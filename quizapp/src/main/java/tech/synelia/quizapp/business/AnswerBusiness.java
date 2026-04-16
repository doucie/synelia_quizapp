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
 * BUSINESS for table "answer"
 */
@Log
@Component
public class AnswerBusiness implements IBasicBusiness<Request<AnswerDto>, Response<AnswerDto>> {

	private Response<AnswerDto> response;
	@Autowired
	private AnswerRepository answerRepository;
	@Autowired
	private QuestionRepository questionRepository;
	@Autowired
	private CandidateAnswerRepository candidateAnswerRepository;
	@Autowired
	private FormQuestionsRepository formQuestionsRepository;
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

	public AnswerBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}

	@Override
	public Response<AnswerDto> create(Request<AnswerDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin create Answer-----");
		Response<AnswerDto> response = new Response<AnswerDto>();
		List<Answer> items = new ArrayList<Answer>();

		for (AnswerDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("answerText", dto.getAnswerText());
			fieldsToVerify.put("answerType", dto.getAnswerType());
			fieldsToVerify.put("questionId", dto.getQuestionId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
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
			Answer entityToSave = AnswerTransformer.INSTANCE.toEntity(dto, existingQuestion);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			if (entityToSave.getIsCorrect() == null) {
				entityToSave.setIsCorrect(false);
			}
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Answer> itemsSaved = answerRepository.saveAll((Iterable<Answer>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("answer", locale));
			}
			List<AnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? AnswerTransformer.INSTANCE.toLiteDtos(itemsSaved) : AnswerTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end create Answer-----");
		return response;
	}

	@Override
	public Response<AnswerDto> update(Request<AnswerDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin update Answer-----");
		Response<AnswerDto> response = new Response<AnswerDto>();
		List<Answer> items = new ArrayList<Answer>();

		for (AnswerDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Answer entityToSave = answerRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answer id -> " + dto.getId(), locale));
			}

			// Vérifier si la réponse est liée à une question dans un formulaire verrouillé
			if (entityToSave.getQuestion() != null) {
				List<FormQuestions> linkedFqs = formQuestionsRepository.findByQuestionId(entityToSave.getQuestion().getId(), false);
				if (linkedFqs != null) {
					for (FormQuestions fq : linkedFqs) {
						if (fq.getFormVersion() != null && Boolean.TRUE.equals(fq.getFormVersion().getIsLocked())) {
							throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE(
								"Cette réponse est dans un formulaire verrouillé (version " + fq.getFormVersion().getVersionNumber() + ")", locale));
						}
					}
				}
			}

			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				Question existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestion(existingQuestion);
			}
			if (Utilities.shouldUpdate(dto.getAnswerText())) {
				entityToSave.setAnswerText(dto.getAnswerText());
			}
			if (Utilities.shouldUpdate(dto.getAnswerType())) {
				entityToSave.setAnswerType(dto.getAnswerType());
			}
			if (dto.getAnswerOrder() != null) {
				entityToSave.setAnswerOrder(dto.getAnswerOrder());
			}
			if (dto.getIsCorrect() != null) {
				entityToSave.setIsCorrect(dto.getIsCorrect());
			}
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entityToSave)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Answer> itemsSaved = answerRepository.saveAll((Iterable<Answer>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("answer", locale));
			}
			List<AnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? AnswerTransformer.INSTANCE.toLiteDtos(itemsSaved) : AnswerTransformer.INSTANCE.toDtos(itemsSaved);

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
		log.info("----end update Answer-----");
		return response;
	}

	@Override
	public Response<AnswerDto> delete(Request<AnswerDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Answer-----");
		Response<AnswerDto> response = new Response<AnswerDto>();
		List<Answer> items = new ArrayList<Answer>();

		for (AnswerDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Answer existingEntity = answerRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answer -> " + dto.getId(), locale));
			}

			// Vérifier si la réponse est liée à une question dans un formulaire verrouillé
			if (existingEntity.getQuestion() != null) {
				List<FormQuestions> linkedFqs = formQuestionsRepository.findByQuestionId(existingEntity.getQuestion().getId(), false);
				if (linkedFqs != null) {
					for (FormQuestions fq : linkedFqs) {
						if (fq.getFormVersion() != null && Boolean.TRUE.equals(fq.getFormVersion().getIsLocked())) {
							throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE(
								"Cette réponse est dans un formulaire verrouillé (version " + fq.getFormVersion().getVersionNumber() + ")", locale));
						}
					}
				}
			}

			// Check if data is used by candidateAnswer
			List<CandidateAnswer> listOfCandidateAnswer = candidateAnswerRepository.findByAnswerId(existingEntity.getId(), false);
			if (listOfCandidateAnswer != null && !listOfCandidateAnswer.isEmpty()) {
				throw new InternalErrorException(functionalError.DATA_NOT_DELETABLE("(" + listOfCandidateAnswer.size() + ")", locale));
			}

			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			answerRepository.saveAll((Iterable<Answer>) items);
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end delete Answer-----");
		return response;
	}

	@Override
	public Response<AnswerDto> getByCriteria(Request<AnswerDto> request, Locale locale) throws Exception {
		log.info("----begin get Answer-----");
		Response<AnswerDto> response = new Response<AnswerDto>();
		List<Answer> items = answerRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<AnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? AnswerTransformer.INSTANCE.toLiteDtos(items) : AnswerTransformer.INSTANCE.toDtos(items);

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
			response.setCount(answerRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("answer", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get Answer-----");
		return response;
	}

	public Response<AnswerDto> getAllByCriteria(Request<AnswerDto> request, Locale locale) throws Exception {
		log.info("----begin get ALL Answer-----");
		Response<AnswerDto> response = new Response<AnswerDto>();
		List<Answer> items = answerRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<AnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? AnswerTransformer.INSTANCE.toLiteDtos(items) : AnswerTransformer.INSTANCE.toDtos(items);

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
			response.setCount(answerRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("answer", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get ALL Answer-----");
		return response;
	}

	public Response<AnswerDto> custom(Request<AnswerDto> request, Locale locale) throws Exception {
		log.info("----begin custom AnswerBusiness-----");
		Response<AnswerDto> response = new Response<AnswerDto>();
		response.setHasError(false);
		response.setCount(1L);
		response.setHttpCode(HttpStatus.OK.value());
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setStatus(status);
		return response;
	}

	public Response<AnswerDto> updateDeleted(Request<AnswerDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateDeleted Answer-----");
		Response<AnswerDto> response = new Response<AnswerDto>();
		List<Answer> items = new ArrayList<Answer>();

		for (AnswerDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Answer entityToSave = answerRepository.findOne(dto.getId(), true);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answer id -> " + dto.getId(), locale));
			}

			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				Question existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestion(existingQuestion);
			}
			if (Utilities.shouldUpdate(dto.getAnswerText())) {
				entityToSave.setAnswerText(dto.getAnswerText());
			}
			if (Utilities.shouldUpdate(dto.getAnswerType())) {
				entityToSave.setAnswerType(dto.getAnswerType());
			}
			if (dto.getAnswerOrder() != null) {
				entityToSave.setAnswerOrder(dto.getAnswerOrder());
			}
			if (dto.getIsCorrect() != null) {
				entityToSave.setIsCorrect(dto.getIsCorrect());
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
			List<Answer> itemsSaved = answerRepository.saveAll((Iterable<Answer>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("answer", locale));
			}
			List<AnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? AnswerTransformer.INSTANCE.toLiteDtos(itemsSaved) : AnswerTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateDeleted Answer-----");
		return response;
	}

	public Response<AnswerDto> updateAll(Request<AnswerDto> request, Locale locale) throws ParseException, JsonProcessingException {
		log.info("----begin updateAll Answer-----");
		Response<AnswerDto> response = new Response<AnswerDto>();
		List<Answer> items = new ArrayList<Answer>();

		for (AnswerDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			Answer entityToSave = answerRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				entityToSave = answerRepository.findOne(dto.getId(), true);
			}
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("answer id -> " + dto.getId(), locale));
			}

			if (dto.getQuestionId() != null && dto.getQuestionId() > 0) {
				Question existingQuestion = questionRepository.findOne(dto.getQuestionId(), false);
				if (existingQuestion == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("question questionId -> " + dto.getQuestionId(), locale));
				}
				entityToSave.setQuestion(existingQuestion);
			}
			if (Utilities.shouldUpdate(dto.getAnswerText())) {
				entityToSave.setAnswerText(dto.getAnswerText());
			}
			if (Utilities.shouldUpdate(dto.getAnswerType())) {
				entityToSave.setAnswerType(dto.getAnswerType());
			}
			if (dto.getAnswerOrder() != null) {
				entityToSave.setAnswerOrder(dto.getAnswerOrder());
			}
			if (dto.getIsCorrect() != null) {
				entityToSave.setIsCorrect(dto.getIsCorrect());
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
			List<Answer> itemsSaved = answerRepository.saveAll((Iterable<Answer>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("answer", locale));
			}
			List<AnswerDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? AnswerTransformer.INSTANCE.toLiteDtos(itemsSaved) : AnswerTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateAll Answer-----");
		return response;
	}

	private AnswerDto getFullInfos(AnswerDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		if (dto == null || isSimpleLoading != null && isSimpleLoading) {
			return dto;
		}
		return dto;
	}
}
