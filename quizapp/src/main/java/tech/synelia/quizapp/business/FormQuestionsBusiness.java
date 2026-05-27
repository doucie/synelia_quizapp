package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

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
	private FormBusiness formBusiness;
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
			entityToSave.setQuestionOrder(insertActiveQuestionOrder(
					entityToSave.getFormVersion(),
					null,
					entityToSave.getQuestionOrder(),
					request.getUser()));
			validateQuestionOrderUniqueness(entityToSave.getFormVersion(), entityToSave.getQuestionOrder(), null, locale);
			formBusiness.validateTimedFormQuestion(entityToSave.getFormVersion(), entityToSave.getQuestion(), entityToSave.getChronoOverride(), locale);
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
		Map<Integer, FormVersion> versionsToNormalize = new LinkedHashMap<>();

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
			FormVersion originalFormVersion = entityToSave.getFormVersion();
			Integer originalQuestionOrder = entityToSave.getQuestionOrder();
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
			boolean movedAcrossVersions = !isSameFormVersion(originalFormVersion, entityToSave.getFormVersion());
			if (dto.getQuestionOrder() != null || movedAcrossVersions) {
				entityToSave.setQuestionOrder(resolveAdjustedQuestionOrder(
						entityToSave,
						originalFormVersion,
						originalQuestionOrder,
						dto.getQuestionOrder(),
						false,
						request.getUser()));
			}
			if (dto.getChronoOverride() != null) {
				entityToSave.setChronoOverride(dto.getChronoOverride());
			}
			rememberVersionToNormalize(versionsToNormalize, originalFormVersion, false, entityToSave.getIsDeleted(), movedAcrossVersions);
			validateQuestionOrderUniqueness(entityToSave.getFormVersion(), entityToSave.getQuestionOrder(), entityToSave.getId(), locale);
			if (!Boolean.TRUE.equals(entityToSave.getIsDeleted())) {
				formBusiness.validateTimedFormQuestion(entityToSave.getFormVersion(), entityToSave.getQuestion(), entityToSave.getChronoOverride(), locale);
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
			normalizeRememberedVersions(versionsToNormalize, request.getUser());
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
	@Transactional(rollbackFor = {RuntimeException.class, Exception.class})
	public Response<FormQuestionsDto> delete(Request<FormQuestionsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete FormQuestions-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();

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
			existingEntity.setUpdatedAt(Utilities.getCurrentDate());
			existingEntity.setUpdatedBy(request.getUser());
			existingEntity.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(existingEntity)));
			formQuestionsRepository.save(existingEntity);
			em.flush();
			normalizeActiveQuestionOrders(existingEntity.getFormVersion(), request.getUser());
		}

		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
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

	@Transactional(rollbackFor = {RuntimeException.class, Exception.class})
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

	@Transactional(rollbackFor = {RuntimeException.class, Exception.class})
	public Response<FormQuestionsDto> updateDeleted(Request<FormQuestionsDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted FormQuestions-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		List<FormQuestions> items = new ArrayList<FormQuestions>();
		Map<Integer, FormVersion> versionsToNormalize = new LinkedHashMap<>();

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
			FormVersion originalFormVersion = entityToSave.getFormVersion();
			Integer originalQuestionOrder = entityToSave.getQuestionOrder();
			boolean wasDeleted = Boolean.TRUE.equals(entityToSave.getIsDeleted());
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
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			boolean movedAcrossVersions = !isSameFormVersion(originalFormVersion, entityToSave.getFormVersion());
			if (!Boolean.TRUE.equals(entityToSave.getIsDeleted()) && (wasDeleted || dto.getQuestionOrder() != null || movedAcrossVersions)) {
				entityToSave.setQuestionOrder(resolveAdjustedQuestionOrder(
						entityToSave,
						originalFormVersion,
						originalQuestionOrder,
						dto.getQuestionOrder(),
						wasDeleted,
						request.getUser()));
			}
			rememberVersionToNormalize(versionsToNormalize, originalFormVersion, wasDeleted, entityToSave.getIsDeleted(), movedAcrossVersions);
			validateQuestionOrderUniqueness(entityToSave.getFormVersion(), entityToSave.getQuestionOrder(), entityToSave.getId(), locale);
			if (!Boolean.TRUE.equals(entityToSave.getIsDeleted())) {
				formBusiness.validateTimedFormQuestion(entityToSave.getFormVersion(), entityToSave.getQuestion(), entityToSave.getChronoOverride(), locale);
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
			normalizeRememberedVersions(versionsToNormalize, request.getUser());
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

	@Transactional(rollbackFor = {RuntimeException.class, Exception.class})
	public Response<FormQuestionsDto> updateAll(Request<FormQuestionsDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateAll FormQuestions-----");
		Response<FormQuestionsDto> response = new Response<FormQuestionsDto>();
		List<FormQuestions> items = new ArrayList<FormQuestions>();
		Map<Integer, FormVersion> versionsToNormalize = new LinkedHashMap<>();

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
			FormVersion originalFormVersion = entityToSave.getFormVersion();
			Integer originalQuestionOrder = entityToSave.getQuestionOrder();
			boolean wasDeleted = Boolean.TRUE.equals(entityToSave.getIsDeleted());
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
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			boolean movedAcrossVersions = !isSameFormVersion(originalFormVersion, entityToSave.getFormVersion());
			if (!Boolean.TRUE.equals(entityToSave.getIsDeleted()) && (wasDeleted || dto.getQuestionOrder() != null || movedAcrossVersions)) {
				entityToSave.setQuestionOrder(resolveAdjustedQuestionOrder(
						entityToSave,
						originalFormVersion,
						originalQuestionOrder,
						dto.getQuestionOrder(),
						wasDeleted,
						request.getUser()));
			}
			rememberVersionToNormalize(versionsToNormalize, originalFormVersion, wasDeleted, entityToSave.getIsDeleted(), movedAcrossVersions);
			validateQuestionOrderUniqueness(entityToSave.getFormVersion(), entityToSave.getQuestionOrder(), entityToSave.getId(), locale);
			if (!Boolean.TRUE.equals(entityToSave.getIsDeleted())) {
				formBusiness.validateTimedFormQuestion(entityToSave.getFormVersion(), entityToSave.getQuestion(), entityToSave.getChronoOverride(), locale);
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
			normalizeRememberedVersions(versionsToNormalize, request.getUser());
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

	private void validateQuestionOrderUniqueness(FormVersion formVersion, Integer questionOrder, Integer currentId, Locale locale) {
		if (formVersion == null || formVersion.getId() == null || questionOrder == null) {
			return;
		}

		List<FormQuestions> conflicts = formQuestionsRepository.findByFormVersionIdAndQuestionOrder(formVersion.getId(), questionOrder, false);
		if (conflicts == null) {
			return;
		}

		for (FormQuestions conflict : conflicts) {
			if (conflict != null && !Objects.equals(conflict.getId(), currentId)) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"L'ordre " + questionOrder + " existe deja pour cette version de formulaire.", locale));
			}
		}
	}

	private void normalizeActiveQuestionOrders(FormVersion formVersion, Integer userId) throws JsonProcessingException {
		if (formVersion == null || formVersion.getId() == null) {
			return;
		}

		List<FormQuestions> activeLinks = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false);
		if (activeLinks == null || activeLinks.isEmpty()) {
			return;
		}

		int expectedOrder = 1;
		for (FormQuestions activeLink : activeLinks) {
			if (activeLink == null) {
				continue;
			}

			if (!Objects.equals(activeLink.getQuestionOrder(), expectedOrder)) {
				activeLink.setQuestionOrder(expectedOrder);
				activeLink.setUpdatedAt(Utilities.getCurrentDate());
				activeLink.setUpdatedBy(userId);
				activeLink.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(activeLink)));
				formQuestionsRepository.save(activeLink);
				em.flush();
			}

			expectedOrder++;
		}
	}

	private Integer repositionActiveQuestionOrder(FormQuestions entityToSave, Integer originalQuestionOrder, Integer requestedQuestionOrder, Integer userId) throws JsonProcessingException {
		if (entityToSave == null || entityToSave.getFormVersion() == null || entityToSave.getFormVersion().getId() == null) {
			return requestedQuestionOrder;
		}

		List<FormQuestions> activeLinks = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(entityToSave.getFormVersion().getId(), false);
		if (activeLinks == null || activeLinks.isEmpty()) {
			return requestedQuestionOrder;
		}

		int currentOrder = originalQuestionOrder != null && originalQuestionOrder > 0 ? originalQuestionOrder : 1;
		int maxOrder = activeLinks.size();
		int targetOrder = clampQuestionOrder(requestedQuestionOrder, maxOrder);
		if (targetOrder == currentOrder) {
			return currentOrder;
		}

		List<FormQuestions> linksToShift = new ArrayList<>();
		for (FormQuestions activeLink : activeLinks) {
			if (activeLink == null || Objects.equals(activeLink.getId(), entityToSave.getId()) || activeLink.getQuestionOrder() == null) {
				continue;
			}

			if (targetOrder < currentOrder
					&& activeLink.getQuestionOrder() >= targetOrder
					&& activeLink.getQuestionOrder() < currentOrder) {
				linksToShift.add(activeLink);
			}
			if (targetOrder > currentOrder
					&& activeLink.getQuestionOrder() <= targetOrder
					&& activeLink.getQuestionOrder() > currentOrder) {
				linksToShift.add(activeLink);
			}
		}

		persistShiftedQuestionOrders(linksToShift, targetOrder < currentOrder ? 1 : -1, userId, activeLinks);
		return targetOrder;
	}

	private Integer insertActiveQuestionOrder(FormVersion formVersion, Integer currentId, Integer requestedQuestionOrder, Integer userId) throws JsonProcessingException {
		if (formVersion == null || formVersion.getId() == null) {
			return requestedQuestionOrder;
		}

		List<FormQuestions> activeLinks = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false);
		if (activeLinks == null || activeLinks.isEmpty()) {
			return clampQuestionOrder(requestedQuestionOrder, 1);
		}

		int targetOrder = clampQuestionOrder(requestedQuestionOrder, activeLinks.size() + 1);
		List<FormQuestions> linksToShift = new ArrayList<>();
		for (FormQuestions activeLink : activeLinks) {
			if (activeLink == null || Objects.equals(activeLink.getId(), currentId) || activeLink.getQuestionOrder() == null) {
				continue;
			}
			if (activeLink.getQuestionOrder() >= targetOrder) {
				linksToShift.add(activeLink);
			}
		}

		persistShiftedQuestionOrders(linksToShift, 1, userId, activeLinks);
		return targetOrder;
	}

	private Integer resolveAdjustedQuestionOrder(
			FormQuestions entityToSave,
			FormVersion originalFormVersion,
			Integer originalQuestionOrder,
			Integer requestedQuestionOrder,
			boolean wasDeleted,
			Integer userId) throws JsonProcessingException {
		Integer targetOrder = requestedQuestionOrder != null ? requestedQuestionOrder : originalQuestionOrder;
		if (Boolean.TRUE.equals(entityToSave.getIsDeleted())) {
			return targetOrder;
		}

		if (isSameFormVersion(originalFormVersion, entityToSave.getFormVersion())) {
			if (wasDeleted) {
				return insertActiveQuestionOrder(entityToSave.getFormVersion(), entityToSave.getId(), targetOrder, userId);
			}
			return repositionActiveQuestionOrder(entityToSave, originalQuestionOrder, targetOrder, userId);
		}

		return insertActiveQuestionOrder(entityToSave.getFormVersion(), entityToSave.getId(), targetOrder, userId);
	}

	private void rememberVersionToNormalize(
			Map<Integer, FormVersion> versionsToNormalize,
			FormVersion originalFormVersion,
			boolean wasDeleted,
			Boolean isDeleted,
			boolean movedAcrossVersions) {
		if (versionsToNormalize == null || originalFormVersion == null || originalFormVersion.getId() == null) {
			return;
		}

		if (!wasDeleted && (Boolean.TRUE.equals(isDeleted) || movedAcrossVersions)) {
			versionsToNormalize.putIfAbsent(originalFormVersion.getId(), originalFormVersion);
		}
	}

	private void normalizeRememberedVersions(Map<Integer, FormVersion> versionsToNormalize, Integer userId) throws JsonProcessingException {
		if (versionsToNormalize == null || versionsToNormalize.isEmpty()) {
			return;
		}

		for (FormVersion formVersion : versionsToNormalize.values()) {
			normalizeActiveQuestionOrders(formVersion, userId);
		}
	}

	private void persistShiftedQuestionOrders(List<FormQuestions> linksToShift, int delta, Integer userId, List<FormQuestions> referenceLinks) throws JsonProcessingException {
		if (linksToShift == null || linksToShift.isEmpty()) {
			return;
		}

		int highestOrder = 0;
		if (referenceLinks != null) {
			for (FormQuestions referenceLink : referenceLinks) {
				if (referenceLink != null && referenceLink.getQuestionOrder() != null) {
					highestOrder = Math.max(highestOrder, referenceLink.getQuestionOrder());
				}
			}
		}
		int offset = highestOrder + (referenceLinks != null ? referenceLinks.size() : linksToShift.size()) + 1;

		Map<FormQuestions, Integer> originalOrders = new LinkedHashMap<>();
		for (FormQuestions linkToShift : linksToShift) {
			originalOrders.put(linkToShift, linkToShift.getQuestionOrder());
			linkToShift.setQuestionOrder(linkToShift.getQuestionOrder() + offset);
			markFormQuestionAsUpdated(linkToShift, userId);
		}
		formQuestionsRepository.saveAll(linksToShift);
		em.flush();

		for (Map.Entry<FormQuestions, Integer> entry : originalOrders.entrySet()) {
			entry.getKey().setQuestionOrder(entry.getValue() + delta);
			markFormQuestionAsUpdated(entry.getKey(), userId);
		}
		formQuestionsRepository.saveAll(linksToShift);
		em.flush();
	}

	private void markFormQuestionAsUpdated(FormQuestions formQuestion, Integer userId) throws JsonProcessingException {
		if (formQuestion == null) {
			return;
		}
		formQuestion.setUpdatedAt(Utilities.getCurrentDate());
		formQuestion.setUpdatedBy(userId);
		formQuestion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(formQuestion)));
	}

	private int clampQuestionOrder(Integer requestedQuestionOrder, int maxAllowed) {
		if (maxAllowed <= 0) {
			return 1;
		}
		if (requestedQuestionOrder == null || requestedQuestionOrder <= 0) {
			return maxAllowed;
		}
		return Math.max(1, Math.min(requestedQuestionOrder, maxAllowed));
	}

	private boolean isSameFormVersion(FormVersion left, FormVersion right) {
		if (left == null || right == null) {
			return false;
		}
		return Objects.equals(left.getId(), right.getId());
	}

	private FormQuestionsDto getFullInfos(FormQuestionsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		if (dto == null || isSimpleLoading != null && isSimpleLoading) {
			return dto;
		}
		return dto;
	}
}
