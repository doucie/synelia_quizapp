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

@Log
@Component
public class PipelineTemplateBusiness implements IBasicBusiness<Request<PipelineTemplateDto>, Response<PipelineTemplateDto>> {

    @Autowired
    private PipelineTemplateRepository pipelineTemplateRepository;
    @Autowired
    private PipelineStageRepository pipelineStageRepository;
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
            if (entityToSave.getIsActive() == null) entityToSave.setIsActive(true);
            if (entityToSave.getIsLocked() == null) entityToSave.setIsLocked(false);
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<PipelineTemplate> itemsSaved = pipelineTemplateRepository.saveAll(items);
            if (itemsSaved == null) {
                throw new InternalErrorException(functionalError.SAVE_FAIL("pipeline_template", locale));
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
        newTemplate.setIsActive(true);
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
                pipelineStageRepository.save(newStage);
            }
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
}
