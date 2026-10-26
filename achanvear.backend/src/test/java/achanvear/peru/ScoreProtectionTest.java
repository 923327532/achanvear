package achanvear.peru;

import achanvear.peru.interview.application.*;
import achanvear.peru.interview.application.command.CompleteInterviewCommand;
import achanvear.peru.interview.domain.model.*;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.web.*;
import achanvear.peru.hiring.application.*;
import achanvear.peru.hiring.web.HiringController;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.GlobalExceptionHandler;
import org.junit.jupiter.api.*;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ScoreProtectionTest {
    @Configuration
    @EnableMethodSecurity(proxyTargetClass=true)
    static class Config {
        @Bean InterviewRepository interviews() { return mock(InterviewRepository.class); }
        @Bean InterviewAccess interviewAccess(InterviewRepository repository) { return new InterviewAccess(repository); }
        @Bean CompleteInterviewUseCase complete() { return mock(CompleteInterviewUseCase.class); }
        @Bean EvaluateTheoryResultUseCase evaluate() { return mock(EvaluateTheoryResultUseCase.class); }
        @Bean InterviewController controller(CompleteInterviewUseCase complete) {
            return new InterviewController(mock(ScheduleInterviewUseCase.class),mock(StartInterviewSessionUseCase.class),
                    mock(SubmitAnswerUseCase.class),complete,mock(ReportViolationUseCase.class),mock(AbortInterviewUseCase.class),
                    mock(AbortInterviewSessionUseCase.class),mock(SaveRecordingKeyUseCase.class),mock(GetInterviewReportUseCase.class),
                    mock(GetMyInterviewsUseCase.class),mock(achanvear.peru.compliance.application.RecordInterviewConsentUseCase.class));
        }
        @Bean HiringController hiring(EvaluateTheoryResultUseCase evaluate) {
            return new HiringController(mock(StartScreeningUseCase.class),evaluate,mock(GenerateFinalReportUseCase.class));
        }
    }
    AnnotationConfigApplicationContext context;
    MockMvc mvc;
    String id;
    @BeforeEach void setup() {
        context=new AnnotationConfigApplicationContext(Config.class);
        var user=UUID.randomUUID();id=UUID.randomUUID().toString();
        var principal=new AuthenticatedUser(user,"test@example.invalid",null,"FREELANCER","ACTIVE",null,List.of());
        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(principal,null,List.of(new SimpleGrantedAuthority("ROLE_FREELANCER"))));
        when(context.getBean(InterviewRepository.class).findById(InterviewId.of(id))).thenReturn(Optional.of(new Interview(InterviewId.of(id),user.toString(),UUID.randomUUID().toString(),InterviewType.THEORY)));
        mvc=MockMvcBuilders.standaloneSetup(context.getBean(InterviewController.class),context.getBean(HiringController.class))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }
    @AfterEach void cleanup() { SecurityContextHolder.clearContext();context.close(); }
    @Test void professionalCannotSubmitAnAlteredScore() throws Exception {
        mvc.perform(post("/interviews/"+id+"/complete").contentType(MediaType.APPLICATION_JSON).content("{\"score\":100,\"softSkillsScore\":100}"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(context.getBean(CompleteInterviewUseCase.class));
    }
    @Test void professionalCannotUseManualTheoryEvaluationEndpoint() throws Exception {
        mvc.perform(post("/hiring/theory/evaluate").contentType(MediaType.APPLICATION_JSON)
                .content("{\"hiringProcessId\":\"process\",\"theoryScore\":100}"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(context.getBean(EvaluateTheoryResultUseCase.class));
    }
    @Test void professionalCanRequestOwnCompletionWithoutProvidingScores() throws Exception {
        mvc.perform(post("/interviews/"+id+"/complete")).andExpect(status().isOk());
        var captor=org.mockito.ArgumentCaptor.forClass(CompleteInterviewCommand.class);
        verify(context.getBean(CompleteInterviewUseCase.class)).execute(captor.capture());
        assertNull(captor.getValue().score());assertNull(captor.getValue().summary());assertNull(captor.getValue().evidence());
    }
    @Test void professionalCannotChangeAnotherCandidatesResult() throws Exception {
        mvc.perform(post("/interviews/"+UUID.randomUUID()+"/complete")).andExpect(status().isForbidden());
        verifyNoInteractions(context.getBean(CompleteInterviewUseCase.class));
    }
}
