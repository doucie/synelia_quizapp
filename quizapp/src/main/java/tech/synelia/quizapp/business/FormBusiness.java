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
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
 * BUSINESS for table "form"
 */
@Log
@Component
public class FormBusiness implements IBasicBusiness<Request<FormDto>, Response<FormDto>> {

	private Response<FormDto> response;
	@Autowired
	private FormRepository formRepository;
	@Autowired
	private CampaignsRepository campaignsRepository;
	@Autowired
	private FormVersionRepository formVersionRepository;
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

	public FormBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}

	@Override
	public Response<FormDto> create(Request<FormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin create Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = new ArrayList<Form>();

		for (FormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("formName", dto.getFormName());
			fieldsToVerify.put("campaignId", dto.getCampaignId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if campaigns exist
			Campaigns existingCampaigns = null;
			if (dto.getCampaignId() != null && dto.getCampaignId() > 0) {
				existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			Form entityToSave = FormTransformer.INSTANCE.toEntity(dto, existingCampaigns);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			if (entityToSave.getIsActive() == null) {
				entityToSave.setIsActive(true);
			}
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Form> itemsSaved = formRepository.saveAll((Iterable<Form>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("form", locale));
			}
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
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

			response.setHttpCode(HttpStatus.CREATED.value());
			response.setStatus(status);
			response.setItems(itemsDto);
			response.setHasError(false);
		}
		log.info("----end create Form-----");
		return response;
	}

	@Override
	public Response<FormDto> update(Request<FormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin update Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = new ArrayList<Form>();

		for (FormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Form entityToSave = formRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form id -> " + dto.getId(), locale));
			}

			if (dto.getCampaignId() != null && dto.getCampaignId() > 0) {
				Campaigns existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
				entityToSave.setCampaigns(existingCampaigns);
			}
			if (Utilities.notBlank(dto.getFormName())) {
				entityToSave.setFormName(dto.getFormName());
			}
			if (Utilities.notBlank(dto.getFormDesc())) {
				entityToSave.setFormDesc(dto.getFormDesc());
			}
			if (dto.getIsActive() != null) {
				entityToSave.setIsActive(dto.getIsActive());
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Form> itemsSaved = formRepository.saveAll((Iterable<Form>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("form", locale));
			}
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormTransformer.INSTANCE.toDtos(itemsSaved);

			final int size = itemsSaved.size();
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
		}
		log.info("----end update Form-----");
		return response;
	}

	@Override
	public Response<FormDto> delete(Request<FormDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = new ArrayList<Form>();

		for (FormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Form existingEntity = formRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form -> " + dto.getId(), locale));
			}

			// Check if data is used by formVersion
			List<FormVersion> listOfFormVersion = formVersionRepository.findByFormId(existingEntity.getId(), false);
			if (listOfFormVersion != null && !listOfFormVersion.isEmpty()) {
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfFormVersion.size() + ")", locale));
			}

			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			formRepository.saveAll((Iterable<Form>) items);
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end delete Form-----");
		return response;
	}

	@Override
	public Response<FormDto> getByCriteria(Request<FormDto> request, Locale locale) throws Exception {
		log.info("----begin get Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = formRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(items) : FormTransformer.INSTANCE.toDtos(items);

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
			response.setCount(formRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("form", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get Form-----");
		return response;
	}

	public Response<FormDto> getAllByCriteria(Request<FormDto> request, Locale locale) throws Exception {
		log.info("----begin get ALL Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = formRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(items) : FormTransformer.INSTANCE.toDtos(items);

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
			response.setCount(formRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("form", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get ALL Form-----");
		return response;
	}

	public Response<FormDto> custom(Request<FormDto> request, Locale locale) throws Exception {
		log.info("----begin custom FormBusiness-----");
		Response<FormDto> response = new Response<FormDto>();
		response.setHasError(false);
		response.setCount(1L);
		response.setHttpCode(HttpStatus.OK.value());
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setStatus(status);
		return response;
	}

	public Response<FormDto> updateDeleted(Request<FormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = new ArrayList<Form>();

		for (FormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Form entityToSave = formRepository.findOne(dto.getId(), true);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form id -> " + dto.getId(), locale));
			}

			if (dto.getCampaignId() != null && dto.getCampaignId() > 0) {
				Campaigns existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
				entityToSave.setCampaigns(existingCampaigns);
			}
			if (Utilities.notBlank(dto.getFormName())) {
				entityToSave.setFormName(dto.getFormName());
			}
			if (Utilities.notBlank(dto.getFormDesc())) {
				entityToSave.setFormDesc(dto.getFormDesc());
			}
			if (dto.getIsActive() != null) {
				entityToSave.setIsActive(dto.getIsActive());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Form> itemsSaved = formRepository.saveAll((Iterable<Form>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("form", locale));
			}
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateDeleted Form-----");
		return response;
	}

	public Response<FormDto> updateAll(Request<FormDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateAll Form-----");
		Response<FormDto> response = new Response<FormDto>();
		List<Form> items = new ArrayList<Form>();

		for (FormDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Form entityToSave = formRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				entityToSave = formRepository.findOne(dto.getId(), true);
			}
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form id -> " + dto.getId(), locale));
			}

			if (dto.getCampaignId() != null && dto.getCampaignId() > 0) {
				Campaigns existingCampaigns = campaignsRepository.findOne(dto.getCampaignId(), false);
				if (existingCampaigns == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("campaigns campaignId -> " + dto.getCampaignId(), locale));
				}
				entityToSave.setCampaigns(existingCampaigns);
			}
			if (Utilities.notBlank(dto.getFormName())) {
				entityToSave.setFormName(dto.getFormName());
			}
			if (Utilities.notBlank(dto.getFormDesc())) {
				entityToSave.setFormDesc(dto.getFormDesc());
			}
			if (dto.getIsActive() != null) {
				entityToSave.setIsActive(dto.getIsActive());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Form> itemsSaved = formRepository.saveAll((Iterable<Form>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("form", locale));
			}
			List<FormDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateAll Form-----");
		return response;
	}

	private FormDto getFullInfos(FormDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		if (dto == null || isSimpleLoading != null && isSimpleLoading) {
			return dto;
		}
		return dto;
	}
}
