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
 * Controller for table "form_version"
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/formversion")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'RECRUITER')")
public class FormVersionController {

	@Autowired
	private HttpServletRequest requestBasic;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private ExceptionUtils exceptionUtils;

	private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ControllerFactory<FormVersionDto> controllerFactory;
	@Autowired
	private FormVersionBusiness formVersionBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public ResponseEntity<Response<FormVersionDto>> create(@RequestBody Request<FormVersionDto> request) throws Exception {
		log.info("start method /formversion/create");
		Response<FormVersionDto> response = controllerFactory.create(formVersionBusiness, request, FunctionalityEnum.CREATE_FORM_VERSION);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /formversion/create");
		return ResponseEntity.created(uri).body(response);
	}

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormVersionDto> update(@RequestBody Request<FormVersionDto> request) throws Exception {
		log.info("start method /formversion/update");
		Response<FormVersionDto> response = controllerFactory.update(formVersionBusiness, request, FunctionalityEnum.UPDATE_FORM_VERSION);
		log.info("end method /formversion/update");
		return response;
	}

	@RequestMapping(value="/updateDeleted",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormVersionDto> updateDeleted(@RequestBody Request<FormVersionDto> request) throws Exception {
		log.info("start method /formversion/updateDeleted");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<FormVersionDto> response = formVersionBusiness.updateDeleted(request, locale);
		log.info("end method /formversion/updateDeleted");
		return response;
	}

	@RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormVersionDto> updateAll(@RequestBody Request<FormVersionDto> request) throws Exception {
		log.info("start method /formversion/updateAll");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<FormVersionDto> response = formVersionBusiness.updateAll(request, locale);
		log.info("end method /formversion/updateAll");
		return response;
	}

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormVersionDto> delete(@RequestBody Request<FormVersionDto> request) throws Exception {
		log.info("start method /formversion/delete");
		Response<FormVersionDto> response = controllerFactory.delete(formVersionBusiness, request, FunctionalityEnum.DELETE_FORM_VERSION);
		log.info("end method /formversion/delete");
		return response;
	}

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormVersionDto> getByCriteria(@RequestBody Request<FormVersionDto> request) throws Exception {
		log.info("start method /formversion/getByCriteria");
		Response<FormVersionDto> response = controllerFactory.getByCriteria(formVersionBusiness, request, FunctionalityEnum.VIEW_FORM_VERSION);
		log.info("end method /formversion/getByCriteria");
		return response;
	}

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormVersionDto> getAllByCriteria(@RequestBody Request<FormVersionDto> request) throws Exception {
		log.info("start method /formversion/getAllByCriteria");
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		Response<FormVersionDto> response = formVersionBusiness.getAllByCriteria(request, locale);
		log.info("end method /formversion/getAllByCriteria");
		return response;
	}

	@RequestMapping(value="/custom",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormVersionDto> custom(@RequestBody Request<FormVersionDto> request) throws Exception {
		log.info("start method /formversion/custom");
		Response<FormVersionDto> response = new Response<FormVersionDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateList(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = formVersionBusiness.custom(request, locale);
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
		slf4jLogger.info("end method /formversion/custom");
		return response;
	}
}
