package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
import tech.synelia.quizapp.utils.enums.StageType;

@Log
@Component
public class PipelineStageBusiness implements IBasicBusiness<Request<PipelineStageDto>, Response<PipelineStageDto>> {

    @Autowired
    private PipelineStageRepository pipelineStageRepository;
    @Autowired
    private PipelineTemplateRepository pipelineTemplateRepository;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private TechnicalError technicalError;
    @Autowired
    private ExceptionUtils exceptionUtils;
    @PersistenceContext
    private EntityManager em;

    private SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Response<PipelineStageDto> create(Request<PipelineStageDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin create PipelineStage-----");
        Response<PipelineStageDto> response = new Response<>();
        List<PipelineStage> items = new ArrayList<>();

        for (PipelineStageDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("stageType", dto.getStageType());
            fieldsToVerify.put("stageLabel", dto.getStageLabel());
            fieldsToVerify.put("pipelineTemplateId", dto.getPipelineTemplateId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            // Vérifier que le template existe
            PipelineTemplate template = pipelineTemplateRepository.findOne(dto.getPipelineTemplateId(), false);
            if (template == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template id -> " + dto.getPipelineTemplateId(), locale));
            }

            // Bloquer si template verrouillé
            if (template.getIsLocked() != null && template.getIsLocked()) {
                throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Ce pipeline est verrouillé car utilisé par des candidats", locale));
            }

            // Si stageOrder non fourni, mettre à la fin
            if (dto.getStageOrder() == null) {
                Long count = pipelineStageRepository.countByPipelineTemplateId(dto.getPipelineTemplateId());
                dto.setStageOrder(count != null ? count.intValue() + 1 : 1);
            }

            String normalizedStageType = normalizeStageType(dto.getStageType(), locale);
            String normalizedConfigJson = validateAndNormalizeConfig(normalizedStageType, dto.getConfigJson(), locale);
            dto.setStageType(normalizedStageType);
            dto.setConfigJson(normalizedConfigJson);

            PipelineStage entityToSave = PipelineStageTransformer.INSTANCE.toEntity(dto, template);
            entityToSave.setCreatedAt(Utilities.getCurrentDate());
            entityToSave.setCreatedBy(request.getUser());
            entityToSave.setIsDeleted(false);
            if (entityToSave.getIsRequired() == null) entityToSave.setIsRequired(true);
            if (entityToSave.getIsEliminatory() == null) entityToSave.setIsEliminatory(false);
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<PipelineStage> itemsSaved = pipelineStageRepository.saveAll(items);
            if (itemsSaved == null) {
                throw new InternalErrorException(functionalError.SAVE_FAIL("pipeline_stage", locale));
            }
            List<PipelineStageDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? PipelineStageTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : PipelineStageTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHttpCode(HttpStatus.CREATED.value());
            response.setStatus(status);
            response.setItems(itemsDto);
            response.setHasError(false);
        }
        log.info("----end create PipelineStage-----");
        return response;
    }

    @Override
    public Response<PipelineStageDto> update(Request<PipelineStageDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin update PipelineStage-----");
        Response<PipelineStageDto> response = new Response<>();
        List<PipelineStage> items = new ArrayList<>();

        for (PipelineStageDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            PipelineStage entityToSave = pipelineStageRepository.findOne(dto.getId(), false);
            if (entityToSave == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage id -> " + dto.getId(), locale));
            }

            // Bloquer si template verrouillé
            PipelineTemplate template = entityToSave.getPipelineTemplate();
            if (template != null && template.getIsLocked() != null && template.getIsLocked()) {
                throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Ce pipeline est verrouillé car utilisé par des candidats", locale));
            }

                String nextStageType = Utilities.shouldUpdate(dto.getStageType())
                    ? normalizeStageType(dto.getStageType(), locale)
                    : entityToSave.getStageType();
                String nextConfigJson = Utilities.shouldUpdate(dto.getConfigJson())
                    ? dto.getConfigJson()
                    : entityToSave.getConfigJson();
                String normalizedConfigJson = validateAndNormalizeConfig(nextStageType, nextConfigJson, locale);

                if (Utilities.shouldUpdate(dto.getStageType())) entityToSave.setStageType(nextStageType);
            if (Utilities.shouldUpdate(dto.getStageLabel())) entityToSave.setStageLabel(dto.getStageLabel());
            if (dto.getStageOrder() != null) entityToSave.setStageOrder(dto.getStageOrder());
            if (dto.getIsRequired() != null) entityToSave.setIsRequired(dto.getIsRequired());
            if (dto.getIsEliminatory() != null) entityToSave.setIsEliminatory(dto.getIsEliminatory());
                if (Utilities.shouldUpdate(dto.getConfigJson())) entityToSave.setConfigJson(normalizedConfigJson);
            if (dto.getIsDeleted() != null) entityToSave.setIsDeleted(dto.getIsDeleted());

            entityToSave.setUpdatedAt(Utilities.getCurrentDate());
            entityToSave.setUpdatedBy(request.getUser());
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<PipelineStage> itemsSaved = pipelineStageRepository.saveAll(items);
            List<PipelineStageDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? PipelineStageTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : PipelineStageTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end update PipelineStage-----");
        return response;
    }

    @Override
    public Response<PipelineStageDto> delete(Request<PipelineStageDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin delete PipelineStage-----");
        Response<PipelineStageDto> response = new Response<>();
        List<PipelineStage> items = new ArrayList<>();

        for (PipelineStageDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            PipelineStage existingEntity = pipelineStageRepository.findOne(dto.getId(), false);
            if (existingEntity == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage -> " + dto.getId(), locale));
            }

            // Bloquer si template verrouillé
            PipelineTemplate template = existingEntity.getPipelineTemplate();
            if (template != null && template.getIsLocked() != null && template.getIsLocked()) {
                throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Ce pipeline est verrouillé car utilisé par des candidats", locale));
            }

            existingEntity.setIsDeleted(true);
            existingEntity.setUpdatedAt(Utilities.getCurrentDate());
            existingEntity.setUpdatedBy(request.getUser());
            items.add(existingEntity);
        }

        if (!items.isEmpty()) {
            pipelineStageRepository.saveAll(items);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end delete PipelineStage-----");
        return response;
    }

    private String normalizeStageType(String stageType, Locale locale) {
        if (!Utilities.notBlank(stageType)) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("stageType", locale));
        }

        try {
            return StageType.fromValue(stageType).getValue();
        } catch (IllegalArgumentException exception) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Type d'étape invalide: " + stageType,
                    locale));
        }
    }

    private String validateAndNormalizeConfig(String stageType, String configJson, Locale locale) {
        JsonNode config = null;

        if (configJson != null) {
            try {
                config = objectMapper.readTree(configJson);
            } catch (Exception exception) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json invalide: JSON mal formé",
                        locale));
            }

            if (config == null || !config.isObject()) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json invalide: un objet JSON est attendu",
                        locale));
            }

            validateCommonConfig(config, locale);
        }

        if (StageType.TECHNICAL_TEST.getValue().equals(stageType)) {
            if (config == null) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json est requis pour une étape TECHNICAL_TEST",
                        locale));
            }

            String testMode = config.path("testMode").asText("").trim().toUpperCase(Locale.ROOT);
            if (!"INTERNAL".equals(testMode) && !"EXTERNAL".equals(testMode)) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "TECHNICAL_TEST attend un testMode INTERNAL ou EXTERNAL",
                        locale));
            }
            if ("EXTERNAL".equals(testMode) && !Utilities.notBlank(config.path("externalUrl").asText(null))) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "TECHNICAL_TEST externe: externalUrl est requis",
                        locale));
            }
        }

        if (StageType.CUSTOM.getValue().equals(stageType)) {
            if (config == null || config.isEmpty()) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json est requis pour une étape CUSTOM",
                        locale));
            }
        }

        if (config == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(config);
        } catch (JsonProcessingException exception) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "config_json invalide: impossible de normaliser la configuration",
                    locale));
        }
    }

    private void validateCommonConfig(JsonNode config, Locale locale) {
        if (config.has("allowSkip") && !config.get("allowSkip").isBoolean()) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "config_json.allowSkip doit être un booléen",
                    locale));
        }

        if (config.has("passingScore")) {
            JsonNode passingScore = config.get("passingScore");
            if (!passingScore.isNumber()) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json.passingScore doit être un nombre",
                        locale));
            }
            double value = passingScore.asDouble();
            if (value < 0d || value > 100d) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json.passingScore doit être compris entre 0 et 100",
                        locale));
            }
        }

        if (config.has("inactivityTimeoutMinutes")) {
            JsonNode inactivityTimeout = config.get("inactivityTimeoutMinutes");
            if (!inactivityTimeout.isNumber()) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json.inactivityTimeoutMinutes doit être un nombre",
                        locale));
            }

            int value = inactivityTimeout.asInt();
            if (value < 0 || value > 1440) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "config_json.inactivityTimeoutMinutes doit être compris entre 0 et 1440",
                        locale));
            }
        }
    }

    @Override
    public Response<PipelineStageDto> getByCriteria(Request<PipelineStageDto> request, Locale locale) throws Exception {
        log.info("----begin get PipelineStage-----");
        Response<PipelineStageDto> response = new Response<>();
        List<PipelineStage> items = pipelineStageRepository.getByCriteria(request, em, locale);

        if (items != null && !items.isEmpty()) {
            List<PipelineStageDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? PipelineStageTransformer.INSTANCE.toLiteDtos(items)
                    : PipelineStageTransformer.INSTANCE.toDtos(items);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount(pipelineStageRepository.count(request, em, locale));
        } else {
            response.setStatus(functionalError.DATA_EMPTY("pipeline_stage", locale));
            response.setHasError(false);
            return response;
        }
        log.info("----end get PipelineStage-----");
        return response;
    }

    // --- Méthodes métier spécifiques ---

    /**
     * Réordonner les étapes d'un template
     */
    public Response<PipelineStageDto> reorderStages(Integer templateId, List<Integer> orderedStageIds, Integer userId, Locale locale) throws ParseException {
        log.info("----begin reorderStages PipelineStage-----");
        Response<PipelineStageDto> response = new Response<>();

        PipelineTemplate template = pipelineTemplateRepository.findOne(templateId, false);
        if (template == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_template id -> " + templateId, locale));
        }

        // Bloquer si template verrouillé
        if (template.getIsLocked() != null && template.getIsLocked()) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Ce pipeline est verrouillé car utilisé par des candidats", locale));
        }

        List<PipelineStage> updatedStages = new ArrayList<>();
        for (int i = 0; i < orderedStageIds.size(); i++) {
            PipelineStage stage = pipelineStageRepository.findOne(orderedStageIds.get(i), false);
            if (stage == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage id -> " + orderedStageIds.get(i), locale));
            }
            stage.setStageOrder(i + 1);
            stage.setUpdatedAt(Utilities.getCurrentDate());
            stage.setUpdatedBy(userId);
            updatedStages.add(stage);
        }

        List<PipelineStage> itemsSaved = pipelineStageRepository.saveAll(updatedStages);
        List<PipelineStageDto> itemsDto = PipelineStageTransformer.INSTANCE.toDtos(itemsSaved);

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setItems(itemsDto);
        response.setHasError(false);
        response.setHttpCode(HttpStatus.OK.value());
        response.setStatus(status);

        log.info("----end reorderStages PipelineStage-----");
        return response;
    }

    /**
     * Liste ordonnée des étapes d'un template
     */
    public Response<PipelineStageDto> getStagesForTemplate(Integer templateId, Boolean isSimpleLoading, Locale locale) throws ParseException {
        log.info("----begin getStagesForTemplate PipelineStage-----");
        Response<PipelineStageDto> response = new Response<>();

        List<PipelineStage> stages = pipelineStageRepository.findByPipelineTemplateIdOrderByStageOrder(templateId);

        if (stages != null && !stages.isEmpty()) {
            List<PipelineStageDto> itemsDto = (Utilities.isTrue(isSimpleLoading))
                    ? PipelineStageTransformer.INSTANCE.toLiteDtos(stages)
                    : PipelineStageTransformer.INSTANCE.toDtos(stages);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount((long) stages.size());
        } else {
            response.setStatus(functionalError.DATA_EMPTY("pipeline_stage", locale));
            response.setHasError(false);
        }

        log.info("----end getStagesForTemplate PipelineStage-----");
        return response;
    }
}
