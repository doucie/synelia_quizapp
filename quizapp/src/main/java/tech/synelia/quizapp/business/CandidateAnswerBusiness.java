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
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.utils.enums.QuestionType;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
 * BUSINESS for table "candidate_answer"
 */
@Log
@Component
public class CandidateAnswerBusiness implements IBasicBusiness<Request<CandidateAnswerDto>, Response<CandidateAnswerDto>> {

	private Response<CandidateAnswerDto> response;
	@Autowired
	private CandidateAnswerRepository candidateAnswerRepository;
	@Autowired
	private ApplicationsRepository applicationsRepository;
	@Autowired
	private QuestionRepository questionRepository;
	@Autowired
	private AnswerRepository answerRepository;
	@Autowired
	private PermissionService permissionService;
	@Autowired
	private ApplicationsBusiness applicationsBusiness;
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

	public CandidateAnswerBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}

	@Override
	public Response<CandidateAnswerDto> create(Request<CandidateAnswerDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin create CandidateAnswer-----");
		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		List<CandidateAnswer> items = new ArrayList<CandidateAnswer>();

		for (CandidateAnswerDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("applicationId", dto.getApplicationId());
			fieldsToVerify.put("questionId", dto.getQuestionId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if applications exist
			Applications existingApplications = null;
			if (dto.getApplicationId() != null && dto.getApplicationId() > 0) {
				existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
			}

			// Verify if question exists
			Question existingQuestion = null;
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
			}

			// Verify if answer exists (optional)
			Answer existingAnswer = null;
			if (dto.getAnswerId() != null && dto.getAnswerId() > 0) {
				existingAnswer = answerRepository.findOne(dto.getAnswerId(), false);
				if (existingAnswer == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answer answerId -> " + dto.getAnswerId(), locale));
				}
			}

			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			CandidateAnswer entityToSave = CandidateAnswerTransformer.INSTANCE.toEntity(dto, existingApplications, existingQuestion, existingAnswer);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			if (entityToSave.getIsSelected() == null) {
				entityToSave.setIsSelected(false);
			}
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CandidateAnswer> itemsSaved = candidateAnswerRepository.saveAll((Iterable<CandidateAnswer>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateAnswer", locale));
			}
			List<CandidateAnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAnswerTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateAnswerTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create CandidateAnswer-----");
		return response;
	}

	@Override
	public Response<CandidateAnswerDto> update(Request<CandidateAnswerDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin update CandidateAnswer-----");
		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		List<CandidateAnswer> items = new ArrayList<CandidateAnswer>();

		for (CandidateAnswerDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			CandidateAnswer entityToSave = candidateAnswerRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateAnswer id -> " + dto.getId(), locale));
			}

			if (dto.getApplicationId() != null && dto.getApplicationId() > 0) {
				Applications existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
				entityToSave.setApplications(existingApplications);
			}
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				Question existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestion(existingQuestion);
			}
			if (dto.getAnswerId() != null && dto.getAnswerId() > 0) {
				Answer existingAnswer = answerRepository.findOne(dto.getAnswerId(), false);
				if (existingAnswer == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answer answerId -> " + dto.getAnswerId(), locale));
				}
				entityToSave.setAnswer(existingAnswer);
			}
			if (Utilities.shouldUpdate(dto.getFreeTextResponse())) {
				entityToSave.setFreeTextResponse(dto.getFreeTextResponse());
			}
			if (dto.getIsSelected() != null) {
				entityToSave.setIsSelected(dto.getIsSelected());
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<CandidateAnswer> itemsSaved = candidateAnswerRepository.saveAll((Iterable<CandidateAnswer>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateAnswer", locale));
			}
			List<CandidateAnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAnswerTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateAnswerTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update CandidateAnswer-----");
		return response;
	}

	@Override
	public Response<CandidateAnswerDto> delete(Request<CandidateAnswerDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete CandidateAnswer-----");
		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		List<CandidateAnswer> items = new ArrayList<CandidateAnswer>();

		for (CandidateAnswerDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			CandidateAnswer existingEntity = candidateAnswerRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateAnswer -> " + dto.getId(), locale));
			}

			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			candidateAnswerRepository.saveAll((Iterable<CandidateAnswer>) items);
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end delete CandidateAnswer-----");
		return response;
	}

	@Override
	public Response<CandidateAnswerDto> getByCriteria(Request<CandidateAnswerDto> request, Locale locale) throws Exception {
		log.info("----begin get CandidateAnswer-----");
		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		List<CandidateAnswer> items = candidateAnswerRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CandidateAnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAnswerTransformer.INSTANCE.toLiteDtos(items) : CandidateAnswerTransformer.INSTANCE.toDtos(items);

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
			response.setCount(candidateAnswerRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("candidateAnswer", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get CandidateAnswer-----");
		return response;
	}

	public Response<CandidateAnswerDto> getAllByCriteria(Request<CandidateAnswerDto> request, Locale locale) throws Exception {
		log.info("----begin get ALL CandidateAnswer-----");
		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		List<CandidateAnswer> items = candidateAnswerRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<CandidateAnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAnswerTransformer.INSTANCE.toLiteDtos(items) : CandidateAnswerTransformer.INSTANCE.toDtos(items);

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
			response.setCount(candidateAnswerRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("candidateAnswer", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get ALL CandidateAnswer-----");
		return response;
	}

	public Response<CandidateAnswerDto> custom(Request<CandidateAnswerDto> request, Locale locale) throws Exception {
		log.info("----begin custom CandidateAnswerBusiness-----");
		CandidateAnswerDto dto = request.getData();
		if (dto == null && request.getDatas() != null && !request.getDatas().isEmpty()) {
			dto = request.getDatas().get(0);
		}
		if (dto == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("candidateAnswer custom payload", locale));
		}

		if ("manualCorrection".equalsIgnoreCase(StringUtils.trimToEmpty(dto.getAction()))) {
			return applyManualCorrection(dto, request.getUser(), locale);
		}

		if ("manualQuestionCorrection".equalsIgnoreCase(StringUtils.trimToEmpty(dto.getAction()))) {
			return applyQuestionManualCorrection(dto, request.getUser(), locale);
		}

		throw new InvalidEntityException(functionalError.REQUEST_FAIL(
				"Action custom candidateAnswer non supportee: " + dto.getAction(), locale));
	}

	private Response<CandidateAnswerDto> applyManualCorrection(CandidateAnswerDto dto, Integer actorUserId, Locale locale) throws Exception {
		if (dto.getId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}
		if (dto.getManualIsCorrect() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("manualIsCorrect", locale));
		}
		if (actorUserId == null || actorUserId <= 0) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
		}

		CandidateAnswer entityToSave = candidateAnswerRepository.findOne(dto.getId(), false);
		if (entityToSave == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateAnswer id -> " + dto.getId(), locale));
		}
		if (entityToSave.getApplications() == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("application linked to candidateAnswer -> " + dto.getId(), locale));
		}
		if (entityToSave.getQuestion() != null && Boolean.TRUE.equals(entityToSave.getQuestion().getManualCorrectionRequired())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Cette question requiert une note manuelle comprise entre 0 et le score de la question.", locale));
		}
		if (entityToSave.getQuestion() == null || !QuestionType.TEXT.getValue().equalsIgnoreCase(StringUtils.trimToEmpty(entityToSave.getQuestion().getQuestionType()))) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Seules les réponses libres peuvent être corrigées manuellement.", locale));
		}

		Campaigns campaign = resolveCampaignFromApplication(entityToSave.getApplications(), locale);
		boolean hasScopedRight = permissionService.hasScopedPermission(
				actorUserId,
				"CAMPAIGN",
				campaign.getId(),
				FunctionalityEnum.CORRECT_TEST.getValue(),
				"ADMIN",
				"CREATOR",
				"CORRECT_TEST");
		if (!hasScopedRight) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Accès refusé: droits insuffisants pour corriger ce test.", locale));
		}

		entityToSave.setManualIsCorrect(dto.getManualIsCorrect());
		entityToSave.setManualCorrectionComment(StringUtils.trimToNull(dto.getManualCorrectionComment()));
		entityToSave.setManualCorrectedAt(Utilities.getCurrentDate());
		entityToSave.setManualCorrectedBy(actorUserId);
		entityToSave.setUpdatedAt(Utilities.getCurrentDate());
		entityToSave.setUpdatedBy(actorUserId);
		entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
		CandidateAnswer savedEntity = candidateAnswerRepository.save(entityToSave);
		Applications updatedApplication = applicationsBusiness.refreshQuizScoringState(entityToSave.getApplications(), actorUserId);

		CandidateAnswerDto resultDto = CandidateAnswerTransformer.INSTANCE.toDto(savedEntity);
		if (updatedApplication != null) {
			resultDto.setApplicationId(updatedApplication.getId());
		}

		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage("Correction manuelle enregistrée avec succès");
		response.setHasError(false);
		response.setCount(1L);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		response.setItems(Arrays.asList(resultDto));
		return response;
	}

	private Response<CandidateAnswerDto> applyQuestionManualCorrection(CandidateAnswerDto dto, Integer actorUserId, Locale locale) throws Exception {
		if (dto.getApplicationId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("applicationId", locale));
		}
		if (dto.getQuestionId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("questionId", locale));
		}
		if (dto.getManualCorrectionScore() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("manualCorrectionScore", locale));
		}
		if (actorUserId == null || actorUserId <= 0) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
		}

		Applications application = applicationsRepository.findOne(dto.getApplicationId(), false);
		if (application == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("application id -> " + dto.getApplicationId(), locale));
		}

		Question question = questionRepository.findOne(dto.getQuestionId(), false);
		if (question == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question id -> " + dto.getQuestionId(), locale));
		}
		if (!Boolean.TRUE.equals(question.getManualCorrectionRequired())) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Cette question n'attend pas de notation manuelle questionnelle.", locale));
		}

		int questionMaxScore = Math.max(question.getScore() != null ? question.getScore() : 0, 0);
		if (dto.getManualCorrectionScore() < 0 || dto.getManualCorrectionScore() > questionMaxScore) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"La note manuelle doit être comprise entre 0 et " + questionMaxScore + ".", locale));
		}

		Campaigns campaign = resolveCampaignFromApplication(application, locale);
		boolean hasScopedRight = permissionService.hasScopedPermission(
				actorUserId,
				"CAMPAIGN",
				campaign.getId(),
				FunctionalityEnum.CORRECT_TEST.getValue(),
				"ADMIN",
				"CREATOR",
				"CORRECT_TEST");
		if (!hasScopedRight) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Accès refusé: droits insuffisants pour corriger ce test.", locale));
		}

		List<CandidateAnswer> questionAnswers = candidateAnswerRepository.findByApplicationIdAndQuestionId(
				dto.getApplicationId(),
				dto.getQuestionId(),
				false);
		CandidateAnswer entityToSave = resolveQuestionManualCorrectionCarrier(application, question, questionAnswers, actorUserId);
		entityToSave.setManualCorrectionScore(dto.getManualCorrectionScore());
		entityToSave.setManualCorrectionComment(StringUtils.trimToNull(dto.getManualCorrectionComment()));
		entityToSave.setManualCorrectedAt(Utilities.getCurrentDate());
		entityToSave.setManualCorrectedBy(actorUserId);
		entityToSave.setUpdatedAt(Utilities.getCurrentDate());
		entityToSave.setUpdatedBy(actorUserId);
		entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
		CandidateAnswer savedEntity = candidateAnswerRepository.save(entityToSave);
		Applications updatedApplication = applicationsBusiness.refreshQuizScoringState(application, actorUserId, locale);

		CandidateAnswerDto resultDto = CandidateAnswerTransformer.INSTANCE.toDto(savedEntity);
		if (updatedApplication != null) {
			resultDto.setApplicationId(updatedApplication.getId());
		}

		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage("Notation manuelle enregistrée avec succès");
		response.setHasError(false);
		response.setCount(1L);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		response.setItems(Arrays.asList(resultDto));
		return response;
	}

	private CandidateAnswer resolveQuestionManualCorrectionCarrier(Applications application, Question question, List<CandidateAnswer> questionAnswers, Integer actorUserId) {
		CandidateAnswer carrier = null;
		if (questionAnswers != null) {
			for (CandidateAnswer candidateAnswer : questionAnswers) {
				if (candidateAnswer == null || Boolean.TRUE.equals(candidateAnswer.getIsDeleted())) {
					continue;
				}
				if (carrier == null || isBetterQuestionManualCorrectionCarrier(question, candidateAnswer, carrier)) {
					carrier = candidateAnswer;
				}
			}
		}
		if (carrier != null) {
			return carrier;
		}

		CandidateAnswer fallbackCarrier = new CandidateAnswer();
		fallbackCarrier.setApplications(application);
		fallbackCarrier.setQuestion(question);
		fallbackCarrier.setAnswer(null);
		fallbackCarrier.setIsSelected(false);
		fallbackCarrier.setIsDeleted(false);
		fallbackCarrier.setCreatedAt(Utilities.getCurrentDate());
		fallbackCarrier.setCreatedBy(actorUserId);
		return fallbackCarrier;
	}

	private boolean isBetterQuestionManualCorrectionCarrier(Question question, CandidateAnswer candidate, CandidateAnswer current) {
		if (candidate == null) {
			return false;
		}
		if (current == null) {
			return true;
		}

		if (candidate.getManualCorrectionScore() != null && current.getManualCorrectionScore() == null) {
			return true;
		}
		if (candidate.getManualCorrectionScore() == null && current.getManualCorrectionScore() != null) {
			return false;
		}

		boolean isTextQuestion = question != null
				&& QuestionType.TEXT.getValue().equalsIgnoreCase(StringUtils.trimToEmpty(question.getQuestionType()));
		if (isTextQuestion) {
			if (candidate.getAnswer() == null && current.getAnswer() != null) {
				return true;
			}
			if (candidate.getAnswer() != null && current.getAnswer() == null) {
				return false;
			}
		}

		Integer candidateOrder = candidate.getAnswer() != null ? candidate.getAnswer().getAnswerOrder() : null;
		Integer currentOrder = current.getAnswer() != null ? current.getAnswer().getAnswerOrder() : null;
		if (candidateOrder != null && currentOrder != null && !candidateOrder.equals(currentOrder)) {
			return candidateOrder < currentOrder;
		}
		if (candidateOrder != null && currentOrder == null) {
			return true;
		}
		if (candidateOrder == null && currentOrder != null) {
			return false;
		}

		Integer candidateAnswerId = candidate.getAnswer() != null ? candidate.getAnswer().getId() : null;
		Integer currentAnswerId = current.getAnswer() != null ? current.getAnswer().getId() : null;
		if (candidateAnswerId != null && currentAnswerId != null && !candidateAnswerId.equals(currentAnswerId)) {
			return candidateAnswerId < currentAnswerId;
		}
		if (candidateAnswerId != null && currentAnswerId == null) {
			return true;
		}
		if (candidateAnswerId == null && currentAnswerId != null) {
			return false;
		}

		Integer candidateId = candidate.getId();
		Integer currentId = current.getId();
		if (candidateId != null && currentId != null && !candidateId.equals(currentId)) {
			return candidateId < currentId;
		}

		return false;
	}

	private Campaigns resolveCampaignFromApplication(Applications application, Locale locale) {
		if (application != null && application.getSourceToken() != null && application.getSourceToken().getCampaigns() != null) {
			return application.getSourceToken().getCampaigns();
		}
		throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST(
				"campaign linked to application -> " + (application != null ? application.getId() : null), locale));
	}

	public Response<CandidateAnswerDto> updateDeleted(Request<CandidateAnswerDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted CandidateAnswer-----");
		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		List<CandidateAnswer> items = new ArrayList<CandidateAnswer>();

		for (CandidateAnswerDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			CandidateAnswer entityToSave = candidateAnswerRepository.findOne(dto.getId(), true);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateAnswer id -> " + dto.getId(), locale));
			}

			if (dto.getApplicationId() != null && dto.getApplicationId() > 0) {
				Applications existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
				entityToSave.setApplications(existingApplications);
			}
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				Question existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestion(existingQuestion);
			}
			if (dto.getAnswerId() != null && dto.getAnswerId() > 0) {
				Answer existingAnswer = answerRepository.findOne(dto.getAnswerId(), false);
				if (existingAnswer == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answer answerId -> " + dto.getAnswerId(), locale));
				}
				entityToSave.setAnswer(existingAnswer);
			}
			if (Utilities.shouldUpdate(dto.getFreeTextResponse())) {
				entityToSave.setFreeTextResponse(dto.getFreeTextResponse());
			}
			if (dto.getIsSelected() != null) {
				entityToSave.setIsSelected(dto.getIsSelected());
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
			List<CandidateAnswer> itemsSaved = candidateAnswerRepository.saveAll((Iterable<CandidateAnswer>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateAnswer", locale));
			}
			List<CandidateAnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAnswerTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateAnswerTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateDeleted CandidateAnswer-----");
		return response;
	}

	public Response<CandidateAnswerDto> updateAll(Request<CandidateAnswerDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateAll CandidateAnswer-----");
		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		List<CandidateAnswer> items = new ArrayList<CandidateAnswer>();

		for (CandidateAnswerDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			CandidateAnswer entityToSave = candidateAnswerRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				entityToSave = candidateAnswerRepository.findOne(dto.getId(), true);
			}
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateAnswer id -> " + dto.getId(), locale));
			}

			if (dto.getApplicationId() != null && dto.getApplicationId() > 0) {
				Applications existingApplications = applicationsRepository.findOne(dto.getApplicationId(), false);
				if (existingApplications == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("applications applicationId -> " + dto.getApplicationId(), locale));
				}
				entityToSave.setApplications(existingApplications);
			}
			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				Question existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestion(existingQuestion);
			}
			if (dto.getAnswerId() != null && dto.getAnswerId() > 0) {
				Answer existingAnswer = answerRepository.findOne(dto.getAnswerId(), false);
				if (existingAnswer == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answer answerId -> " + dto.getAnswerId(), locale));
				}
				entityToSave.setAnswer(existingAnswer);
			}
			if (Utilities.shouldUpdate(dto.getFreeTextResponse())) {
				entityToSave.setFreeTextResponse(dto.getFreeTextResponse());
			}
			if (dto.getIsSelected() != null) {
				entityToSave.setIsSelected(dto.getIsSelected());
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
			List<CandidateAnswer> itemsSaved = candidateAnswerRepository.saveAll((Iterable<CandidateAnswer>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("candidateAnswer", locale));
			}
			List<CandidateAnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? CandidateAnswerTransformer.INSTANCE.toLiteDtos(itemsSaved) : CandidateAnswerTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateAll CandidateAnswer-----");
		return response;
	}

	private CandidateAnswerDto getFullInfos(CandidateAnswerDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		if (dto == null || isSimpleLoading != null && isSimpleLoading) {
			return dto;
		}
		return dto;
	}
}
