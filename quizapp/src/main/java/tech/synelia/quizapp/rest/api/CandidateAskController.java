

/*
 * Java controller for entity table candidate_ask 
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
Controller for table "candidate_ask"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/candidateAsk")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER', 'RECRUITER')")
public class CandidateAskController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<CandidateAskDto> controllerFactory;
	@Autowired
	private CandidateAskBusiness candidateAskBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<CandidateAskDto>> create(@RequestBody Request<CandidateAskDto> request) throws Exception {
    	log.info("start method /candidateAsk/create");
        Response<CandidateAskDto> response = controllerFactory.create(candidateAskBusiness, request, FunctionalityEnum.CREATE_CANDIDATE_ASK);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /candidateAsk/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateAskDto> update(@RequestBody Request<CandidateAskDto> request) throws Exception{
    	log.info("start method /candidateAsk/update");
        Response<CandidateAskDto> response = controllerFactory.update(candidateAskBusiness, request, FunctionalityEnum.UPDATE_CANDIDATE_ASK);
		log.info("end method /candidateAsk/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateAskDto> delete(@RequestBody Request<CandidateAskDto> request) throws Exception{
    	log.info("start method /candidateAsk/delete");
        Response<CandidateAskDto> response = controllerFactory.delete(candidateAskBusiness, request, FunctionalityEnum.DELETE_CANDIDATE_ASK);
		log.info("end method /candidateAsk/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateAskDto> getByCriteria(@RequestBody Request<CandidateAskDto> request) throws Exception{
    	log.info("start method /candidateAsk/getByCriteria");
        Response<CandidateAskDto> response = controllerFactory.getByCriteria(candidateAskBusiness, request, FunctionalityEnum.VIEW_CANDIDATE_ASK);
		log.info("end method /candidateAsk/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateAskDto> getAllByCriteria(@RequestBody Request<CandidateAskDto> request) throws Exception{
    	log.info("start method /candidateAsk/getAllByCriteria");
        Response<CandidateAskDto> response = candidateAskBusiness.getAllByCriteria(request, Locale.of((String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER"), ""));
		log.info("end method /candidateAsk/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<CandidateAskDto> custom(@RequestBody Request<CandidateAskDto> request) throws Exception{
	  log.info("CandidateAskDto method /$/custom");
	  Response<CandidateAskDto> response = new Response<CandidateAskDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = candidateAskBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /CandidateAskDto/custom");
	  return response;
	 }
}
