/*
 * Java business for entity table decisions
 * Created on 2025-10-27 ( Time 12:00:00 )
 * Generator tool : Synelia Tools
 */

package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
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
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
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

    private static final String PRE_SCREEN_DECISION_ACTION = "PRE_SCREEN_DECISION";
    private static final String PRE_SCREEN_DECISION_TEMPLATE_KEY = "pre_screen_decision";
    private static final String FINAL_DECISION_ACTION = "FINAL_DECISION";
    private static final String FINAL_DECISION_TEMPLATE_KEY = "final_decision";
    private static final String MAIL_SENDER_NAME = "Synelia Recrutement";

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private ApplicationsRepository applicationsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PipelineStageRepository pipelineStageRepository;

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
            Response<DecisionDto> validation = validate(dto, locale);
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
            if (dto.getApplicationId() != null) {
                Applications app = new Applications();
                app.setId(dto.getApplicationId());
                entity.setApplication(app);
            }
            if (dto.getUserId() != null) {
                User user = new User();
                user.setId(dto.getUserId());
                entity.setUser(user);
            }
            if (dto.getPipelineStageId() != null) {
                PipelineStage stage = new PipelineStage();
                stage.setId(dto.getPipelineStageId());
                entity.setPipelineStage(stage);
            }
            
            entity.setCreatedAt(new Date());
            entity.setCreatedBy(request.getUser());
            entity.setIsDeleted(false);

            // Update application status based on decision
            updateApplicationStatus(entity, request.getUser(), locale);

            Decision saved = decisionRepository.save(entity);
            items.add(saved);
        }

        List<DecisionDto> itemDtos = DecisionTransformer.INSTANCE.toDto(items);
        response.setItems(itemDtos);
        response.setHasError(false);
        log.info("----end create Decision-----");
        return response;
    }

    /**
     * Update application status based on decision
     */
    private void updateApplicationStatus(Decision decision, Integer actorUserId, Locale locale) {
        if (decision.getApplication() != null && decision.getApplication().getId() != null) {
            // Fetch the full application entity
            Applications app = applicationsRepository.findOne(decision.getApplication().getId(), false);
            if (app != null) {
                Integer decisionActorId = resolveDecisionActorId(decision, actorUserId);
                if (Boolean.TRUE.equals(decision.getIsCancel())) {
                    String revertedStatus = resolveCancelledDecisionStatus(decision);
                    app.setApplicationStatus(revertedStatus);
                    app.setUpdatedAt(new Date());
                    app.setUpdatedBy(decisionActorId);
                    applicationsRepository.save(app);
                    log.info("Updated application " + app.getId() + " status to " + revertedStatus + " after decision cancellation");
                    return;
                }

                try {
                    updateDecisionStageProgress(app, decision, decisionActorId, locale);
                } catch (ParseException exception) {
                    throw new InvalidEntityException(functionalError.REQUEST_FAIL(
                            "Impossible de synchroniser la décision avec le pipeline: " + exception.getMessage(),
                            locale));
                }

                Applications latestApplication = applicationsRepository.findOne(app.getId(), false);
                if (latestApplication == null) {
                    return;
                }

                syncApplicationStatusFromDecision(latestApplication, decision, decisionActorId);
                sendDecisionEmailIfNeeded(latestApplication, decision, decisionActorId, locale);
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
            Response<DecisionDto> validation = validate(dto, locale);
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

            ensureCampaignDecisionAllowed(
                    dto.getApplicationId(),
                    request.getUser(),
                    locale,
                    "modifier cette décision",
                    FunctionalityEnum.UPDATE_DECISIONS.getValue(),
                    FunctionalityEnum.ADVANCE_PIPELINE.getValue());

            Decision entity = existing;

            if (Utilities.shouldUpdate(dto.getDecisionType())) {
                entity.setDecisionType(dto.getDecisionType());
            }
            if (dto.getIsCancel() != null) {
                entity.setIsCancel(dto.getIsCancel());
            }

            // Set relationships manually
            if (dto.getApplicationId() != null) {
                Applications app = new Applications();
                app.setId(dto.getApplicationId());
                entity.setApplication(app);
            }
            if (dto.getUserId() != null) {
                User user = new User();
                user.setId(dto.getUserId());
                entity.setUser(user);
            }
            if (dto.getPipelineStageId() != null) {
                PipelineStage stage = new PipelineStage();
                stage.setId(dto.getPipelineStageId());
                entity.setPipelineStage(stage);
            }
            
            entity.setUpdatedAt(new Date());
            entity.setUpdatedBy(request.getUser());
            entity.setIsDeleted(false);

            Decision saved = decisionRepository.save(entity);
            updateApplicationStatus(saved, request.getUser(), locale);
            items.add(saved);
        }

        List<DecisionDto> itemDtos = DecisionTransformer.INSTANCE.toDto(items);
        response.setItems(itemDtos);
        response.setHasError(false);

        log.info("----end update Decision-----");
        return response;
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

            Integer applicationId = existing.getApplication() != null ? existing.getApplication().getId() : null;
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
    private Response<DecisionDto> validate(DecisionDto dto, Locale locale) {
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

        if (dto.getIsCancel() == null) {
            response.setStatus(functionalError.FIELD_EMPTY("isCancel", locale));
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

    /**
     * Met à jour le progrès pipeline pour l'étape DECISION ou PRESELECTION
     * en fonction du type de décision.
     */
    private boolean updateDecisionStageProgress(Applications app, Decision decision, Integer actorUserId, Locale locale) throws ParseException {
        if (app.getSourceToken() == null || app.getSourceToken().getCampaigns() == null) {
            return false;
        }
        Campaigns campaign = app.getSourceToken().getCampaigns();
        if (campaign.getPipelineTemplate() == null) {
            return false;
        }
        Integer templateId = campaign.getPipelineTemplate().getId();

        // Déterminer le type d'étape pipeline en fonction du type de décision
        String stageType;
        String decisionType = decision.getDecisionType();
        if ("PRE_SCREEN_ACCEPTED".equals(decisionType) || "PRE_SCREEN_REJECTED".equals(decisionType)) {
            stageType = "PRESELECTION";
        } else if ("FINAL_ACCEPTED".equals(decisionType) || "FINAL_REJECTED".equals(decisionType)) {
            stageType = "DECISION";
        } else {
            return false;
        }

        PipelineStage stage = pipelineStageRepository.findByTemplateIdAndStageType(templateId, stageType);
        if (stage == null) {
            log.info("Aucune étape " + stageType + " trouvée dans le template " + templateId);
            return false;
        }

        // Lier la décision à l'étape pipeline (optionnel, rétrocompatible)
        if (decision.getPipelineStage() == null) {
            decision.setPipelineStage(stage);
            decisionRepository.save(decision);
        }

        ApplicationProgress progress = applicationProgressRepository
                .findByApplicationIdAndPipelineStageId(app.getId(), stage.getId());
        if (progress == null) {
            log.info("Aucun progrès trouvé pour application " + app.getId() + " et étape " + stage.getId());
            return false;
        }

        boolean isAccepted = "PRE_SCREEN_ACCEPTED".equals(decisionType) || "FINAL_ACCEPTED".equals(decisionType);
        if (isAccepted) {
            applicationProgressBusiness.passStage(app.getId(), stage.getId(), actorUserId, null, decision.getDecisionType(), locale);
        } else {
            applicationProgressBusiness.failStage(app.getId(), stage.getId(), actorUserId, decision.getDecisionType(), locale);
        }
        log.info("Pipeline stage " + stageType + " synchronisé via le moteur central pour application " + app.getId());
        return true;
    }

    private void syncApplicationStatusFromDecision(Applications application, Decision decision, Integer actorUserId) {
        if (application == null || decision == null || !Utilities.notBlank(decision.getDecisionType())) {
            return;
        }

        String newStatus = decision.getDecisionType();
        if (Objects.equals(newStatus, application.getApplicationStatus())) {
            return;
        }

        application.setApplicationStatus(newStatus);
        application.setUpdatedAt(new Date());
        application.setUpdatedBy(actorUserId);
        applicationsRepository.save(application);
        log.info("Updated application " + application.getId() + " status to " + newStatus);
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

    private void sendDecisionEmailIfNeeded(Applications application, Decision decision, Integer actorUserId, Locale locale) {
        if (application == null || decision == null || Boolean.TRUE.equals(decision.getIsCancel())) {
            return;
        }
        if (!Utilities.notBlank(application.getCandidateEmail())) {
            return;
        }

        String decisionType = decision.getDecisionType();
        boolean isPreScreenDecision = "PRE_SCREEN_ACCEPTED".equals(decisionType) || "PRE_SCREEN_REJECTED".equals(decisionType);
        boolean isFinalDecision = "FINAL_ACCEPTED".equals(decisionType) || "FINAL_REJECTED".equals(decisionType);
        if (!isPreScreenDecision && !isFinalDecision) {
            return;
        }

        if (isPreScreenDecision && Boolean.TRUE.equals(application.getPreScreenDecisionMailSent())) {
            return;
        }
        if (isFinalDecision && Boolean.TRUE.equals(application.getFinalDecisionMailSent())) {
            return;
        }

        String actionType = isPreScreenDecision ? PRE_SCREEN_DECISION_ACTION : FINAL_DECISION_ACTION;
        String templateKey = isPreScreenDecision ? PRE_SCREEN_DECISION_TEMPLATE_KEY : FINAL_DECISION_TEMPLATE_KEY;
        EmailTemplate emailTemplate = emailTemplateBusiness.findDefaultByActionTypeOrKey(actionType, templateKey);
        if (emailTemplate == null || Boolean.TRUE.equals(emailTemplate.getIsDeleted()) || !Boolean.TRUE.equals(emailTemplate.getIsActive())) {
            log.info("Aucun template email actif pour la décision " + decisionType + ", envoi ignoré.");
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
            vars.put("decision_type", decisionType);
            vars.put("decision_stage", isPreScreenDecision ? "preselection" : "decision_finale");
            vars.put("decision_label", decisionType.endsWith("ACCEPTED") ? "acceptee" : "refusee");
            vars.put("application_status", application.getApplicationStatus());
            vars.put("app_link", paramsUtils.getUrlAppl());

            String subject = emailTemplateBusiness.renderSubjectTemplate(emailTemplate, vars);
            String contenu = emailTemplateBusiness.renderBodyTemplate(emailTemplate, vars);

            Context context = new Context();
            context.setVariable("contenu", contenu);
            context.setVariable("entete", isPreScreenDecision ? "Decision de preselection" : "Decision finale");
            context.setVariable("titre", isPreScreenDecision ? "Resultat de votre preselection" : "Resultat final de votre candidature");
            context.setVariable("appLink", paramsUtils.getUrlAppl());

            Response<?> responseEmail = hostingUtils.sendEmail(from, toRecipients, subject, "", null, context, "blank", locale);
            if (responseEmail.isHasError()) {
                log.warning("Échec de l'envoi de l'email de décision pour l'application " + application.getId());
                return;
            }

            if (isPreScreenDecision) {
                application.setPreScreenDecisionMailSent(true);
            } else {
                application.setFinalDecisionMailSent(true);
            }
            application.setUpdatedAt(new Date());
            application.setUpdatedBy(actorUserId);
            applicationsRepository.save(application);
        } catch (Exception exception) {
            log.warning("Envoi email décision ignoré pour application " + application.getId() + ": " + exception.getMessage());
        }
    }

    private String resolveCancelledDecisionStatus(Decision decision) {
        String currentDecisionType = decision.getDecisionType();
        if (currentDecisionType == null) {
            return "SUBMITTED";
        }
        if (currentDecisionType.startsWith("PRE_SCREEN")) {
            return "SUBMITTED";
        }
        if (currentDecisionType.startsWith("FINAL")) {
            return "PRE_SCREEN_ACCEPTED";
        }
        return currentDecisionType;
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
        boolean hasGlobalRight = permissionService.hasAnyPermission(actorUserId, globalPermissions);
        boolean hasCampaignRight = permissionService.hasAnyEntityPermission(
                actorUserId,
                "CAMPAIGN",
                campaign.getId(),
                "ADMIN",
                "ADVANCE_PIPELINE");

        if (!hasGlobalRight && !hasCampaignRight) {
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