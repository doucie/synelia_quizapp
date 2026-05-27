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
 * BUSINESS for table "question"
 */
@Log
@Component
public class QuestionBusiness implements IBasicBusiness<Request<QuestionDto>, Response<QuestionDto>> {

	private Response<QuestionDto> response;
	@Autowired
	private QuestionRepository questionRepository;
	@Autowired
	private SpecialitiesRepository specialitiesRepository;
	@Autowired
	private FormQuestionsRepository formQuestionsRepository;
	@Autowired
	private AnswerRepository answerRepository;
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

	public QuestionBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}

	@Override
	public Response<QuestionDto> create(Request<QuestionDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin create Question-----");
		Response<QuestionDto> response = new Response<QuestionDto>();
		List<Question> items = new ArrayList<Question>();

		for (QuestionDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("questionText", dto.getQuestionText());
			fieldsToVerify.put("questionType", dto.getQuestionType());
			fieldsToVerify.put("specialityId", dto.getSpecialityId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Validation enum strict questionType (D-013)
			String qTypeUpper = dto.getQuestionType().toUpperCase(java.util.Locale.ROOT);
			if (!"SINGLE_CHOICE".equals(qTypeUpper) && !"MULTIPLE_CHOICE".equals(qTypeUpper)
					&& !"TRUE_FALSE".equals(qTypeUpper) && !"TEXT".equals(qTypeUpper)) {
				throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("questionType invalide (SINGLE_CHOICE/MULTIPLE_CHOICE/TRUE_FALSE/TEXT) -> " + dto.getQuestionType(), locale));
			}
			dto.setQuestionType(qTypeUpper);

			// Validation enum strict difficultyLevel (D-013) si fourni
			if (dto.getDifficultyLevel() != null && !dto.getDifficultyLevel().isBlank()) {
				String diffUpper = dto.getDifficultyLevel().toUpperCase(java.util.Locale.ROOT);
				if (!"EASY".equals(diffUpper) && !"MEDIUM".equals(diffUpper) && !"HARD".equals(diffUpper)) {
					throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("difficultyLevel invalide (EASY/MEDIUM/HARD) -> " + dto.getDifficultyLevel(), locale));
				}
				dto.setDifficultyLevel(diffUpper);
			}

			// Verify if specialities exist
			Specialities existingSpecialities = null;
			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0) {
				existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			Question entityToSave = QuestionTransformer.INSTANCE.toEntity(dto, existingSpecialities);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			entityToSave.setQuestionRef(UUID.randomUUID().toString());
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Question> itemsSaved = questionRepository.saveAll((Iterable<Question>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("question", locale));
			}
			List<QuestionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionTransformer.INSTANCE.toLiteDtos(itemsSaved) : QuestionTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create Question-----");
		return response;
	}

	@Override
	public Response<QuestionDto> update(Request<QuestionDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin update Question-----");
		Response<QuestionDto> response = new Response<QuestionDto>();
		List<Question> items = new ArrayList<Question>();

		for (QuestionDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Question entityToSave = questionRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question id -> " + dto.getId(), locale));
			}
			if (hasStructuralQuestionUpdate(entityToSave, dto)) {
				ensureQuestionIsEditable(entityToSave, locale);
			}
			rejectQuestionRefMutation(entityToSave, dto, locale);

			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0) {
				Specialities existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
				entityToSave.setSpecialities(existingSpecialities);
			}
			if (Utilities.shouldUpdate(dto.getQuestionText())) {
				entityToSave.setQuestionText(dto.getQuestionText());
			}
			if (Utilities.shouldUpdate(dto.getQuestionType())) {
				String qTypeUpper = dto.getQuestionType().toUpperCase(java.util.Locale.ROOT);
				if (!"SINGLE_CHOICE".equals(qTypeUpper) && !"MULTIPLE_CHOICE".equals(qTypeUpper)
						&& !"TRUE_FALSE".equals(qTypeUpper) && !"TEXT".equals(qTypeUpper)) {
					throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("questionType invalide (SINGLE_CHOICE/MULTIPLE_CHOICE/TRUE_FALSE/TEXT) -> " + dto.getQuestionType(), locale));
				}
				entityToSave.setQuestionType(qTypeUpper);
			}
			if (Utilities.shouldUpdate(dto.getDifficultyLevel())) {
				String diffUpper = dto.getDifficultyLevel().toUpperCase(java.util.Locale.ROOT);
				if (!"EASY".equals(diffUpper) && !"MEDIUM".equals(diffUpper) && !"HARD".equals(diffUpper)) {
					throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("difficultyLevel invalide (EASY/MEDIUM/HARD) -> " + dto.getDifficultyLevel(), locale));
				}
				entityToSave.setDifficultyLevel(diffUpper);
			}
			if (dto.getQuestionChrono() != null) {
				entityToSave.setQuestionChrono(dto.getQuestionChrono());
				formBusiness.validateQuestionChronoUsage(entityToSave, locale);
			}
			if (dto.getScore() != null) {
				entityToSave.setScore(dto.getScore());
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Question> itemsSaved = questionRepository.saveAll((Iterable<Question>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("question", locale));
			}
			List<QuestionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionTransformer.INSTANCE.toLiteDtos(itemsSaved) : QuestionTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Question-----");
		return response;
	}

	@Override
	public Response<QuestionDto> delete(Request<QuestionDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Question-----");
		Response<QuestionDto> response = new Response<QuestionDto>();
		List<Question> items = new ArrayList<Question>();

		for (QuestionDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Question existingEntity = questionRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question -> " + dto.getId(), locale));
			}

			// Vérifier si la question est dans un formulaire verrouillé
			List<FormQuestions> linkedFqs = formQuestionsRepository.findByQuestionId(existingEntity.getId(), false);
			if (linkedFqs != null) {
				for (FormQuestions fq : linkedFqs) {
					if (fq.getFormVersion() != null && Boolean.TRUE.equals(fq.getFormVersion().getIsLocked())) {
						throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE(
							"Cette question est dans un formulaire verrouillé (version " + fq.getFormVersion().getVersionNumber() + ")", locale));
					}
				}
			}

			// Check if data is used by formQuestions
			List<FormQuestions> listOfFormQuestions = formQuestionsRepository.findByQuestionId(existingEntity.getId(), false);
			if (listOfFormQuestions != null && !listOfFormQuestions.isEmpty()) {
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfFormQuestions.size() + ")", locale));
			}

			// Check if data is used by answer
			List<Answer> listOfAnswer = answerRepository.findByQuestionId(existingEntity.getId(), false);
			if (listOfAnswer != null && !listOfAnswer.isEmpty()) {
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfAnswer.size() + ")", locale));
			}

			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			questionRepository.saveAll((Iterable<Question>) items);
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end delete Question-----");
		return response;
	}

	@Override
	public Response<QuestionDto> getByCriteria(Request<QuestionDto> request, Locale locale) throws Exception {
		log.info("----begin get Question-----");
		Response<QuestionDto> response = new Response<QuestionDto>();
		List<Question> items = questionRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<QuestionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionTransformer.INSTANCE.toLiteDtos(items) : QuestionTransformer.INSTANCE.toDtos(items);

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
			response.setCount(questionRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("question", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get Question-----");
		return response;
	}

	public Response<QuestionDto> getAllByCriteria(Request<QuestionDto> request, Locale locale) throws Exception {
		log.info("----begin get ALL Question-----");
		Response<QuestionDto> response = new Response<QuestionDto>();
		List<Question> items = questionRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<QuestionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionTransformer.INSTANCE.toLiteDtos(items) : QuestionTransformer.INSTANCE.toDtos(items);

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
			response.setCount(questionRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("question", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get ALL Question-----");
		return response;
	}

	public Response<QuestionDto> custom(Request<QuestionDto> request, Locale locale) throws Exception {
		log.info("----begin custom QuestionBusiness-----");
		Response<QuestionDto> response = new Response<QuestionDto>();
		response.setHasError(false);
		response.setCount(1L);
		response.setHttpCode(HttpStatus.OK.value());
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setStatus(status);
		return response;
	}

	public Response<QuestionDto> updateDeleted(Request<QuestionDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted Question-----");
		Response<QuestionDto> response = new Response<QuestionDto>();
		List<Question> items = new ArrayList<Question>();

		for (QuestionDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Question entityToSave = questionRepository.findOne(dto.getId(), true);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question id -> " + dto.getId(), locale));
			}
			if (hasStructuralQuestionUpdate(entityToSave, dto)) {
				ensureQuestionIsEditable(entityToSave, locale);
			}
			rejectQuestionRefMutation(entityToSave, dto, locale);

			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0) {
				Specialities existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
				entityToSave.setSpecialities(existingSpecialities);
			}
			if (Utilities.shouldUpdate(dto.getQuestionText())) {
				entityToSave.setQuestionText(dto.getQuestionText());
			}
			if (Utilities.shouldUpdate(dto.getQuestionType())) {
				String qTypeUpper = dto.getQuestionType().toUpperCase(java.util.Locale.ROOT);
				if (!"SINGLE_CHOICE".equals(qTypeUpper) && !"MULTIPLE_CHOICE".equals(qTypeUpper)
						&& !"TRUE_FALSE".equals(qTypeUpper) && !"TEXT".equals(qTypeUpper)) {
					throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("questionType invalide (SINGLE_CHOICE/MULTIPLE_CHOICE/TRUE_FALSE/TEXT) -> " + dto.getQuestionType(), locale));
				}
				entityToSave.setQuestionType(qTypeUpper);
			}
			if (Utilities.shouldUpdate(dto.getDifficultyLevel())) {
				String diffUpper = dto.getDifficultyLevel().toUpperCase(java.util.Locale.ROOT);
				if (!"EASY".equals(diffUpper) && !"MEDIUM".equals(diffUpper) && !"HARD".equals(diffUpper)) {
					throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("difficultyLevel invalide (EASY/MEDIUM/HARD) -> " + dto.getDifficultyLevel(), locale));
				}
				entityToSave.setDifficultyLevel(diffUpper);
			}
			if (dto.getQuestionChrono() != null) {
				entityToSave.setQuestionChrono(dto.getQuestionChrono());
			}
			if (dto.getScore() != null) {
				entityToSave.setScore(dto.getScore());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			if (!Boolean.TRUE.equals(entityToSave.getIsDeleted())
					&& (dto.getQuestionChrono() != null || Boolean.FALSE.equals(dto.getIsDeleted()))) {
				formBusiness.validateQuestionChronoUsage(entityToSave, locale);
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Question> itemsSaved = questionRepository.saveAll((Iterable<Question>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("question", locale));
			}
			List<QuestionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionTransformer.INSTANCE.toLiteDtos(itemsSaved) : QuestionTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateDeleted Question-----");
		return response;
	}

	public Response<QuestionDto> updateAll(Request<QuestionDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateAll Question-----");
		Response<QuestionDto> response = new Response<QuestionDto>();
		List<Question> items = new ArrayList<Question>();

		for (QuestionDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Question entityToSave = questionRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				entityToSave = questionRepository.findOne(dto.getId(), true);
			}
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question id -> " + dto.getId(), locale));
			}
			if (hasStructuralQuestionUpdate(entityToSave, dto)) {
				ensureQuestionIsEditable(entityToSave, locale);
			}
			rejectQuestionRefMutation(entityToSave, dto, locale);

			if (dto.getSpecialityId() != null && dto.getSpecialityId() > 0) {
				Specialities existingSpecialities = specialitiesRepository.findOne(dto.getSpecialityId(), false);
				if (existingSpecialities == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("specialities specialityId -> " + dto.getSpecialityId(), locale));
				}
				entityToSave.setSpecialities(existingSpecialities);
			}
			if (Utilities.shouldUpdate(dto.getQuestionText())) {
				entityToSave.setQuestionText(dto.getQuestionText());
			}
			if (Utilities.shouldUpdate(dto.getQuestionType())) {
				String qTypeUpper = dto.getQuestionType().toUpperCase(java.util.Locale.ROOT);
				if (!"SINGLE_CHOICE".equals(qTypeUpper) && !"MULTIPLE_CHOICE".equals(qTypeUpper)
						&& !"TRUE_FALSE".equals(qTypeUpper) && !"TEXT".equals(qTypeUpper)) {
					throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("questionType invalide (SINGLE_CHOICE/MULTIPLE_CHOICE/TRUE_FALSE/TEXT) -> " + dto.getQuestionType(), locale));
				}
				entityToSave.setQuestionType(qTypeUpper);
			}
			if (Utilities.shouldUpdate(dto.getDifficultyLevel())) {
				String diffUpper = dto.getDifficultyLevel().toUpperCase(java.util.Locale.ROOT);
				if (!"EASY".equals(diffUpper) && !"MEDIUM".equals(diffUpper) && !"HARD".equals(diffUpper)) {
					throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("difficultyLevel invalide (EASY/MEDIUM/HARD) -> " + dto.getDifficultyLevel(), locale));
				}
				entityToSave.setDifficultyLevel(diffUpper);
			}
			if (dto.getQuestionChrono() != null) {
				entityToSave.setQuestionChrono(dto.getQuestionChrono());
			}
			if (dto.getScore() != null) {
				entityToSave.setScore(dto.getScore());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			if (!Boolean.TRUE.equals(entityToSave.getIsDeleted())
					&& (dto.getQuestionChrono() != null || Boolean.FALSE.equals(dto.getIsDeleted()))) {
				formBusiness.validateQuestionChronoUsage(entityToSave, locale);
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Question> itemsSaved = questionRepository.saveAll((Iterable<Question>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("question", locale));
			}
			List<QuestionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? QuestionTransformer.INSTANCE.toLiteDtos(itemsSaved) : QuestionTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateAll Question-----");
		return response;
	}

	private boolean hasStructuralQuestionUpdate(Question question, QuestionDto dto) {
		if (question == null || dto == null) {
			return false;
		}

		if (Utilities.shouldUpdate(dto.getQuestionText()) && !Objects.equals(dto.getQuestionText(), question.getQuestionText())) {
			return true;
		}

		if (dto.getQuestionType() == null) {
			if (!Objects.equals(null, question.getQuestionType())) {
				return true;
			}
		} else if (Utilities.shouldUpdate(dto.getQuestionType())) {
			String requestedQuestionType = dto.getQuestionType().toUpperCase(java.util.Locale.ROOT);
			if (!Objects.equals(requestedQuestionType, question.getQuestionType())) {
				return true;
			}
		}

		if (dto.getQuestionChrono() != null && !Objects.equals(dto.getQuestionChrono(), question.getQuestionChrono())) {
			return true;
		}

		if (dto.getScore() != null && !Objects.equals(dto.getScore(), question.getScore())) {
			return true;
		}

		if (dto.getIsDeleted() != null && !Objects.equals(dto.getIsDeleted(), question.getIsDeleted())) {
			return true;
		}

		return false;
	}

	private void ensureQuestionIsEditable(Question question, Locale locale) {
		if (question == null || question.getId() == null) {
			return;
		}

		List<FormQuestions> linkedFqs = formQuestionsRepository.findByQuestionId(question.getId(), false);
		if (linkedFqs == null) {
			return;
		}

		for (FormQuestions fq : linkedFqs) {
			if (fq.getFormVersion() != null && Boolean.TRUE.equals(fq.getFormVersion().getIsLocked())) {
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE(
						"Cette question est dans un formulaire verrouille (version " + fq.getFormVersion().getVersionNumber() + ")", locale));
			}
		}
	}

	private void rejectQuestionRefMutation(Question question, QuestionDto dto, Locale locale) {
		if (!Utilities.shouldUpdate(dto.getQuestionRef())) {
			return;
		}

		String requestedQuestionRef = StringUtils.trimToNull(dto.getQuestionRef());
		if (!Objects.equals(requestedQuestionRef, question.getQuestionRef())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"questionRef est gere par le serveur et ne peut pas etre modifie manuellement.", locale));
		}
	}

	private QuestionDto getFullInfos(QuestionDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		if (dto == null || isSimpleLoading != null && isSimpleLoading) {
			return dto;
		}
		return dto;
	}
}
