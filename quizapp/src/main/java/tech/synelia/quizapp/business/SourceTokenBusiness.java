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
import tech.synelia.quizapp.dao.repository.SourceTokenRepository;

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
			fieldsToVerify.put("tokenString", dto.getTokenString());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if sourceToken to insert do not exist
			SourceToken existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("sourceToken id -> " + dto.getId(), locale));
			}

			// verif unique tokenString in db
			existingEntity = sourceTokenRepository.findByTokenString(dto.getTokenString(), false);
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("sourceToken tokenString -> " + dto.getTokenString(), locale));
			}
			// verif unique tokenString in items to save
			if (items.stream().anyMatch(a -> a.getTokenString().equals(dto.getTokenString()))) {
				throw new InternalErrorException(functionalError.DATA_DUPLICATE(" tokenString ", locale));
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			SourceToken entityToSave = null;
			entityToSave = SourceTokenTransformer.INSTANCE.toEntity(dto, null);
			
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

			if (Utilities.notBlank(dto.getTokenString())) {
				entityToSave.setTokenString(dto.getTokenString());
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
			if (Utilities.notBlank(dto.getSearchString())) {
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
			
			// Mise à jour conditionnelle des champs
			if (Utilities.notBlank(dto.getTokenString())) {
				entityToSave.setTokenString(dto.getTokenString());
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
			if (Utilities.notBlank(dto.getSearchString())) {
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
