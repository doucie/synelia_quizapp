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
@RequestMapping(value="/pipelineStage")
public class PipelineStageController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private ControllerFactory<PipelineStageDto> controllerFactory;
    @Autowired
    private PipelineStageBusiness pipelineStageBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageDto>> create(@RequestBody Request<PipelineStageDto> request) throws Exception {
        log.info("start method /pipelineStage/create");
        Response<PipelineStageDto> response = controllerFactory.create(pipelineStageBusiness, request, FunctionalityEnum.CREATE_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageDto>> update(@RequestBody Request<PipelineStageDto> request) throws Exception {
        log.info("start method /pipelineStage/update");
        Response<PipelineStageDto> response = controllerFactory.update(pipelineStageBusiness, request, FunctionalityEnum.UPDATE_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageDto>> delete(@RequestBody Request<PipelineStageDto> request) throws Exception {
        log.info("start method /pipelineStage/delete");
        Response<PipelineStageDto> response = controllerFactory.delete(pipelineStageBusiness, request, FunctionalityEnum.DELETE_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageDto>> getByCriteria(@RequestBody Request<PipelineStageDto> request) throws Exception {
        log.info("start method /pipelineStage/getByCriteria");
        Response<PipelineStageDto> response = controllerFactory.getByCriteria(pipelineStageBusiness, request, FunctionalityEnum.VIEW_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/getAllByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageDto>> getAllByCriteria(@RequestBody Request<PipelineStageDto> request) throws Exception {
        log.info("start method /pipelineStage/getAllByCriteria");
        Response<PipelineStageDto> response = controllerFactory.getByCriteria(pipelineStageBusiness, request, FunctionalityEnum.VIEW_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/updateAll", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageDto>> updateAll(@RequestBody Request<PipelineStageDto> request) throws Exception {
        log.info("start method /pipelineStage/updateAll");
        Response<PipelineStageDto> response = controllerFactory.update(pipelineStageBusiness, request, FunctionalityEnum.UPDATE_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/updateDeleted", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageDto>> updateDeleted(@RequestBody Request<PipelineStageDto> request) throws Exception {
        log.info("start method /pipelineStage/updateDeleted");
        Response<PipelineStageDto> response = controllerFactory.update(pipelineStageBusiness, request, FunctionalityEnum.UPDATE_PIPELINE_STAGE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/byTemplate", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageDto>> byTemplate(@RequestBody Request<PipelineStageDto> request) throws Exception {
        log.info("start method /pipelineStage/byTemplate");
        Response<PipelineStageDto> response = new Response<>();
        try {
            PipelineStageDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getPipelineTemplateId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = pipelineStageBusiness.getStagesForTemplate(dto.getPipelineTemplateId(), request.getIsSimpleLoading(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/reorder", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineStageDto>> reorder(@RequestBody Request<PipelineStageDto> request) throws Exception {
        log.info("start method /pipelineStage/reorder");
        Response<PipelineStageDto> response = new Response<>();
        try {
            PipelineStageDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getPipelineTemplateId() == null || dto.getOrderedStageIds() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = pipelineStageBusiness.reorderStages(dto.getPipelineTemplateId(), dto.getOrderedStageIds(), request.getUser(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
