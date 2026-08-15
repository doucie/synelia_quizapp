package tech.synelia.quizapp.business;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.PipelineStageNotificationRule;
import tech.synelia.quizapp.dao.repository.EmailTemplateRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageNotificationRuleRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageRepository;
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
import tech.synelia.quizapp.utils.dto.PipelineStageNotificationRuleDto;
import tech.synelia.quizapp.utils.dto.transformer.PipelineStageNotificationRuleTransformer;
import tech.synelia.quizapp.utils.enums.NotificationTrigger;
import tech.synelia.quizapp.utils.enums.StageType;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@Log
@Component
public class PipelineStageNotificationRuleBusiness implements IBasicBusiness<Request<PipelineStageNotificationRuleDto>, Response<PipelineStageNotificationRuleDto>> {

    @Autowired
    private PipelineStageNotificationRuleRepository ruleRepository;
    @Autowired
    private PipelineStageRepository pipelineStageRepository;
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

    @Override
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<PipelineStageNotificationRuleDto> create(Request<PipelineStageNotificationRuleDto> request, Locale locale) throws java.text.ParseException, com.fasterxml.jackson.core.JsonProcessingException {
        log.info("----begin create PipelineStageNotificationRule-----");
        List<PipelineStageNotificationRule> result = new ArrayList<>();

        for (PipelineStageNotificationRuleDto dto : request.getDatas()) {
            PipelineStage stage = validateAndResolve(dto, locale, true);

            validateRuleFields(dto, locale);

            PipelineStageNotificationRule rule = PipelineStageNotificationRuleTransformer.INSTANCE.toEntity(dto, stage);
            Date now = Utilities.getCurrentDate();
            rule.setCreatedAt(now);
            rule.setCreatedBy(request.getUser());
            rule.setUpdatedAt(now);
            rule.setUpdatedBy(request.getUser());
            if (rule.getIsDeleted() == null) {
                rule.setIsDeleted(false);
            }
            ruleRepository.save(rule);
            result.add(rule);
        }

        return buildResponse(result, locale);
    }

    @Override
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<PipelineStageNotificationRuleDto> update(Request<PipelineStageNotificationRuleDto> request, Locale locale) throws java.text.ParseException, com.fasterxml.jackson.core.JsonProcessingException {
        log.info("----begin update PipelineStageNotificationRule-----");
        List<PipelineStageNotificationRule> result = new ArrayList<>();

        for (PipelineStageNotificationRuleDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            PipelineStageNotificationRule existing = ruleRepository.findOne(dto.getId(), false);
            if (existing == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage_notification_rule id -> " + dto.getId(), locale));
            }

            validateRuleFields(dto, locale);

            if (Utilities.notBlank(dto.getTriggerCode())) {
                existing.setTriggerCode(normalizeTrigger(dto.getTriggerCode(), locale));
            }
            if (Utilities.shouldUpdate(dto.getOutcomeCode())) {
                existing.setOutcomeCode(dto.getOutcomeCode() == null ? null : normalizeOutcome(dto.getOutcomeCode(), locale));
            }
            if (dto.getEmailTemplateId() != null) {
                existing.setEmailTemplateId(dto.getEmailTemplateId());
            }
            if (dto.getIsRequired() != null) {
                existing.setIsRequired(dto.getIsRequired());
            }
            if (dto.getIsAutomatic() != null) {
                existing.setIsAutomatic(dto.getIsAutomatic());
            }
            if (dto.getRequiresManualConfirmation() != null) {
                existing.setRequiresManualConfirmation(dto.getRequiresManualConfirmation());
            }
            if (Boolean.TRUE.equals(existing.getIsAutomatic()) && !Boolean.TRUE.equals(existing.getIsRequired())) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "Une regle automatique (isAutomatic) doit etre requise (isRequired)",
                        locale));
            }
            existing.setUpdatedAt(Utilities.getCurrentDate());
            existing.setUpdatedBy(request.getUser());

            ruleRepository.save(existing);
            result.add(existing);
        }

        return buildResponse(result, locale);
    }

    @Override
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<PipelineStageNotificationRuleDto> delete(Request<PipelineStageNotificationRuleDto> request, Locale locale) throws java.text.ParseException, com.fasterxml.jackson.core.JsonProcessingException {
        log.info("----begin delete PipelineStageNotificationRule-----");
        List<PipelineStageNotificationRule> result = new ArrayList<>();

        for (PipelineStageNotificationRuleDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            PipelineStageNotificationRule existing = ruleRepository.findOne(dto.getId(), false);
            if (existing == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage_notification_rule id -> " + dto.getId(), locale));
            }

            existing.setIsDeleted(true);
            existing.setUpdatedAt(Utilities.getCurrentDate());
            existing.setUpdatedBy(request.getUser());
            ruleRepository.save(existing);
            result.add(existing);
        }

        return buildResponse(result, locale);
    }

    @Override
    public Response<PipelineStageNotificationRuleDto> getByCriteria(Request<PipelineStageNotificationRuleDto> request, Locale locale) throws Exception {
        log.info("----begin get PipelineStageNotificationRule-----");
        Response<PipelineStageNotificationRuleDto> response = new Response<>();
        List<PipelineStageNotificationRule> items = ruleRepository.getByCriteria(request, em, locale);

        if (items != null && !items.isEmpty()) {
            List<PipelineStageNotificationRuleDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? PipelineStageNotificationRuleTransformer.INSTANCE.toLiteDtos(items)
                    : enrichTemplateNames(PipelineStageNotificationRuleTransformer.INSTANCE.toDtos(items));

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount(ruleRepository.count(request, em, locale));
        } else {
            response.setStatus(functionalError.DATA_EMPTY("pipeline_stage_notification_rule", locale));
            response.setHasError(false);
        }
        log.info("----end get PipelineStageNotificationRule-----");
        return response;
    }

    /**
     * Règles de notification d'une étape (ordre d'insertion).
     */
    public Response<PipelineStageNotificationRuleDto> getByStage(Integer pipelineStageId, Locale locale) throws Exception {
        log.info("----begin getByStage PipelineStageNotificationRule-----");
        Response<PipelineStageNotificationRuleDto> response = new Response<>();

        PipelineStage stage = pipelineStageRepository.findOne(pipelineStageId, false);
        if (stage == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage id -> " + pipelineStageId, locale));
        }

        List<PipelineStageNotificationRule> rules = ruleRepository.findByPipelineStageIdAndIsDeletedFalseOrderByIdAsc(pipelineStageId);
        if (rules != null && !rules.isEmpty()) {
            List<PipelineStageNotificationRuleDto> itemsDto = enrichTemplateNames(
                    PipelineStageNotificationRuleTransformer.INSTANCE.toDtos(rules));

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount((long) rules.size());
        } else {
            response.setStatus(functionalError.DATA_EMPTY("pipeline_stage_notification_rule", locale));
            response.setHasError(false);
        }

        log.info("----end getByStage PipelineStageNotificationRule-----");
        return response;
    }

    /**
     * Remplacement complet des règles d'une étape (CRUD du panneau éditeur) :
     * les règles fournies remplacent l'ensemble des règles actives de l'étape.
     */
    @Transactional(rollbackFor = {RuntimeException.class, Exception.class})
    public Response<PipelineStageNotificationRuleDto> saveStageRules(Integer pipelineStageId, List<PipelineStageNotificationRuleDto> rules, Integer userId, Locale locale) throws Exception {
        log.info("----begin saveStageRules PipelineStageNotificationRule-----");

        PipelineStage stage = pipelineStageRepository.findOne(pipelineStageId, false);
        if (stage == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage id -> " + pipelineStageId, locale));
        }

        Date now = Utilities.getCurrentDate();
        List<PipelineStageNotificationRule> existingRules = ruleRepository.findByPipelineStageIdAndIsDeletedFalseOrderByIdAsc(pipelineStageId);

        if (rules == null || rules.isEmpty()) {
            for (PipelineStageNotificationRule existingRule : existingRules) {
                existingRule.setIsDeleted(true);
                existingRule.setUpdatedAt(now);
                existingRule.setUpdatedBy(userId);
            }
            ruleRepository.saveAll(existingRules);
            return buildResponse(new ArrayList<>(), locale);
        }

        List<PipelineStageNotificationRule> kept = new ArrayList<>();
        for (PipelineStageNotificationRuleDto dto : rules) {
            if (dto.getId() != null) {
                PipelineStageNotificationRule existing = ruleRepository.findOne(dto.getId(), false);
                if (existing != null && existing.getPipelineStage() != null
                        && existing.getPipelineStage().getId().equals(pipelineStageId)) {
                    validateRuleFields(dto, locale);
                    applyRuleChanges(existing, dto, locale);
                    existing.setUpdatedAt(now);
                    existing.setUpdatedBy(userId);
                    ruleRepository.save(existing);
                    kept.add(existing);
                    continue;
                }
            }

            validateRuleFields(dto, locale);
            PipelineStageNotificationRule rule = PipelineStageNotificationRuleTransformer.INSTANCE.toEntity(dto, stage);
            rule.setCreatedAt(now);
            rule.setCreatedBy(userId);
            rule.setUpdatedAt(now);
            rule.setUpdatedBy(userId);
            if (rule.getIsDeleted() == null) {
                rule.setIsDeleted(false);
            }
            ruleRepository.save(rule);
            kept.add(rule);
        }

        for (PipelineStageNotificationRule existingRule : existingRules) {
            if (kept.contains(existingRule)) {
                continue;
            }
            existingRule.setIsDeleted(true);
            existingRule.setUpdatedAt(now);
            existingRule.setUpdatedBy(userId);
        }
        ruleRepository.saveAll(existingRules);

        return buildResponse(kept, locale);
    }

    // --- Helpers ---

    private PipelineStage validateAndResolve(PipelineStageNotificationRuleDto dto, Locale locale, boolean required) {
        Map<String, Object> fieldsToVerify = new HashMap<>();
        fieldsToVerify.put("pipelineStageId", dto.getPipelineStageId());
        if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
        }

        PipelineStage stage = pipelineStageRepository.findOne(dto.getPipelineStageId(), false);
        if (stage == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage id -> " + dto.getPipelineStageId(), locale));
        }
        return stage;
    }

    private void validateRuleFields(PipelineStageNotificationRuleDto dto, Locale locale) {
        String triggerCode = normalizeTrigger(
                Utilities.notBlank(dto.getTriggerCode()) ? dto.getTriggerCode() : "STAGE_EMAIL", locale);
        dto.setTriggerCode(triggerCode);
        if (Utilities.notBlank(dto.getOutcomeCode())) {
            dto.setOutcomeCode(normalizeOutcome(dto.getOutcomeCode(), locale));
        }
        if (dto.getEmailTemplateId() != null) {
            EmailTemplate template = emailTemplateRepository.findOne(dto.getEmailTemplateId(), false);
            if (template == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("email_template id -> " + dto.getEmailTemplateId(), locale));
            }
        }
        boolean required = dto.getIsRequired() == null || Boolean.TRUE.equals(dto.getIsRequired());
        if (Boolean.TRUE.equals(dto.getIsAutomatic()) && !required) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Une regle automatique (isAutomatic) doit etre requise (isRequired)",
                    locale));
        }
    }

    private void applyRuleChanges(PipelineStageNotificationRule existing, PipelineStageNotificationRuleDto dto, Locale locale) {
        existing.setTriggerCode(normalizeTrigger(
                Utilities.notBlank(dto.getTriggerCode()) ? dto.getTriggerCode() : existing.getTriggerCode(), locale));
        if (Utilities.shouldUpdate(dto.getOutcomeCode())) {
            existing.setOutcomeCode(dto.getOutcomeCode() == null ? null : normalizeOutcome(dto.getOutcomeCode(), locale));
        }
        if (dto.getEmailTemplateId() != null) {
            existing.setEmailTemplateId(dto.getEmailTemplateId());
        }
        if (dto.getIsRequired() != null) {
            existing.setIsRequired(dto.getIsRequired());
        }
        if (dto.getIsAutomatic() != null) {
            existing.setIsAutomatic(dto.getIsAutomatic());
        }
        if (dto.getRequiresManualConfirmation() != null) {
            existing.setRequiresManualConfirmation(dto.getRequiresManualConfirmation());
        }
        if (Boolean.TRUE.equals(existing.getIsAutomatic()) && !Boolean.TRUE.equals(existing.getIsRequired())) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Une regle automatique (isAutomatic) doit etre requise (isRequired)",
                    locale));
        }
    }

    private String normalizeTrigger(String triggerCode, Locale locale) {
        if (!Utilities.notBlank(triggerCode)) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("triggerCode", locale));
        }
        try {
            return NotificationTrigger.fromValue(triggerCode).getValue();
        } catch (IllegalArgumentException exception) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Trigger de notification invalide: " + triggerCode,
                    locale));
        }
    }

    private String normalizeOutcome(String outcomeCode, Locale locale) {
        try {
            return StageType.fromValue(outcomeCode).getValue();
        } catch (IllegalArgumentException exception) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Outcome invalide: " + outcomeCode,
                    locale));
        }
    }

    private List<PipelineStageNotificationRuleDto> enrichTemplateNames(List<PipelineStageNotificationRuleDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return dtos;
        }
        List<EmailTemplate> templates = emailTemplateRepository.findByIsDeleted(false);
        Map<Integer, String> namesById = new HashMap<>();
        for (EmailTemplate template : templates) {
            namesById.put(template.getId(), template.getTemplateKey());
        }
        for (PipelineStageNotificationRuleDto dto : dtos) {
            if (dto.getEmailTemplateId() != null && namesById.containsKey(dto.getEmailTemplateId())) {
                dto.setEmailTemplateName(namesById.get(dto.getEmailTemplateId()));
            }
        }
        return dtos;
    }

    private Response<PipelineStageNotificationRuleDto> buildResponse(List<PipelineStageNotificationRule> rules, Locale locale) throws java.text.ParseException {
        Response<PipelineStageNotificationRuleDto> response = new Response<>();
        List<PipelineStageNotificationRuleDto> itemsDto = enrichTemplateNames(
                PipelineStageNotificationRuleTransformer.INSTANCE.toDtos(rules));
        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(itemsDto);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);
        response.setCount((long) itemsDto.size());
        return response;
    }
}
