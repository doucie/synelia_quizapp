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

import java.text.ParseException;
import java.util.*;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.dao.entity.Decision;
import tech.synelia.quizapp.dao.entity.Applications;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
 * BUSINESS for table "decisions"
 *
 * @author Synelia
 */
@Log
@Component
public class DecisionBusiness implements IBasicBusiness<Request<DecisionDto>, Response<DecisionDto>> {

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
    private FunctionalError functionalError;

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
            updateApplicationStatus(entity);

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
    private void updateApplicationStatus(Decision decision) {
        if (decision.getApplication() != null && decision.getApplication().getId() != null) {
            // Fetch the full application entity
            Applications app = applicationsRepository.findOne(decision.getApplication().getId(), false);
            if (app != null) {
                String newStatus;
                
                // Si c'est une annulation (isCancel = true), on revient à l'état précédent
                if (Boolean.TRUE.equals(decision.getIsCancel())) {
                    String currentDecisionType = decision.getDecisionType();
                    
                    // Si on annule une décision de pré-sélection, on retourne à SUBMITTED
                    if (currentDecisionType.startsWith("PRE_SCREEN")) {
                        newStatus = "SUBMITTED";
                        log.info("Cancelling pre-screen decision, reverting to SUBMITTED");
                    }
                    // Si on annule une décision finale, on retourne à PRE_SCREEN_ACCEPTED
                    else if (currentDecisionType.startsWith("FINAL")) {
                        newStatus = "PRE_SCREEN_ACCEPTED";
                        log.info("Cancelling final decision, reverting to PRE_SCREEN_ACCEPTED");
                    }
                    else {
                        newStatus = decision.getDecisionType();
                    }
                }
                // Si c'est une prise de décision (isCancel = false), on met à jour avec le type de décision
                else {
                    newStatus = decision.getDecisionType();
                }

                // Update the application status
                app.setApplicationStatus(newStatus);
                app.setUpdatedAt(new Date());
                app.setUpdatedBy(decision.getCreatedBy());

                applicationsRepository.save(app);
                log.info("Updated application " + app.getId() + " status to " + newStatus);
                
                // Mettre à jour le progrès pipeline pour l'étape DECISION
                try {
                    updateDecisionStageProgress(app, decision);
                } catch (Exception e) {
                    log.warning("Erreur lors de la mise à jour du pipeline pour la décision: " + e.getMessage());
                }
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
        log.info("Request data: " + (request.getData() != null ? request.getData().getApplicationId() : "null"));

        Response<DecisionDto> response = new Response<DecisionDto>();
        List<Decision> items = new ArrayList<Decision>();

        // Simple implementation - get all decisions for application if specified
        if (request.getData() != null && request.getData().getApplicationId() != null) {
            log.info("Searching decisions for application ID: " + request.getData().getApplicationId());
            items = decisionRepository.findByApplicationId(request.getData().getApplicationId(), false);
            log.info("Found " + items.size() + " decisions");
        } else {
            log.info("No applicationId specified, getting all active decisions");
            items = decisionRepository.findAllActive();
        }

        // Apply pagination if needed
        if (request.getIndex() != null && request.getSize() != null) {
            int start = request.getIndex() * request.getSize();
            int end = Math.min(start + request.getSize(), items.size());
            if (start < items.size()) {
                items = items.subList(start, end);
            } else {
                items = new ArrayList<>();
            }
        }

        List<DecisionDto> itemDtos = DecisionTransformer.INSTANCE.toDto(items);
        
        // Créer un status pour la réponse
        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        
        response.setItems(itemDtos);
        response.setCount((long) items.size());
        response.setHasError(false);
        response.setStatus(status);

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

            // Update
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
            
            entity.setUpdatedAt(new Date());
            entity.setIsDeleted(false);

            Decision saved = decisionRepository.save(entity);
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
    private void updateDecisionStageProgress(Applications app, Decision decision) {
        if (app.getSourceToken() == null || app.getSourceToken().getCampaigns() == null) {
            return;
        }
        Campaigns campaign = app.getSourceToken().getCampaigns();
        if (campaign.getPipelineTemplate() == null) {
            return;
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
            return;
        }

        PipelineStage stage = pipelineStageRepository.findByTemplateIdAndStageType(templateId, stageType);
        if (stage == null) {
            log.info("Aucune étape " + stageType + " trouvée dans le template " + templateId);
            return;
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
            return;
        }

        boolean isAccepted = "PRE_SCREEN_ACCEPTED".equals(decisionType) || "FINAL_ACCEPTED".equals(decisionType);
        progress.setProgressStatus(isAccepted ? "PASSED" : "FAILED");
        progress.setCompletedAt(new Date());
        if (decision.getCreatedBy() != null) {
            User decidedBy = userRepository.findOne(decision.getCreatedBy(), false);
            if (decidedBy != null) {
                progress.setDecidedBy(decidedBy);
            }
        }
        progress.setUpdatedAt(new Date());
        progress.setUpdatedBy(decision.getCreatedBy());
        applicationProgressRepository.save(progress);
        log.info("Pipeline stage " + stageType + " mis à jour: " + (isAccepted ? "PASSED" : "FAILED") + " pour application " + app.getId());
    }
}