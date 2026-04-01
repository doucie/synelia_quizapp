package tech.synelia.quizapp.utils;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
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
import lombok.AllArgsConstructor;

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
	private ParamsUtils paramsUtils;

	@Autowired
	private TemplateEngine templateEngine;

	@Autowired
	private ExceptionUtils exceptionUtils;

	@Autowired
	private SmtpConfigRepository smtpConfigRepository;

	private static final Logger slf4jLogger = LoggerFactory.getLogger(HostingUtils.class);

	public <T> Response<T> sendEmail(Map<String, String> from, List<Map<String, String>> toRecipients, String subject,
			String body, List<String> attachmentsFilesAbsolutePaths, Context context, String templateName,
			Locale locale) {
		slf4jLogger.info("----begin sendEmail-----");
		slf4jLogger.info("From: {}, To: {}, Subject: {}", from.get("email"), 
			toRecipients.stream().map(r -> r.get("email")).toList(), subject);
		
		Response<T> response = new Response<T>();
		JavaMailSenderImpl javaMailSender = new JavaMailSenderImpl();

		// Try DB-based SMTP config first, fallback to application.properties via ParamsUtils
		SmtpConfig dbConfig = null;
		try {
			dbConfig = smtpConfigRepository.findActiveConfig(true, false);
		} catch (Exception e) {
			slf4jLogger.warn("Could not load SMTP config from DB, falling back to application.properties", e);
		}

		String smtpServer;
		int smtpPort;
		String smtpUsername;
		String smtpPassword;
		Boolean smtpAuth;
		Boolean starttlsEnable;
		Boolean starttlsRequired;

		if (dbConfig != null && dbConfig.getHost() != null) {
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
				from.put("email", dbConfig.getSenderEmail());
				if (dbConfig.getSenderName() != null && !dbConfig.getSenderName().isEmpty()) {
					from.put("user", dbConfig.getSenderName());
				}
			}
		} else {
			slf4jLogger.info("Using SMTP config from application.properties");
			smtpServer = paramsUtils.getSmtpHost();
			smtpPort = paramsUtils.getSmtpPort();
			smtpUsername = paramsUtils.getSmtpMailAdresse();
			smtpPassword = paramsUtils.getSmtpPassword();
			smtpAuth = true;
			starttlsEnable = true;
			starttlsRequired = true;
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
				helper.setFrom(new InternetAddress(from.get("email"), from.get("user")));
				// sender

				// recipients
				List<InternetAddress> to = new ArrayList<InternetAddress>();
				for (Map<String, String> recipient : toRecipients) {
					to.add(new InternetAddress(recipient.get("email"), recipient.get("user")));
				}
				helper.setTo(to.toArray(new InternetAddress[0]));

				// Subject and body
				helper.setSubject(subject);
				if (context != null && templateName != null) {
					body = templateEngine.process(templateName, context);
				}
				helper.setText(body, true);

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
					toRecipients.stream().map(r -> r.get("email")).toList());
				response.setHasError(Boolean.FALSE);
				/// gerer les cas d'exeption de non envoi de mail
			} catch (MessagingException e) {
				slf4jLogger.error("Erreur MessagingException lors de l'envoi de l'email", e);
				e.printStackTrace();
				exceptionUtils.EXCEPTION(response, locale, e);
			} catch (UnsupportedEncodingException e) {
				slf4jLogger.error("Erreur UnsupportedEncodingException lors de l'envoi de l'email", e);
				e.printStackTrace();
				exceptionUtils.EXCEPTION(response, locale, e);
			}
		} else {
			slf4jLogger.error("SMTP Server est null - impossible d'envoyer l'email");
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