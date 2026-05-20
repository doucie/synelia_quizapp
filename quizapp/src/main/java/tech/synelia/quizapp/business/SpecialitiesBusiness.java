                                                											
/*
 * Java business for entity table specialities 
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
import java.text.SimpleDateFormat;
import java.util.*;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.dao.entity.Specialities;
import tech.synelia.quizapp.dao.entity.Departments;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "specialities"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class SpecialitiesBusiness implements IBasicBusiness<Request<SpecialitiesDto>, Response<SpecialitiesDto>> {

	private Response<SpecialitiesDto> response;
	@Autowired
	private SpecialitiesRepository specialitiesRepository;
	@Autowired
	private DepartmentsRepository departmentsRepository;
	@Autowired
	private QuestionRepository questionRepository;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private TechnicalError technicalError;
	@Autowired
	private ExceptionUtils exceptionUtils;
	@PersistenceContext
	private EntityManager em;

	private SimpleDateFormat dateFormat;
	private SimpleDateFormat dateTimeFormat;

	public SpecialitiesBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Specialities by using SpecialitiesDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SpecialitiesDto> create(Request<SpecialitiesDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Specialities-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SpecialitiesDto> response = new Response<SpecialitiesDto>();
		List<Specialities>        items    = new ArrayList<Specialities>();
			
		for (SpecialitiesDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("specialityName", dto.getSpecialityName());
			fieldsToVerify.put("specialityDesc", dto.getSpecialityDesc());
			// fieldsToVerify.put("searchString", dto.getSearchString());
			fieldsToVerify.put("departmentId", dto.getDepartmentId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			ensureUniqueActiveSpecialityName(null, dto.getSpecialityName(), false, locale);

			// Verify if departments exist
			Departments existingDepartments = null;
			if (dto.getDepartmentId() != null && dto.getDepartmentId() > 0){
				existingDepartments = departmentsRepository.findOne(dto.getDepartmentId(), false);
				if (existingDepartments == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("departments departmentId -> " + dto.getDepartmentId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Specialities entityToSave = null;
			entityToSave = SpecialitiesTransformer.INSTANCE.toEntity(dto, existingDepartments);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Specialities> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = specialitiesRepository.saveAll((Iterable<Specialities>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("specialities", locale));
			}
			List<SpecialitiesDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SpecialitiesTransformer.INSTANCE.toLiteDtos(itemsSaved) : SpecialitiesTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create Specialities-----");
		return response;
	}

	/**
	 * update Specialities by using SpecialitiesDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SpecialitiesDto> update(Request<SpecialitiesDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Specialities-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SpecialitiesDto> response = new Response<SpecialitiesDto>();
		List<Specialities>        items    = new ArrayList<Specialities>();
			
		for (SpecialitiesDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la specialities existe (uniquement les actives pour update)
			Specialities entityToSave = null;
			// Pour update, chercher uniquement parmi les spécialités actives
			entityToSave = specialitiesRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities id -> " + dto.getId(), locale));
			}

			String nextSpecialityName = Utilities.shouldUpdate(dto.getSpecialityName()) ? dto.getSpecialityName()
					: entityToSave.getSpecialityName();
			Boolean nextIsDeleted = dto.getIsDeleted() != null ? dto.getIsDeleted() : entityToSave.getIsDeleted();
			ensureUniqueActiveSpecialityName(entityToSave.getId(), nextSpecialityName, nextIsDeleted, locale);

			// Verify if departments exist
			if (dto.getDepartmentId() != null && dto.getDepartmentId() > 0){
				Departments existingDepartments = departmentsRepository.findOne(dto.getDepartmentId(), false);
				if (existingDepartments == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("departments departmentId -> " + dto.getDepartmentId(), locale));
				}
				entityToSave.setDepartments(existingDepartments);
			}
			if (Utilities.shouldUpdate(dto.getSpecialityName())) {
				entityToSave.setSpecialityName(dto.getSpecialityName());
			}
			if (Utilities.shouldUpdate(dto.getSpecialityDesc())) {
				entityToSave.setSpecialityDesc(dto.getSpecialityDesc());
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
			List<Specialities> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = specialitiesRepository.saveAll((Iterable<Specialities>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("specialities", locale));
			}
			List<SpecialitiesDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SpecialitiesTransformer.INSTANCE.toLiteDtos(itemsSaved) : SpecialitiesTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Specialities-----");
		return response;
	}

	private void ensureUniqueActiveSpecialityName(Integer currentId, String specialityName, Boolean isDeleted, Locale locale) {
		if (!Utilities.notBlank(specialityName) || Boolean.TRUE.equals(isDeleted)) {
			return;
		}

		List<Specialities> existingByName = specialitiesRepository.findBySpecialityName(specialityName, false);
		if (existingByName == null || existingByName.isEmpty()) {
			return;
		}

		for (Specialities existingSpeciality : existingByName) {
			if (existingSpeciality != null && (currentId == null || !existingSpeciality.getId().equals(currentId))) {
				throw new InternalErrorException(functionalError.DATA_EXIST("specialities specialityName -> " + specialityName, locale));
			}
		}
	}

	/**
	 * delete Specialities by using SpecialitiesDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SpecialitiesDto> delete(Request<SpecialitiesDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Specialities-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SpecialitiesDto> response = new Response<SpecialitiesDto>();
		List<Specialities>        items    = new ArrayList<Specialities>();
			
		for (SpecialitiesDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la specialities existe
			Specialities existingEntity = null;
			existingEntity = specialitiesRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// question
			List<Question> listOfQuestion = questionRepository.findBySpecialityId(existingEntity.getId(), false);
			if (listOfQuestion != null && !listOfQuestion.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfQuestion.size() + ")", locale));
			}
			// campaigns
			List<Campaigns> listOfCampaigns = campaignsRepository.findBySpecialityId(existingEntity.getId(), false);
			if (listOfCampaigns != null && !listOfCampaigns.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCampaigns.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			specialitiesRepository.saveAll((Iterable<Specialities>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Specialities-----");
		return response;
	}

	/**
	 * get Specialities by using SpecialitiesDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<SpecialitiesDto> getByCriteria(Request<SpecialitiesDto> request, Locale locale)  throws Exception {
		log.info("----begin get Specialities-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SpecialitiesDto> response = new Response<SpecialitiesDto>();
		List<Specialities> items 			 = specialitiesRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<SpecialitiesDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SpecialitiesTransformer.INSTANCE.toLiteDtos(items) : SpecialitiesTransformer.INSTANCE.toDtos(items);

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
			response.setCount(specialitiesRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("specialities", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Specialities-----");
		return response;
	}

	/**
	 * get full SpecialitiesDto by using Specialities as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public SpecialitiesDto getFullInfos(SpecialitiesDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<SpecialitiesDto> custom(Request<SpecialitiesDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom SpecialitiesDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SpecialitiesDto> response = new Response<SpecialitiesDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new SpecialitiesDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom SpecialitiesDto-----");
		return response;
	}

	/**
	 * Get all specialities by criteria (including deleted ones)
	 * @param request
	 * @param locale
	 * @return response
	 */
	public Response<SpecialitiesDto> getAllByCriteria(Request<SpecialitiesDto> request, Locale locale) throws Exception {
		log.info("----begin getAll Specialities (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SpecialitiesDto> response = new Response<SpecialitiesDto>();

		// Utiliser une requête directe sans filtrage automatique des supprimés
		List<Specialities> items = specialitiesRepository.getAllByCriteriaIncludingDeleted(request, em, locale);

		// Compter le nombre total d'utilisateurs avec les mêmes critères (pour pagination)
		Long totalCount = specialitiesRepository.countAllByCriteriaIncludingDeleted(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<SpecialitiesDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SpecialitiesTransformer.INSTANCE.toLiteDtos(items) : SpecialitiesTransformer.INSTANCE.toDtos(items);

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
			response.setStatus(functionalError.DATA_EMPTY("specialities", locale));
			response.setTotalCount(totalCount); // Même si aucun résultat, renvoyer le total
			response.setHasError(false);
		}

		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end getAll Specialities-----");
		return response;
	}

	/**
	 * updateAll Specialities by using SpecialitiesDto as object (including deleted specialities).
	 *
	 * @param request
	 * @return response
	 */
	public Response<SpecialitiesDto> updateAll(Request<SpecialitiesDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin updateAll Specialities-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<SpecialitiesDto> response = new Response<SpecialitiesDto>();
		List<Specialities>        items    = new ArrayList<Specialities>();

		for (SpecialitiesDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, Object> fieldsToVerify = new HashMap<String, Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la donnee existe
			Specialities existingEntity = null;
			// Pour updateAll, chercher d'abord les spécialités actives, puis les supprimées
			existingEntity = specialitiesRepository.findOne(dto.getId(), false); // Chercher d'abord les actives
			if (existingEntity == null) {
				existingEntity = specialitiesRepository.findOne(dto.getId(), true); // Puis les supprimées si pas trouvé
			}
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities id -> " + dto.getId(), locale));
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
			Specialities entityToSave = existingEntity;

			// Mise à jour conditionnelle des champs
			if (Utilities.shouldUpdate(dto.getSpecialityName())) {
				entityToSave.setSpecialityName(dto.getSpecialityName());
			}
			if (Utilities.shouldUpdate(dto.getSpecialityDesc())) {
				entityToSave.setSpecialityDesc(dto.getSpecialityDesc());
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
			if (Utilities.shouldUpdate(dto.getCreatedAt())) {
				entityToSave.setCreatedAt(dateFormat.parse(dto.getCreatedAt()));
			}
			if (Utilities.shouldUpdate(dto.getUpdatedAt())) {
				entityToSave.setUpdatedAt(dateFormat.parse(dto.getUpdatedAt()));
			}

			// -----------------------------------------------------------------------
			// ----------- SAVE SPECIALITIES
			// -----------------------------------------------------------------------
			Specialities entity = specialitiesRepository.save(entityToSave);
			items.add(entity);
		}

		if (Utilities.isNotEmpty(items)) {
			List<SpecialitiesDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? SpecialitiesTransformer.INSTANCE.toLiteDtos(items) : SpecialitiesTransformer.INSTANCE.toDtos(items);

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

			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount((long) itemsDto.size());
		}

		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end updateAll Specialities-----");
		return response;
	}
}
