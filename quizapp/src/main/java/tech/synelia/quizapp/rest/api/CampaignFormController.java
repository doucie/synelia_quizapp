package tech.synelia.quizapp.rest.api;

import java.net.URI;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;
import tech.synelia.quizapp.business.CampaignFormBusiness;
import tech.synelia.quizapp.rest.fact.ControllerFactory;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.CampaignFormDto;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value = "/campaignform")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'RECRUITER')")
public class CampaignFormController {

	@Autowired
	private HttpServletRequest requestBasic;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private ExceptionUtils exceptionUtils;

	@Autowired
	private ControllerFactory<CampaignFormDto> controllerFactory;
	@Autowired
	private CampaignFormBusiness campaignFormBusiness;

	@RequestMapping(value = "/create", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public ResponseEntity<Response<CampaignFormDto>> create(@RequestBody Request<CampaignFormDto> request) throws Exception {
		log.info("start method /campaignform/create");
		Response<CampaignFormDto> response = controllerFactory.create(campaignFormBusiness, request, FunctionalityEnum.CREATE_FORM);
		URI uri = ServletUriComponentsBuilder.fromCurrentRequest().buildAndExpand(response.getItems().get(0)).toUri();
		log.info("end method /campaignform/create");
		return ResponseEntity.created(uri).body(response);
	}

	@RequestMapping(value = "/update", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<CampaignFormDto> update(@RequestBody Request<CampaignFormDto> request) throws Exception {
		log.info("start method /campaignform/update");
		Response<CampaignFormDto> response = controllerFactory.update(campaignFormBusiness, request, FunctionalityEnum.UPDATE_FORM);
		log.info("end method /campaignform/update");
		return response;
	}

	@RequestMapping(value = "/updateDeleted", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<CampaignFormDto> updateDeleted(@RequestBody Request<CampaignFormDto> request) throws Exception {
		log.info("start method /campaignform/updateDeleted");
		Response<CampaignFormDto> response = controllerFactory.updateDeleted(request, FunctionalityEnum.UPDATE_FORM, campaignFormBusiness::updateDeleted);
		log.info("end method /campaignform/updateDeleted");
		return response;
	}

	@RequestMapping(value = "/updateAll", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<CampaignFormDto> updateAll(@RequestBody Request<CampaignFormDto> request) throws Exception {
		log.info("start method /campaignform/updateAll");
		Response<CampaignFormDto> response = controllerFactory.updateAll(request, FunctionalityEnum.UPDATE_FORM, campaignFormBusiness::updateAll);
		log.info("end method /campaignform/updateAll");
		return response;
	}

	@RequestMapping(value = "/delete", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<CampaignFormDto> delete(@RequestBody Request<CampaignFormDto> request) throws Exception {
		log.info("start method /campaignform/delete");
		Response<CampaignFormDto> response = controllerFactory.delete(campaignFormBusiness, request, FunctionalityEnum.DELETE_FORM);
		log.info("end method /campaignform/delete");
		return response;
	}

	@RequestMapping(value = "/getByCriteria", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<CampaignFormDto> getByCriteria(@RequestBody Request<CampaignFormDto> request) throws Exception {
		log.info("start method /campaignform/getByCriteria");
		Response<CampaignFormDto> response = controllerFactory.getByCriteria(campaignFormBusiness, request, FunctionalityEnum.VIEW_FORM);
		log.info("end method /campaignform/getByCriteria");
		return response;
	}

	@RequestMapping(value = "/getAllByCriteria", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<CampaignFormDto> getAllByCriteria(@RequestBody Request<CampaignFormDto> request) throws Exception {
		log.info("start method /campaignform/getAllByCriteria");
		Response<CampaignFormDto> response = controllerFactory.getAllByCriteria(request, FunctionalityEnum.VIEW_FORM, campaignFormBusiness::getAllByCriteria);
		log.info("end method /campaignform/getAllByCriteria");
		return response;
	}

	@RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<CampaignFormDto> custom(@RequestBody Request<CampaignFormDto> request) throws Exception {
		log.info("start method /campaignform/custom");
		Response<CampaignFormDto> response = controllerFactory.custom(request, FunctionalityEnum.UPDATE_FORM, campaignFormBusiness::custom);
		log.info("end method /campaignform/custom");
		return response;
	}
}