package com.example.weeklyreport.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.weeklyreport.model.Project;
import com.example.weeklyreport.model.ProjectMember;
import com.example.weeklyreport.model.Report;
import com.example.weeklyreport.model.ReportAchievement;
import com.example.weeklyreport.model.ReportBlocker;
import com.example.weeklyreport.model.ReportHour;
import com.example.weeklyreport.model.ReportPlannedTask;
import com.example.weeklyreport.model.ReportTask;
import com.example.weeklyreport.model.ReportVersion;
import com.example.weeklyreport.model.ReviewAction;
import com.example.weeklyreport.model.User;
import com.example.weeklyreport.repository.ProjectMemberRepository;
import com.example.weeklyreport.repository.ProjectRepository;
import com.example.weeklyreport.repository.ReportRepository;
import com.example.weeklyreport.repository.ReportVersionRepository;
import com.example.weeklyreport.repository.ReviewActionRepository;
import com.example.weeklyreport.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ReportRepository reportRepository;
    private final ReportVersionRepository versionRepository;
    private final ReviewActionRepository reviewActionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
	if (userRepository.count() > 0) {
	    repairExistingReports();
	    return;
	}

	User admin = user("Sarah Admin", "admin@company.com", "admin123", User.UserRole.ADMIN, null);
	User managerOne = user("David Chen", "manager@company.com", "manager123", User.UserRole.MANAGER, null);
	User managerTwo = user("Maya Patel", "manager2@company.com", "manager2123", User.UserRole.MANAGER, null);

	List<User> teamOne = List.of(
		user("Alice Johnson", "alice@company.com", "password123", User.UserRole.TEAM_MEMBER, managerOne),
		user("Bob Williams", "bob@company.com", "password123", User.UserRole.TEAM_MEMBER, managerOne),
		user("Carol Martinez", "carol@company.com", "password123", User.UserRole.TEAM_MEMBER, managerOne),
		user("Derek Thompson", "derek@company.com", "password123", User.UserRole.TEAM_MEMBER, managerOne),
		user("Elena Rodriguez", "elena@company.com", "password123", User.UserRole.TEAM_MEMBER, managerOne));
	List<User> teamTwo = List.of(
		user("Frank Wilson", "frank@company.com", "password123", User.UserRole.TEAM_MEMBER, managerTwo),
		user("Grace Lee", "grace@company.com", "password123", User.UserRole.TEAM_MEMBER, managerTwo),
		user("Henry Brown", "henry@company.com", "password123", User.UserRole.TEAM_MEMBER, managerTwo),
		user("Ivy Davis", "ivy@company.com", "password123", User.UserRole.TEAM_MEMBER, managerTwo),
		user("Jack Miller", "jack@company.com", "password123", User.UserRole.TEAM_MEMBER, managerTwo));

	Project clientA = project("Client A", "E-commerce platform redesign", managerOne);
	Project internal = project("Internal Tooling", "Developer tools and CI/CD improvements", managerOne);
	Project rnd = project("R&D", "Research and development initiatives", managerTwo);
	Project marketing = project("Marketing", "Campaign website and content tools", managerTwo);
	Project mobile = project("Mobile App", "Cross-platform mobile application", managerTwo);
	Project operations = project("Operations", "Internal operations and reporting", managerOne);

	assign(clientA, teamOne);
	assign(internal, teamOne);
	assign(operations, teamOne);
	assign(rnd, teamTwo);
	assign(marketing, teamTwo);
	assign(mobile, teamTwo);

	LocalDate monday = LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() - 1);
	List<Project> projects = List.of(clientA, internal, rnd, marketing, mobile, operations);
	List<User> allMembers = new ArrayList<>();
	allMembers.addAll(teamOne);
	allMembers.addAll(teamTwo);

	for (int weekOffset = 4; weekOffset >= 0; weekOffset--) {
	    LocalDate week = monday.minusWeeks(weekOffset);
	    for (int index = 0; index < allMembers.size(); index++) {
		User member = allMembers.get(index);
		Project project = projects.get(index % projects.size());
		Report.ReportStatus status = statusFor(weekOffset, index);
		User reviewer = member.getManagerId().equals(managerOne.getId()) ? managerOne : managerTwo;
		createReport(member, project, week, status, reviewer);
	    }
	}
    }

    private User user(String name, String email, String password, User.UserRole role, User manager) {
	return userRepository.save(User.builder()
		.fullName(name)
		.email(email)
		.password(passwordEncoder.encode(password))
		.role(role)
		.managerId(manager == null ? null : manager.getId())
		.isActive(true)
		.build());
    }

    private void repairExistingReports() {
	for (Report report : reportRepository.findAll()) {
	    List<ReportVersion> versions = versionRepository.findByReportIdOrderByVersionNumberAsc(report.getId());
	    User member = userRepository.findById(report.getUserId()).orElse(null);
	    Project project = report.getProjectId() == null ? null : projectRepository.findById(report.getProjectId()).orElse(null);
	    if (member != null && project != null && (versions.isEmpty() || hasRecoveredEmptyVersion(report, versions))) {
		int versionNumber = versions.isEmpty() ? 1 : versions.get(versions.size() - 1).getVersionNumber() + 1;
		ReportVersion repairedVersion = createVersion(report, member, project, versionNumber);
		if (report.getStatus() != Report.ReportStatus.DRAFT) {
		    repairedVersion.setSubmittedAt(report.getUpdatedAt());
		    versionRepository.save(repairedVersion);
		}
		report.setCurrentVersionId(repairedVersion.getId());
		reportRepository.save(report);
	    } else if (!versions.isEmpty() && report.getCurrentVersionId() == null) {
		report.setCurrentVersionId(versions.get(versions.size() - 1).getId());
		reportRepository.save(report);
	    }
	}
    }

    private boolean hasRecoveredEmptyVersion(Report report, List<ReportVersion> versions) {
	if (report.getCurrentVersionId() == null) {
	    return false;
	}
	return versions.stream()
		.filter(version -> version.getId().equals(report.getCurrentVersionId()))
		.anyMatch(version -> version.getNotes() != null
			&& version.getNotes().startsWith("Recovered seeded report version"));
    }

    private Project project(String name, String description, User creator) {
	return projectRepository.save(Project.builder()
		.name(name)
		.description(description)
		.createdBy(creator.getId())
		.isActive(true)
		.build());
    }

    private void assign(Project project, List<User> members) {
	projectMemberRepository.saveAll(members.stream()
		.map(member -> ProjectMember.builder().projectId(project.getId()).userId(member.getId()).build())
		.toList());
    }

    private Report.ReportStatus statusFor(int weekOffset, int memberIndex) {
	if (weekOffset == 0) {
	    return memberIndex % 5 == 0 ? Report.ReportStatus.DRAFT
		    : memberIndex % 4 == 0 ? Report.ReportStatus.NEEDS_CORRECTION
		    : Report.ReportStatus.SUBMITTED;
	}
	if (weekOffset == 1 && memberIndex % 4 == 1) {
	    return Report.ReportStatus.NEEDS_CORRECTION;
	}
	return Report.ReportStatus.APPROVED;
    }

    private void createReport(User member, Project project, LocalDate weekStart,
	    Report.ReportStatus status, User reviewer) {
	Report report = reportRepository.save(Report.builder()
		.userId(member.getId())
		.projectId(project.getId())
		.weekStartDate(weekStart)
		.weekEndDate(weekStart.plusDays(6))
		.status(status)
		.build());

	ReportVersion version = createVersion(report, member, project);
	if (status != Report.ReportStatus.DRAFT) {
	    version.setSubmittedAt(OffsetDateTime.now().minusDays(Math.max(1, weekStart.until(LocalDate.now()).getDays())));
	}
	versionRepository.save(version);
	report.setCurrentVersionId(version.getId());
	reportRepository.save(report);

	if (status == Report.ReportStatus.APPROVED || status == Report.ReportStatus.NEEDS_CORRECTION) {
	    reviewActionRepository.save(ReviewAction.builder()
		    .reportId(report.getId())
		    .reportVersionId(version.getId())
		    .reviewerId(reviewer.getId())
		    .action(status == Report.ReportStatus.APPROVED
			    ? ReviewAction.ReviewActionType.APPROVE
			    : ReviewAction.ReviewActionType.REQUEST_CHANGES)
		    .comment(status == Report.ReportStatus.APPROVED
			    ? "Good progress and clear deliverables."
			    : "Please add more detail to the blockers and update the time spent values.")
		    .build());
	}
    }

    private ReportVersion createVersion(Report report, User member, Project project) {
	return createVersion(report, member, project, 1);
    }

    private ReportVersion createVersion(Report report, User member, Project project, int versionNumber) {
	ReportVersion version = ReportVersion.builder()
		.report(report)
		.versionNumber(versionNumber)
		.notes("Weekly progress update for " + project.getName())
		.links(new String[] { "https://jira.company.com/board", "https://docs.company.com" })
		.build();

	String firstName = member.getFullName().split(" ")[0];
	version.setTasks(List.of(
		ReportTask.builder().reportVersion(version).taskName("Implement " + project.getName() + " feature")
			.priority((short) 1).plannedPct(new BigDecimal("100")).actualPct(new BigDecimal("85"))
			.status(ReportTask.TaskStatus.IN_PROGRESS).timePlannedHours(new BigDecimal("16"))
			.timeSpentHours(new BigDecimal("14")).outputDeliverable("Feature branch and review notes")
			.sortOrder(0).build(),
		ReportTask.builder().reportVersion(version).taskName("Testing and bug fixes for " + firstName)
			.priority((short) 2).plannedPct(new BigDecimal("100")).actualPct(new BigDecimal("100"))
			.status(ReportTask.TaskStatus.DONE).timePlannedHours(new BigDecimal("8"))
			.timeSpentHours(new BigDecimal("9")).outputDeliverable("Tests and fixes merged")
			.sortOrder(1).build()));
	version.setPlannedTasks(List.of(
		ReportPlannedTask.builder().reportVersion(version).description("Complete remaining implementation").sortOrder(0).build(),
		ReportPlannedTask.builder().reportVersion(version).description("Prepare staging release").sortOrder(1).build()));
	version.setBlockers(List.of(
		ReportBlocker.builder().reportVersion(version).description("Waiting for API dependency").isKeyIssue(true).sortOrder(0).build(),
		ReportBlocker.builder().reportVersion(version).description("Design approval pending").isKeyIssue(false).sortOrder(1).build()));
	version.setAchievements(List.of(
		ReportAchievement.builder().reportVersion(version).description("Delivered the planned feature increment").isKeyAchievement(true).sortOrder(0).build(),
		ReportAchievement.builder().reportVersion(version).description("Improved automated test coverage").isKeyAchievement(false).sortOrder(1).build()));
	version.setHoursBreakdown(List.of(
		ReportHour.builder().reportVersion(version).taskType("Development").hours(new BigDecimal("20")).build(),
		ReportHour.builder().reportVersion(version).taskType("Testing").hours(new BigDecimal("8")).build(),
		ReportHour.builder().reportVersion(version).taskType("Meetings").hours(new BigDecimal("6")).build(),
		ReportHour.builder().reportVersion(version).taskType("Documentation").hours(new BigDecimal("4")).build()));
	return versionRepository.save(version);
    }
}
