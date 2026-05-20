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
 * Controller for table "answer"
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/answer")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'RECRUITER')")
public class AnswerController {

	@Autowired
	private HttpServletRequest requestBasic;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private ExceptionUtils exceptionUtils;

	private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ControllerFactory<AnswerDto> controllerFactory;
	@Autowired
	private AnswerBusiness answerBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public ResponseEntity<Response<AnswerDto>> create(@RequestBody Request<AnswerDto> request) throws Exception {
		log.info("start method /answer/create");
		Response<AnswerDto> response = controllerFactory.create(answerBusiness, request, FunctionalityEnum.CREATE_ANSWER);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /answer/create");
		return ResponseEntity.created(uri).body(response);
	}

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<AnswerDto> update(@RequestBody Request<AnswerDto> request) throws Exception {
		log.info("start method /answer/update");
		Response<AnswerDto> response = controllerFactory.update(answerBusiness, request, FunctionalityEnum.UPDATE_ANSWER);
		log.info("end method /answer/update");
		return response;
	}

	@RequestMapping(value="/updateDeleted",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<AnswerDto> updateDeleted(@RequestBody Request<AnswerDto> request) throws Exception {
		log.info("start method /answer/updateDeleted");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<AnswerDto> response = answerBusiness.updateDeleted(request, locale);
		log.info("end method /answer/updateDeleted");
		return response;
	}

	@RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<AnswerDto> updateAll(@RequestBody Request<AnswerDto> request) throws Exception {
		log.info("start method /answer/updateAll");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<AnswerDto> response = answerBusiness.updateAll(request, locale);
		log.info("end method /answer/updateAll");
		return response;
	}

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<AnswerDto> delete(@RequestBody Request<AnswerDto> request) throws Exception {
		log.info("start method /answer/delete");
		Response<AnswerDto> response = controllerFactory.delete(answerBusiness, request, FunctionalityEnum.DELETE_ANSWER);
		log.info("end method /answer/delete");
		return response;
	}

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<AnswerDto> getByCriteria(@RequestBody Request<AnswerDto> request) throws Exception {
		log.info("start method /answer/getByCriteria");
		Response<AnswerDto> response = controllerFactory.getByCriteria(answerBusiness, request, FunctionalityEnum.VIEW_ANSWER);
		log.info("end method /answer/getByCriteria");
		return response;
	}

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<AnswerDto> getAllByCriteria(@RequestBody Request<AnswerDto> request) throws Exception {
		log.info("start method /answer/getAllByCriteria");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<AnswerDto> response = answerBusiness.getAllByCriteria(request, locale);
		log.info("end method /answer/getAllByCriteria");
		return response;
	}

	@RequestMapping(value="/custom",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<AnswerDto> custom(@RequestBody Request<AnswerDto> request) throws Exception {
		log.info("start method /answer/custom");
		Response<AnswerDto> response = new Response<AnswerDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateList(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = answerBusiness.custom(request, locale);
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
		slf4jLogger.info("end method /answer/custom");
		return response;
	}
}
