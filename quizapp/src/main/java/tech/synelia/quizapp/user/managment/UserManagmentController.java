package tech.synelia.quizapp.user.managment;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;
// import tech.synelia.quizapp.user.managment.UserManagmentBusiness;
// import tech.synelia.quizapp.dao.entity.User;
// import tech.synelia.quizapp.rest.api.FonctionaliteController;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.StatusCode;
import tech.synelia.quizapp.utils.StatusMessage;
import tech.synelia.quizapp.utils.Validate;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
// import tech.synelia.quizapp.utils.dto.FonctionaliteDto;
import tech.synelia.quizapp.utils.dto.UserDto;
// import tech.synelia.quizapp.user.managment.UserManagmentDto;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value = "/userManager")
public class UserManagmentController {
	@Autowired
	private UserManagmentBusiness userManagerBusiness;
	@Autowired
	private HttpServletRequest requestBasic;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private ExceptionUtils exceptionUtils;

	private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@RequestMapping(value = "/connexion", method = RequestMethod.POST, consumes = { "application/json" }, produces = {
			"application/json" })
	public Response<UserDto> connexion(@RequestBody Request<UserDto> request) throws Exception {
		log.info("FonctionaliteDto method /$/connexion");
		Response<UserDto> response = new Response<UserDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateObject(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = userManagerBusiness.connexion(request, locale);
			} else {
				slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(),
						response.getStatus().getMessage());
				return response;
			}
			if (!response.isHasError()) {
				slf4jLogger.info("end method connexion");
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
		slf4jLogger.info("end method /$/connexion");
		return response;
	}

	@RequestMapping(value = "/deconnexion", method = RequestMethod.POST, consumes = { "application/json" }, produces = {
			"application/json" })
	public Response<UserDto> deconnexion(@RequestBody Request<UserDto> request) throws Exception {
		log.info("FonctionaliteDto method /$/deconnexion");
		Response<UserDto> response = new Response<UserDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateObject(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = userManagerBusiness.deconnexion(request, locale);
			} else {
				slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(),
						response.getStatus().getMessage());
				return response;
			}
			if (!response.isHasError()) {
				slf4jLogger.info("end method deconnexion");
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
		slf4jLogger.info("end method /$/deconnexion");
		return response;
	}

	@RequestMapping(value = "/changerMotDePasse", method = RequestMethod.POST, consumes = {
			"application/json" }, produces = { "application/json" })
	public Response<UserDto> changerMotDePasse(@RequestBody Request<UserManagmentDto> request) throws Exception {
		log.info("FonctionaliteDto method /$/changerMotDePasse");
		Response<UserDto> response = new Response<UserDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateObject1(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = userManagerBusiness.changerMotDePasse(request, locale);
			} else {
				slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(),
						response.getStatus().getMessage());
				return response;
			}
			if (!response.isHasError()) {
				slf4jLogger.info("end method changerMotDePasse");
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
		slf4jLogger.info("end method /$/changerMotDePasse");
		return response;
	}

	@RequestMapping(value = "/reinitialiserMotDePasse", method = RequestMethod.POST, consumes = {
			"application/json" }, produces = { "application/json" })
	public Response<UserDto> reinitialiserMotDePasse(@RequestBody Request<UserDto> request) throws Exception {
		log.info("FonctionaliteDto method /$/deconnexion");
		Response<UserDto> response = new Response<UserDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateObject(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = userManagerBusiness.reinitialiserMotDePasse(request, locale);
			} else {
				slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(),
						response.getStatus().getMessage());
				return response;
			}
			if (!response.isHasError()) {
				slf4jLogger.info("end method reinitialiserMotDePasse");
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
		slf4jLogger.info("end method /$/reinitialiserMotDePasse");
		return response;
	}

	@RequestMapping(value = "/verrouiller", method = RequestMethod.POST, consumes = { "application/json" }, produces = {
			"application/json" })
	public Response<UserDto> verrouiller(@RequestBody Request<UserDto> request) throws Exception {
		log.info("FonctionaliteDto method /$/verrouiller");
		Response<UserDto> response = new Response<UserDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateList(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = userManagerBusiness.verrouiller(request, locale);
			} else {
				slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(),
						response.getStatus().getMessage());
				return response;
			}
			if (!response.isHasError()) {
				slf4jLogger.info("end method verrouiller");
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
		slf4jLogger.info("end method /$/verrouiller");
		return response;
	}

	@RequestMapping(value = "/déverrouiller", method = RequestMethod.POST, consumes = {
			"application/json" }, produces = { "application/json" })
	public Response<UserDto> déverrouiller(@RequestBody Request<UserDto> request) throws Exception {
		log.info("FonctionaliteDto method /$/déverrouiller");
		Response<UserDto> response = new Response<UserDto>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID, "");
		try {
			response = Validate.validateList(request, response, functionalError, locale);
			if (!response.isHasError()) {
				response = userManagerBusiness.déverrouiller(request, locale);
			} else {
				slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(),
						response.getStatus().getMessage());
				return response;
			}
			if (!response.isHasError()) {
				slf4jLogger.info("end method déverrouiller");
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
		slf4jLogger.info("end method /$/déverrouiller");
		return response;
	}
}
