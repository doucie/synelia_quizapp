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

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;
import tech.synelia.quizapp.utils.enums.CampaignStatus;
import tech.synelia.quizapp.utils.enums.StageType;

@Log
@Component
public class PipelineTemplateBusiness implements IBasicBusiness<Request<PipelineTemplateDto>, Response<PipelineTemplateDto>> {

    @Autowired
    private PipelineTemplateRepository pipelineTemplateRepository;
    @Autowired
    private PipelineStageRepository pipelineStageRepository;
    @Autowired
    private PipelineStageNotificationRuleRepository pipelineStageNotificationRuleRepository;
    @Autowired
    private CampaignsRepository campaignsRepository;
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
    public Response<PipelineTemplateDto> create(Request<PipelineTemplateDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin create PipelineTemplate-----");
        Response<PipelineTemplateDto> response = new Response<>();
        List<PipelineTemplate> items = new ArrayList<>();

        for (PipelineTemplateDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("templateName", dto.getTemplateName());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            // Vérifier unicité du nom
            List<PipelineTemplate> existing = pipelineTemplateRepository.findByTemplateName(dto.getTemplateName(), false);
            if (existing != null && !existing.isEmpty()) {
                throw new InternalErrorException(functionalError.DATA_EXIST("Un template avec ce nom existe déjà -> " + dto.getTemplateName(), locale));
            }

            PipelineTemplate entityToSave = PipelineTemplateTransformer.INSTANCE.toEntity(dto);
            entityToSave.setCreatedAt(Utilities.getCurrentDate());
            entityToSave.setCreatedBy(request.getUser());
            entityToSave.setIsDeleted(false);
            if (entityToSave.getIsDefault() == null) entityToSave.setIsDefault(false);
            entityToSave.setIsActive(false);
            if (entityToSave.getIsLocked() == null) entityToSave.setIsLocked(false);
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<PipelineTemplate> itemsSaved = pipelineTemplateRepository.saveAll(items);
            if (itemsSaved == null) {
                throw new InternalErrorException(functionalError.SAVE_FAIL("pipeline_template", locale));
            }

            for (PipelineTemplate savedTemplate : itemsSaved) {
                initializeFixedStages(savedTemplate, request.getUser());
            }

            List<PipelineTemplateDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? PipelineTemplateTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : PipelineTemplateTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHttpCode(HttpStatus.CREATED.value());
            response.setStatus(status);
            response.setItems(itemsDto);
            response.setHasError(false);
        }
        log.info("----end create PipelineTemplate-----");
        return response;
    }

    @Override
    public Response<PipelineTemplateDto> update(Request<PipelineTemplateDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin update PipelineTemplate-----");
        Response<PipelineTemplateDto> response = new Response<>();
        List<PipelineTemplate> items = new ArrayList<>();

        for (PipelineTemplateDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            PipelineTemplate entityToSave = pipelineTemplateRepository.findOne(dto.getId(), false);
            if (entityToSave == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template id -> " + dto.getId(), locale));
            }

            // Bloquer si verrouillé
            if (entityToSave.getIsLocked() != null && entityToSave.getIsLocked()) {
                throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Ce pipeline est verrouillé car utilisé par des candidats", locale));
            }

            if (dto.getIsActive() != null
                    && !dto.getIsActive()
                    && Boolean.TRUE.equals(entityToSave.getIsActive())) {
                ensureTemplateCanBeDisabled(entityToSave.getId(), locale);
            }

            Boolean nextIsActive = dto.getIsActive() != null ? dto.getIsActive() : entityToSave.getIsActive();
            if (Boolean.TRUE.equals(nextIsActive)) {
                validateTemplateReadiness(entityToSave.getId(), locale, "active");
            }

            if (Utilities.shouldUpdate(dto.getTemplateName())) entityToSave.setTemplateName(dto.getTemplateName());
            if (Utilities.shouldUpdate(dto.getTemplateDesc())) entityToSave.setTemplateDesc(dto.getTemplateDesc());
            if (dto.getIsDefault() != null) entityToSave.setIsDefault(dto.getIsDefault());
            if (dto.getIsActive() != null) entityToSave.setIsActive(dto.getIsActive());
            if (dto.getIsDeleted() != null) entityToSave.setIsDeleted(dto.getIsDeleted());

            entityToSave.setUpdatedAt(Utilities.getCurrentDate());
            entityToSave.setUpdatedBy(request.getUser());
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<PipelineTemplate> itemsSaved = pipelineTemplateRepository.saveAll(items);
            List<PipelineTemplateDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? PipelineTemplateTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : PipelineTemplateTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end update PipelineTemplate-----");
        return response;
    }

    @Override
    public Response<PipelineTemplateDto> delete(Request<PipelineTemplateDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin delete PipelineTemplate-----");
        Response<PipelineTemplateDto> response = new Response<>();
        List<PipelineTemplate> items = new ArrayList<>();

        for (PipelineTemplateDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            PipelineTemplate existingEntity = pipelineTemplateRepository.findOne(dto.getId(), false);
            if (existingEntity == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template -> " + dto.getId(), locale));
            }

            // Bloquer si verrouillé
            if (existingEntity.getIsLocked() != null && existingEntity.getIsLocked()) {
                throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Ce pipeline est verrouillé car utilisé par des candidats", locale));
            }

            // Garde campagne ouverte
            ensureTemplateCanBeDisabled(dto.getId(), locale);

            existingEntity.setIsDeleted(true);
            existingEntity.setUpdatedAt(Utilities.getCurrentDate());
            existingEntity.setUpdatedBy(request.getUser());
            items.add(existingEntity);
        }

        if (!items.isEmpty()) {
            pipelineTemplateRepository.saveAll(items);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end delete PipelineTemplate-----");
        return response;
    }

    @Override
    public Response<PipelineTemplateDto> getByCriteria(Request<PipelineTemplateDto> request, Locale locale) throws Exception {
        log.info("----begin get PipelineTemplate-----");
        Response<PipelineTemplateDto> response = new Response<>();
        List<PipelineTemplate> items = pipelineTemplateRepository.getByCriteria(request, em, locale);

        if (items != null && !items.isEmpty()) {
            List<PipelineTemplateDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? PipelineTemplateTransformer.INSTANCE.toLiteDtos(items)
                    : PipelineTemplateTransformer.INSTANCE.toDtos(items);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount(pipelineTemplateRepository.count(request, em, locale));
        } else {
            response.setStatus(functionalError.DATA_EMPTY("pipeline_template", locale));
            response.setHasError(false);
            return response;
        }
        log.info("----end get PipelineTemplate-----");
        return response;
    }

    // --- Méthodes métier spécifiques ---

    /**
     * Définir un template comme template par défaut (is_default=true sur celui-ci, false sur les autres)
     */
    public Response<PipelineTemplateDto> setAsDefault(Integer templateId, Integer userId, Locale locale) throws ParseException {
        log.info("----begin setAsDefault PipelineTemplate-----");
        Response<PipelineTemplateDto> response = new Response<>();

        PipelineTemplate target = pipelineTemplateRepository.findOne(templateId, false);
        if (target == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template id -> " + templateId, locale));
        }

        if (!Boolean.TRUE.equals(target.getIsActive())) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Ce pipeline est inactif. Activez-le depuis l'editeur avant de le definir par defaut",
                    locale));
        }

        validateTemplateReadiness(templateId, locale, "default");

        // Retirer le défaut de tous les templates
        List<PipelineTemplate> allTemplates = pipelineTemplateRepository.findByIsDeleted(false);
        for (PipelineTemplate t : allTemplates) {
            if (t.getIsDefault() != null && t.getIsDefault()) {
                t.setIsDefault(false);
                t.setUpdatedAt(Utilities.getCurrentDate());
                t.setUpdatedBy(userId);
            }
        }
        pipelineTemplateRepository.saveAll(allTemplates);

        // Définir le nouveau défaut
        target.setIsDefault(true);
        target.setUpdatedAt(Utilities.getCurrentDate());
        target.setUpdatedBy(userId);
        PipelineTemplate saved = pipelineTemplateRepository.save(target);

        List<PipelineTemplateDto> itemsDto = new ArrayList<>();
        itemsDto.add(PipelineTemplateTransformer.INSTANCE.toDto(saved));

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(itemsDto);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);

        log.info("----end setAsDefault PipelineTemplate-----");
        return response;
    }

    /**
     * Retourner le template marqué par défaut
     */
    public PipelineTemplate getDefaultTemplate() {
        return pipelineTemplateRepository.findByIsDefaultTrue();
    }

    /**
     * Dupliquer un template + ses étapes (le nouveau a isLocked=false)
     */
    public Response<PipelineTemplateDto> duplicateTemplate(Integer templateId, String newName, Integer userId, Locale locale) throws ParseException {
        log.info("----begin duplicateTemplate PipelineTemplate-----");
        Response<PipelineTemplateDto> response = new Response<>();

        PipelineTemplate source = pipelineTemplateRepository.findOne(templateId, false);
        if (source == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template id -> " + templateId, locale));
        }

        // Vérifier unicité du nouveau nom
        List<PipelineTemplate> existing = pipelineTemplateRepository.findByTemplateName(newName, false);
        if (existing != null && !existing.isEmpty()) {
            throw new InternalErrorException(functionalError.DATA_EXIST("Un template avec ce nom existe déjà -> " + newName, locale));
        }

        // Créer le nouveau template
        PipelineTemplate newTemplate = new PipelineTemplate();
        newTemplate.setTemplateName(newName);
        newTemplate.setTemplateDesc(source.getTemplateDesc());
        newTemplate.setIsDefault(false);
        newTemplate.setIsActive(false);
        newTemplate.setIsLocked(false);
        newTemplate.setCreatedAt(Utilities.getCurrentDate());
        newTemplate.setCreatedBy(userId);
        newTemplate.setIsDeleted(false);
        PipelineTemplate savedTemplate = pipelineTemplateRepository.save(newTemplate);

        // Dupliquer les étapes
        List<PipelineStage> sourceStages = pipelineStageRepository.findByPipelineTemplateIdOrderByStageOrder(templateId);
        if (sourceStages != null) {
            for (PipelineStage stage : sourceStages) {
                PipelineStage newStage = new PipelineStage();
                newStage.setPipelineTemplate(savedTemplate);
                newStage.setStageType(stage.getStageType());
                newStage.setStageLabel(stage.getStageLabel());
                newStage.setStageOrder(stage.getStageOrder());
                newStage.setIsRequired(stage.getIsRequired());
                newStage.setIsEliminatory(stage.getIsEliminatory());
                newStage.setConfigJson(stage.getConfigJson());
                newStage.setCreatedAt(Utilities.getCurrentDate());
                newStage.setCreatedBy(userId);
                newStage.setIsDeleted(false);
                PipelineStage savedNewStage = pipelineStageRepository.save(newStage);

                List<PipelineStageNotificationRule> sourceRules = pipelineStageNotificationRuleRepository
                        .findByPipelineStageIdAndIsDeletedFalseOrderByIdAsc(stage.getId());
                if (sourceRules != null) {
                    for (PipelineStageNotificationRule rule : sourceRules) {
                        PipelineStageNotificationRule newRule = new PipelineStageNotificationRule();
                        newRule.setPipelineStage(savedNewStage);
                        newRule.setTriggerCode(rule.getTriggerCode());
                        newRule.setOutcomeCode(rule.getOutcomeCode());
                        newRule.setEmailTemplateId(rule.getEmailTemplateId());
                        newRule.setIsRequired(rule.getIsRequired());
                        newRule.setIsAutomatic(rule.getIsAutomatic());
                        newRule.setRequiresManualConfirmation(rule.getRequiresManualConfirmation());
                        newRule.setCreatedAt(Utilities.getCurrentDate());
                        newRule.setCreatedBy(userId);
                        newRule.setIsDeleted(false);
                        pipelineStageNotificationRuleRepository.save(newRule);
                    }
                }
            }
        }

        if (sourceStages == null || sourceStages.isEmpty()) {
            initializeFixedStages(savedTemplate, userId);
        }

        List<PipelineTemplateDto> itemsDto = new ArrayList<>();
        itemsDto.add(PipelineTemplateTransformer.INSTANCE.toDto(savedTemplate));

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(itemsDto);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.CREATED.value());
        response.setStatus(status);

        log.info("----end duplicateTemplate PipelineTemplate-----");
        return response;
    }

    /**
     * Verrouiller un template (appelé automatiquement quand le premier application_progress est créé)
     */
    private void initializeFixedStages(PipelineTemplate template, Integer userId) throws ParseException {
        createFixedStage(template, StageType.CANDIDATURE, "Candidature", 1, userId);
        createFixedStage(template, StageType.DECISION, "Décision", 2, userId);
    }

    private void createFixedStage(PipelineTemplate template, StageType stageType, String label, int stageOrder, Integer userId) throws ParseException {
        PipelineStage stage = new PipelineStage();
        stage.setPipelineTemplate(template);
        stage.setStageType(stageType.getValue());
        stage.setStageLabel(label);
        stage.setStageOrder(stageOrder);
        stage.setIsRequired(true);
        stage.setIsEliminatory(false);
        stage.setCreatedAt(Utilities.getCurrentDate());
        stage.setCreatedBy(userId);
        stage.setIsDeleted(false);
        pipelineStageRepository.save(stage);
    }

    public void lockTemplate(Integer templateId, Integer userId) throws ParseException {
        log.info("----begin lockTemplate PipelineTemplate-----");
        PipelineTemplate template = pipelineTemplateRepository.findOne(templateId, false);
        if (template != null && (template.getIsLocked() == null || !template.getIsLocked())) {
            template.setIsLocked(true);
            template.setUpdatedAt(Utilities.getCurrentDate());
            template.setUpdatedBy(userId);
            pipelineTemplateRepository.save(template);
        }
        log.info("----end lockTemplate PipelineTemplate-----");
    }

    private void validateTemplateReadiness(Integer templateId, Locale locale, String targetUsage) {
        List<String> issues = collectTemplateReadinessIssues(templateId);
        if (issues.isEmpty()) {
            return;
        }

        String action = "active".equals(targetUsage)
                ? "actif"
                : "defini par defaut";

        throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                "Ce pipeline ne peut pas etre " + action + " : " + String.join(" ", issues),
                locale));
    }

    private List<String> collectTemplateReadinessIssues(Integer templateId) {
        List<PipelineStage> stages = pipelineStageRepository.findByPipelineTemplateIdOrderByStageOrder(templateId);
        List<String> issues = new ArrayList<>();

        if (stages == null || stages.isEmpty()) {
            issues.add("ajoutez au minimum CANDIDATURE, une etape intermediaire et DECISION.");
            return issues;
        }

        int candidatureCount = 0;
        int decisionCount = 0;
        int intermediateCount = 0;
        boolean hasBlankLabel = false;
        boolean hasInvalidOrder = false;
        boolean hasInvalidType = false;
        Set<Integer> seenOrders = new HashSet<>();

        for (int index = 0; index < stages.size(); index++) {
            PipelineStage stage = stages.get(index);

            Integer stageOrder = stage.getStageOrder();
            if (stageOrder == null || stageOrder != index + 1 || !seenOrders.add(stageOrder)) {
                hasInvalidOrder = true;
            }

            if (!Utilities.notBlank(stage.getStageLabel())) {
                hasBlankLabel = true;
            }

            StageType normalizedType;
            try {
                normalizedType = StageType.fromValue(stage.getStageType());
            } catch (IllegalArgumentException exception) {
                hasInvalidType = true;
                continue;
            }

            if (normalizedType == StageType.CANDIDATURE) {
                candidatureCount++;
            } else if (normalizedType == StageType.DECISION) {
                decisionCount++;
            } else {
                intermediateCount++;
            }
        }

        if (candidatureCount != 1) {
            issues.add("CANDIDATURE doit etre presente une seule fois.");
        }
        if (decisionCount < 1) {
            issues.add("ajoutez au minimum une etape DECISION.");
        }
        if (intermediateCount < 1) {
            issues.add("ajoutez au moins une etape intermediaire entre CANDIDATURE et DECISION.");
        }
        if (hasBlankLabel) {
            issues.add("chaque etape doit avoir un libelle.");
        }
        if (hasInvalidOrder) {
            issues.add("les ordres d'etapes doivent etre continus et sans doublon.");
        }
        if (hasInvalidType) {
            issues.add("le pipeline contient un type d'etape invalide.");
        }

        if (!stages.isEmpty()) {
            StageType firstStageType = normalizeReadinessStageType(stages.get(0).getStageType());
            StageType lastStageType = normalizeReadinessStageType(stages.get(stages.size() - 1).getStageType());

            if (firstStageType != StageType.CANDIDATURE) {
                issues.add("CANDIDATURE doit rester en premiere position.");
            }
            if (lastStageType != StageType.DECISION) {
                issues.add("DECISION doit rester en derniere position.");
            }
        }

        return issues;
    }

    private StageType normalizeReadinessStageType(String stageType) {
        return StageType.fromValue(stageType);
    }

    private void ensureTemplateCanBeDisabled(Integer templateId, Locale locale) {
        if (templateId == null) {
            return;
        }

        Long openCampaigns = campaignsRepository.countOpenByPipelineTemplateId(
                templateId,
                CampaignStatus.OPEN.getValue());

        if (openCampaigns != null && openCampaigns > 0) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Ce pipeline est encore utilise par une campagne ouverte. Fermez ou reassignez la campagne avant de le desactiver.",
                    locale));
        }
    }
}
