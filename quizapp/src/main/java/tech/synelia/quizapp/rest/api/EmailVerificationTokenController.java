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
import java.net.URI;

import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/emailVerificationToken")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'UTILISATEUR')")
public class EmailVerificationTokenController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ControllerFactory<EmailVerificationTokenDto> controllerFactory;
    @Autowired
    private EmailVerificationTokenBusiness emailVerificationTokenBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<EmailVerificationTokenDto>> create(@RequestBody Request<EmailVerificationTokenDto> request) throws Exception {
        log.info("start method /emailVerificationToken/create");
        Response<EmailVerificationTokenDto> response = controllerFactory.create(emailVerificationTokenBusiness, request, FunctionalityEnum.CREATE_EMAIL_VERIFICATION_TOKEN);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().buildAndExpand(response.getItems().get(0)).toUri();
        log.info("end method /emailVerificationToken/create");
        return ResponseEntity.created(uri).body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<EmailVerificationTokenDto> update(@RequestBody Request<EmailVerificationTokenDto> request) throws Exception {
        log.info("start method /emailVerificationToken/update");
        Response<EmailVerificationTokenDto> response = controllerFactory.update(emailVerificationTokenBusiness, request, FunctionalityEnum.UPDATE_EMAIL_VERIFICATION_TOKEN);
        log.info("end method /emailVerificationToken/update");
        return response;
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<EmailVerificationTokenDto> delete(@RequestBody Request<EmailVerificationTokenDto> request) throws Exception {
        log.info("start method /emailVerificationToken/delete");
        Response<EmailVerificationTokenDto> response = controllerFactory.delete(emailVerificationTokenBusiness, request, FunctionalityEnum.DELETE_EMAIL_VERIFICATION_TOKEN);
        log.info("end method /emailVerificationToken/delete");
        return response;
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<EmailVerificationTokenDto> getByCriteria(@RequestBody Request<EmailVerificationTokenDto> request) throws Exception {
        log.info("start method /emailVerificationToken/getByCriteria");
        Response<EmailVerificationTokenDto> response = controllerFactory.getByCriteria(emailVerificationTokenBusiness, request, FunctionalityEnum.VIEW_EMAIL_VERIFICATION_TOKEN);
        log.info("end method /emailVerificationToken/getByCriteria");
        return response;
    }
}
