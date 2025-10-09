package tech.synelia.quizapp.business;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.java.Log;

/**
 * Business pour l'envoi d'emails
 */
@Log
@Component
public class EmailBusiness {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    /**
     * Envoie un email de vérification de candidature
     */
    public void sendApplicationVerificationEmail(String toEmail, Map<String, Object> templateData) {
        try {
            log.info("Envoi d'email de vérification de candidature à : " + toEmail);

            // Préparer le contexte Thymeleaf
            Context context = new Context();
            context.setVariables(templateData);

            // Générer le contenu HTML
            String htmlContent = templateEngine.process("verification-candidature", context);

            // Créer le message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setTo(toEmail);
            helper.setSubject("Confirmation de réception de votre candidature - Synelia");
            helper.setText(htmlContent, true); // true = HTML

            // Envoyer l'email
            mailSender.send(message);

            log.info("Email de vérification envoyé avec succès à : " + toEmail);

        } catch (MessagingException e) {
            log.severe("Erreur lors de l'envoi de l'email de vérification : " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }

    /**
     * Méthode utilitaire pour formater une date
     */
    public String formatDate(Date date) {
        if (date == null) return "";
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        return sdf.format(date);
    }

    /**
     * Méthode utilitaire pour formater une date depuis un String
     */
    public String formatDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) return "";
        try {
            // Si c'est déjà au format dd/MM/yyyy, retourner tel quel
            if (dateString.matches("\\d{2}/\\d{2}/\\d{4}")) {
                return dateString;
            }
            // Si c'est au format yyyy-MM-dd, convertir
            if (dateString.matches("\\d{4}-\\d{2}-\\d{2}")) {
                SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd");
                SimpleDateFormat outputFormat = new SimpleDateFormat("dd/MM/yyyy");
                Date date = inputFormat.parse(dateString);
                return outputFormat.format(date);
            }
            // Retourner tel quel si format inconnu
            return dateString;
        } catch (Exception e) {
            log.warning("Erreur lors du formatage de la date: " + dateString + " - " + e.getMessage());
            return dateString;
        }
    }
}