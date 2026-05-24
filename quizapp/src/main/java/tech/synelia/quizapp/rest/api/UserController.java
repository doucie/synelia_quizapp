

/*
 * Java controller for entity table user 
 * Created on 2025-08-22 ( Time 11:38:28 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2017 Savoir Faire Linux. All Rights Reserved.
 */

package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.transaction.TransactionSystemException;

import java.net.URI;
import java.util.Date;
import java.util.Locale;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.dto.OnlineStatsDto;
// import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.business.OnlineStatsBusiness;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

/**
Controller for table "user"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/user")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class UserController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<UserDto> controllerFactory;
	@Autowired
	private UserBusiness userBusiness;
	@Autowired
	private OnlineStatsBusiness onlineStatsBusiness;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<UserDto>> create(@RequestBody Request<UserDto> request) throws Exception {
    	log.info("start method /user/create");
        Response<UserDto> response = controllerFactory.create(userBusiness, request, FunctionalityEnum.CREATE_USER);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /user/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<UserDto> update(@RequestBody Request<UserDto> request) throws Exception{
    	log.info("start method /user/update");
        Response<UserDto> response = controllerFactory.update(userBusiness, request, FunctionalityEnum.UPDATE_USER);
		log.info("end method /user/update");
        return response;
    }

	@RequestMapping(value="/update-admin-mode", method=RequestMethod.PUT, consumes = {"application/json"}, produces={"application/json"})
	public ResponseEntity<Response<UserDto>> updateAdminMode(@RequestBody Request<UserDto> request, Locale locale) {

		slf4jLogger.info("start method updateAdminMode");

		Integer authenticatedUserId = resolveAuthenticatedUserId();
		if (authenticatedUserId == null) {
			Response<UserDto> errorResponse = new Response<>();
			errorResponse.setHasError(true);
			errorResponse.setHttpCode(HttpStatus.FORBIDDEN.value());
			errorResponse.getStatus().setCode(StatusCode.FUNC_AUTH_FAIL);
			errorResponse.getStatus().setMessage("Utilisateur authentifie introuvable");
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
		}

		request.setUser(authenticatedUserId);

		if (request.getDatas() == null || request.getDatas().isEmpty()) {
			Response<UserDto> errorResponse = new Response<>();
			errorResponse.setHasError(true);
			errorResponse.setHttpCode(HttpStatus.BAD_REQUEST.value());
			errorResponse.getStatus().setCode(StatusCode.FUNC_FIELD_EMPTY);
			errorResponse.getStatus().setMessage("Aucune donnee a mettre a jour");
			return ResponseEntity.badRequest().body(errorResponse);
		}

		boolean targetsAnotherUser = request.getDatas().stream()
			.anyMatch(dto -> dto.getId() == null || !authenticatedUserId.equals(dto.getId()));
		if (targetsAnotherUser) {
			Response<UserDto> errorResponse = new Response<>();
			errorResponse.setHasError(true);
			errorResponse.setHttpCode(HttpStatus.FORBIDDEN.value());
			errorResponse.getStatus().setCode(StatusCode.FUNC_AUTH_FAIL);
			errorResponse.getStatus().setMessage("Le mode admin ne peut etre modifie que pour l'utilisateur courant");
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
		}

		try {
			Response<UserDto> response = userBusiness.updateAdminMode(request, locale);
			slf4jLogger.info("Response: {}", Utilities.convertObjectToJson(response));
			return ResponseEntity.ok(response);
		} catch (Exception exception) {
			slf4jLogger.error("Exception updateAdminMode -> {}", exception.getMessage());
			Response<UserDto> errorResponse = new Response<>();
			errorResponse.setHasError(true);
			errorResponse.setHttpCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
			errorResponse.getStatus().setCode(StatusCode.FUNC_FAIL);
			errorResponse.getStatus().setMessage(exception.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@RequestMapping(value="/updateAll",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<UserDto> updateAll(@RequestBody Request<UserDto> request) throws Exception{
    	log.info("start method /user/updateAll");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<UserDto> response = userBusiness.updateAll(request, locale);
		log.info("end method /user/updateAll");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<UserDto> delete(@RequestBody Request<UserDto> request) throws Exception{
    	log.info("start method /user/delete");
        Response<UserDto> response = controllerFactory.delete(userBusiness, request, FunctionalityEnum.DELETE_USER);
		log.info("end method /user/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<UserDto> getByCriteria(@RequestBody Request<UserDto> request) throws Exception{
    	log.info("start method /user/getByCriteria");
        Response<UserDto> response = controllerFactory.getByCriteria(userBusiness, request, FunctionalityEnum.VIEW_USER);
		log.info("end method /user/getByCriteria");
        return response;
    }

    @RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<UserDto> getAllByCriteria(@RequestBody Request<UserDto> request) throws Exception{
    	log.info("start method /user/getAllByCriteria (including deleted users)");
    	String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
    	Locale locale = Locale.of(languageID, "");
        Response<UserDto> response = userBusiness.getAllByCriteria(request, locale);
		log.info("end method /user/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<UserDto> custom(@RequestBody Request<UserDto> request) throws Exception{
	  log.info("UserDto method /$/custom");
	  Response<UserDto> response = new Response<UserDto>();
	  String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
	  Locale locale = Locale.of(languageID, "");
	  try {
	   response = Validate.validateList(request, response, functionalError, locale);
	   if (!response.isHasError()) {
	    response = userBusiness.custom(request, locale);
	   } else {
	    slf4jLogger.info("Erreur| code: {} -  message: {}", response.getStatus().getCode(),
	      response.getStatus().getMessage());
	    return response;
	   }
	   if (!response.isHasError()) {
	    slf4jLogger.info("end method custom");
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
	  slf4jLogger.info("end method /UserDto/custom");
	  return response;
	 }

	/**
	 * Endpoint pour mettre à jour le statut en ligne d'un utilisateur
	 * Permet de marquer un utilisateur comme connecté (true) ou déconnecté (false)
	 * 
	 * @param id l'identifiant de l'utilisateur
	 * @param isOnline le nouveau statut en ligne (true = connecté, false = déconnecté)
	 * @param request la requête HTTP
	 * @param locale la locale pour l'internationalisation
	 * @return ResponseEntity avec le statut de l'opération
	 */
	@RequestMapping(value="/{id}/online-status", method=RequestMethod.PUT, produces={"application/json"})
	public ResponseEntity<Response<UserDto>> updateOnlineStatus(
			@PathVariable Integer id, 
			@RequestParam Boolean isOnline, 
			HttpServletRequest request, 
			Locale locale) {
		
		slf4jLogger.debug("start method updateOnlineStatus - user id: {}, isOnline: {}", id, isOnline);
		
		userBusiness.updateOnlineStatus(id, isOnline);
		
		Response<UserDto> response = new Response<>();
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.getStatus().setCode(StatusCode.SUCCESS);
		response.getStatus().setMessage("Online status updated");
		return ResponseEntity.ok(response);
	}

	/**
	 * Récupère les statistiques complètes des utilisateurs en ligne (QEEL)
	 * Retourne le nombre d'utilisateurs connectés par rôle et les totaux
	 * 
	 * @param request la requête HTTP
	 * @param locale la locale pour l'internationalisation
	 * @return ResponseEntity avec les statistiques QEEL
	 */
	@RequestMapping(value="/online-stats", method=RequestMethod.GET, produces={"application/json"})
	public ResponseEntity<OnlineStatsDto> getOnlineStats(HttpServletRequest request, Locale locale) {
		
		slf4jLogger.debug("start method getOnlineStats - récupération des statistiques utilisateurs en ligne");
		
		try {
			// Récupération des vraies statistiques depuis la base de données
			OnlineStatsDto stats = onlineStatsBusiness.getOnlineStats();
			
slf4jLogger.debug("Statistiques QEEL retournées avec succès: {} utilisateurs total, {} en ligne", 
							stats.getTotalUsers(), stats.getOnlineUsers());
			
			return ResponseEntity.ok(stats);
			
		} catch (Exception e) {
			slf4jLogger.error("Erreur lors de la récupération des statistiques QEEL", e);
			
			OnlineStatsDto fallbackStats = new OnlineStatsDto(0L, 0L, 0.0, 0L, 0L, 0.0, 0L, 0L, 0.0);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(fallbackStats);
		}
	}

	/**
	 * Endpoint pour récupérer uniquement le nombre d'utilisateurs en ligne
	 * 
	 * @param request la requête HTTP
	 * @param locale la locale pour l'internationalisation  
	 * @return ResponseEntity avec le nombre d'utilisateurs connectés
	 */
	@RequestMapping(value="/online-count", method=RequestMethod.GET, produces={"application/json"})
	public ResponseEntity<Long> getOnlineUsersCount(HttpServletRequest request, Locale locale) {
		
		slf4jLogger.debug("start method getOnlineUsersCount");
		
		try {
			// Récupération du vrai nombre d'utilisateurs en ligne depuis la base de données
			Long count = onlineStatsBusiness.getOnlineUsersCount();
			
			slf4jLogger.debug("Nombre d'utilisateurs en ligne retourné: {}", count);
			return ResponseEntity.ok(count);
			
		} catch (Exception e) {
			slf4jLogger.error("Erreur lors de la récupération du nombre d'utilisateurs en ligne", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0L);
		}
	}

	/**
	 * Endpoint pour mettre à jour la préférence de taille de page d'un utilisateur
	 *
	 * @param request la requête contenant les données utilisateur
	 * @param locale la locale pour l'internationalisation
	 * @return ResponseEntity avec la réponse
	 */
	@RequestMapping(value="/update-page-size-preference", method=RequestMethod.PUT, consumes = {"application/json"}, produces={"application/json"})
	public ResponseEntity<Response<UserDto>> updatePageSizePreference(@RequestBody Request<UserDto> request, Locale locale) {

		slf4jLogger.info("start method updatePageSizePreference");

		try {
			Response<UserDto> response = userBusiness.updatePageSizePreference(request, locale);
			slf4jLogger.info("Response: {}", Utilities.convertObjectToJson(response));
			return ResponseEntity.ok(response);

		} catch (CannotCreateTransactionException e) {
			slf4jLogger.error("CannotCreateTransactionException -> {}", e.getMessage());
			Response<UserDto> errorResponse = new Response<>();
			errorResponse.setHasError(true);
			errorResponse.setHttpCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
			errorResponse.getStatus().setCode(StatusCode.FUNC_FAIL);
			errorResponse.getStatus().setMessage("Transaction error");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		} catch (TransactionSystemException e) {
			slf4jLogger.error("TransactionSystemException -> {}", e.getMessage());
			Response<UserDto> errorResponse = new Response<>();
			errorResponse.setHasError(true);
			errorResponse.setHttpCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
			errorResponse.getStatus().setCode(StatusCode.FUNC_FAIL);
			errorResponse.getStatus().setMessage("Transaction system error");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		} catch (Exception e) {
			slf4jLogger.error("Exception -> {}", e.getMessage());
			Response<UserDto> errorResponse = new Response<>();
			errorResponse.setHasError(true);
			errorResponse.setHttpCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
			errorResponse.getStatus().setCode(StatusCode.FUNC_FAIL);
			errorResponse.getStatus().setMessage(e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	private Integer resolveAuthenticatedUserId() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			return null;
		}

		Object principal = authentication.getPrincipal();
		if (principal instanceof Integer) {
			return (Integer) principal;
		}
		if (principal instanceof Number) {
			return ((Number) principal).intValue();
		}
		if (principal instanceof String principalValue
				&& !principalValue.isBlank()
				&& !"anonymousUser".equalsIgnoreCase(principalValue)) {
			try {
				return Integer.valueOf(principalValue);
			} catch (NumberFormatException exception) {
				return null;
			}
		}

		return null;
	}
}
