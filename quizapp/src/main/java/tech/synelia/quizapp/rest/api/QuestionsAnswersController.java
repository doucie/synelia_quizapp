

/*
 * Java controller for entity table questions_answers 
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
Controller for table "questions_answers"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/questionsAnswers")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER', 'RECRUITER')")
public class QuestionsAnswersController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<QuestionsAnswersDto> controllerFactory;
	@Autowired
	private QuestionsAnswersBusiness questionsAnswersBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<QuestionsAnswersDto>> create(@RequestBody Request<QuestionsAnswersDto> request) throws Exception {
    	log.info("start method /questionsAnswers/create");
        Response<QuestionsAnswersDto> response = controllerFactory.create(questionsAnswersBusiness, request, FunctionalityEnum.CREATE_QUESTIONS_ANSWERS);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /questionsAnswers/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<QuestionsAnswersDto> update(@RequestBody Request<QuestionsAnswersDto> request) throws Exception{
    	log.info("start method /questionsAnswers/update");
        Response<QuestionsAnswersDto> response = controllerFactory.update(questionsAnswersBusiness, request, FunctionalityEnum.UPDATE_QUESTIONS_ANSWERS);
		log.info("end method /questionsAnswers/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<QuestionsAnswersDto> delete(@RequestBody Request<QuestionsAnswersDto> request) throws Exception{
    	log.info("start method /questionsAnswers/delete");
        Response<QuestionsAnswersDto> response = controllerFactory.delete(questionsAnswersBusiness, request, FunctionalityEnum.DELETE_QUESTIONS_ANSWERS);
		log.info("end method /questionsAnswers/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<QuestionsAnswersDto> getByCriteria(@RequestBody Request<QuestionsAnswersDto> request) throws Exception{
    	log.info("start method /questionsAnswers/getByCriteria");
        Response<QuestionsAnswersDto> response = controllerFactory.getByCriteria(questionsAnswersBusiness, request, FunctionalityEnum.VIEW_QUESTIONS_ANSWERS);
		log.info("end method /questionsAnswers/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<QuestionsAnswersDto> getAllByCriteria(@RequestBody Request<QuestionsAnswersDto> request) throws Exception{
    	log.info("start method /questionsAnswers/getAllByCriteria (including deleted)");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<QuestionsAnswersDto> response = questionsAnswersBusiness.getAllByCriteria(request, locale);
		log.info("end method /questionsAnswers/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<QuestionsAnswersDto> custom(@RequestBody Request<QuestionsAnswersDto> request) throws Exception{
	  log.info("QuestionsAnswersDto method /$/custom");
	  Response<QuestionsAnswersDto> response = new Response<QuestionsAnswersDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = questionsAnswersBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /QuestionsAnswersDto/custom");
	  return response;
	 }
}
