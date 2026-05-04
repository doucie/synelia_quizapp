package tech.synelia.quizapp.rest.api;

import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;
import tech.synelia.quizapp.business.ApplicationProgressBusiness;
import tech.synelia.quizapp.rest.fact.ControllerFactory;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.StatusCode;
import tech.synelia.quizapp.utils.StatusMessage;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.ApplicationProgressDto;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/applicationProgress")
public class ApplicationProgressController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private ControllerFactory<ApplicationProgressDto> controllerFactory;
    @Autowired
    private ApplicationProgressBusiness applicationProgressBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> create(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/create");
        Response<ApplicationProgressDto> response = controllerFactory.create(applicationProgressBusiness, request, FunctionalityEnum.CREATE_APPLICATION_PROGRESS);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> update(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/update");
        Response<ApplicationProgressDto> response = controllerFactory.update(applicationProgressBusiness, request, FunctionalityEnum.UPDATE_APPLICATION_PROGRESS);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> delete(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/delete");
        Response<ApplicationProgressDto> response = controllerFactory.delete(applicationProgressBusiness, request, FunctionalityEnum.DELETE_APPLICATION_PROGRESS);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> getByCriteria(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/getByCriteria");
        Response<ApplicationProgressDto> response = controllerFactory.getByCriteria(applicationProgressBusiness, request, FunctionalityEnum.VIEW_APPLICATION_PROGRESS);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/getAllByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> getAllByCriteria(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/getAllByCriteria");
        Response<ApplicationProgressDto> response = controllerFactory.getByCriteria(applicationProgressBusiness, request, FunctionalityEnum.VIEW_APPLICATION_PROGRESS);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/updateAll", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> updateAll(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/updateAll");
        Response<ApplicationProgressDto> response = controllerFactory.update(applicationProgressBusiness, request, FunctionalityEnum.UPDATE_APPLICATION_PROGRESS);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/updateDeleted", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> updateDeleted(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/updateDeleted");
        Response<ApplicationProgressDto> response = controllerFactory.update(applicationProgressBusiness, request, FunctionalityEnum.UPDATE_APPLICATION_PROGRESS);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/byApplication", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> byApplication(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/byApplication");
        Response<ApplicationProgressDto> response = new Response<>();
        try {
            ApplicationProgressDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getApplicationId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = applicationProgressBusiness.getProgressForApplication(dto.getApplicationId(), request.getIsSimpleLoading(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/advance", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> advance(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/advance");
        Response<ApplicationProgressDto> response = new Response<>();
        try {
            ApplicationProgressDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getApplicationId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = applicationProgressBusiness.advanceToNextStageForUser(dto.getApplicationId(), request.getUser(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/fail", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> fail(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/fail");
        Response<ApplicationProgressDto> response = new Response<>();
        try {
            ApplicationProgressDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getApplicationId() == null || dto.getPipelineStageId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = applicationProgressBusiness.failStageForUser(dto.getApplicationId(), dto.getPipelineStageId(), request.getUser(), dto.getNotes(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/skip", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> skip(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/skip");
        Response<ApplicationProgressDto> response = new Response<>();
        try {
            ApplicationProgressDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getApplicationId() == null || dto.getPipelineStageId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = applicationProgressBusiness.skipStageForUser(dto.getApplicationId(), dto.getPipelineStageId(), request.getUser(), dto.getNotes(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/rollback", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> rollback(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/rollback");
        Response<ApplicationProgressDto> response = new Response<>();
        try {
            ApplicationProgressDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getApplicationId() == null || dto.getPipelineStageId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = applicationProgressBusiness.rollbackStageForUser(dto.getApplicationId(), dto.getPipelineStageId(), request.getUser(), dto.getNotes(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/currentStage", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> currentStage(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/currentStage");
        Response<ApplicationProgressDto> response = new Response<>();
        try {
            ApplicationProgressDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getApplicationId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = applicationProgressBusiness.getCurrentStage(dto.getApplicationId(), locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/migratableCandidates", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> migratableCandidates(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/migratableCandidates");
        Response<ApplicationProgressDto> response = new Response<>();
        try {
            ApplicationProgressDto dto = request.getData();
            if (dto == null || dto.getCampaignId() == null || dto.getNewTemplateId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            List<Integer> ids = applicationProgressBusiness.getMigratableCandidates(dto.getCampaignId(), dto.getNewTemplateId());
            ApplicationProgressDto result = new ApplicationProgressDto();
            result.setMigratableApplicationIds(ids);
            response.setItems(java.util.Arrays.asList(result));
            response.setCount((long) ids.size());
            response.setHasError(false);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setStatus(status);
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/migrateMultiple", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<ApplicationProgressDto>> migrateMultiple(@RequestBody Request<ApplicationProgressDto> request) throws Exception {
        log.info("start method /applicationProgress/migrateMultiple");
        Response<ApplicationProgressDto> response = new Response<>();
        try {
            ApplicationProgressDto dto = request.getData();
            if (dto == null || dto.getMigratableApplicationIds() == null || dto.getMigratableApplicationIds().isEmpty() || dto.getNewTemplateId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            applicationProgressBusiness.migrateMultipleCandidates(dto.getMigratableApplicationIds(), dto.getNewTemplateId(), request.getUser());
            response.setHasError(false);
            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setStatus(status);
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
