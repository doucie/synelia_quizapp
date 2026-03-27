

/*
 * Java controller for entity table notifications 
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
Controller for table "notifications"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationsController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<NotificationsDto> controllerFactory;
	@Autowired
	private NotificationsBusiness notificationsBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<NotificationsDto>> create(@RequestBody Request<NotificationsDto> request) throws Exception {
    	log.info("start method /notifications/create");
        Response<NotificationsDto> response = controllerFactory.create(notificationsBusiness, request, FunctionalityEnum.CREATE_NOTIFICATIONS);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /notifications/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<NotificationsDto> update(@RequestBody Request<NotificationsDto> request) throws Exception{
    	log.info("start method /notifications/update");
        Response<NotificationsDto> response = controllerFactory.update(notificationsBusiness, request, FunctionalityEnum.UPDATE_NOTIFICATIONS);
		log.info("end method /notifications/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<NotificationsDto> delete(@RequestBody Request<NotificationsDto> request) throws Exception{
    	log.info("start method /notifications/delete");
        Response<NotificationsDto> response = controllerFactory.delete(notificationsBusiness, request, FunctionalityEnum.DELETE_NOTIFICATIONS);
		log.info("end method /notifications/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<NotificationsDto> getByCriteria(@RequestBody Request<NotificationsDto> request) throws Exception{
    	log.info("start method /notifications/getByCriteria");
        Response<NotificationsDto> response = controllerFactory.getByCriteria(notificationsBusiness, request, FunctionalityEnum.VIEW_NOTIFICATIONS);
		log.info("end method /notifications/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<NotificationsDto> getAllByCriteria(@RequestBody Request<NotificationsDto> request) throws Exception{
    	log.info("start method /notifications/getAllByCriteria");
        Response<NotificationsDto> response = notificationsBusiness.getAllByCriteria(request, Locale.of((String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER"), ""));
		log.info("end method /notifications/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<NotificationsDto> custom(@RequestBody Request<NotificationsDto> request) throws Exception{
	  log.info("NotificationsDto method /$/custom");
	  Response<NotificationsDto> response = new Response<NotificationsDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = notificationsBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /NotificationsDto/custom");
	  return response;
	 }
}
