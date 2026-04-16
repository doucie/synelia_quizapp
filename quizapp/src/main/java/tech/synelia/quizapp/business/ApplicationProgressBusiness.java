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
import java.util.stream.Collectors;

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
    private FunctionalError functionalError;
    @Autowired
    private TechnicalError technicalError;
    @Autowired
    private ExceptionUtils exceptionUtils;
    @PersistenceContext
    private EntityManager em;

    private SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

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
            if (entityToSave.getProgressStatus() == null) entityToSave.setProgressStatus("PENDING");
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

            if (Utilities.shouldUpdate(dto.getProgressStatus())) entityToSave.setProgressStatus(dto.getProgressStatus());
            if (dto.getScore() != null) entityToSave.setScore(dto.getScore());
            if (Utilities.shouldUpdate(dto.getNotes())) entityToSave.setNotes(dto.getNotes());
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
            progress.setProgressStatus("PENDING");
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
    public Response<ApplicationProgressDto> advanceToNextStage(Integer applicationId, Integer userId, Locale locale) throws ParseException {
        log.info("----begin advanceToNextStage-----");
        Response<ApplicationProgressDto> response = new Response<>();

        // Trouver l'étape IN_PROGRESS
        ApplicationProgress current = applicationProgressRepository.findCurrentStage(applicationId);
        if (current != null) {
            current.setProgressStatus("PASSED");
            current.setCompletedAt(Utilities.getCurrentDate());
            current.setDecidedBy(userRepository.findOne(userId, false));
            current.setUpdatedAt(Utilities.getCurrentDate());
            current.setUpdatedBy(userId);
            applicationProgressRepository.save(current);
        }

        // Trouver la prochaine étape PENDING
        List<ApplicationProgress> pending = applicationProgressRepository.findPendingByApplicationId(applicationId);
        if (pending != null && !pending.isEmpty()) {
            ApplicationProgress next = pending.get(0);
            next.setProgressStatus("IN_PROGRESS");
            next.setStartedAt(Utilities.getCurrentDate());
            next.setUpdatedAt(Utilities.getCurrentDate());
            next.setUpdatedBy(userId);
            applicationProgressRepository.save(next);
        }

        // Synchroniser applicationStatus
        syncApplicationStatus(applicationId);

        // Retourner le progrès complet
        return getProgressForApplication(applicationId, false, locale);
    }

    /**
     * Échouer une étape : marquer FAILED + SKIPPED pour les suivantes si éliminatoire
     */
    public Response<ApplicationProgressDto> failStage(Integer applicationId, Integer stageId, Integer decidedById, String notes, Locale locale) throws ParseException {
        log.info("----begin failStage-----");
        Response<ApplicationProgressDto> response = new Response<>();

        ApplicationProgress progress = applicationProgressRepository.findByApplicationIdAndPipelineStageId(applicationId, stageId);
        if (progress == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("application_progress pour application " + applicationId + " et stage " + stageId, locale));
        }

        User decidedBy = decidedById != null ? userRepository.findOne(decidedById, false) : null;

        progress.setProgressStatus("FAILED");
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
                        && "PENDING".equals(ap.getProgressStatus())) {
                    ap.setProgressStatus("SKIPPED");
                    ap.setUpdatedAt(Utilities.getCurrentDate());
                    ap.setUpdatedBy(decidedById);
                    applicationProgressRepository.save(ap);
                }
            }
        }

        // Synchroniser applicationStatus
        syncApplicationStatus(applicationId);

        return getProgressForApplication(applicationId, false, locale);
    }

    /**
     * Sauter une étape (pour étapes non requises)
     */
    public Response<ApplicationProgressDto> skipStage(Integer applicationId, Integer stageId, Integer userId, Locale locale) throws ParseException {
        log.info("----begin skipStage-----");
        Response<ApplicationProgressDto> response = new Response<>();

        ApplicationProgress progress = applicationProgressRepository.findByApplicationIdAndPipelineStageId(applicationId, stageId);
        if (progress == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("application_progress pour application " + applicationId + " et stage " + stageId, locale));
        }

        progress.setProgressStatus("SKIPPED");
        progress.setUpdatedAt(Utilities.getCurrentDate());
        progress.setUpdatedBy(userId);
        applicationProgressRepository.save(progress);

        // Synchroniser applicationStatus
        syncApplicationStatus(applicationId);

        return getProgressForApplication(applicationId, false, locale);
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
                        .anyMatch(ap -> "PENDING".equals(ap.getProgressStatus()) || "IN_PROGRESS".equals(ap.getProgressStatus()));
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
                newProgress.setProgressStatus("PENDING");
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

        // Trouver l'étape la plus avancée avec un état significatif
        String lastSignificantStageType = null;
        String lastSignificantStatus = null;
        boolean hasFailed = false;
        boolean allDone = true;

        for (ApplicationProgress ap : progress) {
            String pStatus = ap.getProgressStatus();
            String sType = ap.getPipelineStage() != null ? ap.getPipelineStage().getStageType() : null;

            if ("FAILED".equals(pStatus)) {
                hasFailed = true;
                lastSignificantStageType = sType;
                lastSignificantStatus = pStatus;
            } else if ("PASSED".equals(pStatus) || "IN_PROGRESS".equals(pStatus)) {
                lastSignificantStageType = sType;
                lastSignificantStatus = pStatus;
            }
            if (!"PASSED".equals(pStatus) && !"SKIPPED".equals(pStatus)) {
                allDone = false;
            }
        }

        // Candidature rejetée — identifier d'où vient le rejet
        if (hasFailed) {
            if ("PRESELECTION".equals(lastSignificantStageType)) return "PRE_SCREEN_REJECTED";
            if ("DECISION".equals(lastSignificantStageType)) return "FINAL_REJECTED";
            return "PRE_SCREEN_REJECTED"; // défaut si type inconnu
        }

        // Toutes les étapes terminées (PASSED ou SKIPPED) = accepté
        if (allDone) return "FINAL_ACCEPTED";

        // Sinon, en cours — déterminer le statut basé sur l'étape courante
        if ("PRESELECTION".equals(lastSignificantStageType) && "PASSED".equals(lastSignificantStatus)) return "PRE_SCREEN_ACCEPTED";
        if ("INTERVIEW".equals(lastSignificantStageType)) return "INTERVIEWING";
        if ("IN_PROGRESS".equals(lastSignificantStatus)) return "SUBMITTED";

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
}
