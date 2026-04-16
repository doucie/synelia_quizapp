package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
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

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/emailTemplate")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class EmailTemplateController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private ControllerFactory<EmailTemplateDto> controllerFactory;
    @Autowired
    private EmailTemplateBusiness emailTemplateBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<EmailTemplateDto>> create(@RequestBody Request<EmailTemplateDto> request) throws Exception {
        log.info("start method /emailTemplate/create");
        Response<EmailTemplateDto> response = controllerFactory.create(emailTemplateBusiness, request, FunctionalityEnum.CREATE_EMAIL_TEMPLATE);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().buildAndExpand(response.getItems().get(0)).toUri();
        log.info("end method /emailTemplate/create");
        return ResponseEntity.created(uri).body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<EmailTemplateDto> update(@RequestBody Request<EmailTemplateDto> request) throws Exception {
        log.info("start method /emailTemplate/update");
        Response<EmailTemplateDto> response = controllerFactory.update(emailTemplateBusiness, request, FunctionalityEnum.UPDATE_EMAIL_TEMPLATE);
        log.info("end method /emailTemplate/update");
        return response;
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<EmailTemplateDto> delete(@RequestBody Request<EmailTemplateDto> request) throws Exception {
        log.info("start method /emailTemplate/delete");
        Response<EmailTemplateDto> response = controllerFactory.delete(emailTemplateBusiness, request, FunctionalityEnum.DELETE_EMAIL_TEMPLATE);
        log.info("end method /emailTemplate/delete");
        return response;
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<EmailTemplateDto> getByCriteria(@RequestBody Request<EmailTemplateDto> request) throws Exception {
        log.info("start method /emailTemplate/getByCriteria");
        Response<EmailTemplateDto> response = controllerFactory.getByCriteria(emailTemplateBusiness, request, FunctionalityEnum.VIEW_EMAIL_TEMPLATE);
        log.info("end method /emailTemplate/getByCriteria");
        return response;
    }
}
