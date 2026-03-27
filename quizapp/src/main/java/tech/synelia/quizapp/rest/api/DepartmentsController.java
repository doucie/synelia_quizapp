

/*
 * Java controller for entity table departments 
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
Controller for table "departments"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/departments")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER')")
public class DepartmentsController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<DepartmentsDto> controllerFactory;
	@Autowired
	private DepartmentsBusiness departmentsBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<DepartmentsDto>> create(@RequestBody Request<DepartmentsDto> request) throws Exception {
    	log.info("start method /departments/create");
        Response<DepartmentsDto> response = controllerFactory.create(departmentsBusiness, request, FunctionalityEnum.CREATE_DEPARTMENTS);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /departments/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<DepartmentsDto> update(@RequestBody Request<DepartmentsDto> request) throws Exception{
    	log.info("start method /departments/update");
        Response<DepartmentsDto> response = controllerFactory.update(departmentsBusiness, request, FunctionalityEnum.UPDATE_DEPARTMENTS);
		log.info("end method /departments/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<DepartmentsDto> delete(@RequestBody Request<DepartmentsDto> request) throws Exception{
    	log.info("start method /departments/delete");
        Response<DepartmentsDto> response = controllerFactory.delete(departmentsBusiness, request, FunctionalityEnum.DELETE_DEPARTMENTS);
		log.info("end method /departments/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<DepartmentsDto> getByCriteria(@RequestBody Request<DepartmentsDto> request) throws Exception{
    	log.info("start method /departments/getByCriteria");
        Response<DepartmentsDto> response = controllerFactory.getByCriteria(departmentsBusiness, request, FunctionalityEnum.VIEW_DEPARTMENTS);
		log.info("end method /departments/getByCriteria");
        return response;
    }

    @RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<DepartmentsDto> getAllByCriteria(@RequestBody Request<DepartmentsDto> request) throws Exception{
    	log.info("start method /departments/getAllByCriteria (including deleted departments)");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<DepartmentsDto> response = departmentsBusiness.getAllByCriteria(request, locale);
		log.info("end method /departments/getAllByCriteria");
        return response;
    }

    @RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<DepartmentsDto> updateAll(@RequestBody Request<DepartmentsDto> request) throws Exception{
    	log.info("start method /departments/updateAll");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<DepartmentsDto> response = departmentsBusiness.updateAll(request, locale);
		log.info("end method /departments/updateAll");
        return response;
    }

    @RequestMapping(value="/checkAssociatedSpecialities",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<DepartmentsDto> checkAssociatedSpecialities(@RequestBody Request<DepartmentsDto> request) throws Exception{
    	log.info("start method /departments/checkAssociatedSpecialities");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<DepartmentsDto> response = departmentsBusiness.checkAssociatedSpecialities(request, locale);
		log.info("end method /departments/checkAssociatedSpecialities");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<DepartmentsDto> custom(@RequestBody Request<DepartmentsDto> request) throws Exception{
	  log.info("DepartmentsDto method /$/custom");
	  Response<DepartmentsDto> response = new Response<DepartmentsDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = departmentsBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /DepartmentsDto/custom");
	  return response;
	 }
}
