package tech.synelia.quizapp.business;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.entity.LegalText;
import tech.synelia.quizapp.dao.entity.SmtpConfig;
import tech.synelia.quizapp.dao.repository.LegalTextRepository;
import tech.synelia.quizapp.dao.repository.SmtpConfigRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.enums.EmailActionType;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@Component
public class PlatformReadinessService {

    @Autowired
    private SmtpConfigRepository smtpConfigRepository;
    @Autowired
    private LegalTextRepository legalTextRepository;
    @Autowired
    private EmailTemplateBusiness emailTemplateBusiness;
    @Autowired
    private FunctionalError functionalError;

    public SmtpConfig requireActiveSmtpConfig(Locale locale) {
        SmtpConfig smtpConfig = smtpConfigRepository.findActiveConfig(true, false);
        if (smtpConfig == null || smtpConfig.getHost() == null || smtpConfig.getHost().trim().isEmpty()) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Aucune configuration SMTP active n'est disponible pour ce flux email.", locale));
        }

        return smtpConfig;
    }

    public EmailTemplate requireActiveEmailTemplate(EmailActionType actionType, Locale locale) {
        return requireActiveEmailTemplate(actionType.name(), actionType.getTemplateKey(), locale);
    }

    public void requireEmailDeliveryAvailable(EmailActionType actionType, Locale locale) {
        requireEmailDeliveryAvailable(actionType.name(), actionType.getTemplateKey(), locale);
    }

    public EmailTemplate requireActiveEmailTemplate(String actionType, String templateKey, Locale locale) {
        EmailTemplate emailTemplate = emailTemplateBusiness.findDefaultByActionTypeOrKey(actionType, templateKey);
        if (emailTemplate == null || Boolean.TRUE.equals(emailTemplate.getIsDeleted()) || !Boolean.TRUE.equals(emailTemplate.getIsActive())) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Aucun template email actif n'est configure pour l'action " + actionType + ".", locale));
        }

        return emailTemplate;
    }

    public void requireEmailDeliveryAvailable(String actionType, String templateKey, Locale locale) {
        requireActiveSmtpConfig(locale);
        requireActiveEmailTemplate(actionType, templateKey, locale);
    }

    public LegalText requireActiveLegalText(String textKey, Locale locale) {
        LegalText legalText = legalTextRepository.findByTextKey(textKey, false);
        if (legalText == null || Boolean.TRUE.equals(legalText.getIsDeleted()) || !Boolean.TRUE.equals(legalText.getIsActive())) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Le texte legal requis '" + textKey + "' est absent ou inactif.", locale));
        }

        return legalText;
    }
}