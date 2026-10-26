package achanvear.peru;

import achanvear.peru.interview.infrastructure.persistence.InterviewRepositoryImpl;
import achanvear.peru.interview.infrastructure.persistence.InterviewMapper;
import achanvear.peru.interview.infrastructure.persistence.repository.InterviewJpaRepository;
import achanvear.peru.interview.infrastructure.persistence.entity.InterviewJpaEntity;
import achanvear.peru.interview.domain.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.transaction.annotation.AnnotationTransactionAttributeSource;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.TransactionDefinition;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InterviewRepositoryTransactionTest {
    @Test void lazyCollectionsAreMappedInsideTransactionEvenDuringAccessChecks() {
        var jpa=mock(InterviewJpaRepository.class);
        var mapper=mock(InterviewMapper.class);
        var id=InterviewId.of(UUID.randomUUID().toString());
        var entity=new InterviewJpaEntity();
        var interview=new Interview(id,UUID.randomUUID().toString(),UUID.randomUUID().toString(),InterviewType.THEORY);
        when(jpa.findDetailedById(id.toString())).thenReturn(Optional.of(entity));
        when(jpa.findByCandidateId(interview.getCandidateId())).thenReturn(List.of(entity));
        when(mapper.toDomain(entity)).thenAnswer(invocation->{
            assertTrue(TransactionSynchronizationManager.isActualTransactionActive());
            assertTrue(TransactionSynchronizationManager.isCurrentTransactionReadOnly());
            return interview;
        });
        var manager=new AbstractPlatformTransactionManager() {
            protected Object doGetTransaction() { return new Object(); }
            protected void doBegin(Object transaction, TransactionDefinition definition) {}
            protected void doCommit(DefaultTransactionStatus status) {}
            protected void doRollback(DefaultTransactionStatus status) {}
        };
        var proxy=new ProxyFactory(new InterviewRepositoryImpl(jpa,mapper));
        proxy.setProxyTargetClass(true);
        proxy.addAdvice(new TransactionInterceptor(manager,new AnnotationTransactionAttributeSource()));
        var repository=(InterviewRepositoryImpl)proxy.getProxy();
        assertSame(interview,repository.findById(id).orElseThrow());
        assertEquals(1,repository.findByCandidateId(interview.getCandidateId()).size());
        assertFalse(TransactionSynchronizationManager.isActualTransactionActive());
        when(mapper.toEntity(interview)).thenAnswer(invocation->{
            assertTrue(TransactionSynchronizationManager.isActualTransactionActive());
            assertFalse(TransactionSynchronizationManager.isCurrentTransactionReadOnly());
            return entity;
        });
        repository.save(interview);
        verify(jpa).save(entity);
    }
}
