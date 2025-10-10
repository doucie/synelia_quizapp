

/*
 * Java controller for entity table applications 
 * Created on 2025-08-22 ( Time 11:38:24 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2017 Savoir Faire Linux. All Rights Reserved.
 */

package tech.synelia.quizapp.rest.api;

import java.net.URI;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;
import tech.synelia.quizapp.business.ApplicationsBusiness;
import tech.synelia.quizapp.rest.fact.ControllerFactory;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.ApplicationsDto;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;

/**
Controller for table "applications"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/applications")
public class ApplicationsController {

     @Autowired
	 private HttpServletRequest requestBasic;


	 private final Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<ApplicationsDto> controllerFactory;
	@Autowired
	private ApplicationsBusiness applicationsBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<ApplicationsDto>> create(@RequestBody Request<ApplicationsDto> request) throws Exception {
    	slf4jLogger.info("start method /applications/create");
        Response<ApplicationsDto> response = controllerFactory.create(applicationsBusiness, request, FunctionalityEnum.CREATE_APPLICATIONS);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		slf4jLogger.info("end method /applications/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<ApplicationsDto> update(@RequestBody Request<ApplicationsDto> request) throws Exception{
    	slf4jLogger.info("start method /applications/update");
        Response<ApplicationsDto> response = controllerFactory.update(applicationsBusiness, request, FunctionalityEnum.UPDATE_APPLICATIONS);
		slf4jLogger.info("end method /applications/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<ApplicationsDto> delete(@RequestBody Request<ApplicationsDto> request) throws Exception{
    	slf4jLogger.info("start method /applications/delete");
        Response<ApplicationsDto> response = controllerFactory.delete(applicationsBusiness, request, FunctionalityEnum.DELETE_APPLICATIONS);
		slf4jLogger.info("end method /applications/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<ApplicationsDto> getByCriteria(@RequestBody Request<ApplicationsDto> request) throws Exception{
    	slf4jLogger.info("start method /applications/getByCriteria");
        Response<ApplicationsDto> response = controllerFactory.getByCriteria(applicationsBusiness, request, FunctionalityEnum.VIEW_APPLICATIONS);
		slf4jLogger.info("end method /applications/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<ApplicationsDto> getAllByCriteria(@RequestBody Request<ApplicationsDto> request) throws Exception{
    	slf4jLogger.info("start method /applications/getAllByCriteria (including deleted)");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<ApplicationsDto> response = applicationsBusiness.getAllByCriteria(request, locale);
		slf4jLogger.info("end method /applications/getAllByCriteria");
        return response;
    }

	@RequestMapping(value="/verify-email",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<ApplicationsDto> verifyEmail(@RequestBody Request<ApplicationsDto> request) throws Exception{
    	slf4jLogger.info("start method /applications/verify-email");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<ApplicationsDto> response = applicationsBusiness.verifyEmail(request, locale);
		slf4jLogger.info("end method /applications/verify-email");
        return response;
    }

	@RequestMapping(value="/get-quiz",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<ApplicationsDto> getQuiz(@RequestBody Request<ApplicationsDto> request) throws Exception{
    	slf4jLogger.info("start method /applications/get-quiz");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<ApplicationsDto> response = applicationsBusiness.getQuizForApplication(request, locale);
		slf4jLogger.info("end method /applications/get-quiz");
        return response;
    }

	@RequestMapping(value="/save-quiz-answer",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<ApplicationsDto> saveQuizAnswer(@RequestBody Request<ApplicationsDto> request) throws Exception{
    	slf4jLogger.info("start method /applications/save-quiz-answer");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<ApplicationsDto> response = applicationsBusiness.saveQuizAnswer(request, locale);
		slf4jLogger.info("end method /applications/save-quiz-answer");
        return response;
    }

   
}
