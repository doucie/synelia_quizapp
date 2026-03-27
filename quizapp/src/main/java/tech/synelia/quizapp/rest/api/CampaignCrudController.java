

/*
 * Java controller for entity table campaign_crud 
 * Created on 2025-08-22 ( Time 11:38:24 )
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
Controller for table "campaign_crud"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/campaignCrud")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER', 'RECRUITER')")
public class CampaignCrudController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<CampaignCrudDto> controllerFactory;
	@Autowired
	private CampaignCrudBusiness campaignCrudBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<CampaignCrudDto>> create(@RequestBody Request<CampaignCrudDto> request) throws Exception {
    	log.info("start method /campaignCrud/create");
        Response<CampaignCrudDto> response = controllerFactory.create(campaignCrudBusiness, request, FunctionalityEnum.CREATE_CAMPAIGN_CRUD);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /campaignCrud/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CampaignCrudDto> update(@RequestBody Request<CampaignCrudDto> request) throws Exception{
    	log.info("start method /campaignCrud/update");
        Response<CampaignCrudDto> response = controllerFactory.update(campaignCrudBusiness, request, FunctionalityEnum.UPDATE_CAMPAIGN_CRUD);
		log.info("end method /campaignCrud/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CampaignCrudDto> delete(@RequestBody Request<CampaignCrudDto> request) throws Exception{
    	log.info("start method /campaignCrud/delete");
        Response<CampaignCrudDto> response = controllerFactory.delete(campaignCrudBusiness, request, FunctionalityEnum.DELETE_CAMPAIGN_CRUD);
		log.info("end method /campaignCrud/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CampaignCrudDto> getByCriteria(@RequestBody Request<CampaignCrudDto> request) throws Exception{
    	log.info("start method /campaignCrud/getByCriteria");
        Response<CampaignCrudDto> response = controllerFactory.getByCriteria(campaignCrudBusiness, request, FunctionalityEnum.VIEW_CAMPAIGN_CRUD);
		log.info("end method /campaignCrud/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CampaignCrudDto> getAllByCriteria(@RequestBody Request<CampaignCrudDto> request) throws Exception{
    	log.info("start method /campaignCrud/getAllByCriteria (including deleted)");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<CampaignCrudDto> response = campaignCrudBusiness.getAllByCriteria(request, locale);
		log.info("end method /campaignCrud/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<CampaignCrudDto> custom(@RequestBody Request<CampaignCrudDto> request) throws Exception{
	  log.info("CampaignCrudDto method /$/custom");
	  Response<CampaignCrudDto> response = new Response<CampaignCrudDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = campaignCrudBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /CampaignCrudDto/custom");
	  return response;
	 }
}
