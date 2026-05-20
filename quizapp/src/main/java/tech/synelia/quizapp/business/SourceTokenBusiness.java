/*
 * Java business for entity table source_token
 * Created on 2025-08-22 ( Time 11:38:28 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.text.ParseException;
import java.util.*;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.dao.entity.SourceToken;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.dao.repository.SourceTokenRepository;
import tech.synelia.quizapp.dao.repository.CampaignsRepository;
import tech.synelia.quizapp.dao.repository.FormRepository;

/**
BUSINESS for table "source_token"
 *
 * @author Geo
 *
 */
@Log
@Component
public class SourceTokenBusiness implements IBasicBusiness<Request<SourceTokenDto>, Response<SourceTokenDto>> {

	@Autowired
	private SourceTokenRepository sourceTokenRepository;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private FormRepository formRepository;
	@Autowired
	private FunctionalError functionalError;
	@PersistenceContext
	private EntityManager em;
	
	/**
	 * create SourceToken by using SourceTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SourceTokenDto> create(Request<SourceTokenDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create SourceToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		List<SourceToken>        items    = new ArrayList<SourceToken>();
			
		for (SourceTokenDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			//fieldsToVerify.put("tokenString", dto.getTokenString());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if campaign exists
			Campaigns existingCampaign = null;
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0){
				existingCampaign = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaign == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaign campaignId -> " + dto.getCampaignId(), locale));
				}
			}
			Form existingForm = resolveSourceTokenForm(dto.getFormId(), existingCampaign, locale);
			if (existingCampaign == null && existingForm != null) {
				existingCampaign = existingForm.getCampaigns();
				dto.setCampaignId(existingCampaign != null ? existingCampaign.getId() : null);
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			SourceToken entityToSave = SourceTokenTransformer.INSTANCE.toEntity(dto, existingCampaign, existingForm);

			// Générer automatiquement le tokenString s'il n'est pas fourni
			if (StringUtils.isBlank(entityToSave.getTokenString())) {
				entityToSave.setTokenString(generateUniqueTokenString());
			} else {
				// Si le tokenString est fourni, vérifier son unicité
				SourceToken existingEntity = sourceTokenRepository.findByTokenString(entityToSave.getTokenString(), false);
				if (existingEntity != null) {
					throw new InternalErrorException(functionalError.DATA_EXIST("sourceToken tokenString -> " + entityToSave.getTokenString(), locale));
				}
				// verif unique tokenString in items to save
				String tokenToCheck = entityToSave.getTokenString();
				if (items.stream().anyMatch(a -> a.getTokenString().equals(tokenToCheck))) {
					throw new InternalErrorException(functionalError.DATA_DUPLICATE(" tokenString ", locale));
				}
			}

			// Vérifier l'unicité du sourceTokenName par campagne si fourni
			if (StringUtils.isNotBlank(entityToSave.getSourceTokenName()) && existingCampaign != null) {
				SourceToken existingByName = sourceTokenRepository.findBySourceTokenNameAndCampaignId(
					entityToSave.getSourceTokenName(), existingCampaign.getId(), false);
				if (existingByName != null) {
					throw new InternalErrorException(functionalError.DATA_EXIST("sourceToken sourceTokenName -> " + entityToSave.getSourceTokenName() + " for campaign " + existingCampaign.getId(), locale));
				}
				// Vérifier l'unicité dans les items à sauvegarder pour cette campagne
				String nameToCheck = entityToSave.getSourceTokenName();
				Integer campaignIdToCheck = existingCampaign.getId();
				if (items.stream().anyMatch(a -> a.getSourceTokenName() != null && 
					a.getSourceTokenName().equals(nameToCheck) && 
					a.getCampaigns() != null && 
					a.getCampaigns().getId().equals(campaignIdToCheck))) {
					throw new InternalErrorException(functionalError.DATA_DUPLICATE(" sourceTokenName ", locale));
				}
			}
			
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<SourceToken> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = sourceTokenRepository.saveAll((Iterable<SourceToken>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("sourceToken", locale));
			}

			// Générer automatiquement les source_token_name si nécessaire
			Map<Integer, String> generatedNames = new HashMap<>();
			List<SourceToken> itemsToUpdate = new ArrayList<>();
			for (SourceToken savedItem : itemsSaved) {
				if (StringUtils.isBlank(savedItem.getSourceTokenName())) {
					String generatedName = "token#" + savedItem.getId();
					savedItem.setSourceTokenName(generatedName);
					generatedNames.put(savedItem.getId(), generatedName);
					itemsToUpdate.add(savedItem);
				}
			}

			// Mettre à jour les entités avec les noms générés
			if (!itemsToUpdate.isEmpty()) {
				sourceTokenRepository.saveAll(itemsToUpdate);
			}

			List<SourceTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SourceTokenTransformer.INSTANCE.toLiteDtos(itemsSaved) : SourceTokenTransformer.INSTANCE.toDtos(itemsSaved);

			// Mettre à jour les DTOs avec les noms générés
			for (SourceTokenDto dto : itemsDto) {
				if (generatedNames.containsKey(dto.getId())) {
					dto.setSourceTokenName(generatedNames.get(dto.getId()));
				}
			}

			final int size = itemsSaved.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHttpCode(HttpStatus.CREATED.value());
			response.setStatus(status);
			response.setItems(itemsDto);
			response.setHasError(false);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end create SourceToken-----");
		return response;
	}

	/**
	 * update SourceToken by using SourceTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SourceTokenDto> update(Request<SourceTokenDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update SourceToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		List<SourceToken>        items    = new ArrayList<SourceToken>();
			
		for (SourceTokenDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la sourceToken existe
			SourceToken entityToSave = null;
			entityToSave = sourceTokenRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("sourceToken id -> " + dto.getId(), locale));
			}

			// Handle campaign update
			if (dto.getCampaignId() != null) {
				if (dto.getCampaignId() > 0) {
					Campaigns existingCampaign = campaignsRepository.findOne(dto.getCampaignId(), false);
					if (existingCampaign == null) {
						throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaign campaignId -> " + dto.getCampaignId(), locale));
					}
					entityToSave.setCampaigns(existingCampaign);
				} else {
					entityToSave.setCampaigns(null);
				}
			}

			if (dto.getFormId() != null) {
				if (dto.getFormId() > 0) {
					Form assignedForm = resolveSourceTokenForm(dto.getFormId(), entityToSave.getCampaigns(), locale);
					entityToSave.setForm(assignedForm);
					if (entityToSave.getCampaigns() == null && assignedForm != null) {
						entityToSave.setCampaigns(assignedForm.getCampaigns());
					}
				} else {
					entityToSave.setForm(null);
				}
			} else {
				ensureExistingFormMatchesCampaign(entityToSave, locale);
			}

			// Vérifier l'unicité du sourceTokenName par campagne si on met à jour le nom
			if (Utilities.shouldUpdate(dto.getSourceTokenName()) && entityToSave.getCampaigns() != null) {
				SourceToken existingByName = sourceTokenRepository.findBySourceTokenNameAndCampaignId(
					dto.getSourceTokenName(), entityToSave.getCampaigns().getId(), false);
				// Vérifier que ce n'est pas le même enregistrement
				if (existingByName != null && !existingByName.getId().equals(entityToSave.getId())) {
					throw new InternalErrorException(functionalError.DATA_EXIST("sourceToken sourceTokenName -> " + dto.getSourceTokenName() + " for campaign " + entityToSave.getCampaigns().getId(), locale));
				}
			}

			if (Utilities.shouldUpdate(dto.getTokenString())) {
				entityToSave.setTokenString(dto.getTokenString());
			}
			if (Utilities.shouldUpdate(dto.getSourceTokenName())) {
				entityToSave.setSourceTokenName(dto.getSourceTokenName());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (Utilities.shouldUpdate(dto.getSearchString())) {
				entityToSave.setSearchString(dto.getSearchString());
			}

			// Après toutes les mises à jour conditionnelles...
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			// Générer le searchString à partir de l'entité finale
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<SourceToken> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = sourceTokenRepository.saveAll((Iterable<SourceToken>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("sourceToken", locale));
			}
			List<SourceTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SourceTokenTransformer.INSTANCE.toLiteDtos(itemsSaved) : SourceTokenTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end update SourceToken-----");
		return response;
	}

	/**
	 * updateAll SourceToken by using SourceTokenDto as object (including deleted sourceTokens).
	 * 
	 * @param request
	 * @return response
	 */
	public Response<SourceTokenDto> updateAll(Request<SourceTokenDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin updateAll SourceToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		List<SourceToken>        items    = new ArrayList<SourceToken>();
			
		for (SourceTokenDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, Object> fieldsToVerify = new HashMap<String, Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la donnee existe
			SourceToken existingEntity = null;
			// Pour updateAll, chercher d'abord les sourceTokens actifs, puis les supprimés
			existingEntity = sourceTokenRepository.findOne(dto.getId(), false); // Chercher d'abord les actifs
			if (existingEntity == null) {
				existingEntity = sourceTokenRepository.findOne(dto.getId(), true); // Puis les supprimés si pas trouvé
			}
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("sourceToken id -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// -----------------------------------------------------------------------
			// ----------- GENERATION KEY
			// -----------------------------------------------------------------------

			// -----------------------------------------------------------------------
			// ----------- PREPARATION DE L'OBJET
			// -----------------------------------------------------------------------
			// Garder les données existantes de base
			SourceToken entityToSave = existingEntity;
			
			// Handle campaign update
			if (dto.getCampaignId() != null) {
				if (dto.getCampaignId() > 0) {
					Campaigns existingCampaign = campaignsRepository.findOne(dto.getCampaignId(), false);
					if (existingCampaign == null) {
						throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaign campaignId -> " + dto.getCampaignId(), locale));
					}
					entityToSave.setCampaigns(existingCampaign);
				} else {
					entityToSave.setCampaigns(null);
				}
			}
			if (dto.getFormId() != null) {
				if (dto.getFormId() > 0) {
					Form assignedForm = resolveSourceTokenForm(dto.getFormId(), entityToSave.getCampaigns(), locale);
					entityToSave.setForm(assignedForm);
					if (entityToSave.getCampaigns() == null && assignedForm != null) {
						entityToSave.setCampaigns(assignedForm.getCampaigns());
					}
				} else {
					entityToSave.setForm(null);
				}
			} else {
				ensureExistingFormMatchesCampaign(entityToSave, locale);
			}
			
			// Vérifier l'unicité du sourceTokenName par campagne si on met à jour le nom
			if (Utilities.shouldUpdate(dto.getSourceTokenName()) && entityToSave.getCampaigns() != null) {
				SourceToken existingByName = sourceTokenRepository.findBySourceTokenNameAndCampaignId(
					dto.getSourceTokenName(), entityToSave.getCampaigns().getId(), false);
				// Vérifier que ce n'est pas le même enregistrement
				if (existingByName != null && !existingByName.getId().equals(entityToSave.getId())) {
					throw new InternalErrorException(functionalError.DATA_EXIST("sourceToken sourceTokenName -> " + dto.getSourceTokenName() + " for campaign " + entityToSave.getCampaigns().getId(), locale));
				}
			}
			
			// Mise à jour conditionnelle des champs
			if (Utilities.shouldUpdate(dto.getTokenString())) {
				entityToSave.setTokenString(dto.getTokenString());
			}
			if (Utilities.shouldUpdate(dto.getSourceTokenName())) {
				entityToSave.setSourceTokenName(dto.getSourceTokenName());
			}
			// IMPORTANT: Gestion du champ isDeleted pour updateAll
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (Utilities.shouldUpdate(dto.getSearchString())) {
				entityToSave.setSearchString(dto.getSearchString());
			}

			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<SourceToken> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = sourceTokenRepository.saveAll((Iterable<SourceToken>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("sourceToken", locale));
			}
			List<SourceTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SourceTokenTransformer.INSTANCE.toLiteDtos(itemsSaved) : SourceTokenTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			response.setItems(itemsDto);
			response.setHasError(false);
		}

		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end updateAll SourceToken-----");
		return response;
	}

	/**
	 * delete SourceToken by using SourceTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SourceTokenDto> delete(Request<SourceTokenDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete SourceToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		List<SourceToken>        items    = new ArrayList<SourceToken>();
			
		for (SourceTokenDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si sourceToken existe
			SourceToken existingEntity = null;
			existingEntity = sourceTokenRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("sourceToken -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			sourceTokenRepository.saveAll((Iterable<SourceToken>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete SourceToken-----");
		return response;
	}

	/**
	 * get SourceToken by using SourceTokenDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SourceTokenDto> getByCriteria(Request<SourceTokenDto> request, Locale locale)  throws Exception {
		log.info("----begin get SourceToken-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		List<SourceToken> items 			 = sourceTokenRepository.getByCriteria(request, em, locale);
		
		// Compter le nombre total de sourceTokens actifs avec les mêmes critères (pour pagination)
		Long totalCount = sourceTokenRepository.count(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<SourceTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SourceTokenTransformer.INSTANCE.toLiteDtos(items) : SourceTokenTransformer.INSTANCE.toDtos(items);

			final int size = items.size();
			List<String>  listOfError      = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(Long.valueOf(itemsDto.size())); // Nombre d'éléments dans cette page
			response.setTotalCount(totalCount); // Nombre total d'éléments dans la base
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("sourceToken", locale));
			response.setTotalCount(totalCount); // Même si aucun résultat, renvoyer le total
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get SourceToken-----");
		return response;
	}

	/**
	 * Récupère TOUS les sourceTokens selon les critères (y compris les supprimés)
	 * 
	 * @param request
	 * @param locale
	 * @return response
	 * @throws Exception
	 */
	public Response<SourceTokenDto> getAllByCriteria(Request<SourceTokenDto> request, Locale locale) throws Exception {
		log.info("----begin getAllByCriteria SourceToken (INCLUDING DELETED)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		
		// Utiliser une requête directe sans filtrage automatique des supprimés
		// Pour inclure les supprimés, on utilise getByCriteria avec isDeleted = null
		Request<SourceTokenDto> requestIncludingDeleted = new Request<SourceTokenDto>();
		requestIncludingDeleted.setData(request.getData());
		requestIncludingDeleted.setDatas(request.getDatas());
		requestIncludingDeleted.setIndex(request.getIndex());
		requestIncludingDeleted.setSize(request.getSize());
		requestIncludingDeleted.setIsAnd(request.getIsAnd());
		requestIncludingDeleted.setIsSimpleLoading(request.getIsSimpleLoading());
		requestIncludingDeleted.setUser(request.getUser());
		
		// Ne pas forcer isDeleted = false
		if (requestIncludingDeleted.getData() != null) {
			requestIncludingDeleted.getData().setIsDeleted(null);
		}
		if (requestIncludingDeleted.getDatas() != null) {
			requestIncludingDeleted.getDatas().forEach(dto -> dto.setIsDeleted(null));
		}
		
		List<SourceToken> items = sourceTokenRepository.getByCriteria(requestIncludingDeleted, em, locale);

		// Compter le nombre total de sourceTokens avec les mêmes critères (pour pagination)
		Long totalCount = sourceTokenRepository.count(requestIncludingDeleted, em, locale);

		if (items != null && !items.isEmpty()) {
			List<SourceTokenDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SourceTokenTransformer.INSTANCE.toLiteDtos(items) : SourceTokenTransformer.INSTANCE.toDtos(items);

			final int size = items.size();
			List<String> listOfError = Collections.synchronizedList(new ArrayList<String>());
			itemsDto.parallelStream().forEach(dto -> {
				try {
					dto = getFullInfos(dto, size, request.getIsSimpleLoading(), locale);
				} catch (Exception e) {
					listOfError.add(e.getMessage());
					e.printStackTrace();
				}
			});
			if (Utilities.isNotEmpty(listOfError)) {
				Object[] objArray = listOfError.stream().distinct().toArray();
				throw new RuntimeException(StringUtils.join(objArray, ", "));
			}
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setItems(itemsDto);
			response.setCount(Long.valueOf(itemsDto.size())); // Nombre d'éléments dans cette page
			response.setTotalCount(totalCount); // Nombre total d'éléments dans la base
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("sourceTokens", locale));
			response.setTotalCount(totalCount); // Même si aucun résultat, renvoyer le total
			response.setHasError(false);
		}

		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end getAllByCriteria SourceToken-----");
		return response;
	}

	/**
	 * get full SourceTokenDto by using SourceToken as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public SourceTokenDto getFullInfos(SourceTokenDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	/**
	 * Génère un token alphanumérique unique cryptographiquement sûr (16 caractères)
	 * @return token unique
	 */
	private String generateUniqueTokenString() {
		String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		StringBuilder token = new StringBuilder();
		java.security.SecureRandom random = new java.security.SecureRandom();

		// Générer un token de 16 caractères (entropie ~95 bits)
		for (int i = 0; i < 16; i++) {
			token.append(chars.charAt(random.nextInt(chars.length())));
		}

		String tokenString = token.toString();

		// Vérifier l'unicité en base de données
		SourceToken existingToken = sourceTokenRepository.findByTokenString(tokenString, false);
		if (existingToken != null) {
			// Si le token existe déjà, générer un nouveau
			return generateUniqueTokenString();
		}

		return tokenString;
	}

	private Form resolveSourceTokenForm(Integer formId, Campaigns campaign, Locale locale) {
		if (formId == null || formId <= 0) {
			return null;
		}

		Form existingForm = formRepository.findOne(formId, false);
		if (existingForm == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form formId -> " + formId, locale));
		}

		if (existingForm.getCampaigns() == null || existingForm.getCampaigns().getId() == null) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Le formulaire selectionne n'est rattache a aucune campagne", locale));
		}

		if (campaign != null && !existingForm.getCampaigns().getId().equals(campaign.getId())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Le formulaire selectionne n'appartient pas a la campagne du source token", locale));
		}

		return existingForm;
	}

	private void ensureExistingFormMatchesCampaign(SourceToken entityToSave, Locale locale) {
		if (entityToSave.getForm() == null || entityToSave.getCampaigns() == null) {
			return;
		}

		if (entityToSave.getForm().getCampaigns() == null
				|| entityToSave.getForm().getCampaigns().getId() == null
				|| !entityToSave.getForm().getCampaigns().getId().equals(entityToSave.getCampaigns().getId())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL("Le formulaire associe au source token ne correspond plus a la campagne selectionnee", locale));
		}
	}

	public Response<SourceTokenDto> custom(Request<SourceTokenDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom SourceTokenDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SourceTokenDto> response = new Response<SourceTokenDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new SourceTokenDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom SourceTokenDto-----");
		return response;
	}
}
