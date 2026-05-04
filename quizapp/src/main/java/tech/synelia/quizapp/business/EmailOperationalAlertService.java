package tech.synelia.quizapp.business;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.entity.Notifications;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.repository.NotificationsRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.enums.UserRole;

@Component
public class EmailOperationalAlertService {

	private static final int SYSTEM_ACTOR_USER_ID = 0;
	private static final String SMTP_ALERT_TYPE = "EMAIL_SMTP_CONFIG_MISSING";
	private static final String DELIVERY_ALERT_TYPE = "EMAIL_DELIVERY_FAILED";
	private static final String TEMPLATE_VARIABLE_ALERT_TYPE = "EMAIL_TEMPLATE_VARIABLE_MISSING";

	@Autowired
	private NotificationsRepository notificationsRepository;
	@Autowired
	private UserRepository userRepository;

	public void notifyMissingSmtpConfiguration() {
		notifyAdmins(
				SMTP_ALERT_TYPE,
				"/dashboard/entities/smtp-config",
				"smtp_config",
				null);
	}

	public void notifyDeliveryFailure() {
		notifyAdmins(
				DELIVERY_ALERT_TYPE,
				"/dashboard/entities/smtp-config",
				"smtp_config",
				null);
	}

	public void notifyTemplateVariablesMissing(EmailTemplate emailTemplate, Set<String> unresolvedVariables) {
		if (emailTemplate == null || unresolvedVariables == null || unresolvedVariables.isEmpty()) {
			return;
		}

		String notifLink = emailTemplate.getId() != null
				? "/dashboard/email-editor/" + emailTemplate.getId()
				: "/dashboard/email-editor";
		notifyAdmins(
				TEMPLATE_VARIABLE_ALERT_TYPE,
				notifLink,
				"email_template",
				emailTemplate.getId());
	}

	private void notifyAdmins(String notifType, String notifLink, String objectTableName, Integer objectTableId) {
		for (User adminUser : resolveAdminRecipients()) {
			if (adminUser == null || adminUser.getId() == null) {
				continue;
			}
			if (hasEquivalentUnreadAlert(adminUser.getId(), notifType, notifLink, objectTableName, objectTableId)) {
				continue;
			}

			Notifications notification = new Notifications();
			notification.setUser(adminUser);
			notification.setNotifType(notifType);
			notification.setNotifLink(notifLink);
			notification.setIsRead(false);
			notification.setCreatedAt(Utilities.getCurrentDate());
			notification.setCreatedBy(SYSTEM_ACTOR_USER_ID);
			notification.setIsDeleted(false);
			notification.setObjectTableName(objectTableName);
			notification.setObjectTableId(objectTableId);
			notificationsRepository.save(notification);
		}
	}

	private List<User> resolveAdminRecipients() {
		Map<Integer, User> recipientsById = new LinkedHashMap<>();
		addUsersByRole(recipientsById, UserRole.SUPER.getValue());
		addUsersByRole(recipientsById, UserRole.ADMIN.getValue());
		return new ArrayList<>(recipientsById.values());
	}

	private void addUsersByRole(Map<Integer, User> recipientsById, String role) {
		List<User> users = userRepository.findByUserRole(role, false);
		if (users == null) {
			return;
		}

		for (User user : users) {
			if (user == null || user.getId() == null || Boolean.TRUE.equals(user.getIsDeleted())) {
				continue;
			}
			recipientsById.put(user.getId(), user);
		}
	}

	private boolean hasEquivalentUnreadAlert(
			Integer userId,
			String notifType,
			String notifLink,
			String objectTableName,
			Integer objectTableId) {
		List<Notifications> existingNotifications = notificationsRepository.findByUserId(userId, false);
		if (existingNotifications == null || existingNotifications.isEmpty()) {
			return false;
		}

		for (Notifications existingNotification : existingNotifications) {
			if (existingNotification == null || Boolean.TRUE.equals(existingNotification.getIsDeleted())) {
				continue;
			}
			if (Boolean.TRUE.equals(existingNotification.getIsRead())) {
				continue;
			}
			if (!StringUtils.equals(existingNotification.getNotifType(), notifType)) {
				continue;
			}
			if (!StringUtils.equals(existingNotification.getNotifLink(), notifLink)) {
				continue;
			}
			if (!StringUtils.equals(existingNotification.getObjectTableName(), objectTableName)) {
				continue;
			}
			if (!Objects.equals(existingNotification.getObjectTableId(), objectTableId)) {
				continue;
			}
			return true;
		}

		return false;
	}
}