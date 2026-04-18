/*
 * Java controller for entity table interview_participant
 */

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

import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.transaction.TransactionSystemException;

import java.net.URI;
import java.util.Locale;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

/**
 * Controller for table "interview_participant"
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/interviewParticipant")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'UTILISATEUR')")
public class InterviewParticipantController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<InterviewParticipantDto> controllerFactory;
	@Autowired
	private InterviewParticipantBusiness interviewParticipantBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<InterviewParticipantDto>> create(@RequestBody Request<InterviewParticipantDto> request) throws Exception {
    	log.info("start method /interviewParticipant/create");
        Response<InterviewParticipantDto> response = controllerFactory.create(interviewParticipantBusiness, request, FunctionalityEnum.CREATE_INTERVIEW_PARTICIPANT);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /interviewParticipant/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewParticipantDto> update(@RequestBody Request<InterviewParticipantDto> request) throws Exception{
    	log.info("start method /interviewParticipant/update");
        Response<InterviewParticipantDto> response = controllerFactory.update(interviewParticipantBusiness, request, FunctionalityEnum.UPDATE_INTERVIEW_PARTICIPANT);
		log.info("end method /interviewParticipant/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewParticipantDto> delete(@RequestBody Request<InterviewParticipantDto> request) throws Exception{
    	log.info("start method /interviewParticipant/delete");
        Response<InterviewParticipantDto> response = controllerFactory.delete(interviewParticipantBusiness, request, FunctionalityEnum.DELETE_INTERVIEW_PARTICIPANT);
		log.info("end method /interviewParticipant/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewParticipantDto> getByCriteria(@RequestBody Request<InterviewParticipantDto> request) throws Exception{
    	log.info("start method /interviewParticipant/getByCriteria");
        Response<InterviewParticipantDto> response = controllerFactory.getByCriteria(interviewParticipantBusiness, request, FunctionalityEnum.VIEW_INTERVIEW_PARTICIPANT);
		log.info("end method /interviewParticipant/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewParticipantDto> getAllByCriteria(@RequestBody Request<InterviewParticipantDto> request) throws Exception{
    	log.info("start method /interviewParticipant/getAllByCriteria");
        Response<InterviewParticipantDto> response = interviewParticipantBusiness.getAllByCriteria(request, Locale.of((String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER"), ""));
		log.info("end method /interviewParticipant/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<InterviewParticipantDto> custom(@RequestBody Request<InterviewParticipantDto> request) throws Exception{
	  log.info("InterviewParticipantDto method /$/custom");
	  Response<InterviewParticipantDto> response = new Response<InterviewParticipantDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = interviewParticipantBusiness.custom(request, locale);
	   } else {
	    slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(),
	      response.getStatus().getMessage());
	    return response;
	   }
	   if (!response.isHasError()) {
	    slf4jLogger.info("end method custom");
	    slf4jLogger.info("code: {} -  message: {}", StatusCode.SUCCESS, StatusMessage.SUCCESS);
	   } else {
	    slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(),
	      response.getStatus().getMessage());
	   }
	  } catch (CannotCreateTransactionException e) {
	   exceptionUtils.CANNOT_CREATE_TRANSACTION_EXCEPTION(response, locale, e);
	  } catch (TransactionSystemException e) {
	   exceptionUtils.TRANSACTION_SYSTEM_EXCEPTION(response, locale, e);
	  }
	  slf4jLogger.info("end method /InterviewParticipantDto/custom");
	  return response;
	 }
}
