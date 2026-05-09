package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import org.thymeleaf.context.Context;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.dao.entity.InvitationCode;
import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.repository.*;
import tech.synelia.quizapp.utils.enums.EmailActionType;

@Log
@Component
public class InvitationCodeBusiness implements IBasicBusiness<Request<InvitationCodeDto>, Response<InvitationCodeDto>> {

    @Autowired
    private InvitationCodeRepository invitationCodeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private TechnicalError technicalError;
    @Autowired
    private ExceptionUtils exceptionUtils;
    @Autowired
    private ParamsUtils paramsUtils;
    @Autowired
    private HostingUtils hostingUtils;
    @Autowired
    private EmailTemplateBusiness emailTemplateBusiness;
    @Autowired
    private PlatformReadinessService platformReadinessService;
    @PersistenceContext
    private EntityManager em;

    private SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
    private SimpleDateFormat dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");

    private final String SENDER = "QuizApp";
    private final String ENTETE = "QuizApp";
    private final String TITRE = "Plateforme QuizApp";

    @Override
    public Response<InvitationCodeDto> create(Request<InvitationCodeDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin create InvitationCode-----");
        Response<InvitationCodeDto> response = new Response<>();
        List<InvitationCode> items = new ArrayList<>();

		platformReadinessService.requireEmailDeliveryAvailable(EmailActionType.INVITATION_CODE, locale);

        for (InvitationCodeDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("email", dto.getEmail());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            // Validate email format
            if (!Utilities.isValidEmail(dto.getEmail())) {
                throw new InvalidEntityException(functionalError.INVALID_FORMAT("email -> " + dto.getEmail(), locale));
            }

            // Validate role
            String role = dto.getRole() != null ? dto.getRole() : "recruiter";
            List<String> validRoles = Arrays.asList("admin", "recruiter");
            if (!validRoles.contains(role)) {
                throw new InvalidEntityException(functionalError.INVALID_FORMAT("role -> " + role + " (valeurs autorisées: admin, recruiter)", locale));
            }

            // Generate unique invitation code
            String code = UUID.randomUUID().toString().replace("-", "").substring(0, 32);

            // Default expiry: 48 hours from now
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.HOUR_OF_DAY, 48);
            Date expiredAt = resolveRequestedExpiry(dto.getExpiredAt(), cal.getTime());

            InvitationCode entityToSave = new InvitationCode();
            entityToSave.setEmail(dto.getEmail());
            entityToSave.setRole(role);
            entityToSave.setCode(code);
            entityToSave.setIsUsed(false);
            entityToSave.setExpiredAt(expiredAt);
            entityToSave.setCreatedAt(Utilities.getCurrentDate());
            entityToSave.setCreatedBy(request.getUser());
            entityToSave.setIsDeleted(false);
            entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<InvitationCode> itemsSaved = invitationCodeRepository.saveAll(items);
            if (itemsSaved == null) {
                throw new InternalErrorException(functionalError.SAVE_FAIL("invitation_code", locale));
            }
            boolean emailSendFailed = false;

            // Send invitation emails
            for (InvitationCode saved : itemsSaved) {
                try {
                    sendInvitationEmail(saved, locale);
                } catch (Exception exception) {
                    emailSendFailed = true;
                    log.warning("Invitation creee mais email non envoye pour " + saved.getEmail() + ": " + exception.getMessage());
                }
            }

            List<InvitationCodeDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? InvitationCodeTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : InvitationCodeTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            if (emailSendFailed) {
                status = functionalError.REQUEST_FAIL(
                        "Invitation creee, mais au moins un email n'a pas pu etre envoye. Corrigez la configuration email puis utilisez la relance.",
                        locale);
            } else {
                status.setCode(StatusCode.SUCCESS);
                status.setMessage(StatusMessage.SUCCESS);
            }
            response.setHttpCode(HttpStatus.CREATED.value());
            response.setStatus(status);
            response.setItems(itemsDto);
            response.setHasError(emailSendFailed);
        }
        log.info("----end create InvitationCode-----");
        return response;
    }

    @Override
    public Response<InvitationCodeDto> update(Request<InvitationCodeDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin update InvitationCode-----");
        Response<InvitationCodeDto> response = new Response<>();
        List<InvitationCode> items = new ArrayList<>();

        for (InvitationCodeDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            InvitationCode entityToSave = invitationCodeRepository.findOne(dto.getId(), false);
            if (entityToSave == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("invitation_code id -> " + dto.getId(), locale));
            }

            if (Utilities.shouldUpdate(dto.getEmail())) entityToSave.setEmail(dto.getEmail());
            if (Utilities.shouldUpdate(dto.getRole())) entityToSave.setRole(dto.getRole());
            if (dto.getIsUsed() != null) entityToSave.setIsUsed(dto.getIsUsed());
            entityToSave.setExpiredAt(resolveRequestedExpiry(dto.getExpiredAt(), entityToSave.getExpiredAt()));
            if (dto.getIsDeleted() != null) entityToSave.setIsDeleted(dto.getIsDeleted());

            entityToSave.setUpdatedAt(Utilities.getCurrentDate());
            entityToSave.setUpdatedBy(request.getUser());
            entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<InvitationCode> itemsSaved = invitationCodeRepository.saveAll(items);
            List<InvitationCodeDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? InvitationCodeTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : InvitationCodeTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end update InvitationCode-----");
        return response;
    }

    @Override
    public Response<InvitationCodeDto> delete(Request<InvitationCodeDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin delete InvitationCode-----");
        Response<InvitationCodeDto> response = new Response<>();
        List<InvitationCode> items = new ArrayList<>();

        for (InvitationCodeDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            InvitationCode existingEntity = invitationCodeRepository.findOne(dto.getId(), false);
            if (existingEntity == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("invitation_code -> " + dto.getId(), locale));
            }

            existingEntity.setIsDeleted(true);
            existingEntity.setUpdatedAt(Utilities.getCurrentDate());
            existingEntity.setUpdatedBy(request.getUser());
            items.add(existingEntity);
        }

        if (!items.isEmpty()) {
            invitationCodeRepository.saveAll(items);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end delete InvitationCode-----");
        return response;
    }

    @Override
    public Response<InvitationCodeDto> getByCriteria(Request<InvitationCodeDto> request, Locale locale) throws Exception {
        log.info("----begin get InvitationCode-----");
        Response<InvitationCodeDto> response = new Response<>();
        List<InvitationCode> items = invitationCodeRepository.getByCriteria(request, em, locale);

        if (items != null && !items.isEmpty()) {
            List<InvitationCodeDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? InvitationCodeTransformer.INSTANCE.toLiteDtos(items)
                    : InvitationCodeTransformer.INSTANCE.toDtos(items);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount(invitationCodeRepository.count(request, em, locale));
        } else {
            response.setStatus(functionalError.DATA_EMPTY("invitation_code", locale));
            response.setHasError(false);
            return response;
        }
        log.info("----end get InvitationCode-----");
        return response;
    }

    /**
     * Validate an invitation code for registration.
     * Returns the invitation data if the code is valid, not used, and not expired.
     */
    public Response<InvitationCodeDto> validateCode(String code, Locale locale) throws ParseException {
        log.info("----begin validateCode-----");
        Response<InvitationCodeDto> response = new Response<>();

        if (!Utilities.notBlank(code)) {
            response.setStatus(functionalError.FIELD_EMPTY("code", locale));
            response.setHasError(true);
            return response;
        }

        InvitationCode invitation = invitationCodeRepository.findByCode(code, false);
        if (invitation == null) {
            response.setStatus(functionalError.DATA_NOT_EXIST("Code d'invitation invalide", locale));
            response.setHasError(true);
            return response;
        }

        if (Utilities.isTrue(invitation.getIsUsed())) {
            response.setStatus(functionalError.DISALLOWED_OPERATION("Ce code d'invitation a déjà été utilisé", locale));
            response.setHasError(true);
            return response;
        }

        if (invitation.getExpiredAt() != null && invitation.getExpiredAt().before(new Date())) {
            response.setStatus(functionalError.DISALLOWED_OPERATION("Ce code d'invitation a expiré", locale));
            response.setHasError(true);
            return response;
        }

        InvitationCodeDto dto = InvitationCodeTransformer.INSTANCE.toDto(invitation);
        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItem(dto);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);

        log.info("----end validateCode-----");
        return response;
    }

    /**
     * Mark an invitation code as used after successful registration.
     */
    public void markAsUsed(String code) {
        InvitationCode invitation = invitationCodeRepository.findByCode(code, false);
        if (invitation != null) {
            invitation.setIsUsed(true);
            invitation.setUpdatedAt(Utilities.getCurrentDate());
            invitationCodeRepository.save(invitation);
        }
    }

    /**
     * Resend the invitation email for an existing invitation code.
     */
    public Response<InvitationCodeDto> resendInvitation(Long id, Locale locale) throws ParseException {
        log.info("----begin resendInvitation-----");
        Response<InvitationCodeDto> response = new Response<>();

        if (id == null) {
            response.setStatus(functionalError.FIELD_EMPTY("id", locale));
            response.setHasError(true);
            return response;
        }

        InvitationCode invitation = invitationCodeRepository.findOne(id, false);
        if (invitation == null) {
            response.setStatus(functionalError.DATA_NOT_EXIST("invitation_code -> " + id, locale));
            response.setHasError(true);
            return response;
        }

        if (Utilities.isTrue(invitation.getIsUsed())) {
            response.setStatus(functionalError.DISALLOWED_OPERATION("Ce code a déjà été utilisé", locale));
            response.setHasError(true);
            return response;
        }

		platformReadinessService.requireEmailDeliveryAvailable(EmailActionType.INVITATION_CODE, locale);

        InvitationCode invitationToSend = invitation;
        Date now = Utilities.getCurrentDate();
        if (invitation.getExpiredAt() != null && invitation.getExpiredAt().before(now)) {
            invitation.setIsDeleted(true);
            invitation.setUpdatedAt(now);
            invitationCodeRepository.save(invitation);

            invitationToSend = createReplacementInvitation(invitation, now);
            invitationCodeRepository.save(invitationToSend);
        }

        try {
            sendInvitationEmail(invitationToSend, locale);
        } catch (Exception exception) {
            response.setStatus(functionalError.REQUEST_FAIL(
                    "Invitation regeneree, mais l'email n'a pas pu etre envoye. Corrigez la configuration email puis relancez l'envoi.",
                    locale));
            response.setHasError(true);
            response.setHttpCode(HttpStatus.OK.value());
            response.setItem(InvitationCodeTransformer.INSTANCE.toDto(invitationToSend));
            return response;
        }

        InvitationCodeDto dto = InvitationCodeTransformer.INSTANCE.toDto(invitationToSend);
        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItem(dto);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);

        log.info("----end resendInvitation-----");
        return response;
    }

    private InvitationCode createReplacementInvitation(InvitationCode source, Date createdAt) {
        InvitationCode replacement = new InvitationCode();
        replacement.setEmail(source.getEmail());
        replacement.setRole(source.getRole());
        replacement.setCode(UUID.randomUUID().toString().replace("-", "").substring(0, 32));
        replacement.setIsUsed(false);
        replacement.setExpiredAt(buildDefaultExpiry(createdAt));
        replacement.setCreatedAt(createdAt);
        replacement.setCreatedBy(source.getCreatedBy());
        replacement.setIsDeleted(false);
        replacement.setSearchString(buildInvitationSearchString(replacement));
        return replacement;
    }

    private String buildInvitationSearchString(InvitationCode invitation) {
        try {
            return Utilities.extractValuesFromJson(Utilities.convertObjectToJson(invitation));
        } catch (JsonProcessingException e) {
            log.warning("Impossible de generer le searchString de l'invitation de remplacement: " + e.getMessage());
            return String.join(" ",
                    Objects.toString(invitation.getEmail(), ""),
                    Objects.toString(invitation.getRole(), ""),
                    Objects.toString(invitation.getCode(), "")).trim();
        }
    }

    private Date buildDefaultExpiry(Date referenceDate) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(referenceDate);
        cal.add(Calendar.HOUR_OF_DAY, 48);
        return cal.getTime();
    }

    private Date resolveRequestedExpiry(String rawExpiredAt, Date fallbackExpiry) throws ParseException {
        if (!Utilities.notBlank(rawExpiredAt)) {
            return fallbackExpiry;
        }

        return dateTimeFormat.parse(rawExpiredAt);
    }

    private String resolveInvitationRecipientLabel(String email) {
        if (email == null || email.isBlank()) {
            return "utilisateur";
        }

        int atIndex = email.indexOf('@');
        String localPart = atIndex > 0 ? email.substring(0, atIndex) : email;
        String normalized = localPart
                .replace('.', ' ')
                .replace('_', ' ')
                .replace('-', ' ')
                .trim();

        return normalized.isBlank() ? "utilisateur" : normalized;
    }

    /**
     * Send the invitation email using the email template system.
     */
    private void sendInvitationEmail(InvitationCode invitation, Locale locale) throws Exception {
        Map<String, String> from = new HashMap<>();
        from.put("email", paramsUtils.getSmtpLogin());
        from.put("user", SENDER);

        List<Map<String, String>> toRecipients = new ArrayList<>();
        Map<String, String> recipient = new HashMap<>();
        recipient.put("email", invitation.getEmail());
        toRecipients.add(recipient);

        String appLink = paramsUtils.getUrlAppl();
        String registrationLink = appLink + "/inscription?code=" + invitation.getCode();

        String subject;
        String contenu;

        EmailTemplate emailTemplate = platformReadinessService.requireActiveEmailTemplate(
                EmailActionType.INVITATION_CODE, locale);
    String invitationEmail = invitation.getEmail();
    String invitationCode = invitation.getCode();
    Date invitationExpiry = invitation.getExpiredAt();
    String registrationExpiry = invitationExpiry != null ? dateTimeFormat.format(invitationExpiry) : "";
    String legacyExpiryDate = invitationExpiry != null ? dateFormat.format(invitationExpiry) : "";

        Map<String, String> vars = new HashMap<>();
    vars.put("email", invitationEmail);
    vars.put("first_name", resolveInvitationRecipientLabel(invitationEmail));
    vars.put("role", invitation.getRole());
    vars.put("code", invitationCode);
    vars.put("invitation_code", invitationCode);
        vars.put("registration_link", registrationLink);
    vars.put("invitation_link", registrationLink);
        vars.put("app_link", appLink);
    vars.put("expired_at", registrationExpiry);
    vars.put("expiry_date", legacyExpiryDate);
        subject = emailTemplateBusiness.renderSubjectTemplate(emailTemplate, vars);
        contenu = emailTemplateBusiness.renderBodyTemplate(emailTemplate, vars);

        String body = "";
        Context context = new Context();
        String template = "blank";
        context.setVariable("contenu", contenu);
        context.setVariable("entete", ENTETE);
        context.setVariable("titre", TITRE);
        context.setVariable("appLink", appLink);

        Response<?> responseEmail = hostingUtils.sendEmail(from, toRecipients, subject, body, null, context, template, locale);
        if (responseEmail.isHasError()) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Envoi de l'invitation impossible pour " + invitation.getEmail(),
                    locale));
        }
    }
}
