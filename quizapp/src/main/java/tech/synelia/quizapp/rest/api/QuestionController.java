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
 * Controller for table "question"
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/question")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'RECRUITER')")
public class QuestionController {

	@Autowired
	private HttpServletRequest requestBasic;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private ExceptionUtils exceptionUtils;

	private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ControllerFactory<QuestionDto> controllerFactory;
	@Autowired
	private QuestionBusiness questionBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public ResponseEntity<Response<QuestionDto>> create(@RequestBody Request<QuestionDto> request) throws Exception {
		log.info("start method /question/create");
		Response<QuestionDto> response = controllerFactory.create(questionBusiness, request, FunctionalityEnum.CREATE_QUESTION);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /question/create");
		return ResponseEntity.created(uri).body(response);
	}

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<QuestionDto> update(@RequestBody Request<QuestionDto> request) throws Exception {
		log.info("start method /question/update");
		Response<QuestionDto> response = controllerFactory.update(questionBusiness, request, FunctionalityEnum.UPDATE_QUESTION);
		log.info("end method /question/update");
		return response;
	}

	@RequestMapping(value="/updateDeleted",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<QuestionDto> updateDeleted(@RequestBody Request<QuestionDto> request) throws Exception {
		log.info("start method /question/updateDeleted");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<QuestionDto> response = questionBusiness.updateDeleted(request, locale);
		log.info("end method /question/updateDeleted");
		return response;
	}

	@RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<QuestionDto> updateAll(@RequestBody Request<QuestionDto> request) throws Exception {
		log.info("start method /question/updateAll");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<QuestionDto> response = questionBusiness.updateAll(request, locale);
		log.info("end method /question/updateAll");
		return response;
	}

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<QuestionDto> delete(@RequestBody Request<QuestionDto> request) throws Exception {
		log.info("start method /question/delete");
		Response<QuestionDto> response = controllerFactory.delete(questionBusiness, request, FunctionalityEnum.DELETE_QUESTION);
		log.info("end method /question/delete");
		return response;
	}

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<QuestionDto> getByCriteria(@RequestBody Request<QuestionDto> request) throws Exception {
		log.info("start method /question/getByCriteria");
		Response<QuestionDto> response = controllerFactory.getByCriteria(questionBusiness, request, FunctionalityEnum.VIEW_QUESTION);
		log.info("end method /question/getByCriteria");
		return response;
	}

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<QuestionDto> getAllByCriteria(@RequestBody Request<QuestionDto> request) throws Exception {
		log.info("start method /question/getAllByCriteria");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<QuestionDto> response = questionBusiness.getAllByCriteria(request, locale);
		log.info("end method /question/getAllByCriteria");
		return response;
	}

	@RequestMapping(value="/custom",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<QuestionDto> custom(@RequestBody Request<QuestionDto> request) throws Exception {
		log.info("start method /question/custom");
		Response<QuestionDto> response = new Response<QuestionDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateList(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = questionBusiness.custom(request, locale);
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
		slf4jLogger.info("end method /question/custom");
		return response;
	}
}
