package com.example.weeklyreport.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.weeklyreport.dto.ReviewActionRequest;
import com.example.weeklyreport.model.Report;
import com.example.weeklyreport.model.ReviewAction.ReviewActionType;
import com.example.weeklyreport.repository.ProjectRepository;
import com.example.weeklyreport.repository.ReportRepository;
import com.example.weeklyreport.repository.ReportVersionRepository;
import com.example.weeklyreport.repository.ReviewActionRepository;

@ExtendWith(MockitoExtension.class)
class ReportServiceSecurityTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private ReportVersionRepository versionRepository;

    @Mock
    private ReviewActionRepository reviewActionRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    void memberCannotSubmitAnotherMembersReport() {
        UUID ownerId = UUID.randomUUID();
        UUID otherMemberId = UUID.randomUUID();
        UUID reportId = UUID.randomUUID();
        Report report = Report.builder()
                .id(reportId)
                .userId(ownerId)
                .status(Report.ReportStatus.DRAFT)
                .build();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        assertThrows(RuntimeException.class, () -> reportService.submitReport(otherMemberId, reportId));
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void managerCannotReviewReportThatIsNotSubmitted() {
        UUID reportId = UUID.randomUUID();
        Report report = Report.builder()
                .id(reportId)
                .userId(UUID.randomUUID())
                .status(Report.ReportStatus.DRAFT)
                .build();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        ReviewActionRequest request = new ReviewActionRequest();
        request.setAction(ReviewActionType.APPROVE);

        assertThrows(RuntimeException.class,
                () -> reportService.reviewReport(UUID.randomUUID(), reportId, request));
        verify(reviewActionRepository, never()).save(any());
    }
}
