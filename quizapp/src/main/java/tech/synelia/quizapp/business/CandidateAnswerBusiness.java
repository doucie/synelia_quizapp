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
			if (Utilities.notBlank(dto.getFreeTextResponse())) {
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
		Response<CandidateAnswerDto> response = new Response<CandidateAnswerDto>();
		response.setHasError(false);
		response.setCount(1L);
		response.setHttpCode(HttpStatus.OK.value());
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setStatus(status);
		return response;
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
			if (Utilities.notBlank(dto.getFreeTextResponse())) {
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
			if (Utilities.notBlank(dto.getFreeTextResponse())) {
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
