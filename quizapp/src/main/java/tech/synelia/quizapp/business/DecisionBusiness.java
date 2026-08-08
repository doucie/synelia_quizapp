/*
 * Java business for entity table decisions
 * Created on 2025-10-27 ( Time 12:00:00 )
 * Generator tool : Synelia Tools
 */

package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;

import java.text.ParseException;
import java.util.*;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.utils.enums.DecisionType;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.utils.enums.EmailActionType;
import tech.synelia.quizapp.business.MailLogService.MailLogContext;
import tech.synelia.quizapp.dao.entity.Decision;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * BUSINESS for table "decisions"
 *
 * @author Synelia
 */
@Log
@Component
public class DecisionBusiness implements IBasicBusiness<Request<DecisionDto>, Response<DecisionDto>> {

    private static final String MAIL_SENDER_NAME = "Synelia Recrutement";
    private static final String DEFAULT_DECISION_MODE = "STANDARD";
    private static final String CANCEL_DECISION_MODE = "CANCEL";
    private static final Set<String> DECISION_MODE_ALLOWED_VALUES = Set.of("STANDARD", "CANCEL", "OVERRIDE", "ROLLBACK");
    private static final String DECISION_TYPE_ALLOWED_VALUES = String.join("/",
            Arrays.stream(DecisionType.values()).map(DecisionType::getValue).toArray(String[]::new));

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private ApplicationsRepository applicationsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PipelineStageRepository pipelineStageRepository;

    @Autowired
    private PipelineStageNotificationRuleRepository pipelineStageNotificationRuleRepository;

    @Autowired
    private MailLogRepository mailLogRepository;

    @Autowired
    private ApplicationProgressRepository applicationProgressRepository;

    @Autowired
    private ApplicationProgressBusiness applicationProgressBusiness;

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private HostingUtils hostingUtils;

    @Autowired
    private ParamsUtils paramsUtils;

    @Autowired
    private EmailTemplateBusiness emailTemplateBusiness;

    @Autowired
    private PlatformReadinessService platformReadinessService;

    @Autowired
    private AuditEventService auditEventService;

    @Autowired
    private FunctionalError functionalError;
    @PersistenceContext
    private EntityManager em;

    /**
     * create Decision by using DecisionDto as object.
     *
     * @param request
     * @return response
     */
    @Override
    @Transactional
    public Response<DecisionDto> create(Request<DecisionDto> request, Locale locale) throws ParseException {
        log.info("----begin create Decision-----");

        Response<DecisionDto> response = new Response<DecisionDto>();
        List<Decision> items = new ArrayList<Decision>();

        for (DecisionDto dto : request.getDatas()) {
            // Validation
            Response<DecisionDto> validation = validateForCreate(dto, locale);
            if (validation.isHasError()) {
                response.setStatus(validation.getStatus());
                response.setHasError(true);
                return response;
            }

                ensureCampaignDecisionAllowed(
                    dto.getApplicationId(),
                    request.getUser(),
                    locale,
                    "prendre cette décision",
                    FunctionalityEnum.CREATE_DECISIONS.getValue(),
                    FunctionalityEnum.ADVANCE_PIPELINE.getValue());

            // Check if application exists
            if (dto.getApplicationId() != null) {
                Applications app = applicationsRepository.findOne(dto.getApplicationId(), false);
                if (app == null) {
                    response.setStatus(functionalError.DATA_NOT_EXIST("Application", locale));
                    response.setHasError(true);
                    return response;
                }
            }

            // Check if user exists
            if (dto.getUserId() != null) {
                User user = userRepository.findOne(dto.getUserId(), false);
                if (user == null) {
                    response.setStatus(functionalError.DATA_NOT_EXIST("User", locale));
                    response.setHasError(true);
                    return response;
                }
            }

            // Transform and save
            Decision entity = DecisionTransformer.INSTANCE.toEntity(dto);
            
            // Set relationships manually
            if (dto.getUserId() != null) {
                User user = new User();
                user.setId(dto.getUserId());
                entity.setUser(user);
            }
            if (dto.getApplicationProgressId() != null) {
                ApplicationProgress progress = new ApplicationProgress();
                progress.setId(dto.getApplicationProgressId());
                entity.setApplicationProgress(progress);
            }
			if (dto.getCancelsDecisionId() != null) {
				Decision cancelsDecision = new Decision();
				cancelsDecision.setId(dto.getCancelsDecisionId());
				entity.setCancelsDecision(cancelsDecision);
			}

			ensureDecisionApplicationMatchesProgress(dto, locale);
			prepareDecisionForPersistence(entity, locale);
            
            entity.setCreatedAt(new Date());
            entity.setCreatedBy(request.getUser());
            entity.setIsDeleted(false);

            Decision saved = decisionRepository.save(entity);
			synchronizeApplicationAfterDecision(saved, request.getUser(), locale, Boolean.TRUE.equals(dto.getSendDecisionEmail()));
            recordDecisionAuditEvent(
                    saved,
                    request.getUser(),
                    null,
                    buildDecisionAuditStateJson(saved),
                    resolveCreateAuditActionType(saved));
            items.add(saved);
        }

        List<DecisionDto> itemDtos = DecisionTransformer.INSTANCE.toDto(items);
        response.setItems(itemDtos);
        response.setHasError(false);
        log.info("----end create Decision-----");
        return response;
    }

    /**
     * Synchronize application pipeline and decision mirrors based on decision
     */
    private void synchronizeApplicationAfterDecision(Decision decision, Integer actorUserId, Locale locale, boolean sendDecisionEmailRequested) {
        Applications app = resolveDecisionApplication(decision);
        if (app != null) {
            Integer decisionActorId = resolveDecisionActorId(decision, actorUserId);

            try {
                if (isCancelDecision(decision)) {
                    rollbackCancelledDecisionStage(app, decision, decisionActorId, locale);
                } else {
                    updateDecisionStageProgress(app, decision, decisionActorId, locale);
                }
            } catch (ParseException exception) {
                throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                        "Impossible de synchroniser la décision avec le pipeline: " + exception.getMessage(),
                        locale));
            }

            Applications latestApplication = applicationsRepository.findOne(app.getId(), false);
            if (latestApplication == null) {
                return;
            }

            syncApplicationCurrentDecisionSummaries(latestApplication, decisionActorId);
			if (!isCancelDecision(decision)) {
				sendDecisionEmailIfNeeded(latestApplication, decision, decisionActorId, locale, sendDecisionEmailRequested);
			}
        }
    }

    /**
     * get Decision by using DecisionDto as object.
     *
     * @param request
     * @return response
     */
    @Override
    public Response<DecisionDto> getByCriteria(Request<DecisionDto> request, Locale locale) throws ParseException {
        log.info("----begin get Decision by criteria-----");
        Response<DecisionDto> response = new Response<>();
        normalizeDecisionCriteria(request, locale);

        try {
            List<Decision> items = decisionRepository.getByCriteria(request, em, locale);

            if (items != null && !items.isEmpty()) {
                List<DecisionDto> itemDtos = DecisionTransformer.INSTANCE.toDto(items);

                Status status = new Status();
                status.setCode(StatusCode.SUCCESS);
                status.setMessage(StatusMessage.SUCCESS);
                response.setItems(itemDtos);
                response.setHasError(false);
                response.setStatus(status);
                response.setCount(decisionRepository.count(request, em, locale));
            } else {
                response.setStatus(functionalError.DATA_EMPTY("decision", locale));
                response.setHasError(false);
                return response;
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        log.info("----end get Decision by criteria-----");
        return response;
    }

    /**
     * update Decision by using DecisionDto as object.
     *
     * @param request
     * @return response
     */
    @Override
    @Transactional
    public Response<DecisionDto> update(Request<DecisionDto> request, Locale locale) throws ParseException {
        log.info("----begin update Decision-----");

        Response<DecisionDto> response = new Response<DecisionDto>();
        List<Decision> items = new ArrayList<Decision>();

        for (DecisionDto dto : request.getDatas()) {
            // Validation
            Response<DecisionDto> validation = validateForUpdate(dto, locale);
            if (validation.isHasError()) {
                response.setStatus(validation.getStatus());
                response.setHasError(true);
                return response;
            }

            // Check if exists
            Decision existing = decisionRepository.findOne(dto.getId(), false);
            if (existing == null) {
                response.setStatus(functionalError.DATA_NOT_EXIST("Decision", locale));
                response.setHasError(true);
                return response;
            }

                Integer applicationId = dto.getApplicationId() != null ? dto.getApplicationId() : getApplicationId(existing);

                ensureCampaignDecisionAllowed(
                    applicationId,
                    request.getUser(),
                    locale,
                    "modifier cette décision",
                    FunctionalityEnum.UPDATE_DECISIONS.getValue(),
                    FunctionalityEnum.ADVANCE_PIPELINE.getValue());

            Decision entity = existing;
			String beforeStateJson = buildDecisionAuditStateJson(existing);
            validateImmutableDecisionUpdate(existing, dto, locale);

            if (Utilities.notBlank(dto.getDecisionType())) {
                entity.setDecisionType(dto.getDecisionType());
            }
            if (dto.getJustification() != null) {
                entity.setJustification(dto.getJustification());
            }
            if (dto.getDecisionMode() != null) {
                entity.setDecisionMode(dto.getDecisionMode());
            }

            // Set relationships manually
            if (dto.getUserId() != null) {
                User user = new User();
                user.setId(dto.getUserId());
                entity.setUser(user);
            }
            if (dto.getApplicationProgressId() != null) {
                ApplicationProgress progress = new ApplicationProgress();
                progress.setId(dto.getApplicationProgressId());
                entity.setApplicationProgress(progress);
            }
			if (dto.getCancelsDecisionId() != null) {
				Decision cancelsDecision = new Decision();
				cancelsDecision.setId(dto.getCancelsDecisionId());
				entity.setCancelsDecision(cancelsDecision);
			}

			ensureDecisionApplicationMatchesProgress(dto, locale);
			prepareDecisionForPersistence(entity, locale);
            
            entity.setUpdatedAt(new Date());
            entity.setUpdatedBy(request.getUser());
            entity.setIsDeleted(false);

            Decision saved = decisionRepository.save(entity);
			synchronizeApplicationAfterDecision(saved, request.getUser(), locale, Boolean.TRUE.equals(dto.getSendDecisionEmail()));
            recordDecisionAuditEvent(
                    saved,
                    request.getUser(),
                    beforeStateJson,
                    buildDecisionAuditStateJson(saved),
                    "DECISION_UPDATED");
            items.add(saved);
        }

        List<DecisionDto> itemDtos = DecisionTransformer.INSTANCE.toDto(items);
        response.setItems(itemDtos);
        response.setHasError(false);

        log.info("----end update Decision-----");
        return response;
    }

    private void validateImmutableDecisionUpdate(Decision existing, DecisionDto dto, Locale locale) {
        if (existing == null || dto == null) {
            return;
        }

        if (dto.getDecisionMode() != null) {
            validateImmutableField(
                    "decisionMode",
                    normalizeOptionalUppercaseText(existing.getDecisionMode()),
                    normalizeOptionalUppercaseText(dto.getDecisionMode()),
                    locale);
        }

        if (dto.getApplicationProgressId() != null) {
            validateImmutableField("applicationProgressId", getApplicationProgressId(existing), dto.getApplicationProgressId(), locale);
        }

        if (dto.getCancelsDecisionId() != null) {
            validateImmutableField("cancelsDecisionId", getCancelsDecisionId(existing), dto.getCancelsDecisionId(), locale);
        }

        if (isCancelDecision(existing)) {
            if (dto.getApplicationId() != null) {
                validateImmutableField("applicationId", getApplicationId(existing), dto.getApplicationId(), locale);
            }
            if (dto.getUserId() != null) {
                validateImmutableField("userId", getUserId(existing), dto.getUserId(), locale);
            }
            if (Utilities.notBlank(dto.getDecisionType())) {
                validateImmutableField("decisionType", existing.getDecisionType(), dto.getDecisionType(), locale);
            }
        }
    }

    private void validateImmutableField(String fieldName, Object existingValue, Object requestedValue, Locale locale) {
        if (Objects.equals(existingValue, requestedValue)) {
            return;
        }

        throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                "Le champ " + fieldName + " est immuable pour cette décision",
                locale));
    }

    private String normalizeOptionalUppercaseText(String value) {
        String normalized = normalizeOptionalText(value);
        return normalized != null ? normalized.toUpperCase(Locale.ROOT) : null;
    }

    private Integer getApplicationId(Decision decision) {
        Applications app = resolveDecisionApplication(decision);
        return app != null ? app.getId() : null;
    }

    private Applications resolveDecisionApplication(Decision decision) {
        if (decision == null || decision.getApplicationProgress() == null || decision.getApplicationProgress().getId() == null) {
            return null;
        }
        ApplicationProgress progress = applicationProgressRepository.findOne(decision.getApplicationProgress().getId(), false);
        return progress != null ? progress.getApplications() : null;
    }

    private boolean isCancelDecision(Decision decision) {
        return decision != null && CANCEL_DECISION_MODE.equals(normalizeOptionalUppercaseText(decision.getDecisionMode()));
    }

    private void ensureDecisionApplicationMatchesProgress(DecisionDto dto, Locale locale) {
        if (dto == null || dto.getApplicationProgressId() == null || dto.getApplicationId() == null) {
            return;
        }
        ApplicationProgress progress = applicationProgressRepository.findOne(dto.getApplicationProgressId(), false);
        if (progress != null
                && progress.getApplications() != null
                && progress.getApplications().getId() != null
                && !Objects.equals(progress.getApplications().getId(), dto.getApplicationId())) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "La décision et l'occurrence pipeline ciblée ne concernent pas la même candidature",
                    locale));
        }
    }

    private Integer getUserId(Decision decision) {
        return decision != null && decision.getUser() != null ? decision.getUser().getId() : null;
    }

    private Integer getPipelineStageId(Decision decision) {
        if (decision == null || decision.getApplicationProgress() == null || decision.getApplicationProgress().getId() == null) {
            return null;
        }
        ApplicationProgress progress = applicationProgressRepository.findOne(decision.getApplicationProgress().getId(), false);
        return progress != null && progress.getPipelineStage() != null ? progress.getPipelineStage().getId() : null;
    }

    private Integer getApplicationProgressId(Decision decision) {
        return decision != null && decision.getApplicationProgress() != null ? decision.getApplicationProgress().getId() : null;
    }

    private Integer getCancelsDecisionId(Decision decision) {
        return decision != null && decision.getCancelsDecision() != null ? decision.getCancelsDecision().getId() : null;
    }

    private void recordDecisionAuditEvent(Decision decision, Integer actorUserId, String beforeStateJson, String afterStateJson, String actionType) {
        if (decision == null || !Utilities.notBlank(actionType)) {
            return;
        }

        auditEventService.recordEvent(
                getApplicationId(decision),
                getApplicationProgressId(decision),
                "DECISION",
                decision.getId() != null ? String.valueOf(decision.getId()) : "UNKNOWN",
                actionType,
                actorUserId,
                decision.getJustification(),
                beforeStateJson,
                afterStateJson);
    }

    private String resolveCreateAuditActionType(Decision decision) {
        String decisionMode = normalizeOptionalUppercaseText(decision != null ? decision.getDecisionMode() : null);
        if (CANCEL_DECISION_MODE.equals(decisionMode)) {
            return "DECISION_CANCELLED";
        }
        if ("OVERRIDE".equals(decisionMode)) {
            return "DECISION_OVERRIDDEN";
        }
        if ("ROLLBACK".equals(decisionMode)) {
            return "DECISION_ROLLED_BACK";
        }
        return "DECISION_CREATED";
    }

    private String buildDecisionAuditStateJson(Decision decision) {
        if (decision == null) {
            return null;
        }

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", decision.getId());
        snapshot.put("applicationId", getApplicationId(decision));
        snapshot.put("userId", getUserId(decision));
        snapshot.put("pipelineStageId", getPipelineStageId(decision));
        snapshot.put("applicationProgressId", getApplicationProgressId(decision));
        snapshot.put("cancelsDecisionId", getCancelsDecisionId(decision));
        snapshot.put("decisionType", decision.getDecisionType());
        snapshot.put("decisionMode", decision.getDecisionMode());
        snapshot.put("justification", decision.getJustification());
        snapshot.put("isDeleted", decision.getIsDeleted());
        snapshot.put("createdAt", decision.getCreatedAt());
        snapshot.put("createdBy", decision.getCreatedBy());
        snapshot.put("updatedAt", decision.getUpdatedAt());
        snapshot.put("updatedBy", decision.getUpdatedBy());

        try {
            return Utilities.convertObjectToJson(snapshot);
        } catch (Exception exception) {
            throw new IllegalStateException("Impossible de serialiser l'etat d'audit de la decision", exception);
        }
    }

    /**
     * delete Decision by using DecisionDto as object.
     *
     * @param request
     * @return response
     */
    @Override
    @Transactional
    public Response<DecisionDto> delete(Request<DecisionDto> request, Locale locale) throws ParseException {
        log.info("----begin delete Decision-----");

        Response<DecisionDto> response = new Response<DecisionDto>();

        for (DecisionDto dto : request.getDatas()) {
            // Check if exists
            Decision existing = decisionRepository.findOne(dto.getId(), false);
            if (existing == null) {
                response.setStatus(functionalError.DATA_NOT_EXIST("Decision", locale));
                response.setHasError(true);
                return response;
            }

			Integer applicationId = getApplicationId(existing);
			String beforeStateJson = buildDecisionAuditStateJson(existing);
            ensureCampaignDecisionAllowed(
                    applicationId,
                    request.getUser(),
                    locale,
                    "supprimer cette décision",
                    FunctionalityEnum.DELETE_DECISIONS.getValue(),
                    FunctionalityEnum.ADVANCE_PIPELINE.getValue());

            // Soft delete
            existing.setIsDeleted(true);
            existing.setUpdatedAt(new Date());
            decisionRepository.save(existing);

            if (applicationId != null) {
                Applications application = applicationsRepository.findOne(applicationId, false);
                if (application != null) {
                    syncApplicationCurrentDecisionSummaries(application, request.getUser());
                }
            }

            recordDecisionAuditEvent(
                    existing,
                    request.getUser(),
                    beforeStateJson,
                    buildDecisionAuditStateJson(existing),
                    "DECISION_DELETED");
        }

        response.setHasError(false);

        log.info("----end delete Decision-----");
        return response;
    }

    /**
     * get full data of Decision by using DecisionDto as object.
     *
     * @param request
     * @return response
     */
    public Response<DecisionDto> getFull(Request<DecisionDto> request, Locale locale) throws ParseException {
        return getByCriteria(request, locale);
    }

    /**
     * validate DecisionDto
     *
     * @param dto
     * @return response
     */
    private Response<DecisionDto> validateForCreate(DecisionDto dto, Locale locale) {
        Response<DecisionDto> response = new Response<DecisionDto>();

        if (dto == null) {
            response.setStatus(functionalError.DATA_NOT_EXIST("Decision", locale));
            response.setHasError(true);
            return response;
        }

        if (!Utilities.notBlank(dto.getDecisionType())) {
            response.setStatus(functionalError.FIELD_EMPTY("decisionType", locale));
            response.setHasError(true);
            return response;
        }

        // Validation enum strict decisionType (D-013)
        DecisionType decisionType;
        try {
            decisionType = DecisionType.fromValue(dto.getDecisionType());
        } catch (IllegalArgumentException exception) {
            response.setStatus(functionalError.DATA_NOT_EXIST(
                    "decisionType invalide (" + DECISION_TYPE_ALLOWED_VALUES + ") -> " + dto.getDecisionType(),
                    locale));
            response.setHasError(true);
            return response;
        }
        dto.setDecisionType(decisionType.getValue());

        if (!Utilities.notBlank(dto.getDecisionMode())) {
            response.setStatus(functionalError.FIELD_EMPTY("decisionMode", locale));
            response.setHasError(true);
            return response;
        }

        if (dto.getApplicationId() == null) {
            response.setStatus(functionalError.FIELD_EMPTY("applicationId", locale));
            response.setHasError(true);
            return response;
        }

        if (dto.getUserId() == null) {
            response.setStatus(functionalError.FIELD_EMPTY("userId", locale));
            response.setHasError(true);
            return response;
        }

        response.setHasError(false);
        return response;
    }

    private Response<DecisionDto> validateForUpdate(DecisionDto dto, Locale locale) {
        Response<DecisionDto> response = new Response<DecisionDto>();

        if (dto == null) {
            response.setStatus(functionalError.DATA_NOT_EXIST("Decision", locale));
            response.setHasError(true);
            return response;
        }

        if (dto.getId() == null) {
            response.setStatus(functionalError.FIELD_EMPTY("id", locale));
            response.setHasError(true);
            return response;
        }

        if (Utilities.notBlank(dto.getDecisionType())) {
            DecisionType decisionType;
            try {
                decisionType = DecisionType.fromValue(dto.getDecisionType());
            } catch (IllegalArgumentException exception) {
                response.setStatus(functionalError.DATA_NOT_EXIST(
                        "decisionType invalide (" + DECISION_TYPE_ALLOWED_VALUES + ") -> " + dto.getDecisionType(),
                        locale));
                response.setHasError(true);
                return response;
            }
            dto.setDecisionType(decisionType.getValue());
        }

        response.setHasError(false);
        return response;
    }

    private void normalizeDecisionCriteria(Request<DecisionDto> request, Locale locale) {
        DecisionDto dto = request != null ? request.getData() : null;
        if (dto == null || !Utilities.notBlank(dto.getDecisionType())) {
            return;
        }

        try {
            dto.setDecisionType(DecisionType.fromValue(dto.getDecisionType()).getValue());
        } catch (IllegalArgumentException exception) {
            throw new InvalidEntityException(functionalError.DATA_NOT_EXIST(
                    "decisionType invalide (" + DECISION_TYPE_ALLOWED_VALUES + ") -> " + dto.getDecisionType(),
                    locale));
        }
    }

    /**
     * Met à jour le progrès pipeline pour l'étape DECISION ou PRESELECTION
     * en fonction du type de décision.
     */
    private boolean updateDecisionStageProgress(Applications app, Decision decision, Integer actorUserId, Locale locale) throws ParseException {
        if (app.getSourceToken() == null || app.getSourceToken().getCampaigns() == null) {
            return false;
        }

        // Déterminer le type d'étape pipeline en fonction du type de décision
        DecisionType decisionType = resolveDecisionType(decision.getDecisionType());
        if (decisionType == null) {
            return false;
        }

        ApplicationProgress progress = resolveDecisionApplicationProgress(app, decision, decisionType);
        if (progress == null || progress.getPipelineStage() == null || progress.getPipelineStage().getId() == null) {
            log.info("Aucune occurrence " + decisionType.getPipelineStageType() + " résolue pour l'application " + app.getId());
            return false;
        }

        persistDecisionProgressLinkIfNeeded(decision, progress);
        PipelineStage stage = progress.getPipelineStage();

        if (decisionType.isAccepted()) {
            applicationProgressBusiness.passStage(app.getId(), stage.getId(), actorUserId, null, decisionType.getValue(), locale);
        } else {
            applicationProgressBusiness.failStage(app.getId(), stage.getId(), actorUserId, decisionType.getValue(), locale);
        }
        log.info("Pipeline stage " + stage.getStageType() + " synchronisé via le moteur central pour application " + app.getId());
        return true;
    }

    private void syncApplicationCurrentDecisionSummaries(Applications application, Integer actorUserId) {
        if (application == null || application.getId() == null) {
            return;
        }

        List<Decision> decisions = decisionRepository.findByApplicationId(application.getId(), false);
        Decision currentPreselection = selectCurrentPreselection(decisions);
        Decision currentFinalDecision = selectCurrentFinalDecision(decisions);
        if (currentPreselection == null) {
            application.setCurrentPreselectionDecisionType(null);
            application.setCurrentPreselectionDecisionDate(null);
        } else {
            application.setCurrentPreselectionDecisionType(currentPreselection.getDecisionType());
            application.setCurrentPreselectionDecisionDate(resolveDecisionSummaryDate(currentPreselection));
        }

        if (currentFinalDecision == null) {
            application.setCurrentFinalDecisionType(null);
            application.setCurrentFinalDecisionDate(null);
        } else {
            application.setCurrentFinalDecisionType(currentFinalDecision.getDecisionType());
            application.setCurrentFinalDecisionDate(resolveDecisionSummaryDate(currentFinalDecision));
        }

        application.setUpdatedAt(new Date());
        application.setUpdatedBy(actorUserId);
        applicationsRepository.save(application);
    }

    private String resolveApplicationStatusMirror(Applications application) {
        if (application == null) {
            return null;
        }
        if (StringUtils.isNotBlank(application.getCurrentFinalDecisionType())) {
            return application.getCurrentFinalDecisionType();
        }
        if (StringUtils.isNotBlank(application.getCurrentPreselectionDecisionType())) {
            return application.getCurrentPreselectionDecisionType();
        }
        return application.getCurrentPipelineProgressStatus();
    }

    private Decision selectCurrentPreselection(List<Decision> decisions) {
        return selectCurrentDecision(decisions, true);
    }

    private Decision selectCurrentFinalDecision(List<Decision> decisions) {
        return selectCurrentDecision(decisions, false);
    }

    private Decision selectCurrentDecision(List<Decision> decisions, boolean preScreen) {
        if (decisions == null || decisions.isEmpty()) {
            return null;
        }

        Set<Integer> cancelledDecisionIds = collectCancelledDecisionIds(decisions);

        return decisions.stream()
                .filter(Objects::nonNull)
                .filter(decision -> !Boolean.TRUE.equals(decision.getIsDeleted()))
                .filter(decision -> !isCancelDecision(decision))
                .filter(decision -> decision.getId() == null || !cancelledDecisionIds.contains(decision.getId()))
                .filter(decision -> {
                    DecisionType decisionType = resolveDecisionType(decision.getDecisionType());
                    return decisionType != null && (preScreen ? decisionType.isPreScreen() : decisionType.isFinal());
                })
                .max(Comparator
                        .comparing(this::resolveDecisionSummaryDate, Comparator.nullsLast(Date::compareTo))
                        .thenComparing(Decision::getId, Comparator.nullsLast(Integer::compareTo)))
                .orElse(null);
    }

    private Date resolveDecisionSummaryDate(Decision decision) {
        if (decision == null) {
            return null;
        }
        return decision.getUpdatedAt() != null ? decision.getUpdatedAt() : decision.getCreatedAt();
    }

    private Set<Integer> collectCancelledDecisionIds(List<Decision> decisions) {
        Set<Integer> cancelledDecisionIds = new HashSet<>();
        if (decisions == null || decisions.isEmpty()) {
            return cancelledDecisionIds;
        }

        for (Decision decision : decisions) {
            if (decision == null || Boolean.TRUE.equals(decision.getIsDeleted()) || !isCancelDecision(decision)) {
                continue;
            }

            Decision target = loadCancelsDecision(decision);
            if (target != null && target.getId() != null) {
                cancelledDecisionIds.add(target.getId());
            }
        }

        return cancelledDecisionIds;
    }

    private Integer resolveDecisionActorId(Decision decision, Integer fallbackUserId) {
        if (decision != null && decision.getUser() != null && decision.getUser().getId() != null) {
            return decision.getUser().getId();
        }
        if (decision != null && decision.getUpdatedBy() != null) {
            return decision.getUpdatedBy();
        }
        if (decision != null && decision.getCreatedBy() != null) {
            return decision.getCreatedBy();
        }
        return fallbackUserId;
    }

    private void prepareDecisionForPersistence(Decision decision, Locale locale) {
        if (decision == null) {
            return;
        }

        decision.setJustification(normalizeOptionalText(decision.getJustification()));
        boolean cancellation = CANCEL_DECISION_MODE.equals(normalizeOptionalUppercaseText(decision.getDecisionMode()));
        decision.setDecisionMode(normalizeDecisionMode(decision.getDecisionMode(), cancellation, locale));
        validateDecisionJustification(decision, locale);
        alignDecisionProgressContext(decision, locale);

        if (cancellation) {
            prepareCancellationDecision(decision, locale);
            return;
        }

        decision.setCancelsDecision(null);
    }

    private void alignDecisionProgressContext(Decision decision, Locale locale) {
        if (decision == null || decision.getApplicationProgress() == null || decision.getApplicationProgress().getId() == null) {
            return;
        }

        ApplicationProgress progress = applicationProgressRepository.findOne(decision.getApplicationProgress().getId(), false);
        if (progress == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("application_progress -> " + decision.getApplicationProgress().getId(), locale));
        }

        decision.setApplicationProgress(progress);
    }

    private void prepareCancellationDecision(Decision decision, Locale locale) {
        Decision target = resolveCancellationTarget(decision, locale);
        decision.setCancelsDecision(target);
        decision.setDecisionMode(CANCEL_DECISION_MODE);
        decision.setDecisionType(target.getDecisionType());

        if (target.getApplicationProgress() != null) {
            decision.setApplicationProgress(target.getApplicationProgress());
        }

        alignDecisionProgressContext(decision, locale);
    }

    private Decision resolveCancellationTarget(Decision decision, Locale locale) {
        Decision explicitTarget = loadCancelsDecision(decision);
        if (explicitTarget != null) {
            validateCancellationTarget(explicitTarget, decision, locale);
            return explicitTarget;
        }

        if (decision == null || getApplicationId(decision) == null) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("applicationId", locale));
        }

        DecisionType decisionType = resolveDecisionType(decision.getDecisionType());
        List<Decision> decisions = decisionRepository.findByApplicationId(getApplicationId(decision), false);
        Set<Integer> cancelledDecisionIds = collectCancelledDecisionIds(decisions);

        for (Decision candidate : decisions) {
            if (isCancellableDecisionTarget(candidate, decision, decisionType, cancelledDecisionIds)) {
                return candidate;
            }
        }

        throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                "Aucune décision active ne peut être annulée pour cette occurrence",
                locale));
    }

    private Decision loadCancelsDecision(Decision decision) {
        if (decision == null || decision.getCancelsDecision() == null || decision.getCancelsDecision().getId() == null) {
            return null;
        }
        return decisionRepository.findOne(decision.getCancelsDecision().getId(), false);
    }

    private void validateCancellationTarget(Decision target, Decision cancellationDecision, Locale locale) {
        if (target == null || Boolean.TRUE.equals(target.getIsDeleted()) || isCancelDecision(target)) {
            throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
                    "La décision cible à annuler est introuvable ou déjà invalide",
                    locale));
        }

        if (cancellationDecision != null
                && getApplicationId(cancellationDecision) != null
                && (getApplicationId(target) == null
                    || !Objects.equals(getApplicationId(target), getApplicationId(cancellationDecision)))) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "La décision cible à annuler n'appartient pas à la même candidature",
                    locale));
        }
    }

    private boolean isCancellableDecisionTarget(Decision candidate, Decision cancellationDecision, DecisionType cancellationType, Set<Integer> cancelledDecisionIds) {
        if (candidate == null || candidate.getId() == null) {
            return false;
        }
        if (Boolean.TRUE.equals(candidate.getIsDeleted()) || isCancelDecision(candidate) || cancelledDecisionIds.contains(candidate.getId())) {
            return false;
        }
        if (cancellationDecision != null && cancellationDecision.getId() != null && Objects.equals(candidate.getId(), cancellationDecision.getId())) {
            return false;
        }

        DecisionType candidateType = resolveDecisionType(candidate.getDecisionType());
        if (candidateType == null || cancellationType == null || candidateType.isPreScreen() != cancellationType.isPreScreen()) {
            return false;
        }

        if (cancellationDecision != null
                && cancellationDecision.getApplicationProgress() != null
                && cancellationDecision.getApplicationProgress().getId() != null) {
            return candidate.getApplicationProgress() != null
                    && Objects.equals(candidate.getApplicationProgress().getId(), cancellationDecision.getApplicationProgress().getId());
        }

        return true;
    }

    private String normalizeDecisionMode(String decisionMode, boolean cancellation, Locale locale) {
        String normalizedDecisionMode = Utilities.notBlank(decisionMode)
                ? decisionMode.trim().toUpperCase(Locale.ROOT)
                : cancellation ? CANCEL_DECISION_MODE : DEFAULT_DECISION_MODE;

        if (cancellation) {
            return CANCEL_DECISION_MODE;
        }

        if (!DECISION_MODE_ALLOWED_VALUES.contains(normalizedDecisionMode) || CANCEL_DECISION_MODE.equals(normalizedDecisionMode)) {
            throw new InvalidEntityException(functionalError.DATA_NOT_EXIST(
                    "decisionMode invalide (STANDARD/CANCEL/OVERRIDE/ROLLBACK) -> " + normalizedDecisionMode,
                    locale));
        }

        return normalizedDecisionMode;
    }

    private void validateDecisionJustification(Decision decision, Locale locale) {
        if (decision == null) {
            return;
        }

        String decisionMode = decision.getDecisionMode();
        boolean requiresJustification = CANCEL_DECISION_MODE.equals(decisionMode)
                || "OVERRIDE".equals(decisionMode)
                || "ROLLBACK".equals(decisionMode);

        if (requiresJustification && !Utilities.notBlank(decision.getJustification())) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("justification", locale));
        }
    }

    private String normalizeOptionalText(String value) {
        if (!Utilities.notBlank(value)) {
            return null;
        }
        return value.trim();
    }

    private void rollbackCancelledDecisionStage(Applications application, Decision decision, Integer actorUserId, Locale locale) throws ParseException {
        if (application == null || decision == null) {
            return;
        }

        ApplicationProgress progress = loadDecisionApplicationProgress(decision);
        if (progress == null) {
            Decision target = loadCancelsDecision(decision);
            progress = loadDecisionApplicationProgress(target);
        }

        if (progress == null || progress.getPipelineStage() == null || progress.getPipelineStage().getId() == null) {
            return;
        }

        applicationProgressBusiness.rollbackStage(
                application.getId(),
                progress.getPipelineStage().getId(),
                actorUserId,
                decision.getJustification(),
                locale);
    }

    private void sendDecisionEmailIfNeeded(Applications application, Decision decision, Integer actorUserId, Locale locale, boolean sendDecisionEmailRequested) {
        if (application == null || decision == null || isCancelDecision(decision)) {
            return;
        }
        if (!Utilities.notBlank(application.getCandidateEmail())) {
            return;
        }

        DecisionType decisionType = resolveDecisionType(decision.getDecisionType());
        if (decisionType == null) {
            return;
        }

        ApplicationProgress progress = resolveDecisionApplicationProgress(application, decision, decisionType);
        PipelineStage stage = progress != null ? progress.getPipelineStage() : loadDecisionPipelineStage(decision);
        PipelineStageNotificationRule notificationRule = stage == null ? null
                : pipelineStageNotificationRuleRepository.findFirstByPipelineStageIdAndIsDeletedFalse(stage.getId());
        boolean emailRequired = stage == null || (notificationRule != null && Boolean.TRUE.equals(notificationRule.getIsRequired()));
        boolean emailAutomatic = stage == null || (notificationRule != null && Boolean.TRUE.equals(notificationRule.getIsAutomatic()));
        if (!emailRequired) {
            return;
        }
        if (!emailAutomatic && !sendDecisionEmailRequested) {
            return;
        }

        if (isStageMailAlreadySent(progress)) {
            return;
        }

        EmailActionType emailAction = decisionType.isPreScreen() ? EmailActionType.PRE_SCREEN_DECISION : EmailActionType.FINAL_DECISION;
        String templateKey = emailAction.getTemplateKey();
        EmailTemplate emailTemplate = emailTemplateBusiness.findDefaultByActionTypeOrKey(emailAction.name(), templateKey);
        if (emailTemplate == null || Boolean.TRUE.equals(emailTemplate.getIsDeleted()) || !Boolean.TRUE.equals(emailTemplate.getIsActive())) {
            log.info("Aucun template email actif pour la décision " + decisionType.getValue() + ", envoi ignoré.");
            return;
        }

        try {
            platformReadinessService.requireActiveSmtpConfig(locale);

            Map<String, String> from = new HashMap<>();
            from.put("email", paramsUtils.getSmtpLogin());
            from.put("user", MAIL_SENDER_NAME);

            List<Map<String, String>> toRecipients = new ArrayList<>();
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", application.getCandidateEmail());
            recipient.put("user", application.getCandidateFirstName() + " " + application.getCandidateLastName());
            toRecipients.add(recipient);

            Campaigns campaign = getCampaignForApplication(application, locale);
            Map<String, String> vars = new HashMap<>();
            vars.put("first_name", application.getCandidateFirstName());
            vars.put("last_name", application.getCandidateLastName());
            vars.put("candidate_full_name", application.getCandidateFirstName() + " " + application.getCandidateLastName());
            vars.put("candidate_email", application.getCandidateEmail());
            vars.put("campaign_title", campaign.getCampaignTitle());
            vars.put("decision_type", decisionType.getValue());
            vars.put("decision_stage", decisionType.isPreScreen() ? "preselection" : "decision_finale");
            vars.put("decision_label", decisionType.isAccepted() ? "acceptee" : "refusee");
            vars.put("application_status", resolveApplicationStatusMirror(application));
            vars.put("app_link", paramsUtils.getUrlAppl());

            String subject = emailTemplateBusiness.renderSubjectTemplate(emailTemplate, vars);
            String contenu = emailTemplateBusiness.renderBodyTemplate(emailTemplate, vars);

            Context context = new Context();
            context.setVariable("contenu", contenu);
            context.setVariable("entete", decisionType.isPreScreen() ? "Decision de preselection" : "Decision finale");
            context.setVariable("titre", decisionType.isPreScreen() ? "Resultat de votre preselection" : "Resultat final de votre candidature");
            context.setVariable("appLink", paramsUtils.getUrlAppl());

            Response<?> responseEmail = hostingUtils.sendEmail(
                    from,
                    toRecipients,
                    subject,
                    "",
                    null,
                    context,
                    "blank",
                    locale,
                    buildDecisionMailLogContext(application, progress, decision, decisionType));
            if (responseEmail.isHasError()) {
                log.warning("Échec de l'envoi de l'email de décision pour l'application " + application.getId());
                return;
            }

            if (progress != null && stage != null && stage.getId() != null) {
                applicationProgressBusiness.markStageMailSent(application.getId(), stage.getId(), actorUserId);
            }
        } catch (Exception exception) {
            log.warning("Envoi email décision ignoré pour application " + application.getId() + ": " + exception.getMessage());
        }
    }

    private MailLogContext buildDecisionMailLogContext(Applications application, ApplicationProgress progress, Decision decision, DecisionType decisionType) {
        return MailLogContext.builder()
                .applicationId(application != null ? application.getId() : null)
                .applicationProgressId(progress != null ? progress.getId() : null)
                .decisionId(decision != null ? decision.getId() : null)
                .eventCode(resolveDecisionMailEventCode(decisionType))
                .requiresConfirmation(Boolean.FALSE)
                .build();
    }

    private String resolveDecisionMailEventCode(DecisionType decisionType) {
        if (decisionType != null && decisionType.isPreScreen()) {
            return "PRE_SCREEN_DECISION_EMAIL";
        }
        return "FINAL_DECISION_EMAIL";
    }

    private ApplicationProgress resolveDecisionApplicationProgress(Applications application, Decision decision, DecisionType decisionType) {
        ApplicationProgress explicitProgress = loadDecisionApplicationProgress(decision);
        if (matchesDecisionProgress(explicitProgress, application, decisionType)) {
            return explicitProgress;
        }

        PipelineStage explicitStage = loadDecisionPipelineStage(decision);
        if (application != null && application.getId() != null && explicitStage != null && explicitStage.getId() != null
                && matchesDecisionStageType(explicitStage, decisionType)) {
            ApplicationProgress stageProgress = applicationProgressRepository.findByApplicationIdAndPipelineStageId(
                    application.getId(),
                    explicitStage.getId());
            if (matchesDecisionProgress(stageProgress, application, decisionType)) {
                return stageProgress;
            }
        }

        if (application != null && application.getId() != null && decisionType != null) {
            ApplicationProgress currentProgress = applicationProgressBusiness.resolveProgressByStageType(
                    application.getId(),
                    decisionType.getPipelineStageType());
            if (matchesDecisionProgress(currentProgress, application, decisionType)) {
                return currentProgress;
            }
        }

        return null;
    }

    private ApplicationProgress loadDecisionApplicationProgress(Decision decision) {
        if (decision == null || decision.getApplicationProgress() == null || decision.getApplicationProgress().getId() == null) {
            return null;
        }
        return applicationProgressRepository.findOne(decision.getApplicationProgress().getId(), false);
    }

    private PipelineStage loadDecisionPipelineStage(Decision decision) {
        if (decision == null || decision.getApplicationProgress() == null || decision.getApplicationProgress().getId() == null) {
            return null;
        }
        ApplicationProgress progress = applicationProgressRepository.findOne(decision.getApplicationProgress().getId(), false);
        return progress != null ? progress.getPipelineStage() : null;
    }

    private boolean matchesDecisionStageType(PipelineStage stage, DecisionType decisionType) {
        return stage != null
                && decisionType != null
                && Utilities.notBlank(stage.getStageType())
                && decisionType.getPipelineStageType().equalsIgnoreCase(stage.getStageType());
    }

    private boolean matchesDecisionProgress(ApplicationProgress progress, Applications application, DecisionType decisionType) {
        return progress != null
                && application != null
                && application.getId() != null
                && progress.getApplications() != null
                && Objects.equals(progress.getApplications().getId(), application.getId())
                && matchesDecisionStageType(progress.getPipelineStage(), decisionType);
    }

    private void persistDecisionProgressLinkIfNeeded(Decision decision, ApplicationProgress progress) {
        if (decision == null || progress == null || progress.getId() == null) {
            return;
        }

        boolean needsSave = false;
        if (decision.getApplicationProgress() == null || !Objects.equals(decision.getApplicationProgress().getId(), progress.getId())) {
            decision.setApplicationProgress(progress);
            needsSave = true;
        }

        if (!needsSave) {
            return;
        }
        if (decision.getId() != null) {
            decisionRepository.save(decision);
        }
    }

    private boolean isStageMailAlreadySent(ApplicationProgress progress) {
        if (progress == null || progress.getId() == null) {
            return false;
        }
        return mailLogRepository.existsByApplicationProgressIdAndStatusAndEventCodeIn(
                progress.getId(),
                "SENT",
                List.of("PRE_SCREEN_DECISION_EMAIL", "FINAL_DECISION_EMAIL"));
    }

    private String resolveCancelledDecisionStatus(Decision decision) {
        DecisionType currentDecisionType = resolveDecisionType(decision.getDecisionType());
        if (currentDecisionType == null) {
            return "SUBMITTED";
        }
        return currentDecisionType.getCancelledFallbackStatus();
    }

    private DecisionType resolveDecisionType(String value) {
        if (!Utilities.notBlank(value)) {
            return null;
        }
        try {
            return DecisionType.fromValue(value);
        } catch (IllegalArgumentException exception) {
            log.warning("decisionType inattendu ignoré: " + value);
            return null;
        }
    }

    private void ensureCampaignDecisionAllowed(Integer applicationId, Integer actorUserId, Locale locale, String actionLabel, String... globalPermissions) {
        if (actorUserId == null) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
        }
        if (applicationId == null) {
            throw new InvalidEntityException(functionalError.FIELD_EMPTY("applicationId", locale));
        }

        Applications application = applicationsRepository.findOne(applicationId, false);
        if (application == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("Application", locale));
        }

        Campaigns campaign = getCampaignForApplication(application, locale);
        boolean hasScopedRight = permissionService.hasAnyScopedPermission(
            actorUserId,
            "CAMPAIGN",
            campaign.getId(),
            globalPermissions,
            "ADMIN",
            "ADVANCE_PIPELINE");

        if (!hasScopedRight) {
            throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                    "Accès refusé: droits insuffisants pour " + actionLabel,
                    locale));
        }
    }

    private Campaigns getCampaignForApplication(Applications application, Locale locale) {
        if (application.getSourceToken() == null || application.getSourceToken().getCampaigns() == null) {
            throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST(
                    "campaign linked to application -> " + application.getId(),
                    locale));
        }
        return application.getSourceToken().getCampaigns();
    }
}