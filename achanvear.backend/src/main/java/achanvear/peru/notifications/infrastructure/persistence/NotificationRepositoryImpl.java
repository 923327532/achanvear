package achanvear.peru.notifications.infrastructure.persistence;

import achanvear.peru.notifications.domain.model.Notification;
import achanvear.peru.notifications.domain.model.NotificationId;
import achanvear.peru.notifications.domain.repository.NotificationRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class NotificationRepositoryImpl implements NotificationRepository {

    private final NotificationJpaRepository jpaRepository;
    private final NotificationMapper mapper;

    public NotificationRepositoryImpl(
            NotificationJpaRepository jpaRepository,
            NotificationMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Notification notification) {
        jpaRepository.save(mapper.toEntity(notification));
    }

    @Override
    public Optional<Notification> findById(NotificationId id) {
        return jpaRepository.findById(id.toString())
                .map(mapper::toDomain);
    }

    @Override
    public List<Notification> findByRecipient(String recipient) {
        return jpaRepository.findByRecipientOrderByCreatedAtDesc(recipient)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}
