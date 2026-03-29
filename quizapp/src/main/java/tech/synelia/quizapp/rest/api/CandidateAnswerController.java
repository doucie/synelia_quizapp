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
 * Controller for table "candidate_answer"
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/candidateanswer")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER', 'RECRUITER')")
public class CandidateAnswerController {

	@Autowired
	private HttpServletRequest requestBasic;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private ExceptionUtils exceptionUtils;

	private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ControllerFactory<CandidateAnswerDto> controllerFactory;
	@Autowired
	private CandidateAnswerBusiness candidateAnswerBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public ResponseEntity<Response<CandidateAnswerDto>> create(@RequestBody Request<CandidateAnswerDto> request) throws Exception {
		log.info("start method /candidateanswer/create");
		Response<CandidateAnswerDto> response = controllerFactory.create(candidateAnswerBusiness, request, FunctionalityEnum.CREATE_CANDIDATE_ANSWER);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /candidateanswer/create");
		return ResponseEntity.created(uri).body(response);
	}

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<CandidateAnswerDto> update(@RequestBody Request<CandidateAnswerDto> request) throws Exception {
		log.info("start method /candidateanswer/update");
		Response<CandidateAnswerDto> response = controllerFactory.update(candidateAnswerBusiness, request, FunctionalityEnum.UPDATE_CANDIDATE_ANSWER);
		log.info("end method /candidateanswer/update");
		return response;
	}

	@RequestMapping(value="/updateDeleted",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<CandidateAnswerDto> updateDeleted(@RequestBody Request<CandidateAnswerDto> request) throws Exception {
		log.info("start method /candidateanswer/updateDeleted");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CandidateAnswerDto> response = candidateAnswerBusiness.updateDeleted(request, locale);
		log.info("end method /candidateanswer/updateDeleted");
		return response;
	}

	@RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<CandidateAnswerDto> updateAll(@RequestBody Request<CandidateAnswerDto> request) throws Exception {
		log.info("start method /candidateanswer/updateAll");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CandidateAnswerDto> response = candidateAnswerBusiness.updateAll(request, locale);
		log.info("end method /candidateanswer/updateAll");
		return response;
	}

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<CandidateAnswerDto> delete(@RequestBody Request<CandidateAnswerDto> request) throws Exception {
		log.info("start method /candidateanswer/delete");
		Response<CandidateAnswerDto> response = controllerFactory.delete(candidateAnswerBusiness, request, FunctionalityEnum.DELETE_CANDIDATE_ANSWER);
		log.info("end method /candidateanswer/delete");
		return response;
	}

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<CandidateAnswerDto> getByCriteria(@RequestBody Request<CandidateAnswerDto> request) throws Exception {
		log.info("start method /candidateanswer/getByCriteria");
		Response<CandidateAnswerDto> response = controllerFactory.getByCriteria(candidateAnswerBusiness, request, FunctionalityEnum.VIEW_CANDIDATE_ANSWER);
		log.info("end method /candidateanswer/getByCriteria");
		return response;
	}

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<CandidateAnswerDto> getAllByCriteria(@RequestBody Request<CandidateAnswerDto> request) throws Exception {
		log.info("start method /candidateanswer/getAllByCriteria");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<CandidateAnswerDto> response = candidateAnswerBusiness.getAllByCriteria(request, locale);
		log.info("end method /candidateanswer/getAllByCriteria");
		return response;
	}

	@RequestMapping(value="/custom",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<CandidateAnswerDto> custom(@RequestBody Request<CandidateAnswerDto> request) throws Exception {
		log.info("start method /candidateanswer/custom");
		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateList(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = candidateAnswerBusiness.custom(request, locale);
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
		slf4jLogger.info("end method /candidateanswer/custom");
		return response;
	}
}
