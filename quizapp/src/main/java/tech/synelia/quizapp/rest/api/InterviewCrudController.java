

/*
 * Java controller for entity table interview_crud 
 * Created on 2025-08-22 ( Time 11:38:26 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2017 Savoir Faire Linux. All Rights Reserved.
 */

package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
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
// import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

/**
Controller for table "interview_crud"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/interviewCrud")
public class InterviewCrudController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<InterviewCrudDto> controllerFactory;
	@Autowired
	private InterviewCrudBusiness interviewCrudBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<InterviewCrudDto>> create(@RequestBody Request<InterviewCrudDto> request) throws Exception {
    	log.info("start method /interviewCrud/create");
        Response<InterviewCrudDto> response = controllerFactory.create(interviewCrudBusiness, request, FunctionalityEnum.CREATE_INTERVIEW_CRUD);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /interviewCrud/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewCrudDto> update(@RequestBody Request<InterviewCrudDto> request) throws Exception{
    	log.info("start method /interviewCrud/update");
        Response<InterviewCrudDto> response = controllerFactory.update(interviewCrudBusiness, request, FunctionalityEnum.UPDATE_INTERVIEW_CRUD);
		log.info("end method /interviewCrud/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewCrudDto> delete(@RequestBody Request<InterviewCrudDto> request) throws Exception{
    	log.info("start method /interviewCrud/delete");
        Response<InterviewCrudDto> response = controllerFactory.delete(interviewCrudBusiness, request, FunctionalityEnum.DELETE_INTERVIEW_CRUD);
		log.info("end method /interviewCrud/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewCrudDto> getByCriteria(@RequestBody Request<InterviewCrudDto> request) throws Exception{
    	log.info("start method /interviewCrud/getByCriteria");
        Response<InterviewCrudDto> response = controllerFactory.getByCriteria(interviewCrudBusiness, request, FunctionalityEnum.VIEW_INTERVIEW_CRUD);
		log.info("end method /interviewCrud/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewCrudDto> getAllByCriteria(@RequestBody Request<InterviewCrudDto> request) throws Exception{
    	log.info("start method /interviewCrud/getAllByCriteria");
        Response<InterviewCrudDto> response = interviewCrudBusiness.getAllByCriteria(request, Locale.of((String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER"), ""));
		log.info("end method /interviewCrud/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<InterviewCrudDto> custom(@RequestBody Request<InterviewCrudDto> request) throws Exception{
	  log.info("InterviewCrudDto method /$/custom");
	  Response<InterviewCrudDto> response = new Response<InterviewCrudDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = interviewCrudBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /InterviewCrudDto/custom");
	  return response;
	 }
}
