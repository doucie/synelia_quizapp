package tech.synelia.quizapp.utils;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import jakarta.activation.CommandMap;
import jakarta.activation.MailcapCommandMap;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import tech.synelia.quizapp.business.EmailOperationalAlertService;
import tech.synelia.quizapp.business.MailLogService;
import tech.synelia.quizapp.business.MailLogService.MailLogContext;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.dao.entity.SmtpConfig;
import tech.synelia.quizapp.dao.repository.SmtpConfigRepository;

/**
 * BUSINESS factory
 *
 * @author Diomande Souleymane
 */

@Component
public class HostingUtils {

	@Autowired
	private TemplateEngine templateEngine;

	@Autowired
	private ExceptionUtils exceptionUtils;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private EmailOperationalAlertService emailOperationalAlertService;
	@Autowired
	private MailLogService mailLogService;

	@Autowired
	private SmtpConfigRepository smtpConfigRepository;

	private static final Logger slf4jLogger = LoggerFactory.getLogger(HostingUtils.class);

	public <T> Response<T> sendEmail(Map<String, String> from, List<Map<String, String>> toRecipients, String subject,
			String body, List<String> attachmentsFilesAbsolutePaths, Context context, String templateName,
			Locale locale) {
		return sendEmail(from, toRecipients, subject, body, attachmentsFilesAbsolutePaths, context, templateName, locale,
				null);
	}

	public <T> Response<T> sendEmail(Map<String, String> from, List<Map<String, String>> toRecipients, String subject,
			String body, List<String> attachmentsFilesAbsolutePaths, Context context, String templateName,
			Locale locale, MailLogContext mailLogContext) {
		Map<String, String> safeFrom = from != null ? from : new HashMap<>();
		List<Map<String, String>> safeToRecipients = toRecipients != null ? toRecipients : List.of();

		slf4jLogger.info("----begin sendEmail-----");
		slf4jLogger.info("From: {}, To: {}, Subject: {}", safeFrom.get("email"),
			safeToRecipients.stream().map(r -> r.get("email")).toList(), subject);
		
		Response<T> response = new Response<>();
		JavaMailSenderImpl javaMailSender = new JavaMailSenderImpl();
		String resolvedBody = body;

		// Email delivery is only allowed when a DB SMTP config is explicitly active.
		SmtpConfig dbConfig = null;
		try {
			dbConfig = smtpConfigRepository.findActiveConfig(true, false);
		} catch (Exception e) {
			slf4jLogger.warn("Could not load SMTP config from DB", e);
		}

		String smtpServer = null;
		int smtpPort = 587;
		String smtpUsername = null;
		String smtpPassword = null;
		Boolean smtpAuth = Boolean.TRUE;
		Boolean starttlsEnable = Boolean.TRUE;
		Boolean starttlsRequired = Boolean.FALSE;

		if (dbConfig == null || dbConfig.getHost() == null || dbConfig.getHost().trim().isEmpty()) {
			slf4jLogger.error("No active SMTP config available in database");
			emailOperationalAlertService.notifyMissingSmtpConfiguration();
			mailLogService.logBulkEmailResult(safeFrom, safeToRecipients, subject, resolvedBody, false,
					"Aucune configuration SMTP active n'est disponible pour cet envoi.", mailLogContext);
			response.setHasError(Boolean.TRUE);
			response.setStatus(functionalError.DISALLOWED_OPERATION(
					"Aucune configuration SMTP active n'est disponible pour cet envoi.", locale));
			return response;
		}

		if (dbConfig.getHost() != null) {
			slf4jLogger.info("Using SMTP config from database (id={})", dbConfig.getId());
			smtpServer = dbConfig.getHost();
			smtpPort = dbConfig.getPort() != null ? dbConfig.getPort() : 587;
			smtpUsername = dbConfig.getUsername();
			smtpPassword = dbConfig.getPasswordEncrypted();
			smtpAuth = dbConfig.getSmtpAuth() != null ? dbConfig.getSmtpAuth() : true;
			starttlsEnable = dbConfig.getStarttlsEnable() != null ? dbConfig.getStarttlsEnable() : true;
			starttlsRequired = dbConfig.getStarttlsRequired() != null ? dbConfig.getStarttlsRequired() : false;
			// Override sender info in 'from' if DB config has sender details
			if (dbConfig.getSenderEmail() != null && !dbConfig.getSenderEmail().isEmpty()) {
				safeFrom.put("email", dbConfig.getSenderEmail());
				if (dbConfig.getSenderName() != null && !dbConfig.getSenderName().isEmpty()) {
					safeFrom.put("user", dbConfig.getSenderName());
				}
			}
		}

		slf4jLogger.info("SMTP Server: {}, Port: {}", smtpServer, smtpPort);
		
		if (smtpServer != null) {
			javaMailSender.setHost(smtpServer);
			javaMailSender.setPort(smtpPort);
			javaMailSender.setUsername(smtpUsername);
			javaMailSender.setPassword(smtpPassword);

			// ADD NEW CONFIG for "no object DCH for MIME type multipart/mixed" error
			MailcapCommandMap mc = (MailcapCommandMap) CommandMap.getDefaultCommandMap();
			mc.addMailcap("text/html;; x-java-content-handler=com.sun.mail.handlers.text_html");
			mc.addMailcap("text/xml;; x-java-content-handler=com.sun.mail.handlers.text_xml");
			mc.addMailcap("text/plain;; x-java-content-handler=com.sun.mail.handlers.text_plain");
			mc.addMailcap("multipart/*;; x-java-content-handler=com.sun.mail.handlers.multipart_mixed");
			mc.addMailcap("message/rfc822;; x-java-content- handler=com.sun.mail.handlers.message_rfc822");
			Thread.currentThread().setContextClassLoader(getClass().getClassLoader());

			javaMailSender.setJavaMailProperties(getMailProperties(smtpServer, smtpAuth, starttlsEnable, starttlsRequired));

			MimeMessage message = javaMailSender.createMimeMessage();
			try {
				MimeMessageHelper helper = new MimeMessageHelper(message, Boolean.TRUE, "UTF-8");

				// sender
				helper.setFrom(new InternetAddress(safeFrom.get("email"), safeFrom.get("user")));
				// sender

				// recipients
				List<InternetAddress> to = new ArrayList<>();
				for (Map<String, String> recipient : safeToRecipients) {
					to.add(new InternetAddress(recipient.get("email"), recipient.get("user")));
				}
				helper.setTo(to.toArray(InternetAddress[]::new));

				// Subject and body
				helper.setSubject(subject);
				if (context != null && templateName != null) {
					resolvedBody = templateEngine.process(templateName, context);
				}
				helper.setText(resolvedBody, true);

				// Attachments
				if (attachmentsFilesAbsolutePaths != null && !attachmentsFilesAbsolutePaths.isEmpty()) {
					for (String attachmentPath : attachmentsFilesAbsolutePaths) {
						File pieceJointe = new File(attachmentPath);
						FileSystemResource file = new FileSystemResource(attachmentPath);
						if (pieceJointe.exists() && pieceJointe.isFile()) {
							helper.addAttachment(file.getFilename(), file);
						}
					}
				}

				javaMailSender.send(message);
				slf4jLogger.info("Email envoyé avec succès à: {}", 
					safeToRecipients.stream().map(r -> r.get("email")).toList());
				mailLogService.logBulkEmailResult(safeFrom, safeToRecipients, subject, resolvedBody, true, null, mailLogContext);
				response.setHasError(Boolean.FALSE);
				/// gerer les cas d'exeption de non envoi de mail
			} catch (MessagingException | UnsupportedEncodingException | RuntimeException e) {
				slf4jLogger.error("Erreur lors de l'envoi de l'email", e);
				emailOperationalAlertService.notifyDeliveryFailure();
				mailLogService.logBulkEmailResult(safeFrom, safeToRecipients, subject, resolvedBody, false, e.getMessage(), mailLogContext);
				exceptionUtils.EXCEPTION(response, locale, e);
			}
		} else {
			slf4jLogger.error("SMTP Server est null - impossible d'envoyer l'email");
			emailOperationalAlertService.notifyMissingSmtpConfiguration();
			mailLogService.logBulkEmailResult(safeFrom, safeToRecipients, subject, resolvedBody, false,
					"SMTP Server est null - impossible d'envoyer l'email", mailLogContext);
			response.setHasError(Boolean.TRUE);
			response.setStatus(functionalError.DISALLOWED_OPERATION(
					"Aucune configuration SMTP active n'est disponible pour cet envoi.", locale));
		}
		slf4jLogger.info("----end sendEmail-----");
		return response;
	}

	private Properties getMailProperties(String host, Boolean auth, Boolean starttlsEnable, Boolean starttlsRequired) {
		Properties properties = new Properties();
		properties.setProperty("mail.transport.protocol", "smtp");
		properties.setProperty("mail.smtp.auth", auth.toString());
		properties.setProperty("mail.smtp.starttls.enable", starttlsEnable.toString());
		properties.setProperty("mail.smtp.starttls.required", starttlsRequired.toString());
		properties.setProperty("mail.debug", "true");
		if (host.equals("smtp.gmail.com")) {
			properties.setProperty("mail.smtp.ssl.trust", "smtp.gmail.com");
		}
		return properties;
	}

}