package tech.synelia.quizapp.business;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

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
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.PipelineStage;
import tech.synelia.quizapp.dao.entity.PipelineStageNotificationRule;
import tech.synelia.quizapp.dao.entity.PipelineTemplate;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.MailLog;
import tech.synelia.quizapp.dao.repository.ApplicationProgressRepository;
import tech.synelia.quizapp.dao.repository.ApplicationsRepository;
import tech.synelia.quizapp.dao.repository.InterviewsRepository;
import tech.synelia.quizapp.dao.repository.MailLogRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageNotificationRuleRepository;
import tech.synelia.quizapp.dao.repository.PipelineStageRepository;
import tech.synelia.quizapp.dao.repository.PipelineTemplateRepository;
import tech.synelia.quizapp.dao.repository.SourceTokenRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.StatusCode;
import tech.synelia.quizapp.utils.StatusMessage;
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
    private InterviewsRepository interviewsRepository;
    @Autowired
    private MailLogRepository mailLogRepository;
    @Autowired
    private PipelineStageNotificationRuleRepository pipelineStageNotificationRuleRepository;
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
        Set<Integer> applicationIdsToSync = new HashSet<>();

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

            ApplicationProgress entityToSave = ApplicationProgressTransformer.INSTANCE.toEntity(dto, application, stage);
            entityToSave.setCreatedAt(Utilities.getCurrentDate());            entityToSave.setCreatedBy(request.getUser());
            entityToSave.setIsDeleted(false);
            if (Utilities.notBlank(entityToSave.getProgressStatus())) {
                entityToSave.setProgressStatus(normalizeProgressStatus(entityToSave.getProgressStatus(), locale));
            } else {
                entityToSave.setProgressStatus(ProgressStatus.PENDING.getValue());
            }
            items.add(entityToSave);
            applicationIdsToSync.add(dto.getApplicationId());
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

            for (Integer applicationId : applicationIdsToSync) {
                if (applicationId != null) {
                    syncApplicationStatus(applicationId);
                }
            }
        }
        log.info("----end create ApplicationProgress-----");
        return response;
    }

    @Override
    public Response<ApplicationProgressDto> update(Request<ApplicationProgressDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin update ApplicationProgress-----");
        Response<ApplicationProgressDto> response = new Response<>();
        List<ApplicationProgress> items = new ArrayList<>();
        Set<Integer> applicationIdsToSync = new HashSet<>();

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
            if (dto.getIsDeleted() != null) entityToSave.setIsDeleted(dto.getIsDeleted());

            entityToSave.setUpdatedAt(Utilities.getCurrentDate());
            entityToSave.setUpdatedBy(request.getUser());
            items.add(entityToSave);
            applicationIdsToSync.add(entityToSave.getApplications() != null ? entityToSave.getApplications().getId() : null);
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

            for (Integer applicationId : applicationIdsToSync) {
                if (applicationId != null) {
                    syncApplicationStatus(applicationId);
                }
            }
        }
        log.info("----end update ApplicationProgress-----");
        return response;
    }

    @Override
    public Response<ApplicationProgressDto> delete(Request<ApplicationProgressDto> request, Locale locale) throws ParseException, JsonProcessingException {
        log.info("----begin delete ApplicationProgress-----");
        Response<ApplicationProgressDto> response = new Response<>();
        List<ApplicationProgress> items = new ArrayList<>();
        Set<Integer> applicationIdsToSync = new HashSet<>();

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
            applicationIdsToSync.add(existingEntity.getApplications() != null ? existingEntity.getApplications().getId() : null);
        }

        if (!items.isEmpty()) {
            applicationProgressRepository.saveAll(items);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setHasError(false);
            response.setHttpCode(HttpStatus.OK.value());
            response.setStatus(status);

            for (Integer applicationId : applicationIdsToSync) {
                if (applicationId != null) {
                    syncApplicationStatus(applicationId);
                }
            }
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

        List<PipelineStage> stages = pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(pipelineTemplateId);
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

        syncApplicationStatus(applicationId);

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

        if (!hasProgressStatus(progress, ProgressStatus.COMPLETED)) {
            if (progress.getStartedAt() == null) {
                progress.setStartedAt(Utilities.getCurrentDate());
            }
            progress.setProgressStatus(ProgressStatus.COMPLETED.getValue());
            progress.setCompletedAt(Utilities.getCurrentDate());
            progress.setNotes(notes);
            progress.setScore(score);
            if (decidedById != null) {
                User decidedBy = userRepository.findOne(decidedById, false);
                if (decidedBy != null) {
                    progress.setValidatedBy(decidedBy);
                    progress.setValidatedAt(Utilities.getCurrentDate());
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
        if (decidedBy != null) {
            progress.setValidatedBy(decidedBy);
            progress.setValidatedAt(Utilities.getCurrentDate());
        }
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

        if (isNextStageWaitingForRequiredMail(progress)) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "Cette étape ne peut pas être ignorée tant que l'email requis n'a pas été envoyé",
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
                progress.setSkippedBy(decidedBy);
                progress.setSkippedAt(Utilities.getCurrentDate());
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
                if (userId != null) {
                    User reopenedBy = userRepository.findOne(userId, false);
                    progress.setReopenedBy(reopenedBy);
                }
                progress.setReopenedAt(Utilities.getCurrentDate());
                progress.setValidatedBy(null);
                progress.setValidatedAt(null);
                progress.setSkippedBy(null);
                progress.setSkippedAt(null);
                cancelSentMailLogRows(progress, userId);
            } else {
                progress.setProgressStatus(ProgressStatus.PENDING.getValue());
                progress.setStartedAt(null);
                progress.setCompletedAt(null);
                progress.setScore(null);
                progress.setNotes(null);
                progress.setValidatedBy(null);
                progress.setValidatedAt(null);
                progress.setSkippedBy(null);
                progress.setSkippedAt(null);
                progress.setReopenedBy(null);
                progress.setReopenedAt(null);
                cancelSentMailLogRows(progress, userId);
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
        syncInterviewEvaluationStages(applicationId, null, score, interviewCompleted, userId, locale);
    }

    public void syncInterviewEvaluationStages(
            Integer applicationId,
            Integer interviewProgressId,
            Double score,
            boolean interviewCompleted,
            Integer userId,
            Locale locale) throws ParseException {
        if (applicationId == null) {
            return;
        }

        ApplicationProgress interviewProgress = resolveInterviewProgressOccurrence(applicationId, interviewProgressId);
        if (interviewProgress == null) {
            return;
        }

        double normalizedScore = score != null ? score : 0d;

        updateStageScore(interviewProgress, normalizedScore, userId, false);
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

    private void updateStageScore(Integer applicationId, String stageType, Double score, Integer userId, boolean activateIfPending) {
        if (applicationId == null || !Utilities.notBlank(stageType) || score == null) {
            return;
        }

        ApplicationProgress progress = findProgressByStageType(applicationId, stageType);
        updateStageScore(progress, score, userId, activateIfPending);
    }

    public void updateStageScore(ApplicationProgress progress, Double score, Integer userId, boolean activateIfPending) {
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
        if (progress.getApplications() != null && progress.getApplications().getId() != null) {
            syncApplicationStatus(progress.getApplications().getId());
        }
    }

    private void ensureStagePassed(Integer applicationId, ApplicationProgress progress, Integer userId, Double score, String notes, Locale locale) throws ParseException {
        if (progress == null || progress.getPipelineStage() == null) {
            return;
        }

        if (score != null) {
            updateStageScore(progress, score, userId, false);
        }

        if (!hasProgressStatus(progress, ProgressStatus.COMPLETED)) {
            passStage(applicationId, progress.getPipelineStage().getId(), userId, score, notes, locale);
        }
    }

    private void resolveScoredStage(Integer applicationId, ApplicationProgress progress, double score, Integer userId, Locale locale, String passNotes, String failNotes) throws ParseException {
        if (progress == null || progress.getPipelineStage() == null) {
            return;
        }

        updateStageScore(progress, score, userId, false);
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

        ApplicationProgress current = resolveCurrentStageProgress(applicationId);

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
        List<PipelineStage> newStages = pipelineStageRepository.findActiveByTemplateIdOrderByStageOrder(newTemplateId);

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
                newProgress.setValidatedAt(oldProgress.getValidatedAt());
                newProgress.setValidatedBy(oldProgress.getValidatedBy());
                newProgress.setSkippedAt(oldProgress.getSkippedAt());
                newProgress.setSkippedBy(oldProgress.getSkippedBy());
                newProgress.setReopenedAt(oldProgress.getReopenedAt());
                newProgress.setReopenedBy(oldProgress.getReopenedBy());
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
     * Synchronise les miroirs de résumé du pipeline (current_pipeline_*).
     * Appelé automatiquement après chaque changement de progrès.
     * Le statut candidat global n'est plus persisté (dérivé à la lecture depuis les miroirs).
     */
    public void syncApplicationStatus(Integer applicationId) {
        ApplicationProgress currentStage = resolveCurrentStageProgress(applicationId);
        Applications app = applicationsRepository.findOne(applicationId, false);
        if (app == null) {
            return;
        }

        String currentStageType = currentStage != null && currentStage.getPipelineStage() != null
                ? currentStage.getPipelineStage().getStageType()
                : null;
        String currentStageLabel = currentStage != null && currentStage.getPipelineStage() != null
                ? currentStage.getPipelineStage().getStageLabel()
                : null;
        String currentStageProgressStatus = currentStage != null ? currentStage.getProgressStatus() : null;

        boolean stageSummaryChanged = !Objects.equals(currentStageType, app.getCurrentPipelineStageType())
                || !Objects.equals(currentStageLabel, app.getCurrentPipelineStageLabel())
                || !Objects.equals(currentStageProgressStatus, app.getCurrentPipelineProgressStatus());

        if (stageSummaryChanged) {
            app.setCurrentPipelineStageType(currentStageType);
            app.setCurrentPipelineStageLabel(currentStageLabel);
            app.setCurrentPipelineProgressStatus(currentStageProgressStatus);
            app.setUpdatedAt(Utilities.getCurrentDate());
            applicationsRepository.save(app);
            log.info("syncApplicationStatus: application " + applicationId + " → stage=" + currentStageType + "/" + currentStageProgressStatus);
        }
    }

    private ApplicationProgress resolveCurrentStageProgress(Integer applicationId) {
        ApplicationProgress current = applicationProgressRepository.findCurrentStage(applicationId);
        if (current != null) {
            return current;
        }

        List<ApplicationProgress> pending = applicationProgressRepository.findPendingByApplicationId(applicationId);
        if (pending != null && !pending.isEmpty()) {
            return pending.get(0);
        }

        return null;
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
        ApplicationProgress progress = applicationProgressRepository.findByApplicationIdAndPipelineStageId(applicationId, stageId);
        if (progress == null || progress.getId() == null) {
            return;
        }
        if (isResolvedStatus(progress.getProgressStatus())) {
            activateNextPendingStage(applicationId, progress, userId);
        }
        syncApplicationStatus(applicationId);
    }

    public void clearStageMailSent(Integer applicationId, Integer stageId, Integer userId) {
        ApplicationProgress progress = applicationProgressRepository.findByApplicationIdAndPipelineStageId(applicationId, stageId);
        if (progress == null || progress.getId() == null) {
            return;
        }
        cancelSentMailLogRows(progress, userId);
        syncApplicationStatus(applicationId);
    }

    public void markStageMailSentByStageType(Integer applicationId, String stageType, Integer userId) {
        ApplicationProgress progress = findProgressByStageType(applicationId, stageType);
        if (progress == null || progress.getId() == null) {
            return;
        }
        if (isResolvedStatus(progress.getProgressStatus())) {
            activateNextPendingStage(applicationId, progress, userId);
        }
        syncApplicationStatus(applicationId);
    }

    public void clearStageMailSentByStageType(Integer applicationId, String stageType, Integer userId) {
        ApplicationProgress progress = findProgressByStageType(applicationId, stageType);
        if (progress == null || progress.getId() == null) {
            return;
        }
        cancelSentMailLogRows(progress, userId);
        syncApplicationStatus(applicationId);
    }

    private void cancelSentMailLogRows(ApplicationProgress progress, Integer userId) {
        if (progress == null || progress.getId() == null) {
            return;
        }
        List<MailLog> sentRows = mailLogRepository.findByApplicationProgressIdAndStatus(progress.getId(), "SENT");
        if (sentRows == null || sentRows.isEmpty()) {
            return;
        }
        for (MailLog mailLog : sentRows) {
            mailLog.setStatus("CANCELLED");
            mailLog.setUpdatedAt(Utilities.getCurrentDate());
            mailLog.setUpdatedBy(userId);
        }
        mailLogRepository.saveAll(sentRows);
    }

    public ApplicationProgress resolveProgressByStageType(Integer applicationId, String stageType) {
        return findProgressByStageType(applicationId, stageType);
    }

    public Interviews resolveCurrentInterviewByApplicationId(Integer applicationId) {
        if (applicationId == null) {
            return null;
        }
        ApplicationProgress interviewProgress = resolveProgressByStageType(applicationId, StageType.INTERVIEW.getValue());
        if (interviewProgress == null || interviewProgress.getId() == null) {
            return null;
        }
        List<Interviews> interviews = interviewsRepository.findByApplicationProgressId(interviewProgress.getId(), false);
        return selectCurrentInterview(interviews);
    }

    private Interviews selectCurrentInterview(List<Interviews> interviews) {
        if (interviews == null || interviews.isEmpty()) {
            return null;
        }

        return interviews.stream()
                .filter(Objects::nonNull)
                .sorted((left, right) -> {
                    int priorityComparison = Integer.compare(getInterviewSummaryPriority(left.getInterviewStatus()), getInterviewSummaryPriority(right.getInterviewStatus()));
                    if (priorityComparison != 0) {
                        return priorityComparison;
                    }

                    long rightDate = right.getInterviewDate() != null ? right.getInterviewDate().getTime() : 0L;
                    long leftDate = left.getInterviewDate() != null ? left.getInterviewDate().getTime() : 0L;
                    if (leftDate != rightDate) {
                        return Long.compare(rightDate, leftDate);
                    }

                    return Integer.compare(
                            right.getId() != null ? right.getId() : 0,
                            left.getId() != null ? left.getId() : 0);
                })
                .findFirst()
                .orElse(null);
    }

    private int getInterviewSummaryPriority(String interviewStatus) {
        if (interviewStatus == null || interviewStatus.trim().isEmpty()) {
            return 99;
        }

        switch (interviewStatus.trim().toUpperCase(Locale.ROOT)) {
            case "IN_PROGRESS":
                return 0;
            case "SCHEDULED":
                return 1;
            case "AWAITING_EVALUATION":
                return 2;
            case "AWAITING_VALIDATION":
                return 3;
            case "CLOSED":
                return 4;
            case "CANCELLED":
                return 5;
            default:
                return 99;
        }
    }

    private ApplicationProgress resolveInterviewProgressOccurrence(Integer applicationId, Integer interviewProgressId) {
        if (interviewProgressId != null) {
            ApplicationProgress explicitProgress = applicationProgressRepository.findOne(interviewProgressId, false);
            if (matchesStageType(explicitProgress, StageType.INTERVIEW.getValue())
                    && explicitProgress.getApplications() != null
                    && applicationId.equals(explicitProgress.getApplications().getId())) {
                return explicitProgress;
            }
        }

        return findProgressByStageType(applicationId, StageType.INTERVIEW.getValue());
    }

    public List<ApplicationProgress> listProgressOccurrences(Integer applicationId, String stageType) {
        if (applicationId == null || !Utilities.notBlank(stageType)) {
            return new ArrayList<>();
        }

        List<ApplicationProgress> progressList = applicationProgressRepository.findByApplicationIdOrderByStageOrder(applicationId);
        if (progressList == null || progressList.isEmpty()) {
            return new ArrayList<>();
        }

        List<ApplicationProgress> occurrences = new ArrayList<>();
        for (ApplicationProgress progress : progressList) {
            if (matchesStageType(progress, stageType)) {
                occurrences.add(progress);
            }
        }
        return occurrences;
    }

    private ApplicationProgress findProgressByStageType(Integer applicationId, String stageType) {
        List<ApplicationProgress> matchingProgress = listProgressOccurrences(applicationId, stageType);
        if (matchingProgress.isEmpty()) {
            return null;
        }

        ApplicationProgress currentProgress = resolveCurrentStageProgress(applicationId);
        if (matchesStageType(currentProgress, stageType)) {
            return currentProgress;
        }

        for (ApplicationProgress progress : matchingProgress) {
            if (hasProgressStatus(progress, ProgressStatus.IN_PROGRESS)) {
                return progress;
            }
        }

        for (ApplicationProgress progress : matchingProgress) {
            if (hasProgressStatus(progress, ProgressStatus.PENDING)) {
                return progress;
            }
        }

        for (int index = matchingProgress.size() - 1; index >= 0; index--) {
            return matchingProgress.get(index);
        }

        return null;
    }

    private boolean matchesStageType(ApplicationProgress progress, String stageType) {
        return progress != null
                && progress.getPipelineStage() != null
                && Utilities.notBlank(stageType)
                && stageType.equalsIgnoreCase(progress.getPipelineStage().getStageType());
    }

    private boolean isNextStageWaitingForRequiredMail(ApplicationProgress currentProgress) {
        if (currentProgress == null || currentProgress.getPipelineStage() == null) {
            return false;
        }
        PipelineStageNotificationRule notificationRule = pipelineStageNotificationRuleRepository
                .findFirstByPipelineStageIdAndIsDeletedFalse(currentProgress.getPipelineStage().getId());
        boolean emailRequired = notificationRule != null && Boolean.TRUE.equals(notificationRule.getIsRequired());
        boolean mailSent = currentProgress.getId() != null
                && mailLogRepository.existsByApplicationProgressIdAndStatus(currentProgress.getId(), "SENT");
        return emailRequired && !mailSent;
    }

    private boolean isResolvedStatus(String progressStatus) {
        return hasProgressStatus(progressStatus, ProgressStatus.COMPLETED)
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
        if (stage.getStageType() != null
                && (StageType.CANDIDATURE.getValue().equalsIgnoreCase(stage.getStageType())
                || StageType.DECISION.getValue().equalsIgnoreCase(stage.getStageType()))) {
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
