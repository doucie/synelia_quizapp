

/*
 * Java controller for entity table candidate_token 
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
Controller for table "candidate_token"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/candidateToken")
@org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class CandidateTokenController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<CandidateTokenDto> controllerFactory;
	@Autowired
	private CandidateTokenBusiness candidateTokenBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<CandidateTokenDto>> create(@RequestBody Request<CandidateTokenDto> request) throws Exception {
    	log.info("start method /candidateToken/create");
        Response<CandidateTokenDto> response = controllerFactory.create(candidateTokenBusiness, request, FunctionalityEnum.CREATE_CANDIDATE_TOKEN);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /candidateToken/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateTokenDto> update(@RequestBody Request<CandidateTokenDto> request) throws Exception{
    	log.info("start method /candidateToken/update");
        Response<CandidateTokenDto> response = controllerFactory.update(candidateTokenBusiness, request, FunctionalityEnum.UPDATE_CANDIDATE_TOKEN);
		log.info("end method /candidateToken/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateTokenDto> delete(@RequestBody Request<CandidateTokenDto> request) throws Exception{
    	log.info("start method /candidateToken/delete");
        Response<CandidateTokenDto> response = controllerFactory.delete(candidateTokenBusiness, request, FunctionalityEnum.DELETE_CANDIDATE_TOKEN);
		log.info("end method /candidateToken/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateTokenDto> getByCriteria(@RequestBody Request<CandidateTokenDto> request) throws Exception{
    	log.info("start method /candidateToken/getByCriteria");
        Response<CandidateTokenDto> response = controllerFactory.getByCriteria(candidateTokenBusiness, request, FunctionalityEnum.VIEW_CANDIDATE_TOKEN);
		log.info("end method /candidateToken/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CandidateTokenDto> getAllByCriteria(@RequestBody Request<CandidateTokenDto> request) throws Exception{
    	log.info("start method /candidateToken/getAllByCriteria");
        Response<CandidateTokenDto> response = candidateTokenBusiness.getAllByCriteria(request, Locale.of((String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER"), ""));
		log.info("end method /candidateToken/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<CandidateTokenDto> custom(@RequestBody Request<CandidateTokenDto> request) throws Exception{
	  log.info("CandidateTokenDto method /$/custom");
	  Response<CandidateTokenDto> response = new Response<CandidateTokenDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = candidateTokenBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /CandidateTokenDto/custom");
	  return response;
	 }
}
