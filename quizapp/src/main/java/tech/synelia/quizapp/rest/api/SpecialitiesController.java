

/*
 * Java controller for entity table specialities 
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
Controller for table "specialities"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/specialities")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER')")
public class SpecialitiesController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<SpecialitiesDto> controllerFactory;
	@Autowired
	private SpecialitiesBusiness specialitiesBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<SpecialitiesDto>> create(@RequestBody Request<SpecialitiesDto> request) throws Exception {
    	log.info("start method /specialities/create");
        Response<SpecialitiesDto> response = controllerFactory.create(specialitiesBusiness, request, FunctionalityEnum.CREATE_SPECIALITIES);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /specialities/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SpecialitiesDto> update(@RequestBody Request<SpecialitiesDto> request) throws Exception{
    	log.info("start method /specialities/update");
        Response<SpecialitiesDto> response = controllerFactory.update(specialitiesBusiness, request, FunctionalityEnum.UPDATE_SPECIALITIES);
		log.info("end method /specialities/update");
        return response;
    }

	@RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SpecialitiesDto> updateAll(@RequestBody Request<SpecialitiesDto> request) throws Exception{
    	log.info("start method /specialities/updateAll");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<SpecialitiesDto> response = specialitiesBusiness.updateAll(request, locale);
		log.info("end method /specialities/updateAll");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SpecialitiesDto> delete(@RequestBody Request<SpecialitiesDto> request) throws Exception{
    	log.info("start method /specialities/delete");
        Response<SpecialitiesDto> response = controllerFactory.delete(specialitiesBusiness, request, FunctionalityEnum.DELETE_SPECIALITIES);
		log.info("end method /specialities/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SpecialitiesDto> getByCriteria(@RequestBody Request<SpecialitiesDto> request) throws Exception{
    	log.info("start method /specialities/getByCriteria");
        Response<SpecialitiesDto> response = controllerFactory.getByCriteria(specialitiesBusiness, request, FunctionalityEnum.VIEW_SPECIALITIES);
		log.info("end method /specialities/getByCriteria");
        return response;
    }

    @RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SpecialitiesDto> getAllByCriteria(@RequestBody Request<SpecialitiesDto> request) throws Exception{
    	log.info("start method /specialities/getAllByCriteria (including deleted specialities)");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<SpecialitiesDto> response = specialitiesBusiness.getAllByCriteria(request, locale);
		log.info("end method /specialities/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<SpecialitiesDto> custom(@RequestBody Request<SpecialitiesDto> request) throws Exception{
	  log.info("SpecialitiesDto method /$/custom");
	  Response<SpecialitiesDto> response = new Response<SpecialitiesDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = specialitiesBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /SpecialitiesDto/custom");
	  return response;
	 }
}
