                                                											
/*
 * Java business for entity table evaluations 
 * Created on 2025-08-22 ( Time 11:38:26 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.business;

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
import java.util.logging.Logger;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.dao.entity.Evaluations;
import tech.synelia.quizapp.dao.entity.CandidateInterview;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
BUSINESS for table "evaluations"
 * 
 * @author Geo
 *
 */
@Component
public class EvaluationsBusiness implements IBasicBusiness<Request<EvaluationsDto>, Response<EvaluationsDto>> {

	private static final Logger log = Logger.getLogger(EvaluationsBusiness.class.getName());
	private static final String EVALUATION_STATUS_SUBMITTED = "SUBMITTED";

	private Response<EvaluationsDto> response;
	@Autowired
	private EvaluationsRepository evaluationsRepository;
	@Autowired
	private CandidateInterviewRepository candidateInterviewRepository;
	@Autowired
	private InterviewParticipantRepository interviewParticipantRepository;
	@Autowired
	private EvaluationItemRepository evaluationItemRepository;
	@Autowired
	private PipelineStageEvaluationCriterionRepository pipelineStageEvaluationCriterionRepository;
	@Autowired
	private InterviewsRepository interviewsRepository;
	@Autowired
	private ApplicationsRepository applicationsRepository;
	@Autowired
	private PipelineStageRepository pipelineStageRepository;
	@Autowired
	private ApplicationProgressRepository applicationProgressRepository;
	@Autowired
	private ApplicationProgressBusiness applicationProgressBusiness;
	@Autowired
	private AuditEventService auditEventService;
	@Autowired
	private PermissionService permissionService;
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

	public EvaluationsBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	/**
	 * create Evaluations by using EvaluationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<EvaluationsDto> create(Request<EvaluationsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create Evaluations-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		List<Evaluations>        items    = new ArrayList<Evaluations>();
		List<Integer> affectedCandidateInterviewIds = new ArrayList<Integer>();
		List<Integer> affectedInterviewParticipantIds = new ArrayList<Integer>();
			
		for (EvaluationsDto dto : request.getDatas()) {
			applyDerivedCandidateMark(dto);
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("candidateMark", dto.getCandidateMark());
			fieldsToVerify.put("recruiterComment", dto.getRecruiterComment());
			fieldsToVerify.put("candidateInterviewId", dto.getCandidateInterviewId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Validate candidateMark range [0, 100]
			if (dto.getCandidateMark() != null && (dto.getCandidateMark() < 0 || dto.getCandidateMark() > 100)) {
				throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("candidateMark must be between 0 and 100 -> " + dto.getCandidateMark(), locale));
			}

			// Verify if evaluations to insert do not exist
			Evaluations existingEntity = null;
			if (existingEntity != null) {
				throw new InternalErrorException(functionalError.DATA_EXIST("evaluations id -> " + dto.getId(), locale));
			}

			// Verify if candidateInterview exist
			CandidateInterview existingCandidateInterview = null;
			if (dto.getCandidateInterviewId() != null && dto.getCandidateInterviewId() > 0){
				existingCandidateInterview = candidateInterviewRepository.findOne(dto.getCandidateInterviewId(), false);
				if (existingCandidateInterview == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateInterview candidateInterviewId -> " + dto.getCandidateInterviewId(), locale));
				}
			}
			ensureEvaluationAllowed(
					existingCandidateInterview,
					request.getUser(),
					locale,
					"saisir cette évaluation",
					FunctionalityEnum.CREATE_EVALUATIONS.getValue());
			InterviewParticipant interviewParticipant = resolveInterviewParticipant(dto, existingCandidateInterview, request.getUser(), locale);
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			Evaluations entityToSave = null;
			entityToSave = EvaluationsTransformer.INSTANCE.toEntity(dto, existingCandidateInterview, interviewParticipant);
			Date submittedAt = Utilities.getCurrentDate();
			entityToSave.setCreatedAt(submittedAt);
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			entityToSave.setEvaluationStatus(EVALUATION_STATUS_SUBMITTED);
			entityToSave.setSubmittedAt(submittedAt);
			items.add(entityToSave);
			affectedCandidateInterviewIds.add(dto.getCandidateInterviewId());
			if (interviewParticipant != null && interviewParticipant.getId() != null) {
				affectedInterviewParticipantIds.add(interviewParticipant.getId());
			}
		}

		if (!items.isEmpty()) {
			List<Evaluations> itemsSaved = null;
			// inserer les donnees en base de donnees
			itemsSaved = evaluationsRepository.saveAll((Iterable<Evaluations>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("evaluations", locale));
			}
			persistEvaluationItemsForSavedEvaluations(itemsSaved, request.getDatas(), request.getUser(), locale);
			for (Evaluations savedEvaluation : itemsSaved) {
				recordEvaluationAuditEvent(
						savedEvaluation,
						request.getUser(),
						null,
						buildEvaluationAuditStateJson(savedEvaluation),
						"EVALUATION_CREATED");
			}
			List<EvaluationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? EvaluationsTransformer.INSTANCE.toLiteDtos(itemsSaved) : EvaluationsTransformer.INSTANCE.toDtos(itemsSaved);

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
			
			recalculateEvaluationAggregates(affectedCandidateInterviewIds, request.getUser(), locale);
			syncInterviewParticipantTracking(affectedInterviewParticipantIds, request.getUser());
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end create Evaluations-----");
		return response;
	}

	/**
	 * update Evaluations by using EvaluationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<EvaluationsDto> update(Request<EvaluationsDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update Evaluations-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		List<Evaluations>        items    = new ArrayList<Evaluations>();
		List<Integer> affectedCandidateInterviewIds = new ArrayList<Integer>();
		List<Integer> affectedInterviewParticipantIds = new ArrayList<Integer>();
		Map<Integer, String> beforeStateByEvaluationId = new HashMap<>();
			
		for (EvaluationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la evaluations existe
			Evaluations entityToSave = null;
			entityToSave = evaluationsRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("evaluations id -> " + dto.getId(), locale));
			}
			beforeStateByEvaluationId.put(entityToSave.getId(), buildEvaluationAuditStateJson(entityToSave));
			CandidateInterview permissionCandidateInterview = entityToSave.getCandidateInterview() != null
					? candidateInterviewRepository.findOne(entityToSave.getCandidateInterview().getId(), false)
					: null;
			if (entityToSave.getCandidateInterview() != null && entityToSave.getCandidateInterview().getId() != null) {
				affectedCandidateInterviewIds.add(entityToSave.getCandidateInterview().getId());
			}
			if (entityToSave.getInterviewParticipant() != null && entityToSave.getInterviewParticipant().getId() != null) {
				affectedInterviewParticipantIds.add(entityToSave.getInterviewParticipant().getId());
			}

			// Verify if candidateInterview exist
			boolean candidateInterviewRetargeted = false;
			if (dto.getCandidateInterviewId() != null && dto.getCandidateInterviewId() > 0){
				CandidateInterview existingCandidateInterview = candidateInterviewRepository.findOne(dto.getCandidateInterviewId(), false);
				if (existingCandidateInterview == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateInterview candidateInterviewId -> " + dto.getCandidateInterviewId(), locale));
				}
				entityToSave.setCandidateInterview(existingCandidateInterview);
				permissionCandidateInterview = existingCandidateInterview;
				affectedCandidateInterviewIds.add(dto.getCandidateInterviewId());
				candidateInterviewRetargeted = true;
			}
			ensureEvaluationAllowed(
					permissionCandidateInterview,
					request.getUser(),
					locale,
					"modifier cette évaluation",
					FunctionalityEnum.UPDATE_EVALUATIONS.getValue());
			InterviewParticipant interviewParticipant = resolveInterviewParticipant(dto, permissionCandidateInterview, request.getUser(), locale);
			applyDerivedCandidateMark(dto);
			if (interviewParticipant != null) {
				entityToSave.setInterviewParticipant(interviewParticipant);
				affectedInterviewParticipantIds.add(interviewParticipant.getId());
			} else if ((dto.getInterviewParticipantId() != null && dto.getInterviewParticipantId() > 0) || candidateInterviewRetargeted) {
				entityToSave.setInterviewParticipant(null);
			}
			if (dto.getCandidateMark() != null) {
				if (dto.getCandidateMark() > 100) {
					throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("candidateMark must be between 0 and 100 -> " + dto.getCandidateMark(), locale));
				}
				entityToSave.setCandidateMark(dto.getCandidateMark());
			}
			if (Utilities.shouldUpdate(dto.getRecruiterComment())) {
				entityToSave.setRecruiterComment(dto.getRecruiterComment());
			}
			if (dto.getCreatedBy() != null && dto.getCreatedBy() > 0) {
				entityToSave.setCreatedBy(dto.getCreatedBy());
			}
			if (dto.getUpdatedBy() != null && dto.getUpdatedBy() > 0) {
				entityToSave.setUpdatedBy(dto.getUpdatedBy());
			}
			if (Utilities.shouldUpdate(dto.getSearchString())) {
				entityToSave.setSearchString(dto.getSearchString());
			}
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setUpdatedBy(request.getUser());
			if (!Utilities.notBlank(entityToSave.getEvaluationStatus())) {
				entityToSave.setEvaluationStatus(EVALUATION_STATUS_SUBMITTED);
			}
			if (entityToSave.getSubmittedAt() == null) {
				entityToSave.setSubmittedAt(entityToSave.getUpdatedAt());
			}
			upsertEvaluationItemsIfProvided(entityToSave, dto, request.getUser(), locale);
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<Evaluations> itemsSaved = null;
			// maj les donnees en base
			itemsSaved = evaluationsRepository.saveAll((Iterable<Evaluations>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("evaluations", locale));
			}
			for (Evaluations savedEvaluation : itemsSaved) {
				recordEvaluationAuditEvent(
						savedEvaluation,
						request.getUser(),
						beforeStateByEvaluationId.get(savedEvaluation.getId()),
						buildEvaluationAuditStateJson(savedEvaluation),
						"EVALUATION_UPDATED");
			}
			List<EvaluationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? EvaluationsTransformer.INSTANCE.toLiteDtos(itemsSaved) : EvaluationsTransformer.INSTANCE.toDtos(itemsSaved);

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
			recalculateEvaluationAggregates(affectedCandidateInterviewIds, request.getUser(), locale);
			syncInterviewParticipantTracking(affectedInterviewParticipantIds, request.getUser());
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end update Evaluations-----");
		return response;
	}

	/**
	 * delete Evaluations by using EvaluationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<EvaluationsDto> delete(Request<EvaluationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete Evaluations-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		List<Evaluations>        items    = new ArrayList<Evaluations>();
		List<Integer> affectedCandidateInterviewIds = new ArrayList<Integer>();
		List<Integer> affectedInterviewParticipantIds = new ArrayList<Integer>();
		Map<Integer, String> beforeStateByEvaluationId = new HashMap<>();
			
		for (EvaluationsDto dto : request.getDatas()) {
			// Definir les parametres obligatoires
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verifier si la evaluations existe
			Evaluations existingEntity = null;
			existingEntity = evaluationsRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("evaluations -> " + dto.getId(), locale));
			}
			CandidateInterview permissionCandidateInterview = existingEntity.getCandidateInterview() != null
					? candidateInterviewRepository.findOne(existingEntity.getCandidateInterview().getId(), false)
					: null;
			ensureEvaluationAllowed(
					permissionCandidateInterview,
					request.getUser(),
					locale,
					"supprimer cette évaluation",
					FunctionalityEnum.DELETE_EVALUATIONS.getValue());
			beforeStateByEvaluationId.put(existingEntity.getId(), buildEvaluationAuditStateJson(existingEntity));
			if (existingEntity.getCandidateInterview() != null && existingEntity.getCandidateInterview().getId() != null) {
				affectedCandidateInterviewIds.add(existingEntity.getCandidateInterview().getId());
			}
			if (existingEntity.getInterviewParticipant() != null && existingEntity.getInterviewParticipant().getId() != null) {
				affectedInterviewParticipantIds.add(existingEntity.getInterviewParticipant().getId());
			}
			softDeleteEvaluationItems(existingEntity, request.getUser());

			// -----------------------------------------------------------------------
			// ----------- CHECK IF DATA IS USED
			// -----------------------------------------------------------------------



			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			// supprimer les donnees en base
			List<Evaluations> itemsSaved = evaluationsRepository.saveAll((Iterable<Evaluations>) items);
			for (Evaluations savedEvaluation : itemsSaved) {
				recordEvaluationAuditEvent(
						savedEvaluation,
						request.getUser(),
						beforeStateByEvaluationId.get(savedEvaluation.getId()),
						buildEvaluationAuditStateJson(savedEvaluation),
						"EVALUATION_DELETED");
			}
			recalculateEvaluationAggregates(affectedCandidateInterviewIds, request.getUser(), locale);
			syncInterviewParticipantTracking(affectedInterviewParticipantIds, request.getUser());

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end delete Evaluations-----");
		return response;
	}

	/**
	 * get Evaluations by using EvaluationsDto as object.
	 * 
	 * @param request
	 * @return response
	 * 
	 */
	@Override
	public Response<EvaluationsDto> getByCriteria(Request<EvaluationsDto> request, Locale locale)  throws Exception {
		log.info("----begin get Evaluations-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		List<Evaluations> items 			 = evaluationsRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<EvaluationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? EvaluationsTransformer.INSTANCE.toLiteDtos(items) : EvaluationsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(evaluationsRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("evaluations", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get Evaluations-----");
		return response;
	}

	/**
	 * get ALL Evaluations by using EvaluationsDto as object (including deleted).
	 *
	 * @param request
	 * @return response
	 *
	 */
	public Response<EvaluationsDto> getAllByCriteria(Request<EvaluationsDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL Evaluations (including deleted)-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		List<Evaluations> items 			 = evaluationsRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<EvaluationsDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? EvaluationsTransformer.INSTANCE.toLiteDtos(items) : EvaluationsTransformer.INSTANCE.toDtos(items);

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
			response.setCount(evaluationsRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("evaluations", locale));
			response.setHasError(false);
			return response;
		}
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end get ALL Evaluations-----");
		return response;
	}

	/**
	 * get full EvaluationsDto by using Evaluations as object.
	 * 
	 * @param dto
	 * @param size
	 * @param isSimpleLoading
	 * @param locale
	 * @return
	 * @throws Exception
	 */
	public EvaluationsDto getFullInfos(EvaluationsDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		// put code here

		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (dto.getId() != null && dto.getId() > 0) {
			dto.setEvaluationItems(loadEvaluationItems(dto.getId()));
		}

		return dto;
	}

	public Response<EvaluationsDto> getCriteria(Request<EvaluationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin getCriteria Evaluations-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));

		EvaluationsDto requestDto = resolveCriteriaRequestDto(request, locale);
		CandidateInterview candidateInterview = candidateInterviewRepository.findOne(requestDto.getCandidateInterviewId(), false);
		if (candidateInterview == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateInterview candidateInterviewId -> " + requestDto.getCandidateInterviewId(), locale));
		}

		ensureEvaluationAllowed(
				candidateInterview,
				request.getUser(),
				locale,
				"consulter les criteres d'evaluation",
				FunctionalityEnum.VIEW_EVALUATIONS.getValue());

		EvaluationsDto responseDto = new EvaluationsDto();
		responseDto.setCandidateInterviewId(candidateInterview.getId());
		responseDto.setEvaluationItems(loadStageCriteria(candidateInterview, locale));

		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setStatus(status);
		response.setItems(List.of(responseDto));
		response.setCount(1L);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());

		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end getCriteria Evaluations-----");
		return response;
	}

	public Response<EvaluationsDto> custom(Request<EvaluationsDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom EvaluationsDto-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<EvaluationsDto> response = new Response<EvaluationsDto>();
		
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new EvaluationsDto()));
		log.info("Response return --:> " + Utilities.convertObjectToJson(response));
		log.info("----end custom EvaluationsDto-----");
		return response;
	}

	private void applyDerivedCandidateMark(EvaluationsDto dto) {
		if (dto == null) {
			return;
		}
		Integer derivedCandidateMark = deriveCandidateMarkFromEvaluationItems(dto.getEvaluationItems());
		if (derivedCandidateMark != null) {
			dto.setCandidateMark(derivedCandidateMark);
		}
	}

	private Integer deriveCandidateMarkFromEvaluationItems(List<EvaluationItemDto> evaluationItems) {
		if (evaluationItems == null || evaluationItems.isEmpty()) {
			return null;
		}

		double totalWeightedScore = 0d;
		double totalWeight = 0d;
		for (EvaluationItemDto evaluationItem : evaluationItems) {
			if (evaluationItem == null || evaluationItem.getScoreValue() == null) {
				continue;
			}

			String criterionType = evaluationItem.getCriterionType();
			Double maxScoreSnapshot = evaluationItem.getMaxScoreSnapshot();
			Double weightSnapshot = evaluationItem.getWeightSnapshot();
			if ((criterionType == null || maxScoreSnapshot == null || weightSnapshot == null || weightSnapshot <= 0d)
					&& evaluationItem.getPipelineStageEvaluationCriterionId() != null
					&& evaluationItem.getPipelineStageEvaluationCriterionId() > 0) {
				PipelineStageEvaluationCriterion criterion = pipelineStageEvaluationCriterionRepository.findOne(
						evaluationItem.getPipelineStageEvaluationCriterionId(),
						false);
				if (criterion != null) {
					if (criterionType == null) {
						criterionType = criterion.getCriterionType();
					}
					if (maxScoreSnapshot == null) {
						maxScoreSnapshot = criterion.getMaxScore();
					}
					if (weightSnapshot == null || weightSnapshot <= 0d) {
						weightSnapshot = criterion.getWeight();
					}
				}
			}

			if (maxScoreSnapshot == null || maxScoreSnapshot <= 0d || "TEXT".equalsIgnoreCase(criterionType)) {
				continue;
			}
			double weight = weightSnapshot != null && weightSnapshot > 0d
					? weightSnapshot
					: 1d;
			double normalizedScore = evaluationItem.getScoreValue() / maxScoreSnapshot;
			normalizedScore = Math.max(0d, Math.min(1d, normalizedScore));
			totalWeightedScore += normalizedScore * weight;
			totalWeight += weight;
		}

		if (totalWeight <= 0d) {
			return null;
		}
		return (int) Math.round((totalWeightedScore / totalWeight) * 100d);
	}

	private void recalculateEvaluationAggregates(List<Integer> candidateInterviewIds, Integer userId, Locale locale) {
		if (candidateInterviewIds == null || candidateInterviewIds.isEmpty()) {
			return;
		}

		LinkedHashSet<Integer> distinctIds = new LinkedHashSet<Integer>(candidateInterviewIds);
		for (Integer candidateInterviewId : distinctIds) {
			if (candidateInterviewId == null) {
				continue;
			}
			try {
				recalculateEvaluationAggregatesForCandidateInterview(candidateInterviewId, userId, locale);
			} catch (Exception exception) {
				log.warning("Erreur lors du recalcul des agrégats d'évaluation pour candidateInterview " + candidateInterviewId + ": " + exception.getMessage());
			}
		}
	}

	private void recalculateEvaluationAggregatesForCandidateInterview(Integer candidateInterviewId, Integer userId, Locale locale) {
		CandidateInterview candidateInterview = candidateInterviewRepository.findOne(candidateInterviewId, false);
		if (candidateInterview == null || candidateInterview.getInterviews() == null || candidateInterview.getApplications() == null) {
			return;
		}

		Interviews interview = interviewsRepository.findOne(candidateInterview.getInterviews().getId(), false);
		Applications application = applicationsRepository.findOne(candidateInterview.getApplications().getId(), false);
		if (interview == null || application == null) {
			return;
		}

		Integer interviewScore = evaluationsRepository.sumMarksByInterviewId(interview.getId());
		Long interviewCount = evaluationsRepository.countByInterviewId(interview.getId());
		double interviewPercentage = interviewCount != null && interviewCount > 0
				? (double) interviewScore / interviewCount
				: 0d;

		interview.setEvaluationScore(interviewScore);
		interview.setEvaluationNumber(interviewCount != null ? interviewCount.intValue() : 0);
		interview.setEvaluationPercentage(interviewPercentage);
		interview.setUpdatedAt(Utilities.getCurrentDate());
		interview.setUpdatedBy(userId);
		interviewsRepository.save(interview);

		Integer applicationScore = evaluationsRepository.sumMarksByApplicationId(application.getId());
		Long applicationCount = evaluationsRepository.countByApplicationId(application.getId());
		double applicationPercentage = applicationCount != null && applicationCount > 0
				? (double) applicationScore / applicationCount
				: 0d;

		application.setTotalEvaluationScore(applicationScore != null ? applicationScore.floatValue() : 0f);
		application.setTotalEvaluationNumber(applicationCount != null ? applicationCount.intValue() : 0);
		application.setTotalEvaluationPercentage(applicationPercentage);
		applyCurrentInterviewSummary(application, resolveCurrentInterviewSummary(application.getId(), interview));
		application.setUpdatedAt(Utilities.getCurrentDate());
		application.setUpdatedBy(userId);
		applicationsRepository.save(application);

		try {
			applicationProgressBusiness.syncInterviewEvaluationStages(
					application.getId(),
					interview.getApplicationProgress() != null ? interview.getApplicationProgress().getId() : null,
					interviewPercentage,
					"OVER".equalsIgnoreCase(interview.getInterviewStatus()),
					userId,
					locale);
		} catch (ParseException exception) {
			throw new RuntimeException(exception);
		}
	}

	private void applyCurrentInterviewSummary(Applications application, Interviews currentInterview) {
		if (application == null) {
			return;
		}

		if (currentInterview == null) {
			application.setInterviewDate(null);
			application.setInterviewStatus(null);
			application.setCurrentInterviewEvaluationScore(null);
			application.setCurrentInterviewEvaluationNumber(null);
			application.setCurrentInterviewEvaluationPercentage(null);
			return;
		}

		application.setInterviewDate(currentInterview.getInterviewDate());
		application.setInterviewStatus(currentInterview.getInterviewStatus());
		application.setCurrentInterviewEvaluationScore(currentInterview.getEvaluationScore());
		application.setCurrentInterviewEvaluationNumber(currentInterview.getEvaluationNumber());
		application.setCurrentInterviewEvaluationPercentage(currentInterview.getEvaluationPercentage());
	}

	private Interviews resolveCurrentInterviewSummary(Integer applicationId, Interviews fallbackInterview) {
		if (applicationId == null) {
			return fallbackInterview;
		}

		Interviews currentInterview = selectCurrentInterview(interviewsRepository.findByApplicationId(applicationId, false));
		return currentInterview != null ? currentInterview : fallbackInterview;
	}

	private Interviews selectCurrentInterview(List<Interviews> interviews) {
		if (interviews == null || interviews.isEmpty()) {
			return null;
		}

		return interviews.stream()
				.filter(Objects::nonNull)
				.sorted((left, right) -> {
					int priorityComparison = Integer.compare(getInterviewSummaryPriority(left.getInterviewStatus()), getInterviewSummaryPriority(right.getInterviewStatus()));
					if (priorityComparison != 0) {
						return priorityComparison;
					}

					long rightDate = right.getInterviewDate() != null ? right.getInterviewDate().getTime() : 0L;
					long leftDate = left.getInterviewDate() != null ? left.getInterviewDate().getTime() : 0L;
					if (leftDate != rightDate) {
						return Long.compare(rightDate, leftDate);
					}

					return Integer.compare(
						right.getId() != null ? right.getId() : 0,
						left.getId() != null ? left.getId() : 0);
				})
				.findFirst()
				.orElse(null);
	}

	private int getInterviewSummaryPriority(String interviewStatus) {
		if (StringUtils.isBlank(interviewStatus)) {
			return 99;
		}

		switch (interviewStatus.trim().toUpperCase(Locale.ROOT)) {
			case "STARTED":
				return 0;
			case "SCHEDULED":
				return 1;
			case "POSTPONED":
				return 2;
			case "PENDING":
				return 3;
			case "OVER":
				return 4;
			case "PASSED":
				return 5;
			case "FAILED":
				return 6;
			case "ARCHIVED":
				return 7;
			default:
				return 99;
		}
	}

	private void ensureEvaluationAllowed(CandidateInterview candidateInterview, Integer actorUserId, Locale locale, String actionLabel, String globalPermission) {
		if (actorUserId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("authenticatedUserId", locale));
		}
		if (candidateInterview == null || candidateInterview.getInterviews() == null || candidateInterview.getInterviews().getId() == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateInterview/interview pour l'évaluation", locale));
		}

		Interviews interview = interviewsRepository.findOne(candidateInterview.getInterviews().getId(), false);
		if (interview == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews id -> " + candidateInterview.getInterviews().getId(), locale));
		}

		Applications application = candidateInterview.getApplications() != null && candidateInterview.getApplications().getId() != null
				? applicationsRepository.findOne(candidateInterview.getApplications().getId(), false)
				: null;
		Campaigns campaign = application != null && application.getSourceToken() != null
				? application.getSourceToken().getCampaigns()
				: null;

		boolean hasCampaignScopedRight = campaign != null && permissionService.hasScopedPermission(
				actorUserId,
				"CAMPAIGN",
				campaign.getId(),
				globalPermission,
				"ADMIN",
				"EVALUATE");
		boolean hasInterviewRight = permissionService.hasAnyEntityPermission(
				actorUserId,
				"INTERVIEW",
				interview.getId(),
				"ADMIN",
				"EVALUATE");
		boolean isInterviewParticipant = false;
		List<InterviewParticipant> participants = interviewParticipantRepository.findByInterviewId(interview.getId(), false);
		if (participants != null) {
			for (InterviewParticipant participant : participants) {
				if (participant.getUser() != null && Objects.equals(participant.getUser().getId(), actorUserId)) {
					isInterviewParticipant = true;
					break;
				}
			}
		}

		if (!hasCampaignScopedRight && !hasInterviewRight && !isInterviewParticipant) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Accès refusé: droits insuffisants pour " + actionLabel,
					locale));
		}
	}

	private InterviewParticipant resolveInterviewParticipant(EvaluationsDto dto, CandidateInterview candidateInterview, Integer actorUserId, Locale locale) {
		if (candidateInterview == null || candidateInterview.getInterviews() == null || candidateInterview.getInterviews().getId() == null) {
			return null;
		}

		Integer interviewId = candidateInterview.getInterviews().getId();
		if (dto.getInterviewParticipantId() != null && dto.getInterviewParticipantId() > 0) {
			InterviewParticipant explicitParticipant = interviewParticipantRepository.findOne(dto.getInterviewParticipantId(), false);
			if (explicitParticipant == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviewParticipant interviewParticipantId -> " + dto.getInterviewParticipantId(), locale));
			}
			if (explicitParticipant.getInterviews() == null || !Objects.equals(explicitParticipant.getInterviews().getId(), interviewId)) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"L'interviewParticipantId ne correspond pas a l'entretien rattache a cette evaluation",
						locale));
			}
			return explicitParticipant;
		}

		if (actorUserId == null) {
			return null;
		}

		List<InterviewParticipant> participants = interviewParticipantRepository.findByInterviewId(interviewId, false);
		if (participants == null) {
			return null;
		}
		for (InterviewParticipant participant : participants) {
			if (participant.getUser() != null && Objects.equals(participant.getUser().getId(), actorUserId)) {
				return participant;
			}
		}
		return null;
	}

	private void persistEvaluationItemsForSavedEvaluations(List<Evaluations> savedEvaluations, List<EvaluationsDto> sourceDtos, Integer actorUserId, Locale locale) throws JsonProcessingException {
		if (savedEvaluations == null || savedEvaluations.isEmpty() || sourceDtos == null || sourceDtos.isEmpty()) {
			return;
		}

		int pairCount = Math.min(savedEvaluations.size(), sourceDtos.size());
		for (int index = 0; index < pairCount; index++) {
			upsertEvaluationItemsIfProvided(savedEvaluations.get(index), sourceDtos.get(index), actorUserId, locale);
		}
	}

	private void upsertEvaluationItemsIfProvided(Evaluations evaluation, EvaluationsDto sourceDto, Integer actorUserId, Locale locale) throws JsonProcessingException {
		if (evaluation == null || evaluation.getId() == null || sourceDto == null || sourceDto.getEvaluationItems() == null) {
			return;
		}

		PipelineStage pipelineStage = resolveEvaluationPipelineStage(evaluation, locale);
		Map<Integer, EvaluationItem> existingItemsByCriterionId = new HashMap<Integer, EvaluationItem>();
		List<EvaluationItem> existingItems = evaluationItemRepository.findByEvaluationId(evaluation.getId(), false);
		if (existingItems != null) {
			for (EvaluationItem existingItem : existingItems) {
				if (existingItem.getPipelineStageEvaluationCriterion() != null && existingItem.getPipelineStageEvaluationCriterion().getId() != null) {
					existingItemsByCriterionId.put(existingItem.getPipelineStageEvaluationCriterion().getId(), existingItem);
				}
			}
		}

		Date now = Utilities.getCurrentDate();
		List<EvaluationItem> itemsToSave = new ArrayList<EvaluationItem>();
		Set<Integer> providedCriterionIds = new HashSet<Integer>();
		for (EvaluationItemDto itemDto : sourceDto.getEvaluationItems()) {
			if (itemDto == null || itemDto.getPipelineStageEvaluationCriterionId() == null || itemDto.getPipelineStageEvaluationCriterionId() <= 0) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY("evaluationItems.pipelineStageEvaluationCriterionId", locale));
			}

			PipelineStageEvaluationCriterion criterion = pipelineStageEvaluationCriterionRepository.findOne(itemDto.getPipelineStageEvaluationCriterionId(), false);
			if (criterion == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("pipelineStageEvaluationCriterion id -> " + itemDto.getPipelineStageEvaluationCriterionId(), locale));
			}
			if (criterion.getPipelineStage() == null || !Objects.equals(criterion.getPipelineStage().getId(), pipelineStage.getId())) {
				throw new InvalidEntityException(functionalError.REQUEST_FAIL(
						"Le critere d'evaluation ne correspond pas au stage courant de l'entretien",
						locale));
			}

			EvaluationItem itemToSave = existingItemsByCriterionId.get(criterion.getId());
			if (itemToSave == null) {
				itemToSave = new EvaluationItem();
				itemToSave.setEvaluation(evaluation);
				itemToSave.setPipelineStageEvaluationCriterion(criterion);
				itemToSave.setCreatedAt(now);
				itemToSave.setCreatedBy(actorUserId);
				itemToSave.setIsDeleted(false);
			}

			itemToSave.setScoreValue(itemDto.getScoreValue());
			itemToSave.setTextValue(Utilities.notBlank(itemDto.getTextValue()) ? itemDto.getTextValue().trim() : null);
			itemToSave.setWeightSnapshot(criterion.getWeight());
			itemToSave.setMaxScoreSnapshot(criterion.getMaxScore());
			itemToSave.setUpdatedAt(now);
			itemToSave.setUpdatedBy(actorUserId);
			itemToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(itemDto)));
			itemsToSave.add(itemToSave);
			providedCriterionIds.add(criterion.getId());
		}

		for (EvaluationItem existingItem : existingItemsByCriterionId.values()) {
			if (existingItem.getPipelineStageEvaluationCriterion() == null || existingItem.getPipelineStageEvaluationCriterion().getId() == null) {
				continue;
			}
			if (!providedCriterionIds.contains(existingItem.getPipelineStageEvaluationCriterion().getId())) {
				existingItem.setIsDeleted(true);
				existingItem.setUpdatedAt(now);
				existingItem.setUpdatedBy(actorUserId);
				itemsToSave.add(existingItem);
			}
		}

		if (!itemsToSave.isEmpty()) {
			evaluationItemRepository.saveAll(itemsToSave);
		}
	}

	private EvaluationsDto resolveCriteriaRequestDto(Request<EvaluationsDto> request, Locale locale) {
		EvaluationsDto requestDto = request != null ? request.getData() : null;
		if (requestDto == null && request != null && request.getDatas() != null && !request.getDatas().isEmpty()) {
			requestDto = request.getDatas().get(0);
		}
		if (requestDto == null || requestDto.getCandidateInterviewId() == null || requestDto.getCandidateInterviewId() <= 0) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("candidateInterviewId", locale));
		}
		return requestDto;
	}

	private List<EvaluationItemDto> loadStageCriteria(CandidateInterview candidateInterview, Locale locale) {
		PipelineStage pipelineStage = resolvePipelineStageForCandidateInterview(candidateInterview, locale);
		List<PipelineStageEvaluationCriterion> criteria = pipelineStageEvaluationCriterionRepository.findByPipelineStageId(pipelineStage.getId(), false);
		if (criteria == null || criteria.isEmpty()) {
			return List.of();
		}

		List<EvaluationItemDto> dtos = new ArrayList<EvaluationItemDto>();
		for (PipelineStageEvaluationCriterion criterion : criteria) {
			EvaluationItemDto dto = new EvaluationItemDto();
			dto.setPipelineStageEvaluationCriterionId(criterion.getId());
			dto.setCriterionOrder(criterion.getCriterionOrder());
			dto.setLabel(criterion.getLabel());
			dto.setCriterionType(criterion.getCriterionType());
			dto.setWeightSnapshot(criterion.getWeight());
			dto.setMaxScoreSnapshot(criterion.getMaxScore());
			dtos.add(dto);
		}
		return dtos;
	}

	private PipelineStage resolveEvaluationPipelineStage(Evaluations evaluation, Locale locale) {
		if (evaluation == null || evaluation.getCandidateInterview() == null || evaluation.getCandidateInterview().getInterviews() == null || evaluation.getCandidateInterview().getInterviews().getId() == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateInterview/interview pour les evaluationItems", locale));
		}
		return resolvePipelineStageForCandidateInterview(evaluation.getCandidateInterview(), locale);
	}

	private PipelineStage resolvePipelineStageForCandidateInterview(CandidateInterview candidateInterview, Locale locale) {
		if (candidateInterview == null || candidateInterview.getInterviews() == null || candidateInterview.getInterviews().getId() == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("candidateInterview/interview pour les evaluationItems", locale));
		}

		Interviews interview = interviewsRepository.findOne(candidateInterview.getInterviews().getId(), false);
		if (interview == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews id -> " + candidateInterview.getInterviews().getId(), locale));
		}

		ApplicationProgress applicationProgress = interview.getApplicationProgress();
		if (applicationProgress != null
				&& applicationProgress.getId() != null
				&& (applicationProgress.getPipelineStage() == null || applicationProgress.getPipelineStage().getId() == null)) {
			applicationProgress = applicationProgressRepository.findOne(interview.getApplicationProgress().getId(), false);
		}
		if (applicationProgress == null || applicationProgress.getPipelineStage() == null || applicationProgress.getPipelineStage().getId() == null) {
			throw new InvalidEntityException(functionalError.REQUEST_FAIL(
					"Impossible de rattacher les evaluationItems a un stage de pipeline courant",
					locale));
		}
		return applicationProgress.getPipelineStage();
	}

	private void softDeleteEvaluationItems(Evaluations evaluation, Integer actorUserId) {
		if (evaluation == null || evaluation.getId() == null) {
			return;
		}

		List<EvaluationItem> existingItems = evaluationItemRepository.findByEvaluationId(evaluation.getId(), false);
		if (existingItems == null || existingItems.isEmpty()) {
			return;
		}

		Date now = Utilities.getCurrentDate();
		for (EvaluationItem item : existingItems) {
			item.setIsDeleted(true);
			item.setUpdatedAt(now);
			item.setUpdatedBy(actorUserId);
		}
		evaluationItemRepository.saveAll(existingItems);
	}

	private void recordEvaluationAuditEvent(Evaluations evaluation, Integer actorUserId, String beforeStateJson, String afterStateJson, String actionType) {
		if (evaluation == null || !Utilities.notBlank(actionType)) {
			return;
		}

		auditEventService.recordEvent(
				resolveEvaluationApplicationId(evaluation),
				resolveEvaluationApplicationProgressId(evaluation),
				"EVALUATION",
				evaluation.getId() != null ? String.valueOf(evaluation.getId()) : "UNKNOWN",
				actionType,
				actorUserId,
				null,
				beforeStateJson,
				afterStateJson);
	}

	private String buildEvaluationAuditStateJson(Evaluations evaluation) {
		if (evaluation == null) {
			return null;
		}

		CandidateInterview candidateInterview = resolveEvaluationCandidateInterview(evaluation);
		Interviews interview = resolveEvaluationInterview(evaluation, candidateInterview);
		Map<String, Object> snapshot = new LinkedHashMap<>();
		snapshot.put("id", evaluation.getId());
		snapshot.put("applicationId", resolveEvaluationApplicationId(candidateInterview));
		snapshot.put("applicationProgressId", resolveEvaluationApplicationProgressId(interview));
		snapshot.put("candidateInterviewId", candidateInterview != null ? candidateInterview.getId() : null);
		snapshot.put("interviewId", interview != null ? interview.getId() : null);
		snapshot.put("interviewParticipantId", evaluation.getInterviewParticipant() != null ? evaluation.getInterviewParticipant().getId() : null);
		snapshot.put("candidateMark", evaluation.getCandidateMark());
		snapshot.put("recruiterComment", evaluation.getRecruiterComment());
		snapshot.put("evaluationStatus", evaluation.getEvaluationStatus());
		snapshot.put("submittedAt", evaluation.getSubmittedAt());
		snapshot.put("isDeleted", evaluation.getIsDeleted());
		snapshot.put("createdAt", evaluation.getCreatedAt());
		snapshot.put("createdBy", evaluation.getCreatedBy());
		snapshot.put("updatedAt", evaluation.getUpdatedAt());
		snapshot.put("updatedBy", evaluation.getUpdatedBy());
		snapshot.put("evaluationItems", evaluation.getId() != null ? loadEvaluationItems(evaluation.getId()) : List.of());

		try {
			return Utilities.convertObjectToJson(snapshot);
		} catch (Exception exception) {
			throw new IllegalStateException("Impossible de serialiser l'etat d'audit de l'evaluation", exception);
		}
	}

	private CandidateInterview resolveEvaluationCandidateInterview(Evaluations evaluation) {
		if (evaluation == null || evaluation.getCandidateInterview() == null || evaluation.getCandidateInterview().getId() == null) {
			return null;
		}

		CandidateInterview candidateInterview = evaluation.getCandidateInterview();
		boolean missingApplication = candidateInterview.getApplications() == null || candidateInterview.getApplications().getId() == null;
		boolean missingInterview = candidateInterview.getInterviews() == null || candidateInterview.getInterviews().getId() == null;
		if (!missingApplication && !missingInterview) {
			return candidateInterview;
		}

		CandidateInterview loadedCandidateInterview = candidateInterviewRepository.findOne(candidateInterview.getId(), false);
		return loadedCandidateInterview != null ? loadedCandidateInterview : candidateInterview;
	}

	private Interviews resolveEvaluationInterview(Evaluations evaluation, CandidateInterview candidateInterview) {
		if (candidateInterview == null || candidateInterview.getInterviews() == null || candidateInterview.getInterviews().getId() == null) {
			return null;
		}

		Interviews interview = candidateInterview.getInterviews();
		if (interview.getApplicationProgress() != null && interview.getApplicationProgress().getId() != null) {
			return interview;
		}

		Interviews loadedInterview = interviewsRepository.findOne(interview.getId(), false);
		return loadedInterview != null ? loadedInterview : interview;
	}

	private Integer resolveEvaluationApplicationId(Evaluations evaluation) {
		return resolveEvaluationApplicationId(resolveEvaluationCandidateInterview(evaluation));
	}

	private Integer resolveEvaluationApplicationId(CandidateInterview candidateInterview) {
		return candidateInterview != null && candidateInterview.getApplications() != null ? candidateInterview.getApplications().getId() : null;
	}

	private Integer resolveEvaluationApplicationProgressId(Evaluations evaluation) {
		return resolveEvaluationApplicationProgressId(resolveEvaluationInterview(evaluation, resolveEvaluationCandidateInterview(evaluation)));
	}

	private Integer resolveEvaluationApplicationProgressId(Interviews interview) {
		return interview != null && interview.getApplicationProgress() != null ? interview.getApplicationProgress().getId() : null;
	}

	private List<EvaluationItemDto> loadEvaluationItems(Integer evaluationId) {
		List<EvaluationItem> items = evaluationItemRepository.findByEvaluationId(evaluationId, false);
		if (items == null || items.isEmpty()) {
			return List.of();
		}

		List<EvaluationItemDto> dtos = new ArrayList<EvaluationItemDto>();
		for (EvaluationItem item : items) {
			EvaluationItemDto dto = new EvaluationItemDto();
			dto.setId(item.getId());
			dto.setScoreValue(item.getScoreValue());
			dto.setTextValue(item.getTextValue());
			dto.setWeightSnapshot(item.getWeightSnapshot());
			dto.setMaxScoreSnapshot(item.getMaxScoreSnapshot());
			if (item.getPipelineStageEvaluationCriterion() != null) {
				dto.setPipelineStageEvaluationCriterionId(item.getPipelineStageEvaluationCriterion().getId());
				dto.setCriterionOrder(item.getPipelineStageEvaluationCriterion().getCriterionOrder());
				dto.setLabel(item.getPipelineStageEvaluationCriterion().getLabel());
				dto.setCriterionType(item.getPipelineStageEvaluationCriterion().getCriterionType());
			}
			dtos.add(dto);
		}
		return dtos;
	}

	private void syncInterviewParticipantTracking(List<Integer> interviewParticipantIds, Integer actorUserId) {
		if (interviewParticipantIds == null || interviewParticipantIds.isEmpty()) {
			return;
		}

		LinkedHashSet<Integer> distinctIds = new LinkedHashSet<Integer>(interviewParticipantIds);
		for (Integer interviewParticipantId : distinctIds) {
			if (interviewParticipantId == null) {
				continue;
			}
			InterviewParticipant participant = interviewParticipantRepository.findOne(interviewParticipantId, false);
			if (participant == null) {
				continue;
			}

			Long activeEvaluations = evaluationsRepository.countByInterviewParticipantId(interviewParticipantId);
			if (activeEvaluations != null && activeEvaluations > 0) {
				participant.setEvaluationStatus(EVALUATION_STATUS_SUBMITTED);
				Date latestSubmittedAt = evaluationsRepository.findLatestSubmittedAtByInterviewParticipantId(interviewParticipantId);
				participant.setEvaluationSubmittedAt(latestSubmittedAt != null ? latestSubmittedAt : Utilities.getCurrentDate());
			} else {
				participant.setEvaluationStatus(null);
				participant.setEvaluationSubmittedAt(null);
			}
			participant.setUpdatedAt(Utilities.getCurrentDate());
			participant.setUpdatedBy(actorUserId);
			interviewParticipantRepository.save(participant);
		}
	}
}
