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
 * Controller for table "form"
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/form")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'RECRUITER')")
public class FormController {

	@Autowired
	private HttpServletRequest requestBasic;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private ExceptionUtils exceptionUtils;

	private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ControllerFactory<FormDto> controllerFactory;
	@Autowired
	private FormBusiness formBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public ResponseEntity<Response<FormDto>> create(@RequestBody Request<FormDto> request) throws Exception {
		log.info("start method /form/create");
		Response<FormDto> response = controllerFactory.create(formBusiness, request, FunctionalityEnum.CREATE_FORM);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /form/create");
		return ResponseEntity.created(uri).body(response);
	}

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormDto> update(@RequestBody Request<FormDto> request) throws Exception {
		log.info("start method /form/update");
		Response<FormDto> response = controllerFactory.update(formBusiness, request, FunctionalityEnum.UPDATE_FORM);
		log.info("end method /form/update");
		return response;
	}

	@RequestMapping(value="/updateDeleted",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormDto> updateDeleted(@RequestBody Request<FormDto> request) throws Exception {
		log.info("start method /form/updateDeleted");
		Response<FormDto> response = controllerFactory.updateDeleted(request, FunctionalityEnum.UPDATE_FORM, formBusiness::updateDeleted);
		log.info("end method /form/updateDeleted");
		return response;
	}

	@RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormDto> updateAll(@RequestBody Request<FormDto> request) throws Exception {
		log.info("start method /form/updateAll");
		Response<FormDto> response = controllerFactory.updateAll(request, FunctionalityEnum.UPDATE_FORM, formBusiness::updateAll);
		log.info("end method /form/updateAll");
		return response;
	}

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormDto> delete(@RequestBody Request<FormDto> request) throws Exception {
		log.info("start method /form/delete");
		Response<FormDto> response = controllerFactory.delete(formBusiness, request, FunctionalityEnum.DELETE_FORM);
		log.info("end method /form/delete");
		return response;
	}

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormDto> getByCriteria(@RequestBody Request<FormDto> request) throws Exception {
		log.info("start method /form/getByCriteria");
		Response<FormDto> response = controllerFactory.getByCriteria(formBusiness, request, FunctionalityEnum.VIEW_FORM);
		log.info("end method /form/getByCriteria");
		return response;
	}

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormDto> getAllByCriteria(@RequestBody Request<FormDto> request) throws Exception {
		log.info("start method /form/getAllByCriteria");
		Response<FormDto> response = controllerFactory.getAllByCriteria(request, FunctionalityEnum.VIEW_FORM, formBusiness::getAllByCriteria);
		log.info("end method /form/getAllByCriteria");
		return response;
	}

	@RequestMapping(value="/custom",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
	public Response<FormDto> custom(@RequestBody Request<FormDto> request) throws Exception {
		log.info("start method /form/custom");
		Response<FormDto> response = controllerFactory.custom(request, FunctionalityEnum.UPDATE_FORM, formBusiness::custom);
		slf4jLogger.info("end method /form/custom");
		return response;
	}
}
