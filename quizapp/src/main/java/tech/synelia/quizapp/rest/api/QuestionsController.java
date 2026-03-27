

/*
 * Java controller for entity table questions 
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
Controller for table "questions"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/questions")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER', 'RECRUITER')")
public class QuestionsController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<QuestionsDto> controllerFactory;
	@Autowired
	private QuestionsBusiness questionsBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<QuestionsDto>> create(@RequestBody Request<QuestionsDto> request) throws Exception {
    	log.info("start method /questions/create");
        Response<QuestionsDto> response = controllerFactory.create(questionsBusiness, request, FunctionalityEnum.CREATE_QUESTIONS);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /questions/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<QuestionsDto> update(@RequestBody Request<QuestionsDto> request) throws Exception{
    	log.info("start method /questions/update");
        Response<QuestionsDto> response = controllerFactory.update(questionsBusiness, request, FunctionalityEnum.UPDATE_QUESTIONS);
		log.info("end method /questions/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<QuestionsDto> delete(@RequestBody Request<QuestionsDto> request) throws Exception{
    	log.info("start method /questions/delete");
        Response<QuestionsDto> response = controllerFactory.delete(questionsBusiness, request, FunctionalityEnum.DELETE_QUESTIONS);
		log.info("end method /questions/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<QuestionsDto> getByCriteria(@RequestBody Request<QuestionsDto> request) throws Exception{
    	log.info("start method /questions/getByCriteria");
        Response<QuestionsDto> response = controllerFactory.getByCriteria(questionsBusiness, request, FunctionalityEnum.VIEW_QUESTIONS);
		log.info("end method /questions/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<QuestionsDto> getAllByCriteria(@RequestBody Request<QuestionsDto> request) throws Exception{
    	log.info("start method /questions/getAllByCriteria (including deleted)");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<QuestionsDto> response = questionsBusiness.getAllByCriteria(request, locale);
		log.info("end method /questions/getAllByCriteria");
        return response;
    }

	@RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<QuestionsDto> updateAll(@RequestBody Request<QuestionsDto> request) throws Exception{
    	log.info("start method /questions/updateAll");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<QuestionsDto> response = questionsBusiness.updateAll(request, locale);
		log.info("end method /questions/updateAll");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<QuestionsDto> custom(@RequestBody Request<QuestionsDto> request) throws Exception{
	  log.info("QuestionsDto method /$/custom");
	  Response<QuestionsDto> response = new Response<QuestionsDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = questionsBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /QuestionsDto/custom");
	  return response;
	 }
}
