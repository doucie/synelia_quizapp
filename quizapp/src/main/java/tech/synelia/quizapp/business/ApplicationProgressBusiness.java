package tech.synelia.quizapp.business;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.ApplicationProgress;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.PipelineTemplate;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.repository.ApplicationProgressRepository;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageRepository;
import tech.synelia.quizapp.dao.repository.PipelineTemplateRepository;
import tech.synelia.quizapp.dao.repository.SourceTokenRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
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
import tech.synelia.quizapp.utils.dto.ApplicationProgressDto;
import tech.synelia.quizapp.utils.dto.transformer.ApplicationProgressTransformer;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.utils.enums.ProgressStatus;
import tech.synelia.quizapp.utils.enums.StageType;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InternalErrorException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@Log
@Component
public class ApplicationProgressBusiness implements IBasicBusiness<Request<ApplicationProgressDto>, Response<ApplicationProgressDto>> {

    @Autowired
    private ApplicationProgressRepository applicationProgressRepository;
    @Autowired
    private PipelineStageRepository pipelineStageRepository;
    @Autowired
    private PipelineTemplateRepository pipelineTemplateRepository;
    @Autowired
    private ApplicationsRepository applicationsRepository;
    @Autowired
    private SourceTokenRepository sourceTokenRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PipelineTemplateBusiness pipelineTemplateBusiness;
    @Autowired
    private PermissionService permissionService;
    @Autowired
    private FunctionalError functionalError;
    @PersistenceContext
    private EntityManager em;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Response<ApplicationProgressDto> create(Request<ApplicationProgressDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin create ApplicationProgress-----");
        Response<ApplicationProgressDto> response = new Response<>();
        List<ApplicationProgress> items = new ArrayList<>();

        for (ApplicationProgressDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("applicationId", dto.getApplicationId());
            fieldsToVerify.put("pipelineStageId", dto.getPipelineStageId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            // Vérifier que l'application existe
            Applications application = applicationsRepository.findOne(dto.getApplicationId(), false);
            if (application == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications id -> " + dto.getApplicationId(), locale));
            }

            // Vérifier que le stage existe
            PipelineStage stage = pipelineStageRepository.findOne(dto.getPipelineStageId(), false);
            if (stage == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipeline_stage id -> " + dto.getPipelineStageId(), locale));
            }

            // Vérifier unicité (application + stage)
            ApplicationProgress existing = applicationProgressRepository.findByApplicationIdAndPipelineStageId(dto.getApplicationId(), dto.getPipelineStageId());
            if (existing != null) {
                throw new InternalErrorException(functionalError.DATA_EXIST("application_progress pour application " + dto.getApplicationId() + " et stage " + dto.getPipelineStageId(), locale));
            }

            User decidedBy = null;
            if (dto.getDecidedById() != null) {
                decidedBy = userRepository.findOne(dto.getDecidedById(), false);
            }

            ApplicationProgress entityToSave = ApplicationProgressTransformer.INSTANCE.toEntity(dto, application, stage, decidedBy);
            entityToSave.setCreatedAt(Utilities.getCurrentDate());
            entityToSave.setCreatedBy(request.getUser());
            entityToSave.setIsDeleted(false);
            if (entityToSave.getMailSent() == null) {
                entityToSave.setMailSent(false);
            }
            if (Utilities.notBlank(entityToSave.getProgressStatus())) {
                entityToSave.setProgressStatus(normalizeProgressStatus(entityToSave.getProgressStatus(), locale));
            } else {
                entityToSave.setProgressStatus(ProgressStatus.PENDING.getValue());
            }
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<ApplicationProgress> itemsSaved = applicationProgressRepository.saveAll(items);
            if (itemsSaved == null) {
                throw new InternalErrorException(functionalError.SAVE_FAIL("application_progress", locale));
            }
            List<ApplicationProgressDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? ApplicationProgressTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : ApplicationProgressTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHttpCode(HttpStatus.CREATED.value());
            response.setStatus(status);
            response.setItems(itemsDto);
            response.setHasError(false);
        }
        log.info("----end create ApplicationProgress-----");
        return response;
    }

    @Override
    public Response<ApplicationProgressDto> update(Request<ApplicationProgressDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin update ApplicationProgress-----");
        Response<ApplicationProgressDto> response = new Response<>();
        List<ApplicationProgress> items = new ArrayList<>();

        for (ApplicationProgressDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            ApplicationProgress entityToSave = applicationProgressRepository.findOne(dto.getId(), false);
            if (entityToSave == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("application_progress id -> " + dto.getId(), locale));
            }

            if (Utilities.shouldUpdate(dto.getProgressStatus())) {
                entityToSave.setProgressStatus(normalizeNullableProgressStatus(dto.getProgressStatus(), locale));
            }
            if (dto.getScore() != null) entityToSave.setScore(dto.getScore());
            if (Utilities.shouldUpdate(dto.getNotes())) entityToSave.setNotes(dto.getNotes());
            if (dto.getMailSent() != null) entityToSave.setMailSent(dto.getMailSent());
            if (dto.getDecidedById() != null) {
                User decidedBy = userRepository.findOne(dto.getDecidedById(), false);
                if (decidedBy != null) entityToSave.setDecidedBy(decidedBy);
            }
            if (dto.getIsDeleted() != null) entityToSave.setIsDeleted(dto.getIsDeleted());

            entityToSave.setUpdatedAt(Utilities.getCurrentDate());
            entityToSave.setUpdatedBy(request.getUser());
            items.add(entityToSave);
        }

        if (!items.isEmpty()) {
            List<ApplicationProgress> itemsSaved = applicationProgressRepository.saveAll(items);
            List<ApplicationProgressDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? ApplicationProgressTransformer.INSTANCE.toLiteDtos(itemsSaved)
                    : ApplicationProgressTransformer.INSTANCE.toDtos(itemsSaved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end update ApplicationProgress-----");
        return response;
    }

    @Override
    public Response<ApplicationProgressDto> delete(Request<ApplicationProgressDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin delete ApplicationProgress-----");
        Response<ApplicationProgressDto> response = new Response<>();
        List<ApplicationProgress> items = new ArrayList<>();

        for (ApplicationProgressDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            ApplicationProgress existingEntity = applicationProgressRepository.findOne(dto.getId(), false);
            if (existingEntity == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("application_progress -> " + dto.getId(), locale));
            }

            existingEntity.setIsDeleted(true);
            existingEntity.setUpdatedAt(Utilities.getCurrentDate());
            existingEntity.setUpdatedBy(request.getUser());
            items.add(existingEntity);
        }

        if (!items.isEmpty()) {
            applicationProgressRepository.saveAll(items);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        }
        log.info("----end delete ApplicationProgress-----");
        return response;
    }

    @Override
    public Response<ApplicationProgressDto> getByCriteria(Request<ApplicationProgressDto> request, Locale locale) throws Exception {
        log.info("----begin get ApplicationProgress-----");
        Response<ApplicationProgressDto> response = new Response<>();
        List<ApplicationProgress> items = applicationProgressRepository.getByCriteria(request, em, locale);

        if (items != null && !items.isEmpty()) {
            List<ApplicationProgressDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading()))
                    ? ApplicationProgressTransformer.INSTANCE.toLiteDtos(items)
                    : ApplicationProgressTransformer.INSTANCE.toDtos(items);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount(applicationProgressRepository.count(request, em, locale));
        } else {
            response.setStatus(functionalError.DATA_EMPTY("application_progress", locale));
            response.setHasError(false);
            return response;
        }
        log.info("----end get ApplicationProgress-----");
        return response;
    }

    // --- Méthodes métier spécifiques ---

    /**
     * Initialiser le progrès pour une candidature : créer toutes les lignes PENDING + verrouiller le template
     */
    public void initProgressForApplication(Integer applicationId, Integer pipelineTemplateId, Integer userId) throws ParseException {
        log.info("----begin initProgressForApplication-----");

        Applications application = applicationsRepository.findOne(applicationId, false);
        if (application == null) {
            log.warning("Application non trouvée: " + applicationId);
            return;
        }

        PipelineTemplate template = pipelineTemplateRepository.findOne(pipelineTemplateId, false);
        if (template == null) {
            log.warning("Template non trouvé: " + pipelineTemplateId);
            return;
        }

        List<PipelineStage> stages = pipelineStageRepository.findByPipelineTemplateIdOrderByStageOrder(pipelineTemplateId);
        if (stages == null || stages.isEmpty()) {
            log.warning("Aucune étape trouvée pour le template: " + pipelineTemplateId);
            return;
        }

        for (PipelineStage stage : stages) {
            // Vérifier si un progrès existe déjà
            ApplicationProgress existing = applicationProgressRepository.findByApplicationIdAndPipelineStageId(applicationId, stage.getId());
            if (existing != null) continue;

            ApplicationProgress progress = new ApplicationProgress();
            progress.setApplications(application);
            progress.setPipelineStage(stage);
            progress.setProgressStatus(ProgressStatus.PENDING.getValue());
            progress.setCreatedAt(Utilities.getCurrentDate());
            progress.setCreatedBy(userId);
            progress.setIsDeleted(false);
            applicationProgressRepository.save(progress);
        }

        // Verrouiller le template
        pipelineTemplateBusiness.lockTemplate(pipelineTemplateId, userId);

        log.info("----end initProgressForApplication-----");
    }

    /**
     * Avancer à l'étape suivante : passer l'étape courante à PASSED et la suivante à IN_PROGRESS
     */
    public Response<ApplicationProgressDto> advanceToNextStageForUser(Integer applicationId, Integer userId, Locale locale) throws ParseException {
        ensureCampaignMutationAllowed(applicationId, userId, locale, "faire avancer cette candidature");
        return advanceToNextStage(applicationId, userId, locale);
    }

    public Response<ApplicationProgressDto> advanceToNextStage(Integer applicationId, Integer userId, Locale locale) throws ParseException {
        log.info("----begin advanceToNextStage-----");

        // Trouver l'étape IN_PROGRESS
        ApplicationProgress current = applicationProgressRepository.findCurrentStage(applicationId);
        if (current != null) {
            return passStage(applicationId, current.getPipelineStage().getId(), userId, null, null, locale);
        }

        // Aucun stage en cours : démarrer simplement la première étape restante.
        List<ApplicationProgress> pending = applicationProgressRepository.findPendingByApplicationId(applicationId);
        if (pending != null && !pending.isEmpty()) {
            activateStage(pending.get(0), userId);
        }

        syncApplicationStatus(applicationId);
        return getProgressForApplication(applicationId, false, locale);
    }

    public Response<ApplicationProgressDto> passStage(Integer applicationId, Integer stageId, Integer decidedById, Double score, String notes, Locale locale) throws ParseException {
        log.info("----begin passStage-----");

        ApplicationProgress progress = getProgressOrThrow(applicationId, stageId, locale);
        ensureStageCanBeCompleted(progress, locale);

        if (!hasProgressStatus(progress, ProgressStatus.PASSED)) {
            if (progress.getStartedAt() == null) {
                progress.setStartedAt(Utilities.getCurrentDate());
            }
            progress.setProgressStatus(ProgressStatus.PASSED.getValue());
            progress.setCompletedAt(Utilities.getCurrentDate());
            progress.setNotes(notes);
            progress.setScore(score);
            if (decidedById != null) {
                User decidedBy = userRepository.findOne(decidedById, false);
                if (decidedBy != null) {
                    progress.setDecidedBy(decidedBy);
                }
            }
            progress.setUpdatedAt(Utilities.getCurrentDate());
            progress.setUpdatedBy(decidedById);
            applicationProgressRepository.save(progress);
        }

        activateNextPendingStage(applicationId, progress, decidedById);
        syncApplicationStatus(applicationId);
        return getProgressForApplication(applicationId, false, locale);
    }

    /**
     * Échouer une étape : marquer FAILED + SKIPPED pour les suivantes si éliminatoire
     */
    public Response<ApplicationProgressDto> failStageForUser(Integer applicationId, Integer stageId, Integer decidedById, String notes, Locale locale) throws ParseException {
        ensureCampaignMutationAllowed(applicationId, decidedById, locale, "refuser cette étape de pipeline");
        return failStage(applicationId, stageId, decidedById, notes, locale);
    }

    public Response<ApplicationProgressDto> failStage(Integer applicationId, Integer stageId, Integer decidedById, String notes, Locale locale) throws ParseException {
        log.info("----begin failStage-----");

        ApplicationProgress progress = getProgressOrThrow(applicationId, stageId, locale);
        ensureStageCanBeCompleted(progress, locale);

        User decidedBy = decidedById != null ? userRepository.findOne(decidedById, false) : null;

        if (progress.getStartedAt() == null) {
            progress.setStartedAt(Utilities.getCurrentDate());
        }
        progress.setProgressStatus(ProgressStatus.FAILED.getValue());
        progress.setCompletedAt(Utilities.getCurrentDate());
        progress.setNotes(notes);
        progress.setDecidedBy(decidedBy);
        progress.setUpdatedAt(Utilities.getCurrentDate());
        progress.setUpdatedBy(decidedById);
        applicationProgressRepository.save(progress);

        // Si étape éliminatoire, marquer toutes les suivantes comme SKIPPED
        PipelineStage failedStage = progress.getPipelineStage();
        if (failedStage.getIsEliminatory() != null && failedStage.getIsEliminatory()) {
            List<ApplicationProgress> allProgress = applicationProgressRepository.findByApplicationIdOrderByStageOrder(applicationId);
            for (ApplicationProgress ap : allProgress) {
                if (ap.getPipelineStage().getStageOrder() > failedStage.getStageOrder()
                        && hasProgressStatus(ap, ProgressStatus.PENDING)) {
                    ap.setProgressStatus(ProgressStatus.SKIPPED.getValue());
                    ap.setCompletedAt(Utilities.getCurrentDate());
                    ap.setNotes("Ignoré après échec d'une étape éliminatoire");
                    ap.setUpdatedAt(Utilities.getCurrentDate());
                    ap.setUpdatedBy(decidedById);
                    applicationProgressRepository.save(ap);
                }
            }
        } else {
            activateNextPendingStage(applicationId, progress, decidedById);
        }

        syncApplicationStatus(applicationId);

        return getProgressForApplication(applicationId, false, locale);
    }

    /**
     * Sauter une étape (pour étapes non requises)
     */
    public Response<ApplicationProgressDto> skipStageForUser(Integer applicationId, Integer stageId, Integer userId, String notes, Locale locale) throws ParseException {
        ensureCampaignMutationAllowed(applicationId, userId, locale, "ignorer cette étape de pipeline");
        return skipStage(applicationId, stageId, userId, notes, locale);
    }

    public Response<ApplicationProgressDto> skipStage(Integer applicationId, Integer stageId, Integer userId, String notes, Locale locale) throws ParseException {
        log.info("----begin skipStage-----");

        ApplicationProgress progress = getProgressOrThrow(applicationId, stageId, locale);
        ensureStageCanBeCompleted(progress, locale);

        if (!isSkipAllowed(progress.getPipelineStage())) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Cette étape obligatoire ne peut pas être ignorée",
                    locale));
        }

        progress.setProgressStatus(ProgressStatus.SKIPPED.getValue());
        if (progress.getStartedAt() == null) {
            progress.setStartedAt(Utilities.getCurrentDate());
        }
        progress.setCompletedAt(Utilities.getCurrentDate());
        progress.setNotes(notes);
        if (userId != null) {
            User decidedBy = userRepository.findOne(userId, false);
            if (decidedBy != null) {
                progress.setDecidedBy(decidedBy);
            }
        }
        progress.setUpdatedAt(Utilities.getCurrentDate());
        progress.setUpdatedBy(userId);
        applicationProgressRepository.save(progress);

        activateNextPendingStage(applicationId, progress, userId);
        syncApplicationStatus(applicationId);

        return getProgressForApplication(applicationId, false, locale);
    }

    public Response<ApplicationProgressDto> rollbackStageForUser(Integer applicationId, Integer stageId, Integer userId, String notes, Locale locale) throws ParseException {
        ensureCampaignRollbackAllowed(applicationId, userId, locale);
        return rollbackStage(applicationId, stageId, userId, notes, locale);
    }

    public Response<ApplicationProgressDto> rollbackStage(Integer applicationId, Integer stageId, Integer userId, String notes, Locale locale) throws ParseException {
        log.info("----begin rollbackStage-----");

        ApplicationProgress targetProgress = getProgressOrThrow(applicationId, stageId, locale);
        List<ApplicationProgress> allProgress = applicationProgressRepository.findByApplicationIdOrderByStageOrder(applicationId);
        if (allProgress == null || allProgress.isEmpty()) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("application_progress pour application -> " + applicationId, locale));
        }

        Integer targetStageOrder = targetProgress.getPipelineStage() != null ? targetProgress.getPipelineStage().getStageOrder() : null;
        if (targetStageOrder == null) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL("Stage cible invalide pour le rollback du pipeline", locale));
        }

        boolean hasProgressToRewind = !hasProgressStatus(targetProgress, ProgressStatus.PENDING);
        if (!hasProgressToRewind) {
            for (ApplicationProgress progress : allProgress) {
                if (progress.getPipelineStage() != null
                        && progress.getPipelineStage().getStageOrder() > targetStageOrder
                        && !hasProgressStatus(progress, ProgressStatus.PENDING)) {
                    hasProgressToRewind = true;
                    break;
                }
            }
        }

        if (!hasProgressToRewind) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Aucun retour arriere utile n'est possible pour cette étape",
                    locale));
        }

        for (ApplicationProgress progress : allProgress) {
            if (progress.getPipelineStage() == null || progress.getPipelineStage().getStageOrder() == null) {
                continue;
            }

            int stageOrder = progress.getPipelineStage().getStageOrder();
            if (stageOrder < targetStageOrder) {
                continue;
            }

            if (stageOrder == targetStageOrder) {
                progress.setProgressStatus(ProgressStatus.IN_PROGRESS.getValue());
                if (progress.getStartedAt() == null) {
                    progress.setStartedAt(Utilities.getCurrentDate());
                }
                progress.setCompletedAt(null);
                progress.setScore(null);
                progress.setNotes(notes);
                progress.setDecidedBy(null);
                progress.setMailSent(false);
            } else {
                progress.setProgressStatus(ProgressStatus.PENDING.getValue());
                progress.setStartedAt(null);
                progress.setCompletedAt(null);
                progress.setScore(null);
                progress.setNotes(null);
                progress.setDecidedBy(null);
                progress.setMailSent(false);
            }

            progress.setUpdatedAt(Utilities.getCurrentDate());
            progress.setUpdatedBy(userId);
            applicationProgressRepository.save(progress);
        }

        syncApplicationStatus(applicationId);
        return getProgressForApplication(applicationId, false, locale);
    }

    public void updateStageScore(Integer applicationId, String stageType, Double score, Integer userId) {
        updateStageScore(applicationId, stageType, score, userId, true);
    }

    public void syncInterviewEvaluationStages(Integer applicationId, Double score, boolean interviewCompleted, Integer userId, Locale locale) throws ParseException {
        if (applicationId == null) {
            return;
        }

        ApplicationProgress interviewProgress = findProgressByStageType(applicationId, StageType.INTERVIEW.getValue());
        ApplicationProgress evaluationProgress = findProgressByStageType(applicationId, StageType.EVALUATION.getValue());
        if (interviewProgress == null && evaluationProgress == null) {
            return;
        }

        double normalizedScore = score != null ? score : 0d;

        if (evaluationProgress != null) {
            updateStageScore(applicationId, StageType.EVALUATION.getValue(), normalizedScore, userId, false);
            if (!interviewCompleted) {
                return;
            }

            if (interviewProgress != null) {
                ensureStagePassed(applicationId, interviewProgress, userId, null, "Entretien terminé", locale);
            }

            resolveScoredStage(
                    applicationId,
                    evaluationProgress,
                    normalizedScore,
                    userId,
                    locale,
                    "Évaluation validée",
                    "Évaluation insuffisante");
            return;
        }

        if (interviewProgress != null) {
            updateStageScore(applicationId, StageType.INTERVIEW.getValue(), normalizedScore, userId, false);
            if (interviewCompleted) {
                resolveScoredStage(
                        applicationId,
                        interviewProgress,
                        normalizedScore,
                        userId,
                        locale,
                        "Entretien validé",
                        "Entretien échoué");
            }
        }
    }

    private void updateStageScore(Integer applicationId, String stageType, Double score, Integer userId, boolean activateIfPending) {
        if (applicationId == null || !Utilities.notBlank(stageType) || score == null) {
            return;
        }

        ApplicationProgress progress = findProgressByStageType(applicationId, stageType);
        if (progress == null) {
            return;
        }

        if (activateIfPending && hasProgressStatus(progress, ProgressStatus.PENDING)) {
            activateStage(progress, userId);
        }

        progress.setScore(score);
        progress.setUpdatedAt(Utilities.getCurrentDate());
        progress.setUpdatedBy(userId);
        applicationProgressRepository.save(progress);
        syncApplicationStatus(applicationId);
    }

    private void ensureStagePassed(Integer applicationId, ApplicationProgress progress, Integer userId, Double score, String notes, Locale locale) throws ParseException {
        if (progress == null || progress.getPipelineStage() == null) {
            return;
        }

        if (score != null) {
            updateStageScore(applicationId, progress.getPipelineStage().getStageType(), score, userId, false);
        }

        if (!hasProgressStatus(progress, ProgressStatus.PASSED)) {
            passStage(applicationId, progress.getPipelineStage().getId(), userId, score, notes, locale);
        }
    }

    private void resolveScoredStage(Integer applicationId, ApplicationProgress progress, double score, Integer userId, Locale locale, String passNotes, String failNotes) throws ParseException {
        if (progress == null || progress.getPipelineStage() == null) {
            return;
        }

        updateStageScore(applicationId, progress.getPipelineStage().getStageType(), score, userId, false);
        double passingScore = resolvePassingScore(progress.getPipelineStage(), 50.0d);
        if (score >= passingScore) {
            ensureStagePassed(applicationId, progress, userId, score, passNotes, locale);
            return;
        }

        if (!hasProgressStatus(progress, ProgressStatus.FAILED)) {
            failStage(applicationId, progress.getPipelineStage().getId(), userId, failNotes, locale);
        }
    }

    public double resolvePassingScore(PipelineStage stage, double defaultValue) {
        JsonNode config = readStageConfig(stage);
        if (config == null || !config.has("passingScore") || !config.get("passingScore").isNumber()) {
            return defaultValue;
        }

        double configuredScore = config.get("passingScore").asDouble(defaultValue);
        if (configuredScore < 0d || configuredScore > 100d) {
            return defaultValue;
        }
        return configuredScore;
    }

    public Integer resolveInactivityTimeoutMinutes(PipelineStage stage, Integer defaultValue) {
        JsonNode config = readStageConfig(stage);
        if (config == null || !config.has("inactivityTimeoutMinutes") || !config.get("inactivityTimeoutMinutes").isNumber()) {
            return defaultValue;
        }

        int configuredTimeout = config.get("inactivityTimeoutMinutes").asInt(defaultValue != null ? defaultValue : 0);
        if (configuredTimeout < 0) {
            return defaultValue;
        }
        return configuredTimeout == 0 ? null : configuredTimeout;
    }

    /**
     * Liste complète du progrès d'une candidature
     */
    public Response<ApplicationProgressDto> getProgressForApplication(Integer applicationId, Boolean isSimpleLoading, Locale locale) throws ParseException {
        log.info("----begin getProgressForApplication-----");
        Response<ApplicationProgressDto> response = new Response<>();

        List<ApplicationProgress> items = applicationProgressRepository.findByApplicationIdOrderByStageOrder(applicationId);

        if (items != null && !items.isEmpty()) {
            List<ApplicationProgressDto> itemsDto = (Utilities.isTrue(isSimpleLoading))
                    ? ApplicationProgressTransformer.INSTANCE.toLiteDtos(items)
                    : ApplicationProgressTransformer.INSTANCE.toDtos(items);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
            response.setCount((long) items.size());
        } else {
            response.setStatus(functionalError.DATA_EMPTY("application_progress", locale));
            response.setHasError(false);
        }

        log.info("----end getProgressForApplication-----");
        return response;
    }

    /**
     * Retourner l'étape IN_PROGRESS ou la prochaine PENDING
     */
    public Response<ApplicationProgressDto> getCurrentStage(Integer applicationId, Locale locale) throws ParseException {
        log.info("----begin getCurrentStage-----");
        Response<ApplicationProgressDto> response = new Response<>();

        // Chercher d'abord l'étape IN_PROGRESS
        ApplicationProgress current = applicationProgressRepository.findCurrentStage(applicationId);

        // Si pas d'étape IN_PROGRESS, prendre la prochaine PENDING
        if (current == null) {
            List<ApplicationProgress> pending = applicationProgressRepository.findPendingByApplicationId(applicationId);
            if (pending != null && !pending.isEmpty()) {
                current = pending.get(0);
            }
        }

        if (current != null) {
            List<ApplicationProgressDto> itemsDto = new ArrayList<>();
            itemsDto.add(ApplicationProgressTransformer.INSTANCE.toDto(current));

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(itemsDto);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);
        } else {
            response.setStatus(functionalError.DATA_EMPTY("application_progress", locale));
            response.setHasError(false);
        }

        log.info("----end getCurrentStage-----");
        return response;
    }

    /**
     * Identifier les candidats dont le pipeline peut être migré (au moins une étape PENDING ou IN_PROGRESS)
     */
    public List<Integer> getMigratableCandidates(Integer campaignId, Integer newTemplateId) {
        log.info("----begin getMigratableCandidates-----");
        List<Integer> migratableIds = new ArrayList<>();

        // Récupérer tous les source_tokens de la campagne
        List<SourceToken> tokens = sourceTokenRepository.findByCampaignId(campaignId, false);
        if (tokens == null || tokens.isEmpty()) {
            log.info("Aucun source_token trouvé pour la campagne: " + campaignId);
            return migratableIds;
        }

        // Pour chaque source_token, récupérer les applications
        for (SourceToken token : tokens) {
            List<Applications> apps = applicationsRepository.findBySourceTokenId(token.getId(), false);
            if (apps == null) continue;
            for (Applications app : apps) {
                List<ApplicationProgress> progress = applicationProgressRepository.findByApplicationIdOrderByStageOrder(app.getId());
                if (progress == null || progress.isEmpty()) continue;

                // Compatible = au moins une étape PENDING ou IN_PROGRESS
                boolean hasIncomplete = progress.stream()
                        .anyMatch(ap -> hasProgressStatus(ap, ProgressStatus.PENDING)
                                || hasProgressStatus(ap, ProgressStatus.IN_PROGRESS));
                if (hasIncomplete) {
                    migratableIds.add(app.getId());
                }
            }
        }

        log.info("----end getMigratableCandidates----- found " + migratableIds.size() + " migratable candidates");
        return migratableIds;
    }

    /**
     * Migrer un candidat vers un nouveau pipeline en faisant le matching par stage_type
     */
    public void migrateCandidateToNewPipeline(Integer applicationId, Integer newTemplateId, Integer userId) throws ParseException {
        log.info("----begin migrateCandidateToNewPipeline-----");

        Applications application = applicationsRepository.findOne(applicationId, false);
        if (application == null) return;

        // Récupérer le progrès actuel
        List<ApplicationProgress> currentProgress = applicationProgressRepository.findByApplicationIdOrderByStageOrder(applicationId);
        Map<String, ApplicationProgress> progressByType = new HashMap<>();
        for (ApplicationProgress ap : currentProgress) {
            progressByType.put(ap.getPipelineStage().getStageType(), ap);
        }

        // Récupérer les stages du nouveau template
        List<PipelineStage> newStages = pipelineStageRepository.findByPipelineTemplateIdOrderByStageOrder(newTemplateId);

        // Supprimer les anciens progrès (soft delete)
        for (ApplicationProgress ap : currentProgress) {
            ap.setIsDeleted(true);
            ap.setUpdatedAt(Utilities.getCurrentDate());
            ap.setUpdatedBy(userId);
        }
        applicationProgressRepository.saveAll(currentProgress);

        // Créer les nouveaux progrès
        for (PipelineStage newStage : newStages) {
            ApplicationProgress oldProgress = progressByType.get(newStage.getStageType());
            ApplicationProgress newProgress = new ApplicationProgress();
            newProgress.setApplications(application);
            newProgress.setPipelineStage(newStage);
            newProgress.setCreatedAt(Utilities.getCurrentDate());
            newProgress.setCreatedBy(userId);
            newProgress.setIsDeleted(false);

            if (oldProgress != null) {
                // Matching : reprendre le statut/score de l'ancien progrès
                newProgress.setProgressStatus(oldProgress.getProgressStatus());
                newProgress.setScore(oldProgress.getScore());
                newProgress.setNotes(oldProgress.getNotes());
                newProgress.setStartedAt(oldProgress.getStartedAt());
                newProgress.setCompletedAt(oldProgress.getCompletedAt());
                newProgress.setDecidedBy(oldProgress.getDecidedBy());
            } else {
                // Nouvelle étape pas dans l'ancien pipeline → PENDING
                newProgress.setProgressStatus(ProgressStatus.PENDING.getValue());
            }

            applicationProgressRepository.save(newProgress);
        }

        // Verrouiller le nouveau template
        pipelineTemplateBusiness.lockTemplate(newTemplateId, userId);

        log.info("----end migrateCandidateToNewPipeline-----");
    }

    /**
     * Migration en lot
     */
    public void migrateMultipleCandidates(List<Integer> applicationIds, Integer newTemplateId, Integer userId) throws ParseException {
        log.info("----begin migrateMultipleCandidates-----");
        for (Integer applicationId : applicationIds) {
            migrateCandidateToNewPipeline(applicationId, newTemplateId, userId);
        }
        log.info("----end migrateMultipleCandidates-----");
    }

    /**
     * Calculer le statut global d'une candidature depuis le progrès du pipeline.
     * Retourne un statut compatible avec applicationStatus existant.
     */
    public String computeApplicationStatus(Integer applicationId) {
        List<ApplicationProgress> progress = applicationProgressRepository.findByApplicationIdOrderByStageOrder(applicationId);
        if (progress == null || progress.isEmpty()) return "PENDING";

        String currentStageType = null;
        boolean hasTerminalFailure = false;
        String failureStageType = null;
        boolean allStagesResolved = true;
        boolean hasStarted = false;
        boolean preselectionPassed = false;

        for (ApplicationProgress ap : progress) {
            String pStatus = ap.getProgressStatus();
            PipelineStage stage = ap.getPipelineStage();
            String sType = stage != null ? stage.getStageType() : null;

            if (hasProgressStatus(pStatus, ProgressStatus.IN_PROGRESS)) {
                currentStageType = sType;
                hasStarted = true;
            }
            if (hasProgressStatus(pStatus, ProgressStatus.PASSED)
                    || hasProgressStatus(pStatus, ProgressStatus.FAILED)
                    || hasProgressStatus(pStatus, ProgressStatus.SKIPPED)) {
                hasStarted = true;
            }
            if (hasProgressStatus(pStatus, ProgressStatus.PASSED)
                    && StageType.PRESELECTION.getValue().equals(sType)) {
                preselectionPassed = true;
            }
            if (!isResolvedStatus(pStatus)) {
                allStagesResolved = false;
            }
            if (hasProgressStatus(pStatus, ProgressStatus.FAILED) && isTerminalFailure(stage)) {
                hasTerminalFailure = true;
                failureStageType = sType;
            }
        }

        if (hasTerminalFailure) {
            if (StageType.DECISION.getValue().equals(failureStageType)) return "FINAL_REJECTED";
            if (StageType.PRESELECTION.getValue().equals(failureStageType)) return "PRE_SCREEN_REJECTED";
            return "PRE_SCREEN_REJECTED";
        }

        if (allStagesResolved) return "FINAL_ACCEPTED";

        if (preselectionPassed) return "PRE_SCREEN_ACCEPTED";

        if (StageType.INTERVIEW.getValue().equals(currentStageType) || StageType.EVALUATION.getValue().equals(currentStageType)) {
            return "INTERVIEWING";
        }

        if (hasStarted) return "SUBMITTED";

        return "PENDING";
    }

    /**
     * Synchronise applicationStatus depuis le progrès du pipeline.
     * Appelé automatiquement après chaque changement de progrès.
     */
    public void syncApplicationStatus(Integer applicationId) {
        String newStatus = computeApplicationStatus(applicationId);
        Applications app = applicationsRepository.findOne(applicationId, false);
        if (app != null && !newStatus.equals(app.getApplicationStatus())) {
            app.setApplicationStatus(newStatus);
            app.setUpdatedAt(Utilities.getCurrentDate());
            applicationsRepository.save(app);
            log.info("syncApplicationStatus: application " + applicationId + " → " + newStatus);
        }
    }

    private ApplicationProgress getProgressOrThrow(Integer applicationId, Integer stageId, Locale locale) {
        ApplicationProgress progress = applicationProgressRepository.findByApplicationIdAndPipelineStageId(applicationId, stageId);
        if (progress == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST(
                    "application_progress pour application " + applicationId + " et stage " + stageId,
                    locale));
        }
        return progress;
    }

    private void ensureStageCanBeCompleted(ApplicationProgress targetProgress, Locale locale) {
        List<ApplicationProgress> allProgress = applicationProgressRepository.findByApplicationIdOrderByStageOrder(
                targetProgress.getApplications().getId());

        for (ApplicationProgress progress : allProgress) {
            if (progress.getId() != null && progress.getId().equals(targetProgress.getId())) {
                break;
            }

            PipelineStage stage = progress.getPipelineStage();
            if (stage != null
                    && Boolean.TRUE.equals(stage.getIsRequired())
                    && !isResolvedStatus(progress.getProgressStatus())) {
                throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                        "Les étapes obligatoires précédentes doivent être traitées avant de finaliser cette étape",
                        locale));
            }
        }
    }

    private void activateNextPendingStage(Integer applicationId, ApplicationProgress currentProgress, Integer userId) {
        if (isNextStageWaitingForRequiredMail(currentProgress)) {
            return;
        }

        ApplicationProgress activeProgress = applicationProgressRepository.findCurrentStage(applicationId);
        if (activeProgress != null) {
            return;
        }

        Integer currentStageOrder = currentProgress != null && currentProgress.getPipelineStage() != null
                ? currentProgress.getPipelineStage().getStageOrder()
                : null;
        if (currentStageOrder == null) {
            return;
        }

        List<ApplicationProgress> pendingStages = applicationProgressRepository.findPendingByApplicationId(applicationId);
        if (pendingStages == null || pendingStages.isEmpty()) {
            return;
        }

        for (ApplicationProgress pendingStage : pendingStages) {
            if (pendingStage.getPipelineStage() != null
                    && pendingStage.getPipelineStage().getStageOrder() > currentStageOrder) {
                activateStage(pendingStage, userId);
                return;
            }
        }
    }

    private void activateStage(ApplicationProgress progress, Integer userId) {
        progress.setProgressStatus(ProgressStatus.IN_PROGRESS.getValue());
        if (progress.getStartedAt() == null) {
            progress.setStartedAt(Utilities.getCurrentDate());
        }
        progress.setUpdatedAt(Utilities.getCurrentDate());
        progress.setUpdatedBy(userId);
        applicationProgressRepository.save(progress);
    }

    public void markStageMailSent(Integer applicationId, Integer stageId, Integer userId) {
        updateStageMailSent(applicationId, stageId, true, userId);
    }

    public void markStageMailSentByStageType(Integer applicationId, String stageType, Integer userId) {
        updateStageMailSentByStageType(applicationId, stageType, true, userId);
    }

    public void clearStageMailSentByStageType(Integer applicationId, String stageType, Integer userId) {
        updateStageMailSentByStageType(applicationId, stageType, false, userId);
    }

    private ApplicationProgress findProgressByStageType(Integer applicationId, String stageType) {
        List<ApplicationProgress> progressList = applicationProgressRepository.findByApplicationIdOrderByStageOrder(applicationId);
        if (progressList == null || progressList.isEmpty()) {
            return null;
        }

        for (ApplicationProgress progress : progressList) {
            if (progress.getPipelineStage() != null
                    && stageType.equalsIgnoreCase(progress.getPipelineStage().getStageType())) {
                return progress;
            }
        }
        return null;
    }

    private void updateStageMailSentByStageType(Integer applicationId, String stageType, boolean mailSent, Integer userId) {
        if (applicationId == null || !Utilities.notBlank(stageType)) {
            return;
        }

        ApplicationProgress progress = findProgressByStageType(applicationId, stageType);
        if (progress == null || progress.getId() == null) {
            return;
        }

        updateStageMailSent(applicationId, progress.getPipelineStage() != null ? progress.getPipelineStage().getId() : null, mailSent, userId);
    }

    private void updateStageMailSent(Integer applicationId, Integer stageId, boolean mailSent, Integer userId) {
        if (applicationId == null || stageId == null) {
            return;
        }

        ApplicationProgress progress = applicationProgressRepository.findByApplicationIdAndPipelineStageId(applicationId, stageId);
        if (progress == null) {
            return;
        }

        if (Boolean.valueOf(mailSent).equals(progress.getMailSent())) {
            if (mailSent && isResolvedStatus(progress.getProgressStatus())) {
                activateNextPendingStage(applicationId, progress, userId);
            }
            return;
        }

        progress.setMailSent(mailSent);
        progress.setUpdatedAt(Utilities.getCurrentDate());
        progress.setUpdatedBy(userId);
        applicationProgressRepository.save(progress);

        if (mailSent && isResolvedStatus(progress.getProgressStatus())) {
            activateNextPendingStage(applicationId, progress, userId);
        }
    }

    private boolean isNextStageWaitingForRequiredMail(ApplicationProgress currentProgress) {
        if (currentProgress == null || currentProgress.getPipelineStage() == null) {
            return false;
        }
        return Boolean.TRUE.equals(currentProgress.getPipelineStage().getEmailRequired())
                && !Boolean.TRUE.equals(currentProgress.getMailSent());
    }

    private boolean isResolvedStatus(String progressStatus) {
        return hasProgressStatus(progressStatus, ProgressStatus.PASSED)
                || hasProgressStatus(progressStatus, ProgressStatus.FAILED)
                || hasProgressStatus(progressStatus, ProgressStatus.SKIPPED);
    }

    private String normalizeProgressStatus(String progressStatus, Locale locale) {
        try {
            return ProgressStatus.fromValue(progressStatus).getValue();
        } catch (IllegalArgumentException exception) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Statut de progression invalide: " + progressStatus,
                    locale));
        }
    }

    private String normalizeNullableProgressStatus(String progressStatus, Locale locale) {
        if (progressStatus == null) {
            return null;
        }
        return normalizeProgressStatus(progressStatus, locale);
    }

    private boolean hasProgressStatus(ApplicationProgress progress, ProgressStatus status) {
        return progress != null && hasProgressStatus(progress.getProgressStatus(), status);
    }

    private boolean hasProgressStatus(String progressStatus, ProgressStatus status) {
        return progressStatus != null && status.getValue().equalsIgnoreCase(progressStatus);
    }

    private boolean isTerminalFailure(PipelineStage stage) {
        if (stage == null) {
            return false;
        }

        String stageType = stage.getStageType();
        return Boolean.TRUE.equals(stage.getIsEliminatory())
                || StageType.PRESELECTION.getValue().equals(stageType)
                || StageType.DECISION.getValue().equals(stageType);
    }

    private boolean isSkipAllowed(PipelineStage stage) {
        if (stage == null) {
            return false;
        }
        if (!Boolean.TRUE.equals(stage.getIsRequired())) {
            return true;
        }

        JsonNode config = readStageConfig(stage);
        return config != null && config.path("allowSkip").asBoolean(false);
    }

    private JsonNode readStageConfig(PipelineStage stage) {
        if (stage == null || !Utilities.notBlank(stage.getConfigJson())) {
            return null;
        }

        try {
            JsonNode config = objectMapper.readTree(stage.getConfigJson());
            return config != null && config.isObject() ? config : null;
        } catch (Exception exception) {
            log.warning("Config JSON invalide ignorée pour le stage " + stage.getId() + ": " + exception.getMessage());
            return null;
        }
    }

    private void ensureCampaignMutationAllowed(Integer applicationId, Integer userId, Locale locale, String actionLabel) {
        if (userId == null) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
        }

        Applications application = applicationsRepository.findOne(applicationId, false);
        if (application == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications id -> " + applicationId, locale));
        }

        Campaigns campaign = getCampaignForApplication(application, locale);
        boolean hasScopedRight = permissionService.hasAnyScopedPermission(
            userId,
            "CAMPAIGN",
            campaign.getId(),
            new String[] {
                FunctionalityEnum.UPDATE_APPLICATION_PROGRESS.getValue(),
                FunctionalityEnum.ADVANCE_PIPELINE.getValue()
            },
            "ADMIN",
            "ADVANCE_PIPELINE");

        if (!hasScopedRight) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Accès refusé: droits insuffisants pour " + actionLabel,
                    locale));
        }
    }

    private void ensureCampaignRollbackAllowed(Integer applicationId, Integer userId, Locale locale) {
        if (userId == null) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
        }

        Applications application = applicationsRepository.findOne(applicationId, false);
        if (application == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications id -> " + applicationId, locale));
        }

        Campaigns campaign = getCampaignForApplication(application, locale);
        boolean hasScopedRight = permissionService.hasScopedPermission(
            userId,
            "CAMPAIGN",
            campaign.getId(),
            FunctionalityEnum.MIGRATE_CANDIDATE_PIPELINE.getValue(),
            "ADMIN");

        if (!hasScopedRight) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Accès refusé: droits insuffisants pour revenir en arrière sur cette candidature",
                    locale));
        }
    }

    private Campaigns getCampaignForApplication(Applications application, Locale locale) {
        SourceToken sourceToken = application.getSourceToken();
        if (sourceToken == null || sourceToken.getCampaigns() == null || sourceToken.getCampaigns().getId() == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST(
                    "campaign linked to application -> " + application.getId(),
                    locale));
        }
        return sourceToken.getCampaigns();
    }
}
