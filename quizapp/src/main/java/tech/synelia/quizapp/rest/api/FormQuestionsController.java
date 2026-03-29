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
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

/**
 * Controller for table "form_questions"
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/formquestions")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER', 'RECRUITER')")
public class FormQuestionsController {

	@Autowired
	private HttpServletRequest requestBasic;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private ExceptionUtils exceptionUtils;

	private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ControllerFactory<FormQuestionsDto> controllerFactory;
	@Autowired
	private FormQuestionsBusiness formQuestionsBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public ResponseEntity<Response<FormQuestionsDto>> create(@RequestBody Request<FormQuestionsDto> request) throws Exception {
		log.info("start method /formquestions/create");
		Response<FormQuestionsDto> response = controllerFactory.create(formQuestionsBusiness, request, FunctionalityEnum.CREATE_FORM_QUESTIONS);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /formquestions/create");
		return ResponseEntity.created(uri).body(response);
	}

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormQuestionsDto> update(@RequestBody Request<FormQuestionsDto> request) throws Exception {
		log.info("start method /formquestions/update");
		Response<FormQuestionsDto> response = controllerFactory.update(formQuestionsBusiness, request, FunctionalityEnum.UPDATE_FORM_QUESTIONS);
		log.info("end method /formquestions/update");
		return response;
	}

	@RequestMapping(value="/updateDeleted",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormQuestionsDto> updateDeleted(@RequestBody Request<FormQuestionsDto> request) throws Exception {
		log.info("start method /formquestions/updateDeleted");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<FormQuestionsDto> response = formQuestionsBusiness.updateDeleted(request, locale);
		log.info("end method /formquestions/updateDeleted");
		return response;
	}

	@RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormQuestionsDto> updateAll(@RequestBody Request<FormQuestionsDto> request) throws Exception {
		log.info("start method /formquestions/updateAll");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<FormQuestionsDto> response = formQuestionsBusiness.updateAll(request, locale);
		log.info("end method /formquestions/updateAll");
		return response;
	}

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormQuestionsDto> delete(@RequestBody Request<FormQuestionsDto> request) throws Exception {
		log.info("start method /formquestions/delete");
		Response<FormQuestionsDto> response = controllerFactory.delete(formQuestionsBusiness, request, FunctionalityEnum.DELETE_FORM_QUESTIONS);
		log.info("end method /formquestions/delete");
		return response;
	}

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormQuestionsDto> getByCriteria(@RequestBody Request<FormQuestionsDto> request) throws Exception {
		log.info("start method /formquestions/getByCriteria");
		Response<FormQuestionsDto> response = controllerFactory.getByCriteria(formQuestionsBusiness, request, FunctionalityEnum.VIEW_FORM_QUESTIONS);
		log.info("end method /formquestions/getByCriteria");
		return response;
	}

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormQuestionsDto> getAllByCriteria(@RequestBody Request<FormQuestionsDto> request) throws Exception {
		log.info("start method /formquestions/getAllByCriteria");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<FormQuestionsDto> response = formQuestionsBusiness.getAllByCriteria(request, locale);
		log.info("end method /formquestions/getAllByCriteria");
		return response;
	}

	@RequestMapping(value="/custom",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormQuestionsDto> custom(@RequestBody Request<FormQuestionsDto> request) throws Exception {
		log.info("start method /formquestions/custom");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateList(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = formQuestionsBusiness.custom(request, locale);
			} else {
				slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(), response.getStatus().getMessage());
				return response;
			}
			if (!response.isHasError()) {
				slf4jLogger.info("end method custom");
				slf4jLogger.info("code: {} -  message: {}", StatusCode.SUCCESS, StatusMessage.SUCCESS);
			} else {
				slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(), response.getStatus().getMessage());
			}
		} catch (CannotCreateTransactionException e) {
			exceptionUtils.CANNOT_CREATE_TRANSACTION_EXCEPTION(response, locale, e);
		} catch (TransactionSystemException e) {
			exceptionUtils.TRANSACTION_SYSTEM_EXCEPTION(response, locale, e);
		}
		slf4jLogger.info("end method /formquestions/custom");
		return response;
	}
}
