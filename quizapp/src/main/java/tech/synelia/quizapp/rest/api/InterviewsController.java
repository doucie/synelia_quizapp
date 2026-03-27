

/*
 * Java controller for entity table interviews 
 * Created on 2025-08-22 ( Time 11:38:27 )
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
// import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

/**
Controller for table "interviews"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/interviews")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER', 'RECRUITER')")
public class InterviewsController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<InterviewsDto> controllerFactory;
	@Autowired
	private InterviewsBusiness interviewsBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<InterviewsDto>> create(@RequestBody Request<InterviewsDto> request) throws Exception {
    	log.info("start method /interviews/create");
        Response<InterviewsDto> response = controllerFactory.create(interviewsBusiness, request, FunctionalityEnum.CREATE_INTERVIEWS);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /interviews/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewsDto> update(@RequestBody Request<InterviewsDto> request) throws Exception{
    	log.info("start method /interviews/update");
        Response<InterviewsDto> response = controllerFactory.update(interviewsBusiness, request, FunctionalityEnum.UPDATE_INTERVIEWS);
		log.info("end method /interviews/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewsDto> delete(@RequestBody Request<InterviewsDto> request) throws Exception{
    	log.info("start method /interviews/delete");
        Response<InterviewsDto> response = controllerFactory.delete(interviewsBusiness, request, FunctionalityEnum.DELETE_INTERVIEWS);
		log.info("end method /interviews/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewsDto> getByCriteria(@RequestBody Request<InterviewsDto> request) throws Exception{
    	log.info("start method /interviews/getByCriteria");
        Response<InterviewsDto> response = controllerFactory.getByCriteria(interviewsBusiness, request, FunctionalityEnum.VIEW_INTERVIEWS);
		log.info("end method /interviews/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<InterviewsDto> getAllByCriteria(@RequestBody Request<InterviewsDto> request) throws Exception{
    	log.info("start method /interviews/getAllByCriteria");
        Response<InterviewsDto> response = interviewsBusiness.getAllByCriteria(request, Locale.of((String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER"), ""));
		log.info("end method /interviews/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<InterviewsDto> custom(@RequestBody Request<InterviewsDto> request) throws Exception{
	  log.info("InterviewsDto method /$/custom");
	  Response<InterviewsDto> response = new Response<InterviewsDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = interviewsBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /InterviewsDto/custom");
	  return response;
	 }

	 /**
	  * Termine un entretien et calcule les scores d'évaluation
	  */
	 @RequestMapping(value = "/finish", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<InterviewsDto> finishInterview(@RequestBody Request<InterviewsDto> request) throws Exception {
	  log.info("start method /interviews/finish");
	  Response<InterviewsDto> response = new Response<InterviewsDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = interviewsBusiness.finishInterview(request, locale);
	   } else {
	    slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(),
	      response.getStatus().getMessage());
	    return response;
	   }
	   if (!response.isHasError()) {
	    slf4jLogger.info("Interview terminé avec succès");
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
	  log.info("end method /interviews/finish");
	  return response;
	 }
}
