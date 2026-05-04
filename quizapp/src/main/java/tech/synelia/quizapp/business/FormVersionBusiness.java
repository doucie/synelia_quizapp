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
	private FunctionalError functionalError;
	@Autowired
	private TechnicalError technicalError;
	@Autowired
	private ExceptionUtils exceptionUtils;
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

			// Verify if form exists
			Form existingForm = null;
			if (dto.getFormId() != null && dto.getFormId() > 0) {
				existingForm = formRepository.findOne(dto.getFormId(), false);
				if (existingForm == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form formId -> " + dto.getFormId(), locale));
				}
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
		List<FormVersion> items = new ArrayList<FormVersion>();

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

			FormVersion entityToSave = sourceVersion;
			boolean autoForkedFromLockedVersion = Boolean.TRUE.equals(sourceVersion.getIsLocked());
			if (autoForkedFromLockedVersion) {
				entityToSave = createForkedVersion(sourceVersion, request.getUser());
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
				entityToSave.setVersionNumber(versionNumberToApply);
			}

			Boolean publishedToApply = dto.getIsPublished();
			if (autoForkedFromLockedVersion
					&& (publishedToApply == null || Objects.equals(publishedToApply, sourceVersion.getIsPublished()))) {
				publishedToApply = entityToSave.getIsPublished();
			}
			if (publishedToApply != null) {
				// Publication unique : dépublier les autres versions du même formulaire
				if (publishedToApply && entityToSave.getForm() != null) {
					validateFormVersionCanBePublished(entityToSave, locale);
					List<FormVersion> otherVersions = formVersionRepository.findByFormIdAndIsPublished(
						entityToSave.getForm().getId(), true, false);
					for (FormVersion other : otherVersions) {
						if (!other.getId().equals(entityToSave.getId())) {
							other.setIsPublished(false);
							other.setUpdatedAt(Utilities.getCurrentDate());
							other.setUpdatedBy(request.getUser());
							formVersionRepository.save(other);
						}
					}
				}
				entityToSave.setIsPublished(publishedToApply);
			}

			Boolean lockedToApply = dto.getIsLocked();
			if (autoForkedFromLockedVersion
					&& (lockedToApply == null || Objects.equals(lockedToApply, sourceVersion.getIsLocked()))) {
				lockedToApply = entityToSave.getIsLocked();
			}
			if (lockedToApply != null) {
				entityToSave.setIsLocked(lockedToApply);
			}
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
		log.info("----end update FormVersion-----");
		return response;
	}

	private void validateFormVersionCanBePublished(FormVersion formVersion, Locale locale) {
		if (formVersion == null || formVersion.getId() == null) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"La version doit etre enregistree et completee avant publication.", locale));
		}

		List<FormQuestions> formQuestions = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(formVersion.getId(), false);
		if (formQuestions == null || formQuestions.isEmpty()) {
			return;
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

	public Response<FormVersionDto> custom(Request<FormVersionDto> request, Locale locale) throws Exception {
		log.info("----begin custom FormVersionBusiness-----");
		Response<FormVersionDto> response = new Response<FormVersionDto>();

		if (request.getDatas() != null && !request.getDatas().isEmpty()) {
			FormVersionDto dto = request.getDatas().get(0);

			if ("fork".equalsIgnoreCase(dto.getAction())) {
				response = forkLockedVersion(dto, request.getUser(), locale);
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

		FormVersion newVersion = createForkedVersion(sourceVersion, userId);

		// 3. Return the new version
		FormVersionDto resultDto = FormVersionTransformer.INSTANCE.toDto(newVersion);
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setItems(Collections.singletonList(resultDto));
		response.setHasError(false);
		response.setHttpCode(HttpStatus.CREATED.value());
		response.setStatus(status);
		return response;
	}

	private FormVersion createForkedVersion(FormVersion sourceVersion, Integer userId) {
		// 1. Create new form_version
		FormVersion newVersion = new FormVersion();
		newVersion.setForm(sourceVersion.getForm());
		newVersion.setVersionNumber(sourceVersion.getVersionNumber() + 1);
		newVersion.setIsPublished(false);
		newVersion.setIsLocked(false);
		newVersion.setIsDeleted(false);
		newVersion.setCreatedAt(Utilities.getCurrentDate());
		newVersion.setCreatedBy(userId);
		newVersion = formVersionRepository.save(newVersion);

		// 2. Copy all form_questions links
		List<FormQuestions> sourceLinks = formQuestionsRepository.findByFormVersionIdOrderByQuestionOrder(
			sourceVersion.getId(), false);
		if (sourceLinks != null && !sourceLinks.isEmpty()) {
			List<FormQuestions> newLinks = new ArrayList<FormQuestions>();
			for (FormQuestions srcFq : sourceLinks) {
				FormQuestions newFq = new FormQuestions();
				newFq.setFormVersion(newVersion);
				newFq.setQuestion(srcFq.getQuestion());
				newFq.setQuestionOrder(srcFq.getQuestionOrder());
				newFq.setChronoOverride(srcFq.getChronoOverride());
				newFq.setIsDeleted(false);
				newFq.setCreatedAt(Utilities.getCurrentDate());
				newFq.setCreatedBy(userId);
				newLinks.add(newFq);
			}
			formQuestionsRepository.saveAll(newLinks);
		}

		return newVersion;
	}

	/**
	 * Duplicate a question for a specific (unlocked) form_version:
	 * 1. Creates a new question (same question_ref, copies all fields)
	 * 2. Duplicates all answers from the original question
	 * 3. Updates the form_questions link in this version to point to the new question
	 * 4. Returns the form_version (so frontend can reload)
	 */
	private Response<FormVersionDto> duplicateQuestionForVersion(FormVersionDto dto, Integer userId, Locale locale) throws Exception {
		Response<FormVersionDto> response = new Response<FormVersionDto>();

		if (dto.getId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id (formVersionId)", locale));
		}
		if (dto.getQuestionId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("questionId", locale));
		}

		FormVersion formVersion = formVersionRepository.findOne(dto.getId(), false);
		if (formVersion == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("formVersion id -> " + dto.getId(), locale));
		}

		if (Boolean.TRUE.equals(formVersion.getIsLocked())) {
			throw new InternalErrorException(functionalError.SAVE_FAIL(
				"La version " + formVersion.getVersionNumber() + " est verrouillée, utilisez l'action 'fork' d'abord", locale));
		}

		Question originalQuestion = questionRepository.findOne(dto.getQuestionId(), false);
		if (originalQuestion == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question id -> " + dto.getQuestionId(), locale));
		}

		// Find the form_questions link for this version + question
		List<FormQuestions> fqLinks = formQuestionsRepository.findByFormVersionId(formVersion.getId(), false);
		FormQuestions targetFq = null;
		for (FormQuestions fq : fqLinks) {
			if (fq.getQuestion() != null && fq.getQuestion().getId().equals(originalQuestion.getId())) {
				targetFq = fq;
				break;
			}
		}
		if (targetFq == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST(
				"form_questions (formVersion=" + formVersion.getId() + ", question=" + originalQuestion.getId() + ")", locale));
		}

		// 1. Duplicate the question
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

		// 2. Duplicate all answers
		List<Answer> originalAnswers = answerRepository.findByQuestionId(originalQuestion.getId(), false);
		if (originalAnswers != null && !originalAnswers.isEmpty()) {
			List<Answer> newAnswers = new ArrayList<Answer>();
			for (Answer origAnswer : originalAnswers) {
				Answer newAnswer = new Answer();
				newAnswer.setQuestion(newQuestion);
				newAnswer.setAnswerText(origAnswer.getAnswerText());
				newAnswer.setAnswerType(origAnswer.getAnswerType());
				newAnswer.setAnswerOrder(origAnswer.getAnswerOrder());
				newAnswer.setIsCorrect(origAnswer.getIsCorrect());
				newAnswer.setIsDeleted(false);
				newAnswer.setCreatedAt(Utilities.getCurrentDate());
				newAnswer.setCreatedBy(userId);
				newAnswers.add(newAnswer);
			}
			answerRepository.saveAll(newAnswers);
		}

		// 3. Update form_questions link to point to the new question
		targetFq.setQuestion(newQuestion);
		targetFq.setUpdatedAt(Utilities.getCurrentDate());
		targetFq.setUpdatedBy(userId);
		formQuestionsRepository.save(targetFq);

		// 4. Return the form_version
		FormVersionDto resultDto = FormVersionTransformer.INSTANCE.toDto(formVersion);
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setItems(Collections.singletonList(resultDto));
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

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

			if (dto.getFormId() != null && dto.getFormId() > 0) {
				Form existingForm = formRepository.findOne(dto.getFormId(), false);
				if (existingForm == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form formId -> " + dto.getFormId(), locale));
				}
				entityToSave.setForm(existingForm);
			}
			if (dto.getVersionNumber() != null) {
				entityToSave.setVersionNumber(dto.getVersionNumber());
			}
			if (dto.getIsPublished() != null) {
				entityToSave.setIsPublished(dto.getIsPublished());
			}
			if (dto.getIsLocked() != null) {
				entityToSave.setIsLocked(dto.getIsLocked());
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

			if (dto.getFormId() != null && dto.getFormId() > 0) {
				Form existingForm = formRepository.findOne(dto.getFormId(), false);
				if (existingForm == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("form formId -> " + dto.getFormId(), locale));
				}
				entityToSave.setForm(existingForm);
			}
			if (dto.getVersionNumber() != null) {
				entityToSave.setVersionNumber(dto.getVersionNumber());
			}
			if (dto.getIsPublished() != null) {
				entityToSave.setIsPublished(dto.getIsPublished());
			}
			if (dto.getIsLocked() != null) {
				entityToSave.setIsLocked(dto.getIsLocked());
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

	private FormVersionDto getFullInfos(FormVersionDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		if (dto == null || isSimpleLoading != null && isSimpleLoading) {
			return dto;
		}
		return dto;
	}
}
