

/*
 * Java controller for entity table campaigns 
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
Controller for table "campaigns"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/campaigns")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'RECRUITER')")
public class CampaignsController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<CampaignsDto> controllerFactory;
	@Autowired
	private CampaignsBusiness campaignsBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<CampaignsDto>> create(@RequestBody Request<CampaignsDto> request) throws Exception {
    	log.info("start method /campaigns/create");
        Response<CampaignsDto> response = controllerFactory.create(campaignsBusiness, request, FunctionalityEnum.CREATE_CAMPAIGNS);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /campaigns/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CampaignsDto> update(@RequestBody Request<CampaignsDto> request) throws Exception{
    	log.info("start method /campaigns/update");
        Response<CampaignsDto> response = controllerFactory.update(campaignsBusiness, request, FunctionalityEnum.UPDATE_CAMPAIGNS);
		log.info("end method /campaigns/update");
        return response;
    }

	@RequestMapping(value="/updateDeleted",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<CampaignsDto> updateDeleted(@RequestBody Request<CampaignsDto> request) throws Exception{
		log.info("start method /campaigns/updateDeleted");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
		Response<CampaignsDto> response = campaignsBusiness.updateDeleted(request, locale);
		log.info("end method /campaigns/updateDeleted");
		return response;
	}

	@RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<CampaignsDto> updateAll(@RequestBody Request<CampaignsDto> request) throws Exception{
		log.info("start method /campaigns/updateAll");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
		Response<CampaignsDto> response = campaignsBusiness.updateAll(request, locale);
		log.info("end method /campaigns/updateAll");
		return response;
	}

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CampaignsDto> delete(@RequestBody Request<CampaignsDto> request) throws Exception{
    	log.info("start method /campaigns/delete");
        Response<CampaignsDto> response = controllerFactory.delete(campaignsBusiness, request, FunctionalityEnum.DELETE_CAMPAIGNS);
		log.info("end method /campaigns/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CampaignsDto> getByCriteria(@RequestBody Request<CampaignsDto> request) throws Exception{
    	log.info("start method /campaigns/getByCriteria");
        Response<CampaignsDto> response = controllerFactory.getByCriteria(campaignsBusiness, request, FunctionalityEnum.VIEW_CAMPAIGNS);
		log.info("end method /campaigns/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<CampaignsDto> getAllByCriteria(@RequestBody Request<CampaignsDto> request) throws Exception{
    	log.info("start method /campaigns/getAllByCriteria (including deleted)");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<CampaignsDto> response = campaignsBusiness.getAllByCriteria(request, locale);
		log.info("end method /campaigns/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<CampaignsDto> custom(@RequestBody Request<CampaignsDto> request) throws Exception{
	  log.info("CampaignsDto method /$/custom");
	  Response<CampaignsDto> response = new Response<CampaignsDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = campaignsBusiness.custom(request, locale);
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
	  slf4jLogger.info("end method /CampaignsDto/custom");
	  return response;
	 }

	@RequestMapping(value="/checkEditPermission",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<CampaignsDto> checkEditPermission(@RequestBody Request<CampaignsDto> request, @org.springframework.web.bind.annotation.RequestHeader(value = "user-id", required = true) Integer authenticatedUserId) throws Exception{
		log.info("start method /campaigns/checkEditPermission");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		
		// IMPORTANT: Utiliser l'ID utilisateur depuis le header (envoyé par le frontend)
		// au lieu du request.getUser() qui peut être incorrect
		log.info("Using authenticated user from header: " + authenticatedUserId);
		request.setUser(authenticatedUserId);
		
		Response<CampaignsDto> response = campaignsBusiness.checkEditPermission(request, locale);
		log.info("end method /campaigns/checkEditPermission");
		return response;
	}

	// ========== ACTIONS DE CYCLE DE VIE ==========

	@RequestMapping(value="/publish", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<CampaignsDto> publish(@RequestBody Request<CampaignsDto> request) throws Exception {
		log.info("start method /campaigns/publish");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CampaignsDto> response = campaignsBusiness.publishCampaign(request, locale);
		log.info("end method /campaigns/publish");
		return response;
	}

	@RequestMapping(value="/open", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<CampaignsDto> open(@RequestBody Request<CampaignsDto> request) throws Exception {
		log.info("start method /campaigns/open");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CampaignsDto> response = campaignsBusiness.openCampaign(request, locale);
		log.info("end method /campaigns/open");
		return response;
	}

	@RequestMapping(value="/close", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<CampaignsDto> close(@RequestBody Request<CampaignsDto> request) throws Exception {
		log.info("start method /campaigns/close");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CampaignsDto> response = campaignsBusiness.closeCampaign(request, locale);
		log.info("end method /campaigns/close");
		return response;
	}

	@RequestMapping(value="/pause", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<CampaignsDto> pause(@RequestBody Request<CampaignsDto> request) throws Exception {
		log.info("start method /campaigns/pause");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CampaignsDto> response = campaignsBusiness.pauseCampaign(request, locale);
		log.info("end method /campaigns/pause");
		return response;
	}

	@RequestMapping(value="/resume", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<CampaignsDto> resume(@RequestBody Request<CampaignsDto> request) throws Exception {
		log.info("start method /campaigns/resume");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CampaignsDto> response = campaignsBusiness.resumeCampaign(request, locale);
		log.info("end method /campaigns/resume");
		return response;
	}

	@RequestMapping(value="/unpublish", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<CampaignsDto> unpublish(@RequestBody Request<CampaignsDto> request) throws Exception {
		log.info("start method /campaigns/unpublish");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CampaignsDto> response = campaignsBusiness.unpublishCampaign(request, locale);
		log.info("end method /campaigns/unpublish");
		return response;
	}

	@RequestMapping(value="/archive", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<CampaignsDto> archive(@RequestBody Request<CampaignsDto> request) throws Exception {
		log.info("start method /campaigns/archive");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CampaignsDto> response = campaignsBusiness.archiveCampaign(request, locale);
		log.info("end method /campaigns/archive");
		return response;
	}

	@RequestMapping(value="/unarchive", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
	public Response<CampaignsDto> unarchive(@RequestBody Request<CampaignsDto> request) throws Exception {
		log.info("start method /campaigns/unarchive");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CampaignsDto> response = campaignsBusiness.unarchiveCampaign(request, locale);
		log.info("end method /campaigns/unarchive");
		return response;
	}
}
