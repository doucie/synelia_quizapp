

/*
 * Java controller for entity table source_token 
 * Created on 2025-08-22 ( Time 11:38:28 )
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
Controller for table "source_token"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/sourceToken")
public class SourceTokenController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<SourceTokenDto> controllerFactory;
	@Autowired
	private SourceTokenBusiness sourceTokenBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<SourceTokenDto>> create(@RequestBody Request<SourceTokenDto> request) throws Exception {
    	log.info("start method /sourceToken/create");
        Response<SourceTokenDto> response = controllerFactory.create(sourceTokenBusiness, request, FunctionalityEnum.CREATE_SOURCE_TOKEN);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /sourceToken/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SourceTokenDto> update(@RequestBody Request<SourceTokenDto> request) throws Exception{
    	log.info("start method /sourceToken/update");
        Response<SourceTokenDto> response = controllerFactory.update(sourceTokenBusiness, request, FunctionalityEnum.UPDATE_SOURCE_TOKEN);
		log.info("end method /sourceToken/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SourceTokenDto> delete(@RequestBody Request<SourceTokenDto> request) throws Exception{
    	log.info("start method /sourceToken/delete");
        Response<SourceTokenDto> response = controllerFactory.delete(sourceTokenBusiness, request, FunctionalityEnum.DELETE_SOURCE_TOKEN);
		log.info("end method /sourceToken/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SourceTokenDto> getByCriteria(@RequestBody Request<SourceTokenDto> request) throws Exception{
    	log.info("start method /sourceToken/getByCriteria");
        Response<SourceTokenDto> response = controllerFactory.getByCriteria(sourceTokenBusiness, request, FunctionalityEnum.VIEW_SOURCE_TOKEN);
		log.info("end method /sourceToken/getByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<SourceTokenDto> custom(@RequestBody Request<SourceTokenDto> request) throws Exception{
	  log.info("SourceTokenDto method /$/custom");
	  Response<SourceTokenDto> response = new Response<SourceTokenDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = sourceTokenBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /SourceTokenDto/custom");
	  return response;
	 }
}
