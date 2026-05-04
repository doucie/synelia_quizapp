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
 * BUSINESS for table "form_questions"
 */
@Log
@Component
public class FormQuestionsBusiness implements IBasicBusiness<Request<FormQuestionsDto>, Response<FormQuestionsDto>> {

	private Response<FormQuestionsDto> response;
	@Autowired
	private FormQuestionsRepository formQuestionsRepository;
	@Autowired
	private FormVersionRepository formVersionRepository;
	@Autowired
	private QuestionRepository questionRepository;
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

	public FormQuestionsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}

	@Override
	public Response<FormQuestionsDto> create(Request<FormQuestionsDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin create FormQuestions-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		List<FormQuestions> items = new ArrayList<FormQuestions>();

		for (FormQuestionsDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("questionOrder", dto.getQuestionOrder());
			fieldsToVerify.put("formVersionId", dto.getFormVersionId());
			fieldsToVerify.put("questionId", dto.getQuestionId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if formVersion exists
			FormVersion existingFormVersion = null;
			if (dto.getFormVersionId() != null && dto.getFormVersionId() > 0) {
				existingFormVersion = formVersionRepository.findOne(dto.getFormVersionId(), false);
				if (existingFormVersion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion formVersionId -> " + dto.getFormVersionId(), locale));
				}
				ensureFormVersionIsEditable(existingFormVersion, locale);
			}

			// Verify if question exists
			Question existingQuestion = null;
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			FormQuestions entityToSave = FormQuestionsTransformer.INSTANCE.toEntity(dto, existingFormVersion, existingQuestion);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<FormQuestions> itemsSaved = formQuestionsRepository.saveAll((Iterable<FormQuestions>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("formQuestions", locale));
			}
			List<FormQuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormQuestionsTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormQuestionsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create FormQuestions-----");
		return response;
	}

	@Override
	public Response<FormQuestionsDto> update(Request<FormQuestionsDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin update FormQuestions-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		List<FormQuestions> items = new ArrayList<FormQuestions>();

		for (FormQuestionsDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			FormQuestions entityToSave = formQuestionsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formQuestions id -> " + dto.getId(), locale));
			}
			ensureFormVersionIsEditable(entityToSave.getFormVersion(), locale);

			if (dto.getFormVersionId() != null && dto.getFormVersionId() > 0) {
				FormVersion existingFormVersion = formVersionRepository.findOne(dto.getFormVersionId(), false);
				if (existingFormVersion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion formVersionId -> " + dto.getFormVersionId(), locale));
				}
				ensureFormVersionIsEditable(existingFormVersion, locale);
				entityToSave.setFormVersion(existingFormVersion);
			}
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				Question existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestion(existingQuestion);
			}
			if (dto.getQuestionOrder() != null) {
				entityToSave.setQuestionOrder(dto.getQuestionOrder());
			}
			if (dto.getChronoOverride() != null) {
				entityToSave.setChronoOverride(dto.getChronoOverride());
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<FormQuestions> itemsSaved = formQuestionsRepository.saveAll((Iterable<FormQuestions>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("formQuestions", locale));
			}
			List<FormQuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormQuestionsTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormQuestionsTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update FormQuestions-----");
		return response;
	}

	@Override
	public Response<FormQuestionsDto> delete(Request<FormQuestionsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete FormQuestions-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		List<FormQuestions> items = new ArrayList<FormQuestions>();

		for (FormQuestionsDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			FormQuestions existingEntity = formQuestionsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formQuestions -> " + dto.getId(), locale));
			}
			ensureFormVersionIsEditable(existingEntity.getFormVersion(), locale);

			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			formQuestionsRepository.saveAll((Iterable<FormQuestions>) items);
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end delete FormQuestions-----");
		return response;
	}

	@Override
	public Response<FormQuestionsDto> getByCriteria(Request<FormQuestionsDto> request, Locale locale) throws Exception {
		log.info("----begin get FormQuestions-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		List<FormQuestions> items = formQuestionsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<FormQuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormQuestionsTransformer.INSTANCE.toLiteDtos(items) : FormQuestionsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(formQuestionsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("formQuestions", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get FormQuestions-----");
		return response;
	}

	private void ensureFormVersionIsEditable(FormVersion formVersion, Locale locale) {
		if (formVersion != null && Boolean.TRUE.equals(formVersion.getIsLocked())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"La version de formulaire " + formVersion.getVersionNumber()
							+ " est verrouillee. Creez d'abord une nouvelle version pour la modifier.",
					locale));
		}
	}

	public Response<FormQuestionsDto> getAllByCriteria(Request<FormQuestionsDto> request, Locale locale) throws Exception {
		log.info("----begin get ALL FormQuestions-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		List<FormQuestions> items = formQuestionsRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<FormQuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormQuestionsTransformer.INSTANCE.toLiteDtos(items) : FormQuestionsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(formQuestionsRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("formQuestions", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get ALL FormQuestions-----");
		return response;
	}

	public Response<FormQuestionsDto> custom(Request<FormQuestionsDto> request, Locale locale) throws Exception {
		log.info("----begin custom FormQuestionsBusiness-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		response.setHasError(false);
		response.setCount(1L);
		response.setHttpCode(HttpStatus.OK.value());
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setStatus(status);
		return response;
	}

	public Response<FormQuestionsDto> updateDeleted(Request<FormQuestionsDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted FormQuestions-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		List<FormQuestions> items = new ArrayList<FormQuestions>();

		for (FormQuestionsDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			FormQuestions entityToSave = formQuestionsRepository.findOne(dto.getId(), true);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formQuestions id -> " + dto.getId(), locale));
			}

			if (dto.getFormVersionId() != null && dto.getFormVersionId() > 0) {
				FormVersion existingFormVersion = formVersionRepository.findOne(dto.getFormVersionId(), false);
				if (existingFormVersion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion formVersionId -> " + dto.getFormVersionId(), locale));
				}
				entityToSave.setFormVersion(existingFormVersion);
			}
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				Question existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestion(existingQuestion);
			}
			if (dto.getQuestionOrder() != null) {
				entityToSave.setQuestionOrder(dto.getQuestionOrder());
			}
			if (dto.getChronoOverride() != null) {
				entityToSave.setChronoOverride(dto.getChronoOverride());
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
			List<FormQuestions> itemsSaved = formQuestionsRepository.saveAll((Iterable<FormQuestions>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("formQuestions", locale));
			}
			List<FormQuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormQuestionsTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormQuestionsTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateDeleted FormQuestions-----");
		return response;
	}

	public Response<FormQuestionsDto> updateAll(Request<FormQuestionsDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateAll FormQuestions-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		List<FormQuestions> items = new ArrayList<FormQuestions>();

		for (FormQuestionsDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			FormQuestions entityToSave = formQuestionsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				entityToSave = formQuestionsRepository.findOne(dto.getId(), true);
			}
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formQuestions id -> " + dto.getId(), locale));
			}

			if (dto.getFormVersionId() != null && dto.getFormVersionId() > 0) {
				FormVersion existingFormVersion = formVersionRepository.findOne(dto.getFormVersionId(), false);
				if (existingFormVersion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion formVersionId -> " + dto.getFormVersionId(), locale));
				}
				entityToSave.setFormVersion(existingFormVersion);
			}
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				Question existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestion(existingQuestion);
			}
			if (dto.getQuestionOrder() != null) {
				entityToSave.setQuestionOrder(dto.getQuestionOrder());
			}
			if (dto.getChronoOverride() != null) {
				entityToSave.setChronoOverride(dto.getChronoOverride());
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
			List<FormQuestions> itemsSaved = formQuestionsRepository.saveAll((Iterable<FormQuestions>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("formQuestions", locale));
			}
			List<FormQuestionsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormQuestionsTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormQuestionsTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateAll FormQuestions-----");
		return response;
	}

	private FormQuestionsDto getFullInfos(FormQuestionsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		if (dto == null || isSimpleLoading != null && isSimpleLoading) {
			return dto;
		}
		return dto;
	}
}
