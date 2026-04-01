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
@RequestMapping(value="/invitationCode")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER')")
public class InvitationCodeController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private FunctionalError functionalError;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private ControllerFactory<InvitationCodeDto> controllerFactory;
    @Autowired
    private InvitationCodeBusiness invitationCodeBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<InvitationCodeDto>> create(@RequestBody Request<InvitationCodeDto> request) throws Exception {
        log.info("start method /invitationCode/create");
        Response<InvitationCodeDto> response = controllerFactory.create(invitationCodeBusiness, request, FunctionalityEnum.CREATE_INVITATION_CODE);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().buildAndExpand(response.getItems().get(0)).toUri();
        log.info("end method /invitationCode/create");
        return ResponseEntity.created(uri).body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<InvitationCodeDto> update(@RequestBody Request<InvitationCodeDto> request) throws Exception {
        log.info("start method /invitationCode/update");
        Response<InvitationCodeDto> response = controllerFactory.update(invitationCodeBusiness, request, FunctionalityEnum.UPDATE_INVITATION_CODE);
        log.info("end method /invitationCode/update");
        return response;
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<InvitationCodeDto> delete(@RequestBody Request<InvitationCodeDto> request) throws Exception {
        log.info("start method /invitationCode/delete");
        Response<InvitationCodeDto> response = controllerFactory.delete(invitationCodeBusiness, request, FunctionalityEnum.DELETE_INVITATION_CODE);
        log.info("end method /invitationCode/delete");
        return response;
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<InvitationCodeDto> getByCriteria(@RequestBody Request<InvitationCodeDto> request) throws Exception {
        log.info("start method /invitationCode/getByCriteria");
        Response<InvitationCodeDto> response = controllerFactory.getByCriteria(invitationCodeBusiness, request, FunctionalityEnum.VIEW_INVITATION_CODE);
        log.info("end method /invitationCode/getByCriteria");
        return response;
    }

    /**
     * Public endpoint to validate an invitation code (no auth required).
     * SecurityConfig must whitelist /invitationCode/validate.
     */
    @PreAuthorize("permitAll()")
    @RequestMapping(value="/validate", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<InvitationCodeDto> validateCode(@RequestBody Request<InvitationCodeDto> request) throws Exception {
        log.info("start method /invitationCode/validate");
        String code = request.getData() != null ? request.getData().getCode() : null;
        Response<InvitationCodeDto> response = invitationCodeBusiness.validateCode(code, Locale.FRENCH);
        log.info("end method /invitationCode/validate");
        return response;
    }

    /**
     * Resend invitation email for an existing invitation.
     */
    @RequestMapping(value="/resend", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<InvitationCodeDto> resend(@RequestBody Request<InvitationCodeDto> request) throws Exception {
        log.info("start method /invitationCode/resend");
        Long id = request.getData() != null ? request.getData().getId() : null;
        Response<InvitationCodeDto> response = invitationCodeBusiness.resendInvitation(id, Locale.FRENCH);
        log.info("end method /invitationCode/resend");
        return response;
    }
}
