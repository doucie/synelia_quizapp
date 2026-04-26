package tech.synelia.quizapp.business;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.repository.EmailTemplateRepository;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.StatusCode;
import tech.synelia.quizapp.utils.StatusMessage;
import tech.synelia.quizapp.utils.TechnicalError;
import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.Validate;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.EmailTemplateDto;
import tech.synelia.quizapp.utils.dto.transformer.EmailTemplateTransformer;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InternalErrorException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@Log
@Component
public class EmailTemplateBusiness implements IBasicBusiness<Request<EmailTemplateDto>, Response<EmailTemplateDto>> {

    @Autowired
    private EmailTemplateRepository emailTemplateRepository;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private TechnicalError technicalError;
    @Autowired
    private ExceptionUtils exceptionUtils;
    @PersistenceContext
    private EntityManager em;

    private SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

    @Override
    public Response<EmailTemplateDto> create(Request<EmailTemplateDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin create EmailTemplate-----");
        Response<EmailTemplateDto> response = new Response<>();
        List<EmailTemplate> items = new ArrayList<>();

        for (EmailTemplateDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("templateKey", dto.getTemplateKey());
            fieldsToVerify.put("subjectTemplate", dto.getSubjectTemplate());
            fieldsToVerify.put("bodyTemplate", dto.getBodyTemplate());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            // Verify uniqueness of templateKey
            EmailTemplate existing = emailTemplateRepository.findByTemplateKey(dto.getTemplateKey(), false);
            if (existing != null) {
                throw new InternalErrorException(functionalError.DATA_EXIST("email_template templateKey -> " + dto.getTemplateKey(), locale));
            }

            EmailTemplate entityToSave = EmailTemplateTransformer.INSTANCE.toEntity(dto);
            entityToSave.setCreatedAt(Utilities.getCurrentDate());
            entityToSave.setCreatedBy(request.getUser());
            entityToSave.setIsDeleted(false);
            if (entityToSave.getIsActive() == null) entityToSave.setIsActive(true);
            ensureSingleActiveTemplatePerActionType(entityToSave, request.getUser());
            entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<EmailTemplate> itemsSaved = emailTemplateRepository.saveAll(items);
            if (itemsSaved == null) {
                throw new InternalErrorException(functionalError.SAVE_FAIL("email_template", locale));
            }
            List<EmailTemplateDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? EmailTemplateTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : EmailTemplateTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHttpCode(HttpStatus.CREATED.value());
            response.setStatus(status);
            response.setItems(itemsDto);
            response.setHasError(false);
        }
        log.info("----end create EmailTemplate-----");
        return response;
    }

    @Override
    public Response<EmailTemplateDto> update(Request<EmailTemplateDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin update EmailTemplate-----");
        Response<EmailTemplateDto> response = new Response<>();
        List<EmailTemplate> items = new ArrayList<>();

        for (EmailTemplateDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            EmailTemplate entityToSave = emailTemplateRepository.findOne(dto.getId(), false);
            if (entityToSave == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("email_template id -> " + dto.getId(), locale));
            }

            if (Utilities.shouldUpdate(dto.getTemplateKey())) entityToSave.setTemplateKey(dto.getTemplateKey());
            if (Utilities.shouldUpdate(dto.getSubjectTemplate())) entityToSave.setSubjectTemplate(dto.getSubjectTemplate());
            if (Utilities.shouldUpdate(dto.getBodyTemplate())) entityToSave.setBodyTemplate(dto.getBodyTemplate());
            if (Utilities.shouldUpdate(dto.getDescription())) entityToSave.setDescription(dto.getDescription());
            if (Utilities.shouldUpdate(dto.getAvailableVariables())) entityToSave.setAvailableVariables(dto.getAvailableVariables());
            if (Utilities.shouldUpdate(dto.getActionType())) entityToSave.setActionType(dto.getActionType());
            if (dto.getPresetId() != null) entityToSave.setPresetId(dto.getPresetId());
            if (dto.getIsActive() != null) entityToSave.setIsActive(dto.getIsActive());
            if (dto.getIsDeleted() != null) entityToSave.setIsDeleted(dto.getIsDeleted());

            ensureSingleActiveTemplatePerActionType(entityToSave, request.getUser());
            entityToSave.setUpdatedAt(Utilities.getCurrentDate());
            entityToSave.setUpdatedBy(request.getUser());
            entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<EmailTemplate> itemsSaved = emailTemplateRepository.saveAll(items);
            List<EmailTemplateDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? EmailTemplateTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : EmailTemplateTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end update EmailTemplate-----");
        return response;
    }

    @Override
    public Response<EmailTemplateDto> delete(Request<EmailTemplateDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin delete EmailTemplate-----");
        Response<EmailTemplateDto> response = new Response<>();
        List<EmailTemplate> items = new ArrayList<>();

        for (EmailTemplateDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            EmailTemplate existingEntity = emailTemplateRepository.findOne(dto.getId(), false);
            if (existingEntity == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("email_template -> " + dto.getId(), locale));
            }

            existingEntity.setIsDeleted(true);
            existingEntity.setUpdatedAt(Utilities.getCurrentDate());
            existingEntity.setUpdatedBy(request.getUser());
            items.add(existingEntity);
        }

        if (!items.isEmpty()) {
            emailTemplateRepository.saveAll(items);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end delete EmailTemplate-----");
        return response;
    }

    @Override
    public Response<EmailTemplateDto> getByCriteria(Request<EmailTemplateDto> request, Locale locale) throws Exception {
        log.info("----begin get EmailTemplate-----");
        Response<EmailTemplateDto> response = new Response<>();
        List<EmailTemplate> items = emailTemplateRepository.getByCriteria(request, em, locale);

        if (items != null && !items.isEmpty()) {
            List<EmailTemplateDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? EmailTemplateTransformer.INSTANCE.toLiteDtos(items)
                    : EmailTemplateTransformer.INSTANCE.toDtos(items);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount(emailTemplateRepository.count(request, em, locale));
        } else {
            response.setStatus(functionalError.DATA_EMPTY("email_template", locale));
            response.setHasError(false);
            return response;
        }
        log.info("----end get EmailTemplate-----");
        return response;
    }

    /**
     * Find a template by its key. Used by other Business classes to load templates.
     */
    public EmailTemplate findByKey(String templateKey) {
        return emailTemplateRepository.findByTemplateKey(templateKey, false);
    }

    public EmailTemplate findDefaultByActionType(String actionType) {
        if (StringUtils.isBlank(actionType)) {
            return null;
        }

        List<EmailTemplate> templates = emailTemplateRepository.findActiveByActionType(actionType, false);
        return templates.isEmpty() ? null : templates.get(0);
    }

    public EmailTemplate findDefaultByActionTypeOrKey(String actionType, String templateKey) {
        EmailTemplate template = findDefaultByActionType(actionType);
        if (template != null) {
            return template;
        }

        EmailTemplate legacyTemplate = findByKey(templateKey);
        if (legacyTemplate != null && Boolean.TRUE.equals(legacyTemplate.getIsActive())) {
            return legacyTemplate;
        }

        return null;
    }

    /**
     * Render a template by replacing {{variable}} placeholders with actual values.
     */
    public String renderTemplate(String template, Map<String, String> variables) {
        if (template == null || variables == null) return template;
        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue() != null ? entry.getValue() : "");
        }
        return result;
    }

    public Response<EmailTemplateDto> getByActionType(Request<EmailTemplateDto> request, Locale locale) throws ParseException {
        log.info("----begin getByActionType EmailTemplate-----");
        Response<EmailTemplateDto> response = new Response<>();

        EmailTemplateDto dto = request.getData();
        if (dto == null || !Utilities.shouldUpdate(dto.getActionType())) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("actionType", locale));
        }

        EmailTemplate entity = findDefaultByActionType(dto.getActionType());
        if (entity == null) {
            response.setStatus(functionalError.DATA_EMPTY("email_template actionType -> " + dto.getActionType(), locale));
            response.setHasError(false);
            return response;
        }

        List<EmailTemplateDto> items = new ArrayList<>();
        items.add(EmailTemplateTransformer.INSTANCE.toDto(entity));

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(items);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);
        log.info("----end getByActionType EmailTemplate-----");
        return response;
    }

    private void ensureSingleActiveTemplatePerActionType(EmailTemplate template, Integer userId) throws JsonProcessingException {
        if (template == null
                || !Boolean.TRUE.equals(template.getIsActive())
                || Boolean.TRUE.equals(template.getIsDeleted())
                || StringUtils.isBlank(template.getActionType())) {
            return;
        }

        List<EmailTemplate> templates = emailTemplateRepository.findActiveByActionType(template.getActionType(), false);
        List<EmailTemplate> templatesToUpdate = new ArrayList<>();

        for (EmailTemplate existing : templates) {
            if (template.getId() != null && template.getId().equals(existing.getId())) {
                continue;
            }

            existing.setIsActive(false);
            existing.setUpdatedAt(Utilities.getCurrentDate());
            existing.setUpdatedBy(userId);
            existing.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(existing)));
            templatesToUpdate.add(existing);
        }

        if (!templatesToUpdate.isEmpty()) {
            emailTemplateRepository.saveAll(templatesToUpdate);
        }
    }
}
