package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Locale;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

@Log
@CrossOrigin("*")
@RestController
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@RequestMapping(value="/pipelineStageNotificationRule")
public class PipelineStageNotificationRuleController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private ControllerFactory<PipelineStageNotificationRuleDto> controllerFactory;
    @Autowired
    private PipelineStageNotificationRuleBusiness pipelineStageNotificationRuleBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageNotificationRuleDto>> create(@RequestBody Request<PipelineStageNotificationRuleDto> request) throws Exception {
        log.info("start method /pipelineStageNotificationRule/create");
        Response<PipelineStageNotificationRuleDto> response = controllerFactory.create(pipelineStageNotificationRuleBusiness, request, FunctionalityEnum.CREATE_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageNotificationRuleDto>> update(@RequestBody Request<PipelineStageNotificationRuleDto> request) throws Exception {
        log.info("start method /pipelineStageNotificationRule/update");
        Response<PipelineStageNotificationRuleDto> response = controllerFactory.update(pipelineStageNotificationRuleBusiness, request, FunctionalityEnum.UPDATE_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageNotificationRuleDto>> delete(@RequestBody Request<PipelineStageNotificationRuleDto> request) throws Exception {
        log.info("start method /pipelineStageNotificationRule/delete");
        Response<PipelineStageNotificationRuleDto> response = controllerFactory.delete(pipelineStageNotificationRuleBusiness, request, FunctionalityEnum.DELETE_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageNotificationRuleDto>> getByCriteria(@RequestBody Request<PipelineStageNotificationRuleDto> request) throws Exception {
        log.info("start method /pipelineStageNotificationRule/getByCriteria");
        Response<PipelineStageNotificationRuleDto> response = controllerFactory.getByCriteria(pipelineStageNotificationRuleBusiness, request, FunctionalityEnum.VIEW_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/byStage", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageNotificationRuleDto>> byStage(@RequestBody Request<PipelineStageNotificationRuleDto> request) throws Exception {
        log.info("start method /pipelineStageNotificationRule/byStage");
        Response<PipelineStageNotificationRuleDto> response = new Response<>();
        try {
            PipelineStageNotificationRuleDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getPipelineStageId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = pipelineStageNotificationRuleBusiness.getByStage(dto.getPipelineStageId(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/saveStageRules", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageNotificationRuleDto>> saveStageRules(@RequestBody Request<PipelineStageNotificationRuleDto> request) throws Exception {
        log.info("start method /pipelineStageNotificationRule/saveStageRules");
        Response<PipelineStageNotificationRuleDto> response = new Response<>();
        try {
            PipelineStageNotificationRuleDto dto = request.getData();
            if (dto == null || dto.getPipelineStageId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            List<PipelineStageNotificationRuleDto> rules = request.getDatas() != null ? request.getDatas() : new java.util.ArrayList<>();
            response = pipelineStageNotificationRuleBusiness.saveStageRules(dto.getPipelineStageId(), rules, request.getUser(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
