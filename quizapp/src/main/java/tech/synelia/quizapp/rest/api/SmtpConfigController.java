package tech.synelia.quizapp.rest.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.Locale;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

@CrossOrigin("*")
@RestController
@RequestMapping(value="/smtpConfig")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SmtpConfigController {

    private static final Logger LOGGER = LoggerFactory.getLogger(SmtpConfigController.class);

    @Autowired
    private HttpServletRequest requestBasic;

    @Autowired
    private ControllerFactory<SmtpConfigDto> controllerFactory;
    @Autowired
    private SmtpConfigBusiness smtpConfigBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<SmtpConfigDto>> create(@RequestBody Request<SmtpConfigDto> request) throws Exception {
        LOGGER.info("start method /smtpConfig/create");
        Response<SmtpConfigDto> response = controllerFactory.create(smtpConfigBusiness, request, FunctionalityEnum.CREATE_SMTP_CONFIG);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().buildAndExpand(response.getItems().get(0)).toUri();
        LOGGER.info("end method /smtpConfig/create");
        return ResponseEntity.created(uri).body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<SmtpConfigDto> update(@RequestBody Request<SmtpConfigDto> request) throws Exception {
        LOGGER.info("start method /smtpConfig/update");
        Response<SmtpConfigDto> response = controllerFactory.update(smtpConfigBusiness, request, FunctionalityEnum.UPDATE_SMTP_CONFIG);
        LOGGER.info("end method /smtpConfig/update");
        return response;
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<SmtpConfigDto> delete(@RequestBody Request<SmtpConfigDto> request) throws Exception {
        LOGGER.info("start method /smtpConfig/delete");
        Response<SmtpConfigDto> response = controllerFactory.delete(smtpConfigBusiness, request, FunctionalityEnum.DELETE_SMTP_CONFIG);
        LOGGER.info("end method /smtpConfig/delete");
        return response;
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<SmtpConfigDto> getByCriteria(@RequestBody Request<SmtpConfigDto> request) throws Exception {
        LOGGER.info("start method /smtpConfig/getByCriteria");
        Response<SmtpConfigDto> response = controllerFactory.getByCriteria(smtpConfigBusiness, request, FunctionalityEnum.VIEW_SMTP_CONFIG);
        LOGGER.info("end method /smtpConfig/getByCriteria");
        return response;
    }

    @RequestMapping(value="/test", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<SmtpConfigDto> test(@RequestBody Request<SmtpConfigDto> request) throws Exception {
        LOGGER.info("start method /smtpConfig/test");
        Response<SmtpConfigDto> response = smtpConfigBusiness.testActiveConfig(request, resolveLocale());
        LOGGER.info("end method /smtpConfig/test");
        return response;
    }

    private Locale resolveLocale() {
        String lang = requestBasic.getHeader("lang");
        if (lang == null || lang.isBlank()) {
            return Locale.getDefault();
        }
        return Locale.forLanguageTag(lang);
    }
}
