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
@RequestMapping(value="/pipelineTemplate")
public class PipelineTemplateController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private ControllerFactory<PipelineTemplateDto> controllerFactory;
    @Autowired
    private PipelineTemplateBusiness pipelineTemplateBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineTemplateDto>> create(@RequestBody Request<PipelineTemplateDto> request) throws Exception {
        log.info("start method /pipelineTemplate/create");
        Response<PipelineTemplateDto> response = controllerFactory.create(pipelineTemplateBusiness, request, FunctionalityEnum.CREATE_PIPELINE_TEMPLATE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineTemplateDto>> update(@RequestBody Request<PipelineTemplateDto> request) throws Exception {
        log.info("start method /pipelineTemplate/update");
        Response<PipelineTemplateDto> response = controllerFactory.update(pipelineTemplateBusiness, request, FunctionalityEnum.UPDATE_PIPELINE_TEMPLATE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineTemplateDto>> delete(@RequestBody Request<PipelineTemplateDto> request) throws Exception {
        log.info("start method /pipelineTemplate/delete");
        Response<PipelineTemplateDto> response = controllerFactory.delete(pipelineTemplateBusiness, request, FunctionalityEnum.DELETE_PIPELINE_TEMPLATE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineTemplateDto>> getByCriteria(@RequestBody Request<PipelineTemplateDto> request) throws Exception {
        log.info("start method /pipelineTemplate/getByCriteria");
        Response<PipelineTemplateDto> response = controllerFactory.getByCriteria(pipelineTemplateBusiness, request, FunctionalityEnum.VIEW_PIPELINE_TEMPLATE);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/getAllByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineTemplateDto>> getAllByCriteria(@RequestBody Request<PipelineTemplateDto> request) throws Exception {
        log.info("start method /pipelineTemplate/getAllByCriteria");
        Response<PipelineTemplateDto> response = controllerFactory.getByCriteria(pipelineTemplateBusiness, request, FunctionalityEnum.VIEW_PIPELINE_TEMPLATE);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/updateAll", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineTemplateDto>> updateAll(@RequestBody Request<PipelineTemplateDto> request) throws Exception {
        log.info("start method /pipelineTemplate/updateAll");
        Response<PipelineTemplateDto> response = controllerFactory.update(pipelineTemplateBusiness, request, FunctionalityEnum.UPDATE_PIPELINE_TEMPLATE);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/updateDeleted", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineTemplateDto>> updateDeleted(@RequestBody Request<PipelineTemplateDto> request) throws Exception {
        log.info("start method /pipelineTemplate/updateDeleted");
        Response<PipelineTemplateDto> response = controllerFactory.update(pipelineTemplateBusiness, request, FunctionalityEnum.UPDATE_PIPELINE_TEMPLATE);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/setDefault", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineTemplateDto>> setDefault(@RequestBody Request<PipelineTemplateDto> request) throws Exception {
        log.info("start method /pipelineTemplate/setDefault");
        Response<PipelineTemplateDto> response = new Response<>();
        try {
            PipelineTemplateDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = pipelineTemplateBusiness.setAsDefault(dto.getId(), request.getUser(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/duplicate", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<PipelineTemplateDto>> duplicate(@RequestBody Request<PipelineTemplateDto> request) throws Exception {
        log.info("start method /pipelineTemplate/duplicate");
        Response<PipelineTemplateDto> response = new Response<>();
        try {
            PipelineTemplateDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getId() == null || dto.getTemplateName() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = pipelineTemplateBusiness.duplicateTemplate(dto.getId(), dto.getTemplateName(), request.getUser(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
