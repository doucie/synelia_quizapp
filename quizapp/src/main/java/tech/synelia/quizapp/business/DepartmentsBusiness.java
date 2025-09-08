                                            										
/*
 * Java business for entity table departments 
 * Created on 2025-08-22 ( Time 11:38:26 )
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
import tech.synelia.quizapp.dao.entity.Departments;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "departments"
 * 
 * @author Geo
 *
 */
@Log
@Component
public class DepartmentsBusiness implements IBasicBusiness<Request<DepartmentsDto>, Response<DepartmentsDto>> {

	private Response<DepartmentsDto> response;
	@Autowired
	private DepartmentsRepository departmentsRepository;
	@Autowired
	private SpecialitiesRepository specialitiesRepository;
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

	public DepartmentsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Departments by using DepartmentsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<DepartmentsDto> create(Request<DepartmentsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Departments-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<DepartmentsDto> response = new Response<DepartmentsDto>();
		List<Departments>        items    = new ArrayList<Departments>();
			
		for (DepartmentsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("departmentName", dto.getDepartmentName());
			fieldsToVerify.put("departmentDesc", dto.getDepartmentDesc());
			// fieldsToVerify.put("searchString", dto.getSearchString());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if departments to insert do not exist
			Departments existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("departments id -> " + dto.getId(), locale));
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Departments entityToSave = null;
			entityToSave = DepartmentsTransformer.INSTANCE.toEntity(dto);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Departments> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = departmentsRepository.saveAll((Iterable<Departments>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("departments", locale));
			}
			List<DepartmentsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? DepartmentsTransformer.INSTANCE.toLiteDtos(itemsSaved) : DepartmentsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create Departments-----");
		return response;
	}

	/**
	 * update Departments by using DepartmentsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<DepartmentsDto> update(Request<DepartmentsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Departments-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<DepartmentsDto> response = new Response<DepartmentsDto>();
		List<Departments>        items    = new ArrayList<Departments>();
			
		for (DepartmentsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la departments existe
			Departments entityToSave = null;
			entityToSave = departmentsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("departments id -> " + dto.getId(), locale));
			}

			if (Utilities.notBlank(dto.getDepartmentName())) {
				entityToSave.setDepartmentName(dto.getDepartmentName());
			}
			if (Utilities.notBlank(dto.getDepartmentDesc())) {
				entityToSave.setDepartmentDesc(dto.getDepartmentDesc());
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
			List<Departments> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = departmentsRepository.saveAll((Iterable<Departments>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("departments", locale));
			}
			List<DepartmentsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? DepartmentsTransformer.INSTANCE.toLiteDtos(itemsSaved) : DepartmentsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Departments-----");
		return response;
	}

	/**
	 * delete Departments by using DepartmentsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<DepartmentsDto> delete(Request<DepartmentsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Departments-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<DepartmentsDto> response = new Response<DepartmentsDto>();
		List<Departments>        items    = new ArrayList<Departments>();
			
		for (DepartmentsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la departments existe
			Departments existingEntity = null;
			existingEntity = departmentsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("departments -> " + dto.getId(), locale));
			}

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------

			// specialities
			List<Specialities> listOfSpecialities = specialitiesRepository.findByDepartmentId(existingEntity.getId(), false);
			if (listOfSpecialities != null && !listOfSpecialities.isEmpty()){
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfSpecialities.size() + ")", locale));
			}


			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			departmentsRepository.saveAll((Iterable<Departments>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Departments-----");
		return response;
	}

	/**
	 * get Departments by using DepartmentsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<DepartmentsDto> getByCriteria(Request<DepartmentsDto> request, Locale locale)  throws Exception {
		log.info("----begin get Departments-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<DepartmentsDto> response = new Response<DepartmentsDto>();
		List<Departments> items 			 = departmentsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<DepartmentsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? DepartmentsTransformer.INSTANCE.toLiteDtos(items) : DepartmentsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(departmentsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("departments", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Departments-----");
		return response;
	}

	/**
	 * get full DepartmentsDto by using Departments as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public DepartmentsDto getFullInfos(DepartmentsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}

		return dto;
	}

	public Response<DepartmentsDto> custom(Request<DepartmentsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom DepartmentsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<DepartmentsDto> response = new Response<DepartmentsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new DepartmentsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom DepartmentsDto-----");
		return response;
	}
}
