package com.example.weeklyreport.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.weeklyreport.dto.AiChatRequest;
import com.example.weeklyreport.model.Report;
import com.example.weeklyreport.model.ReportVersion;
import com.example.weeklyreport.model.User;
import com.example.weeklyreport.repository.ReportRepository;
import com.example.weeklyreport.repository.ReportVersionRepository;
import com.example.weeklyreport.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ReportVersionRepository versionRepository;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    public String chat(AiChatRequest request) {
        String systemPrompt = buildSystemPrompt();

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        if (request.getConversationHistory() != null) {
            for (AiChatRequest.ChatMessage msg : request.getConversationHistory()) {
                messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
            }
        }

        messages.add(Map.of("role", "user", "content", request.getMessage()));

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", 0.7);
        body.put("max_tokens", 2048);

        WebClient webClient = WebClient.builder().build();

        @SuppressWarnings("unchecked")
        Map<String, Object> response = webClient.post()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response != null && response.containsKey("choices")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (!choices.isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }

        return "I'm sorry, I couldn't process your request at this time.";
    }

    private String buildSystemPrompt() {
        List<User> teamMembers = userRepository.findByRole(User.UserRole.TEAM_MEMBER);
        List<Report> recentReports = reportRepository.findAllOrderByUpdatedAtDesc();
        List<Report> limitedReports = recentReports.stream().limit(50).collect(Collectors.toList());

        StringBuilder context = new StringBuilder();
        context.append("You are an AI assistant for a team management dashboard. ");
        context.append("You help managers understand team activity, identify blockers, and analyze work patterns.\n\n");
        context.append("TEAM MEMBERS:\n");

        for (User member : teamMembers) {
            context.append("- ").append(member.getFullName()).append(" (").append(member.getEmail()).append(")\n");
        }

        context.append("\nRECENT REPORTS SUMMARY:\n");

        for (Report report : limitedReports) {
            Optional<User> user = userRepository.findById(report.getUserId());
            String userName = user.map(User::getFullName).orElse("Unknown");

            context.append("\n[").append(userName).append("] Week: ")
                    .append(report.getWeekStartDate()).append(" to ").append(report.getWeekEndDate())
                    .append(" | Status: ").append(report.getStatus());

            if (report.getCurrentVersionId() != null) {
                Optional<ReportVersion> version = versionRepository.findById(report.getCurrentVersionId());
                if (version.isPresent()) {
                    ReportVersion v = version.get();
                    if (v.getTasks() != null && !v.getTasks().isEmpty()) {
                        context.append("\n  Tasks: ");
                        v.getTasks().forEach(t -> context.append(t.getTaskName())
                                .append(" (").append(t.getStatus()).append("), "));
                    }
                    if (v.getBlockers() != null && !v.getBlockers().isEmpty()) {
                        context.append("\n  Blockers: ");
                        v.getBlockers().forEach(b -> context.append(b.getDescription()).append("; "));
                    }
                    if (v.getAchievements() != null && !v.getAchievements().isEmpty()) {
                        context.append("\n  Achievements: ");
                        v.getAchievements().forEach(a -> context.append(a.getDescription()).append("; "));
                    }
                }
            }
        }

        context.append("\n\nProvide helpful, concise answers about the team's work. ");
        context.append("When discussing specific data, reference team member names and dates. ");
        context.append("If asked about something not in the data, say so honestly.");

        return context.toString();
    }
}
