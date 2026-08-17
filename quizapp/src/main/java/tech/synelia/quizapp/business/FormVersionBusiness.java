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
import tech.synelia.quizapp.utils.enums.QuestionType;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
 * BUSINESS for table "form_version"
 */
@Log
@Component
public class FormVersionBusiness implements IBasicBusiness<Request<FormVersionDto>, Response<FormVersionDto>> {

	private Response<FormVersionDto> response;
	@Autowired
	private FormVersionRepository formVersionRepository;
	@Autowired
	private FormRepository formRepository;
	@Autowired
	private FormQuestionsRepository formQuestionsRepository;
	@Autowired
	private QuestionRepository questionRepository;
	@Autowired
	private AnswerRepository answerRepository;
	@Autowired
	private ApplicationsRepository applicationsRepository;
	@Autowired
	private FormBusiness formBusiness;
	@Autowired
	private FunctionalError functionalError;
	@Autowired
	private TechnicalError technicalError;
	@Autowired
	private ExceptionUtils exceptionUtils;
	@Autowired
	private FormVersionForkService formVersionForkService;
	@PersistenceContext
	private EntityManager em;

	private SimpleDateFormat dateFormat;
	private SimpleDateFormat dateTimeFormat;

	public FormVersionBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}

	@Override
	public Response<FormVersionDto> create(Request<FormVersionDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin create FormVersion-----");
		Response<FormVersionDto> response = new Response<FormVersionDto>();
		List<FormVersion> items = new ArrayList<FormVersion>();

		for (FormVersionDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("versionNumber", dto.getVersionNumber());
			fieldsToVerify.put("formId", dto.getFormId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}
			rejectDirectPublishedStateMutationOnStandardFlows(dto, locale);

			// Verify if form exists
			Form existingForm = null;
			if (dto.getFormId() != null && dto.getFormId() > 0) {
				existingForm = formRepository.findOne(dto.getFormId(), false);
				if (existingForm == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form formId -> " + dto.getFormId(), locale));
				}
				ensureManualVersionCreationAllowed(existingForm, dto, locale);
				validateVersionNumberUniqueness(existingForm, dto.getVersionNumber(), null, locale);
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			FormVersion entityToSave = FormVersionTransformer.INSTANCE.toEntity(dto, existingForm);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			if (entityToSave.getIsPublished() == null) {
				entityToSave.setIsPublished(false);
			}
			if (entityToSave.getIsLocked() == null) {
				entityToSave.setIsLocked(false);
			}
			if (entityToSave.getRandomQuestions() == null) {
				entityToSave.setRandomQuestions(false);
			}
			if (Boolean.TRUE.equals(entityToSave.getIsPublished())) {
				validateFormVersionCanBePublished(entityToSave, locale);
			}
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<FormVersion> itemsSaved = formVersionRepository.saveAll((Iterable<FormVersion>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("formVersion", locale));
			}
			List<FormVersionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormVersionTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormVersionTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create FormVersion-----");
		return response;
	}

	@Override
	public Response<FormVersionDto> update(Request<FormVersionDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin update FormVersion-----");
		Response<FormVersionDto> response = new Response<FormVersionDto>();
		List<FormVersion> itemsToPersist = new ArrayList<FormVersion>();
		List<FormVersion> responseItems = new ArrayList<FormVersion>();

		for (FormVersionDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			FormVersion sourceVersion = formVersionRepository.findOne(dto.getId(), false);
			if (sourceVersion == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion id -> " + dto.getId(), locale));
			}
			rejectDirectPublishedStateMutationOnStandardFlows(dto, locale);
			rejectManagedVersionFieldChanges(sourceVersion, dto, locale);
			if (!hasMeaningfulStandardUpdate(sourceVersion, dto)) {
				responseItems.add(sourceVersion);
				continue;
			}

			FormVersion entityToSave = sourceVersion;
			boolean autoForkedFromLockedVersion = Boolean.TRUE.equals(sourceVersion.getIsLocked());
			if (autoForkedFromLockedVersion) {
				entityToSave = formVersionForkService.createForkedVersion(sourceVersion, request.getUser(), locale);
			}

			if (dto.getFormId() != null && dto.getFormId() > 0) {
				Form existingForm = formRepository.findOne(dto.getFormId(), false);
				if (existingForm == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form formId -> " + dto.getFormId(), locale));
				}
				entityToSave.setForm(existingForm);
			}

			Integer versionNumberToApply = dto.getVersionNumber();
			if (autoForkedFromLockedVersion
					&& (versionNumberToApply == null || Objects.equals(versionNumberToApply, sourceVersion.getVersionNumber()))) {
				versionNumberToApply = entityToSave.getVersionNumber();
			}
			if (versionNumberToApply != null) {
				validateVersionNumberUniqueness(entityToSave.getForm(), versionNumberToApply, entityToSave.getId(), locale);
				entityToSave.setVersionNumber(versionNumberToApply);
			}

			Boolean lockedToApply = dto.getIsLocked();
			if (autoForkedFromLockedVersion
					&& (lockedToApply == null || Objects.equals(lockedToApply, sourceVersion.getIsLocked()))) {
				lockedToApply = entityToSave.getIsLocked();
			}
			if (lockedToApply != null) {
				entityToSave.setIsLocked(lockedToApply);
			}
			if (dto.getRandomQuestions() != null) {
				entityToSave.setRandomQuestions(dto.getRandomQuestions());
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			itemsToPersist.add(entityToSave);
			responseItems.add(entityToSave);
		}

		if (!itemsToPersist.isEmpty()) {
			List<FormVersion> itemsSaved = formVersionRepository.saveAll((Iterable<FormVersion>) itemsToPersist);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("formVersion", locale));
			}
		}

		if (!responseItems.isEmpty()) {
			List<FormVersionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormVersionTransformer.INSTANCE.toLiteDtos(responseItems) : FormVersionTransformer.INSTANCE.toDtos(responseItems);

			final int size = responseItems.size();
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
		log.info("----end update FormVersion-----");
		return response;
	}

	private void validateFormVersionCanBePublished(FormVersion formVersion, Locale locale) {
		if (formVersion == null || formVersion.getId() == null) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"La version doit etre enregistree et completee avant publication.", locale));
		}

		formBusiness.validateFormVersionTiming(formVersion, locale);

		List<FormQuestions> formQuestions = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false);
		if (formQuestions == null || formQuestions.isEmpty()) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Publication impossible: la version doit contenir au moins une question active.", locale));
		}

		for (FormQuestions formQuestion : formQuestions) {
			Question question = formQuestion.getQuestion();
			if (question == null || Boolean.TRUE.equals(question.getIsDeleted())) {
				continue;
			}

			String questionType = StringUtils.trimToEmpty(question.getQuestionType());
			if (QuestionType.TEXT.getValue().equals(questionType)) {
				continue;
			}

			List<Answer> answers = answerRepository.findByQuestionId(question.getId(), false);
			int correctAnswersCount = 0;
			for (Answer answer : answers) {
				if (answer != null && !Boolean.TRUE.equals(answer.getIsDeleted()) && Boolean.TRUE.equals(answer.getIsCorrect())) {
					correctAnswersCount++;
				}
			}

			String questionLabel = StringUtils.defaultIfBlank(question.getQuestionRef(), question.getQuestionText());
			if ((QuestionType.SINGLE_CHOICE.getValue().equals(questionType)
					|| QuestionType.TRUE_FALSE.getValue().equals(questionType))
					&& correctAnswersCount != 1) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"Publication impossible: la question '" + questionLabel + "' doit avoir exactement une bonne réponse.", locale));
			}
			if (QuestionType.MULTIPLE_CHOICE.getValue().equals(questionType) && correctAnswersCount < 1) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"Publication impossible: la question '" + questionLabel + "' doit avoir au moins une bonne réponse.", locale));
			}
			if (!QuestionType.SINGLE_CHOICE.getValue().equals(questionType)
					&& !QuestionType.TRUE_FALSE.getValue().equals(questionType)
					&& !QuestionType.MULTIPLE_CHOICE.getValue().equals(questionType)
					&& correctAnswersCount < 1) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"Publication impossible: la question '" + questionLabel + "' n'a pas de bonne réponse exploitable.", locale));
			}
		}
	}

	@Override
	public Response<FormVersionDto> delete(Request<FormVersionDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete FormVersion-----");
		Response<FormVersionDto> response = new Response<FormVersionDto>();
		List<FormVersion> items = new ArrayList<FormVersion>();

		for (FormVersionDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			FormVersion existingEntity = formVersionRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion -> " + dto.getId(), locale));
			}

			// Auto-fork silencieux si verrouille
			if (Boolean.TRUE.equals(existingEntity.getIsLocked())) {
				FormVersion newVersion = formVersionForkService.createForkedVersion(existingEntity, request.getUser(), locale);
				formVersionForkService.autoPublish(newVersion, request.getUser(), locale);
				newVersion.setUpdatedAt(Utilities.getCurrentDate());
				newVersion.setUpdatedBy(request.getUser());
				newVersion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(newVersion)));
				formVersionRepository.save(newVersion);
				// La suppression se fait sur l'ancienne version (maintenant depubliee)
			}

			// Check if data is used by formQuestions
			List<FormQuestions> listOfFormQuestions = formQuestionsRepository.findByFormVersionId(existingEntity.getId(), false);
			if (listOfFormQuestions != null && !listOfFormQuestions.isEmpty()) {
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfFormQuestions.size() + ")", locale));
			}

			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			formVersionRepository.saveAll((Iterable<FormVersion>) items);
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end delete FormVersion-----");
		return response;
	}

	@Override
	public Response<FormVersionDto> getByCriteria(Request<FormVersionDto> request, Locale locale) throws Exception {
		log.info("----begin get FormVersion-----");
		Response<FormVersionDto> response = new Response<FormVersionDto>();
		List<FormVersion> items = formVersionRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<FormVersionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormVersionTransformer.INSTANCE.toLiteDtos(items) : FormVersionTransformer.INSTANCE.toDtos(items);

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
			response.setCount(formVersionRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("formVersion", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get FormVersion-----");
		return response;
	}

	public Response<FormVersionDto> getAllByCriteria(Request<FormVersionDto> request, Locale locale) throws Exception {
		log.info("----begin get ALL FormVersion-----");
		Response<FormVersionDto> response = new Response<FormVersionDto>();
		List<FormVersion> items = formVersionRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<FormVersionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormVersionTransformer.INSTANCE.toLiteDtos(items) : FormVersionTransformer.INSTANCE.toDtos(items);

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
			response.setCount(formVersionRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("formVersion", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get ALL FormVersion-----");
		return response;
	}

	@Transactional(rollbackFor = {RuntimeException.class, Exception.class})
	public Response<FormVersionDto> custom(Request<FormVersionDto> request, Locale locale) throws Exception {
		log.info("----begin custom FormVersionBusiness-----");
		Response<FormVersionDto> response = new Response<FormVersionDto>();

		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			FormVersionDto dto = request.getDatas().get(0);

			if ("fork".equalsIgnoreCase(dto.getAction())) {
				response = forkLockedVersion(dto, request.getUser(), locale);
			} else if ("publish".equalsIgnoreCase(dto.getAction())) {
				response = publishVersion(dto, request.getUser(), locale);
			} else if ("ensureEditableQuestion".equalsIgnoreCase(dto.getAction())) {
				response = ensureEditableQuestionForVersion(dto, request.getUser(), locale);
			} else if ("duplicateQuestion".equalsIgnoreCase(dto.getAction())) {
				response = duplicateQuestionForVersion(dto, request.getUser(), locale);
			} else {
				response.setHasError(true);
				response.setStatus(functionalError.DATA_NOT_EXIST("action -> " + dto.getAction(), locale));
				return response;
			}
		}

		log.info("----end custom FormVersionBusiness-----");
		return response;
	}

	private Response<FormVersionDto> ensureEditableQuestionForVersion(FormVersionDto dto, Integer userId, Locale locale) throws Exception {
		FormVersion formVersion = loadEditableFormVersionForQuestionAction(dto.getId(), userId, locale);
		Question originalQuestion = loadExistingQuestionForQuestionAction(dto.getQuestionId(), locale);
		FormQuestions targetFq = findFormQuestionLink(formVersion, originalQuestion.getId(), locale);

		Question editableQuestion = originalQuestion;
		if (questionRequiresIsolation(originalQuestion)) {
			editableQuestion = duplicateQuestionWithAnswers(originalQuestion, userId);
			relinkFormQuestion(targetFq, editableQuestion, userId);
		}

		return buildQuestionActionResponse(formVersion, editableQuestion.getId(), HttpStatus.OK.value());
	}

	private Response<FormVersionDto> publishVersion(FormVersionDto dto, Integer userId, Locale locale) throws Exception {
		Response<FormVersionDto> response = new Response<FormVersionDto>();

		if (dto.getId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}

		FormVersion formVersion = formVersionRepository.findOne(dto.getId(), false);
		if (formVersion == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion id -> " + dto.getId(), locale));
		}

		applyPublishedState(formVersion, true, userId, locale);
		formVersion.setUpdatedAt(Utilities.getCurrentDate());
		formVersion.setUpdatedBy(userId);
		formVersion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(formVersion)));
		FormVersion savedVersion = formVersionRepository.save(formVersion);

		FormVersionDto resultDto = FormVersionTransformer.INSTANCE.toDto(savedVersion);
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setItems(Collections.singletonList(resultDto));
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Fork a locked form_version:
	 * 1. Creates a new form_version (version_number + 1, unlocked, unpublished)
	 * 2. Copies all form_questions links to the new version (same questions re-linked)
	 * 3. Returns the new form_version
	 */
	private Response<FormVersionDto> forkLockedVersion(FormVersionDto dto, Integer userId, Locale locale) throws Exception {
		Response<FormVersionDto> response = new Response<FormVersionDto>();

		if (dto.getId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}

		FormVersion sourceVersion = formVersionRepository.findOne(dto.getId(), false);
		if (sourceVersion == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion id -> " + dto.getId(), locale));
		}

		if (!Boolean.TRUE.equals(sourceVersion.getIsLocked())) {
			throw new InternalErrorException(functionalError.SAVE_FAIL(
				"La version " + sourceVersion.getVersionNumber() + " n'est pas verrouillée, modification directe possible", locale));
		}

		FormVersion newVersion = formVersionForkService.createForkedVersion(sourceVersion, userId, locale);

		FormVersionDto resultDto = FormVersionTransformer.INSTANCE.toDto(newVersion);
		resultDto.setAutoVersionCreated(true);
		resultDto.setNewVersionNumber(newVersion.getVersionNumber());
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setItems(Collections.singletonList(resultDto));
		response.setHasError(false);
		response.setHttpCode(HttpStatus.CREATED.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Duplicate a question for a specific (unlocked) form_version:
	 * 1. Creates a new question (same question_ref, copies all fields)
	 * 2. Duplicates all answers from the original question
	 * 3. Updates the form_questions link in this version to point to the new question
	 * 4. Returns the form_version (so frontend can reload)
	 */
	private Response<FormVersionDto> duplicateQuestionForVersion(FormVersionDto dto, Integer userId, Locale locale) throws Exception {
		FormVersion formVersion = loadEditableFormVersionForQuestionAction(dto.getId(), userId, locale);
		Question originalQuestion = loadExistingQuestionForQuestionAction(dto.getQuestionId(), locale);
		FormQuestions targetFq = findFormQuestionLink(formVersion, originalQuestion.getId(), locale);
		Question newQuestion = duplicateQuestionWithAnswers(originalQuestion, userId);
		relinkFormQuestion(targetFq, newQuestion, userId);
		return buildQuestionActionResponse(formVersion, newQuestion.getId(), HttpStatus.OK.value());
	}

	private FormVersion loadEditableFormVersionForQuestionAction(Integer formVersionId, Integer userId, Locale locale) throws JsonProcessingException {
		if (formVersionId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id (formVersionId)", locale));
		}

		FormVersion formVersion = formVersionRepository.findOne(formVersionId, false);
		if (formVersion == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion id -> " + formVersionId, locale));
		}

		// Auto-fork silencieux si verrouille
		if (Boolean.TRUE.equals(formVersion.getIsLocked())) {
			FormVersion newVersion = formVersionForkService.createForkedVersion(formVersion, userId, locale);
			formVersionForkService.autoPublish(newVersion, userId, locale);
			newVersion.setUpdatedAt(Utilities.getCurrentDate());
			newVersion.setUpdatedBy(userId);
			newVersion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(newVersion)));
			return formVersionRepository.save(newVersion);
		}

		return formVersion;
	}

	private Question loadExistingQuestionForQuestionAction(Integer questionId, Locale locale) {
		if (questionId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("questionId", locale));
		}

		Question question = questionRepository.findOne(questionId, false);
		if (question == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question id -> " + questionId, locale));
		}

		return question;
	}

	private FormQuestions findFormQuestionLink(FormVersion formVersion, Integer questionId, Locale locale) {
		List<FormQuestions> fqLinks = formQuestionsRepository.findByFormVersionId(formVersion.getId(), false);
		if (fqLinks != null) {
			for (FormQuestions fq : fqLinks) {
				if (fq.getQuestion() != null && Objects.equals(fq.getQuestion().getId(), questionId)) {
					return fq;
				}
			}
		}

		throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST(
				"form_questions (formVersion=" + formVersion.getId() + ", question=" + questionId + ")", locale));
	}

	private boolean questionRequiresIsolation(Question question) {
		if (question == null || question.getId() == null) {
			return false;
		}

		List<FormQuestions> linkedFqs = formQuestionsRepository.findByQuestionId(question.getId(), false);
		if (linkedFqs == null) {
			return false;
		}

		for (FormQuestions fq : linkedFqs) {
			if (fq.getFormVersion() != null && Boolean.TRUE.equals(fq.getFormVersion().getIsLocked())) {
				return true;
			}
		}

		return false;
	}

	private Question duplicateQuestionWithAnswers(Question originalQuestion, Integer userId) {
		Question newQuestion = new Question();
		newQuestion.setQuestionRef(originalQuestion.getQuestionRef() != null ? originalQuestion.getQuestionRef() : java.util.UUID.randomUUID().toString());
		newQuestion.setQuestionText(originalQuestion.getQuestionText());
		newQuestion.setQuestionChrono(originalQuestion.getQuestionChrono());
		newQuestion.setQuestionType(originalQuestion.getQuestionType());
		newQuestion.setScore(originalQuestion.getScore());
		newQuestion.setDifficultyLevel(originalQuestion.getDifficultyLevel());
		newQuestion.setSpecialities(originalQuestion.getSpecialities());
		newQuestion.setIsDeleted(false);
		newQuestion.setCreatedAt(Utilities.getCurrentDate());
		newQuestion.setCreatedBy(userId);
		newQuestion = questionRepository.save(newQuestion);

		List<Answer> originalAnswers = answerRepository.findByQuestionId(originalQuestion.getId(), false);
		if (originalAnswers != null && !originalAnswers.isEmpty()) {
			List<Answer> newAnswers = new ArrayList<Answer>();
			for (Answer origAnswer : originalAnswers) {
				Answer newAnswer = new Answer();
				newAnswer.setQuestion(newQuestion);
				newAnswer.setAnswerText(origAnswer.getAnswerText());
				newAnswer.setAnswerType(origAnswer.getAnswerType());
				newAnswer.setAllowAdditionalComment(origAnswer.getAllowAdditionalComment());
				newAnswer.setAdditionalCommentRequired(origAnswer.getAdditionalCommentRequired());
				newAnswer.setAdditionalCommentPlaceholder(origAnswer.getAdditionalCommentPlaceholder());
				newAnswer.setAnswerOrder(origAnswer.getAnswerOrder());
				newAnswer.setIsCorrect(origAnswer.getIsCorrect());
				newAnswer.setIsDeleted(false);
				newAnswer.setCreatedAt(Utilities.getCurrentDate());
				newAnswer.setCreatedBy(userId);
				newAnswers.add(newAnswer);
			}
			answerRepository.saveAll(newAnswers);
		}

		return newQuestion;
	}

	private void relinkFormQuestion(FormQuestions targetFq, Question question, Integer userId) {
		targetFq.setQuestion(question);
		targetFq.setUpdatedAt(Utilities.getCurrentDate());
		targetFq.setUpdatedBy(userId);
		formQuestionsRepository.save(targetFq);
	}

	private Response<FormVersionDto> buildQuestionActionResponse(FormVersion formVersion, Integer questionId, int httpCode) throws ParseException {
		Response<FormVersionDto> response = new Response<FormVersionDto>();
		FormVersionDto resultDto = FormVersionTransformer.INSTANCE.toDto(formVersion);
		resultDto.setQuestionId(questionId);
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setItems(Collections.singletonList(resultDto));
		response.setHasError(false);
		response.setHttpCode(httpCode);
		response.setStatus(status);
		return response;
	}

	@Transactional(rollbackFor = {RuntimeException.class, Exception.class})
	public Response<FormVersionDto> updateDeleted(Request<FormVersionDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted FormVersion-----");
		Response<FormVersionDto> response = new Response<FormVersionDto>();
		List<FormVersion> items = new ArrayList<FormVersion>();

		for (FormVersionDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			FormVersion entityToSave = formVersionRepository.findOne(dto.getId(), true);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion id -> " + dto.getId(), locale));
			}
			boolean wasDeleted = Boolean.TRUE.equals(entityToSave.getIsDeleted());
			rejectDirectPublishedStateMutationOnStandardFlows(dto, locale);
			rejectManagedVersionFieldChanges(entityToSave, dto, locale);

			// Auto-fork silencieux si verrouille
			if (Boolean.TRUE.equals(entityToSave.getIsLocked())) {
				FormVersion newVersion = formVersionForkService.createForkedVersion(entityToSave, request.getUser(), locale);
				formVersionForkService.autoPublish(newVersion, request.getUser(), locale);
				newVersion.setUpdatedAt(Utilities.getCurrentDate());
				newVersion.setUpdatedBy(request.getUser());
				newVersion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(newVersion)));
				formVersionRepository.save(newVersion);
				// Rediriger l'operation sur la nouvelle version
				entityToSave = newVersion;
				wasDeleted = Boolean.TRUE.equals(entityToSave.getIsDeleted());
			}

			if (dto.getFormId() != null && dto.getFormId() > 0) {
				Form existingForm = formRepository.findOne(dto.getFormId(), false);
				if (existingForm == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form formId -> " + dto.getFormId(), locale));
				}
				entityToSave.setForm(existingForm);
			}
			if (dto.getVersionNumber() != null) {
				validateVersionNumberUniqueness(entityToSave.getForm(), dto.getVersionNumber(), entityToSave.getId(), locale);
				entityToSave.setVersionNumber(dto.getVersionNumber());
			}
			if (dto.getIsLocked() != null) {
				entityToSave.setIsLocked(dto.getIsLocked());
			}
			if (dto.getRandomQuestions() != null) {
				entityToSave.setRandomQuestions(dto.getRandomQuestions());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			reapplyPublishedStateOnRestore(entityToSave, wasDeleted, dto, request.getUser(), locale);
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<FormVersion> itemsSaved = formVersionRepository.saveAll((Iterable<FormVersion>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("formVersion", locale));
			}
			List<FormVersionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormVersionTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormVersionTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateDeleted FormVersion-----");
		return response;
	}

	@Transactional(rollbackFor = {RuntimeException.class, Exception.class})
	public Response<FormVersionDto> updateAll(Request<FormVersionDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateAll FormVersion-----");
		Response<FormVersionDto> response = new Response<FormVersionDto>();
		List<FormVersion> items = new ArrayList<FormVersion>();

		for (FormVersionDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			FormVersion entityToSave = formVersionRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				entityToSave = formVersionRepository.findOne(dto.getId(), true);
			}
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion id -> " + dto.getId(), locale));
			}
			boolean wasDeleted = Boolean.TRUE.equals(entityToSave.getIsDeleted());
			rejectDirectPublishedStateMutationOnStandardFlows(dto, locale);
			rejectManagedVersionFieldChanges(entityToSave, dto, locale);

			// Auto-fork silencieux si verrouille
			if (Boolean.TRUE.equals(entityToSave.getIsLocked())) {
				FormVersion newVersion = formVersionForkService.createForkedVersion(entityToSave, request.getUser(), locale);
				formVersionForkService.autoPublish(newVersion, request.getUser(), locale);
				newVersion.setUpdatedAt(Utilities.getCurrentDate());
				newVersion.setUpdatedBy(request.getUser());
				newVersion.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(newVersion)));
				formVersionRepository.save(newVersion);
				entityToSave = newVersion;
				wasDeleted = Boolean.TRUE.equals(entityToSave.getIsDeleted());
			}

			if (dto.getFormId() != null && dto.getFormId() > 0) {
				Form existingForm = formRepository.findOne(dto.getFormId(), false);
				if (existingForm == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form formId -> " + dto.getFormId(), locale));
				}
				entityToSave.setForm(existingForm);
			}
			if (dto.getVersionNumber() != null) {
				validateVersionNumberUniqueness(entityToSave.getForm(), dto.getVersionNumber(), entityToSave.getId(), locale);
				entityToSave.setVersionNumber(dto.getVersionNumber());
			}
			if (dto.getIsLocked() != null) {
				entityToSave.setIsLocked(dto.getIsLocked());
			}
			if (dto.getRandomQuestions() != null) {
				entityToSave.setRandomQuestions(dto.getRandomQuestions());
			}
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			reapplyPublishedStateOnRestore(entityToSave, wasDeleted, dto, request.getUser(), locale);
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<FormVersion> itemsSaved = formVersionRepository.saveAll((Iterable<FormVersion>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("formVersion", locale));
			}
			List<FormVersionDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? FormVersionTransformer.INSTANCE.toLiteDtos(itemsSaved) : FormVersionTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateAll FormVersion-----");
		return response;
	}

	private void ensureManualVersionCreationAllowed(Form form, FormVersionDto dto, Locale locale) {
		if (form == null || form.getId() == null) {
			return;
		}

		List<FormVersion> existingVersions = formVersionRepository.findAllByFormId(form.getId());
		if (existingVersions != null && !existingVersions.isEmpty()) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"La creation manuelle d'une version n'est autorisee que pour un formulaire sans historique de version.", locale));
		}

		if (!Objects.equals(dto.getVersionNumber(), 1)) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"La premiere version d'un formulaire doit obligatoirement etre numerotee 1.", locale));
		}
	}

	private void validateVersionNumberUniqueness(Form form, Integer versionNumber, Integer currentId, Locale locale) {
		if (form == null || form.getId() == null || versionNumber == null) {
			return;
		}

		List<FormVersion> conflicts = formVersionRepository.findByFormIdAndVersionNumber(form.getId(), versionNumber);
		if (conflicts == null) {
			return;
		}

		for (FormVersion conflict : conflicts) {
			if (conflict != null && !Objects.equals(conflict.getId(), currentId)) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"Le numero de version " + versionNumber + " existe deja pour ce formulaire.", locale));
			}
		}
	}

	private void rejectManagedVersionFieldChanges(FormVersion sourceVersion, FormVersionDto dto, Locale locale) {
		if (dto.getVersionNumber() != null && !Objects.equals(dto.getVersionNumber(), sourceVersion.getVersionNumber())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"versionNumber est gere par le serveur et ne peut pas etre modifie manuellement.", locale));
		}

		Integer sourceFormId = sourceVersion.getForm() != null ? sourceVersion.getForm().getId() : null;
		if (dto.getFormId() != null && !Objects.equals(dto.getFormId(), sourceFormId)) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Le rattachement d'une version a un autre formulaire n'est pas autorise.", locale));
		}
	}

	private void rejectDirectPublishedStateMutationOnStandardFlows(FormVersionDto dto, Locale locale) {
		if (dto == null || dto.getIsPublished() == null) {
			return;
		}

		throw new InvalidEntityException(functionalError.REQUEST_FAIL(
				"La publication d'une version doit passer par l'action metier dediee.", locale));
	}

	private boolean hasMeaningfulStandardUpdate(FormVersion sourceVersion, FormVersionDto dto) {
		if (dto.getIsLocked() != null && !Objects.equals(dto.getIsLocked(), sourceVersion.getIsLocked())) {
			return true;
		}
		if (dto.getRandomQuestions() != null && !Objects.equals(dto.getRandomQuestions(), sourceVersion.getRandomQuestions())) {
			return true;
		}
		return dto.getIsDeleted() != null && !Objects.equals(dto.getIsDeleted(), sourceVersion.getIsDeleted());
	}

	private void reapplyPublishedStateOnRestore(
			FormVersion formVersion,
			boolean wasDeleted,
			FormVersionDto dto,
			Integer actorUserId,
			Locale locale) {
		if (!wasDeleted || !Boolean.FALSE.equals(dto.getIsDeleted())) {
			return;
		}

		if (dto.getIsPublished() != null || !Boolean.TRUE.equals(formVersion.getIsPublished())) {
			return;
		}

		applyPublishedState(formVersion, true, actorUserId, locale);
	}

	private void applyPublishedState(FormVersion formVersion, boolean published, Integer actorUserId, Locale locale) {
		if (!published) {
			formVersion.setIsPublished(false);
			return;
		}

		if (formVersion.getForm() == null || formVersion.getForm().getId() == null) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"La version doit etre rattachee a un formulaire avant publication.", locale));
		}

		validateFormVersionCanBePublished(formVersion, locale);
		List<FormVersion> otherVersions = formVersionRepository.findByFormIdAndIsPublished(
				formVersion.getForm().getId(), true, false);
		for (FormVersion other : otherVersions) {
			if (!Objects.equals(other.getId(), formVersion.getId())) {
				other.setIsPublished(false);
				other.setUpdatedAt(Utilities.getCurrentDate());
				other.setUpdatedBy(actorUserId);
				formVersionRepository.save(other);
			}
		}
		formVersion.setIsPublished(true);
	}

	private FormVersionDto getFullInfos(FormVersionDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		if (dto == null || isSimpleLoading != null && isSimpleLoading) {
			return dto;
		}
		return dto;
	}
}
