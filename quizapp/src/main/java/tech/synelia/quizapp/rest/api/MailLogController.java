package tech.synelia.quizapp.rest.api;

import java.net.URI;
import java.util.Locale;

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
import tech.synelia.quizapp.business.MailLogBusiness;
import tech.synelia.quizapp.rest.fact.ControllerFactory;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.MailLogDto;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value = "/mailLog")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class MailLogController {

	@Autowired
	private HttpServletRequest requestBasic;
	@Autowired
	private ControllerFactory<MailLogDto> controllerFactory;
	@Autowired
	private MailLogBusiness mailLogBusiness;

	@RequestMapping(value = "/create", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public ResponseEntity<Response<MailLogDto>> create(@RequestBody Request<MailLogDto> request) throws Exception {
		log.info("start method /mailLog/create");
		Response<MailLogDto> response = controllerFactory.create(mailLogBusiness, request, FunctionalityEnum.CREATE_MAIL_LOG);
		URI uri = ServletUriComponentsBuilder.fromCurrentRequest().buildAndExpand(response.getItems().get(0)).toUri();
		log.info("end method /mailLog/create");
		return ResponseEntity.created(uri).body(response);
	}

	@RequestMapping(value = "/update", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<MailLogDto> update(@RequestBody Request<MailLogDto> request) throws Exception {
		log.info("start method /mailLog/update");
		Response<MailLogDto> response = controllerFactory.update(mailLogBusiness, request, FunctionalityEnum.UPDATE_MAIL_LOG);
		log.info("end method /mailLog/update");
		return response;
	}

	@RequestMapping(value = "/updateAll", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<MailLogDto> updateAll(@RequestBody Request<MailLogDto> request) throws Exception {
		log.info("start method /mailLog/updateAll");
		Response<MailLogDto> response = mailLogBusiness.updateAll(request, resolveLocale());
		log.info("end method /mailLog/updateAll");
		return response;
	}

	@RequestMapping(value = "/delete", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<MailLogDto> delete(@RequestBody Request<MailLogDto> request) throws Exception {
		log.info("start method /mailLog/delete");
		Response<MailLogDto> response = controllerFactory.delete(mailLogBusiness, request, FunctionalityEnum.DELETE_MAIL_LOG);
		log.info("end method /mailLog/delete");
		return response;
	}

	@RequestMapping(value = "/getByCriteria", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<MailLogDto> getByCriteria(@RequestBody Request<MailLogDto> request) throws Exception {
		log.info("start method /mailLog/getByCriteria");
		Response<MailLogDto> response = controllerFactory.getByCriteria(mailLogBusiness, request, FunctionalityEnum.VIEW_MAIL_LOG);
		log.info("end method /mailLog/getByCriteria");
		return response;
	}

	@RequestMapping(value = "/getAllByCriteria", method = RequestMethod.POST, consumes = { "application/json" }, produces = { "application/json" })
	public Response<MailLogDto> getAllByCriteria(@RequestBody Request<MailLogDto> request) throws Exception {
		log.info("start method /mailLog/getAllByCriteria");
		Response<MailLogDto> response = mailLogBusiness.getAllByCriteria(request, resolveLocale());
		log.info("end method /mailLog/getAllByCriteria");
		return response;
	}

	private Locale resolveLocale() {
		String languageId = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		if (languageId == null || languageId.isBlank()) {
			return Locale.getDefault();
		}
		return Locale.of(languageId, "");
	}
}