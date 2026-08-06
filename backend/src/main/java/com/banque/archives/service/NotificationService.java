package com.banque.archives.service;

import com.banque.archives.entity.Notification;
import com.banque.archives.entity.NotificationType;
import com.banque.archives.entity.User;
import com.banque.archives.entity.WorkflowRequest;
import com.banque.archives.repository.NotificationRepository;
import com.banque.archives.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notifyApprovers(WorkflowRequest request) {
        // Find users who can approve
        List<User> approvers = userRepository.findByFilters(null, null, null);

        for (User approver : approvers) {
            createNotification(
                    approver.getId(),
                    NotificationType.INFO,
                    "Nouvelle demande en attente",
                    "Une demande '" + request.getTitle() + "' attend votre validation.",
                    "/workflows/" + request.getId()
            );
        }
    }

    public void notifyApproval(WorkflowRequest request, User approver, boolean approved) {
        createNotification(
                request.getRequester().getId(),
                approved ? NotificationType.SUCCESS : NotificationType.WARNING,
                approved ? "Demande approuvée" : "Demande rejetée",
                "Votre demande '" + request.getTitle() + "' a été " +
                        (approved ? "approuvée" : "rejetée") + " par " + approver.getName(),
                "/workflows/" + request.getId()
        );
    }

    public void notifyRejection(WorkflowRequest request, User rejecter, String reason) {
        createNotification(
                request.getRequester().getId(),
                NotificationType.WARNING,
                "Demande rejetée",
                "Votre demande '" + request.getTitle() + "' a été rejetée. Raison: " + reason,
                "/workflows/" + request.getId()
        );
    }

    public void notifyRetentionAlert(String userId, String archiveReference, int daysLeft) {
        createNotification(
                userId,
                NotificationType.ALERT,
                "Archive arrivant à échéance",
                "L'archive " + archiveReference + " atteint sa fin de conservation dans " + daysLeft + " jours.",
                null
        );
    }

    public void createNotification(String userId, NotificationType type, String title, String message, String link) {
        Notification notification = Notification.builder()
                .user(User.builder().id(userId).build())
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .isRead(false)
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();

        notificationRepository.save(notification);
        log.debug("Notification créée pour l'utilisateur {}: {}", userId, title);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        });
    }

    public int markAllAsRead(String userId) {
        return notificationRepository.markAllAsReadByUserId(userId);
    }

    public void cleanupExpiredNotifications() {
        int deleted = notificationRepository.deleteExpiredNotifications();
        if (deleted > 0) {
            log.info("Supprimé {} notifications expirées", deleted);
        }
    }
}
