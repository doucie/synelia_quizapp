

/*
 * Java controller for entity table source_token 
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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.transaction.TransactionSystemException;

import java.net.URI;
import java.util.Collections;
import java.util.Locale;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
// import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.utils.dto.transformer.SourceTokenTransformer;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

/**
Controller for table "source_token"
 * 
 * @author SFL Back-End developper
 *
 */
@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/sourceToken")
@org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class SourceTokenController {

     @Autowired
	 private HttpServletRequest requestBasic;
	 @Autowired
	 private FunctionalError functionalError;
	 @Autowired
	 private ExceptionUtils exceptionUtils;

	 private Logger slf4jLogger = LoggerFactory.getLogger(getClass());

	@Autowired
    private ControllerFactory<SourceTokenDto> controllerFactory;
	@Autowired
	private SourceTokenBusiness sourceTokenBusiness;
	@Autowired
	private CampaignPublicAccessService campaignPublicAccessService;

	@RequestMapping(value="/create",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public ResponseEntity<Response<SourceTokenDto>> create(@RequestBody Request<SourceTokenDto> request) throws Exception {
    	log.info("start method /sourceToken/create");
        Response<SourceTokenDto> response = controllerFactory.create(sourceTokenBusiness, request, FunctionalityEnum.CREATE_SOURCE_TOKEN);
		URI uri = ServletUriComponentsBuilder
				.fromCurrentRequest()
				.buildAndExpand(response.getItems().get(0))
				.toUri();
		log.info("end method /sourceToken/create");
        return ResponseEntity.created(uri).body(response);
    }

	@RequestMapping(value="/update",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SourceTokenDto> update(@RequestBody Request<SourceTokenDto> request) throws Exception{
    	log.info("start method /sourceToken/update");
        Response<SourceTokenDto> response = controllerFactory.update(sourceTokenBusiness, request, FunctionalityEnum.UPDATE_SOURCE_TOKEN);
		log.info("end method /sourceToken/update");
        return response;
    }

	@RequestMapping(value="/delete",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SourceTokenDto> delete(@RequestBody Request<SourceTokenDto> request) throws Exception{
    	log.info("start method /sourceToken/delete");
        Response<SourceTokenDto> response = controllerFactory.delete(sourceTokenBusiness, request, FunctionalityEnum.DELETE_SOURCE_TOKEN);
		log.info("end method /sourceToken/delete");
        return response;
    }

	@RequestMapping(value="/getByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SourceTokenDto> getByCriteria(@RequestBody Request<SourceTokenDto> request) throws Exception{
    	log.info("start method /sourceToken/getByCriteria");
        Response<SourceTokenDto> response = controllerFactory.getByCriteria(sourceTokenBusiness, request, FunctionalityEnum.VIEW_SOURCE_TOKEN);
		log.info("end method /sourceToken/getByCriteria");
        return response;
    }

	@RequestMapping(value="/getAllByCriteria",method=RequestMethod.POST,consumes = {"application/json"},produces={"application/json"})
    public Response<SourceTokenDto> getAllByCriteria(@RequestBody Request<SourceTokenDto> request) throws Exception{
    	log.info("start method /sourceToken/getAllByCriteria");
		Response<SourceTokenDto> response = controllerFactory.getAllByCriteria(request, FunctionalityEnum.VIEW_SOURCE_TOKEN, sourceTokenBusiness::getAllByCriteria);
		log.info("end method /sourceToken/getAllByCriteria");
        return response;
    }

    @RequestMapping(value = "/custom", method = RequestMethod.POST, consumes = {
	   "application/json" }, produces = { "application/json" })
	 public Response<SourceTokenDto> custom(@RequestBody Request<SourceTokenDto> request) throws Exception{
	  log.info("SourceTokenDto method /$/custom");
	  Response<SourceTokenDto> response = controllerFactory.custom(request, FunctionalityEnum.UPDATE_SOURCE_TOKEN, sourceTokenBusiness::custom);
	  slf4jLogger.info("end method /SourceTokenDto/custom");
	  return response;
	 }

	/**
	 * Valide l'existence et la validité d'un source token par son token string
	 * Utilisé pour vérifier qu'un lien de candidature est valide
	 * 
	 * Vérifie :
	 * - Le token existe
	 * - Le token n'est pas supprimé
	 * - Le token n'est pas expiré (expiration_date > NOW() ou NULL)
	 * - La campagne associée a le statut 'active'
	 * 
	 * @param tokenString Le token string à valider (6 caractères)
	 * @return Response avec isValid et les informations de la campagne
	 */
	@RequestMapping(value="/validate/{tokenString}", method=RequestMethod.GET, produces={"application/json"})
	@org.springframework.security.access.prepost.PreAuthorize("permitAll()")
	public Response<SourceTokenDto> validateToken(@org.springframework.web.bind.annotation.PathVariable("tokenString") String tokenString) {
		log.info("start method /sourceToken/validate/" + tokenString);
		Response<SourceTokenDto> response = new Response<>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID != null ? languageID : "fr", "");
		
		try {
			// Validation du format
			if (tokenString == null || tokenString.length() != 6) {
				response.setStatus(functionalError.DATA_NOT_EXIST("Token invalide - format incorrect", locale));
				response.setHasError(true);
				return response;
			}
			
			SourceToken sourceToken = campaignPublicAccessService.requireAvailableToken(tokenString, locale);
			
			// Transformer en DTO
			SourceTokenDto dto = SourceTokenTransformer.INSTANCE.toDto(sourceToken);
			
			// Ajouter les infos de la campagne si disponible
			if (sourceToken.getCampaigns() != null) {
				dto.setCampaignId(sourceToken.getCampaigns().getId());
				dto.setCampaignName(sourceToken.getCampaigns().getCampaignTitle());
			}
			
			response.setItems(Collections.singletonList(dto));
			response.setHasError(false);
			response.setStatus(functionalError.SUCCESS("Token valide", locale));
			
			log.info("end method /sourceToken/validate/" + tokenString);
			return response;
			
		} catch (EntityNotFoundException e) {
			response.setStatus(e.getStatus());
			response.setHasError(true);
			return response;
		} catch (InvalidEntityException e) {
			response.setStatus(e.getStatus());
			response.setHasError(true);
			return response;
		} catch (Exception e) {
			slf4jLogger.error("Erreur validation token: " + tokenString, e);
			response.setStatus(functionalError.REQUEST_FAIL("Erreur technique lors de la validation", locale));
			response.setHasError(true);
			return response;
		}
	}

	/**
	 * Récupère les informations détaillées d'un source token
	 * Même validation que validateToken mais retourne plus d'informations
	 * 
	 * @param tokenString Le token string
	 * @return Response avec les données complètes du token
	 */
	@RequestMapping(value="/info/{tokenString}", method=RequestMethod.GET, produces={"application/json"})
	@org.springframework.security.access.prepost.PreAuthorize("permitAll()")
	public Response<SourceTokenDto> getTokenInfo(@org.springframework.web.bind.annotation.PathVariable("tokenString") String tokenString) {
		log.info("start method /sourceToken/info/" + tokenString);
		Response<SourceTokenDto> response = new Response<>();
		String languageID = (String) requestBasic.getAttribute("CURRENT_LANGUAGE_IDENTIFIER");
		Locale locale = Locale.of(languageID != null ? languageID : "fr", "");
		
		try {
			SourceToken sourceToken = campaignPublicAccessService.requireAvailableToken(tokenString, locale);
			
			// Transformer en DTO avec toutes les infos
			SourceTokenDto dto = SourceTokenTransformer.INSTANCE.toDto(sourceToken);
			
			if (sourceToken.getCampaigns() != null) {
				dto.setCampaignId(sourceToken.getCampaigns().getId());
				dto.setCampaignName(sourceToken.getCampaigns().getCampaignTitle());
			}
			
			response.setItems(Collections.singletonList(dto));
			response.setHasError(false);
			response.setStatus(functionalError.SUCCESS("Informations récupérées", locale));
			
			log.info("end method /sourceToken/info/" + tokenString);
			return response;
			
		} catch (EntityNotFoundException e) {
			response.setStatus(e.getStatus());
			response.setHasError(true);
			return response;
		} catch (InvalidEntityException e) {
			response.setStatus(e.getStatus());
			response.setHasError(true);
			return response;
		} catch (Exception e) {
			slf4jLogger.error("Erreur récupération info token: " + tokenString, e);
			response.setStatus(functionalError.REQUEST_FAIL("Erreur technique", locale));
			response.setHasError(true);
			return response;
		}
	}
}
