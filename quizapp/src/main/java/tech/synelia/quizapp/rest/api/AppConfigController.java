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
@RequestMapping(value="/appConfig")
public class AppConfigController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private ControllerFactory<AppConfigDto> controllerFactory;
    @Autowired
    private AppConfigBusiness appConfigBusiness;

    @PreAuthorize("hasRole('SUPER')")
    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<AppConfigDto>> create(@RequestBody Request<AppConfigDto> request) throws Exception {
        log.info("start method /appConfig/create");
        Response<AppConfigDto> response = controllerFactory.create(appConfigBusiness, request, FunctionalityEnum.CREATE_APP_CONFIG);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER')")
    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<AppConfigDto>> update(@RequestBody Request<AppConfigDto> request) throws Exception {
        log.info("start method /appConfig/update");
        Response<AppConfigDto> response = controllerFactory.update(appConfigBusiness, request, FunctionalityEnum.UPDATE_APP_CONFIG);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER')")
    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<AppConfigDto>> delete(@RequestBody Request<AppConfigDto> request) throws Exception {
        log.info("start method /appConfig/delete");
        Response<AppConfigDto> response = controllerFactory.delete(appConfigBusiness, request, FunctionalityEnum.DELETE_APP_CONFIG);
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<AppConfigDto>> getByCriteria(@RequestBody Request<AppConfigDto> request) throws Exception {
        log.info("start method /appConfig/getByCriteria");
        Response<AppConfigDto> response = controllerFactory.getByCriteria(appConfigBusiness, request, FunctionalityEnum.VIEW_APP_CONFIG);
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER')")
    @RequestMapping(value="/activate", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<AppConfigDto>> activate(@RequestBody Request<AppConfigDto> request) throws Exception {
        log.info("start method /appConfig/activate");
        Response<AppConfigDto> response = new Response<>();
        try {
            AppConfigDto dto = request.getDatas() != null && !request.getDatas().isEmpty() ? request.getDatas().get(0) : request.getData();
            if (dto == null || dto.getId() == null) {
                response.setHasError(true);
                return ResponseEntity.ok().body(response);
            }
            response = appConfigBusiness.activateConfig(dto.getId(), request.getUser());
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
