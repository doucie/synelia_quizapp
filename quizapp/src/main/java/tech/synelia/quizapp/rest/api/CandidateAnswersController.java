

/*
 * Java controller for entity table candidate_answers 
 * Created on 2025-08-22 ( Time 11:38:25 )
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
Controller for table "candidate_answers"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/candidateAnswers")
public class CandidateAnswersController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<CandidateAnswersDto> controllerFactory;
	@Autowired
	private CandidateAnswersBusiness candidateAnswersBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<CandidateAnswersDto>> create(@RequestBody Request<CandidateAnswersDto> request) throws Exception {
    	log.info("start method /candidateAnswers/create");
        Response<CandidateAnswersDto> response = controllerFactory.create(candidateAnswersBusiness, request, FunctionalityEnum.CREATE_CANDIDATE_ANSWERS);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /candidateAnswers/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateAnswersDto> update(@RequestBody Request<CandidateAnswersDto> request) throws Exception{
    	log.info("start method /candidateAnswers/update");
        Response<CandidateAnswersDto> response = controllerFactory.update(candidateAnswersBusiness, request, FunctionalityEnum.UPDATE_CANDIDATE_ANSWERS);
		log.info("end method /candidateAnswers/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateAnswersDto> delete(@RequestBody Request<CandidateAnswersDto> request) throws Exception{
    	log.info("start method /candidateAnswers/delete");
        Response<CandidateAnswersDto> response = controllerFactory.delete(candidateAnswersBusiness, request, FunctionalityEnum.DELETE_CANDIDATE_ANSWERS);
		log.info("end method /candidateAnswers/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateAnswersDto> getByCriteria(@RequestBody Request<CandidateAnswersDto> request) throws Exception{
    	log.info("start method /candidateAnswers/getByCriteria");
        Response<CandidateAnswersDto> response = controllerFactory.getByCriteria(candidateAnswersBusiness, request, FunctionalityEnum.VIEW_CANDIDATE_ANSWERS);
		log.info("end method /candidateAnswers/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateAnswersDto> getAllByCriteria(@RequestBody Request<CandidateAnswersDto> request) throws Exception{
    	log.info("start method /candidateAnswers/getAllByCriteria");
        Response<CandidateAnswersDto> response = candidateAnswersBusiness.getAllByCriteria(request, Locale.of((String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER"), ""));
		log.info("end method /candidateAnswers/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<CandidateAnswersDto> custom(@RequestBody Request<CandidateAnswersDto> request) throws Exception{
	  log.info("CandidateAnswersDto method /$/custom");
	  Response<CandidateAnswersDto> response = new Response<CandidateAnswersDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = candidateAnswersBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /CandidateAnswersDto/custom");
	  return response;
	 }
}
