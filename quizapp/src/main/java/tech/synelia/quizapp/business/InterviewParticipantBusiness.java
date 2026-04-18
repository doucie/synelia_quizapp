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
import tech.synelia.quizapp.dao.entity.InterviewParticipant;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.Interviews;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

/**
 * BUSINESS for table "interview_participant"
 */
@Log
@Component
public class InterviewParticipantBusiness implements IBasicBusiness<Request<InterviewParticipantDto>, Response<InterviewParticipantDto>> {

	private Response<InterviewParticipantDto> response;
	@Autowired
	private InterviewParticipantRepository interviewParticipantRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private InterviewsRepository interviewsRepository;
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

	public InterviewParticipantBusiness() {
		dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		dateTimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
	}
	
	@Override
	public Response<InterviewParticipantDto> create(Request<InterviewParticipantDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin create InterviewParticipant-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewParticipantDto> response = new Response<InterviewParticipantDto>();
		List<InterviewParticipant>        items    = new ArrayList<InterviewParticipant>();
			
		for (InterviewParticipantDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("interviewId", dto.getInterviewId());
			fieldsToVerify.put("userId", dto.getUserId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			// Verify if user exist
			User existingUser = null;
			if (dto.getUserId() != null && dto.getUserId() > 0){
				existingUser = userRepository.findOne(dto.getUserId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user userId -> " + dto.getUserId(), locale));
				}
			}
			// Verify if interviews exist
			Interviews existingInterviews = null;
			if (dto.getInterviewId() != null && dto.getInterviewId() > 0){
				existingInterviews = interviewsRepository.findOne(dto.getInterviewId(), false);
				if (existingInterviews == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews interviewId -> " + dto.getInterviewId(), locale));
				}
			}
			dto.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));

			InterviewParticipant entityToSave = InterviewParticipantTransformer.INSTANCE.toEntity(dto, existingUser, existingInterviews);
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<InterviewParticipant> itemsSaved = interviewParticipantRepository.saveAll((Iterable<InterviewParticipant>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("interviewParticipant", locale));
			}
			List<InterviewParticipantDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewParticipantTransformer.INSTANCE.toLiteDtos(itemsSaved) : InterviewParticipantTransformer.INSTANCE.toDtos(itemsSaved);

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
		}
		log.info("----end create InterviewParticipant-----");
		return response;
	}

	@Override
	public Response<InterviewParticipantDto> update(Request<InterviewParticipantDto> request, Locale locale)  throws ParseException, JsonProcessingException {
		log.info("----begin update InterviewParticipant-----");
		log.info("Request send --:> " + Utilities.convertObjectToJson(request));
		Response<InterviewParticipantDto> response = new Response<InterviewParticipantDto>();
		List<InterviewParticipant>        items    = new ArrayList<InterviewParticipant>();
			
		for (InterviewParticipantDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			InterviewParticipant entityToSave = interviewParticipantRepository.findOne(dto.getId(), false);
			if (entityToSave == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviewParticipant id -> " + dto.getId(), locale));
			}

			// Verify if user exist
			if (dto.getUserId() != null && dto.getUserId() > 0){
				User existingUser = userRepository.findOne(dto.getUserId(), false);
				if (existingUser == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user userId -> " + dto.getUserId(), locale));
				}
				entityToSave.setUser(existingUser);
			}
			// Verify if interviews exist
			if (dto.getInterviewId() != null && dto.getInterviewId() > 0){
				Interviews existingInterviews = interviewsRepository.findOne(dto.getInterviewId(), false);
				if (existingInterviews == null) {
					throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviews interviewId -> " + dto.getInterviewId(), locale));
				}
				entityToSave.setInterviews(existingInterviews);
			}
			// Champs de présence en ligne
			if (dto.getIsOnline() != null) {
				entityToSave.setIsOnline(dto.getIsOnline());
			}
			if (dto.getHasFinished() != null) {
				entityToSave.setHasFinished(dto.getHasFinished());
			}
			if (Utilities.shouldUpdate(dto.getLastPingAt())) {
				java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
				entityToSave.setLastPingAt(sdf.parse(dto.getLastPingAt()));
			}
			entityToSave.setSearchString(Utilities.extractValuesFromJson(Utilities.convertObjectToJson(dto)));
			entityToSave.setUpdatedAt(Utilities.getCurrentDate());
			entityToSave.setUpdatedBy(request.getUser());
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<InterviewParticipant> itemsSaved = interviewParticipantRepository.saveAll((Iterable<InterviewParticipant>) items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("interviewParticipant", locale));
			}
			List<InterviewParticipantDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewParticipantTransformer.INSTANCE.toLiteDtos(itemsSaved) : InterviewParticipantTransformer.INSTANCE.toDtos(itemsSaved);

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
		}
		log.info("----end update InterviewParticipant-----");
		return response;
	}

	@Override
	public Response<InterviewParticipantDto> delete(Request<InterviewParticipantDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin delete InterviewParticipant-----");
		Response<InterviewParticipantDto> response = new Response<InterviewParticipantDto>();
		List<InterviewParticipant>        items    = new ArrayList<InterviewParticipant>();
			
		for (InterviewParticipantDto dto : request.getDatas()) {
			Map<String, java.lang.Object> fieldsToVerify = new HashMap<String, java.lang.Object>();
			fieldsToVerify.put("id", dto.getId());
			if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
				throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
			}

			InterviewParticipant existingEntity = interviewParticipantRepository.findOne(dto.getId(), false);
			if (existingEntity == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("interviewParticipant -> " + dto.getId(), locale));
			}

			existingEntity.setIsDeleted(true);
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			interviewParticipantRepository.saveAll((Iterable<InterviewParticipant>) items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);

			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end delete InterviewParticipant-----");
		return response;
	}

	@Override
	public Response<InterviewParticipantDto> getByCriteria(Request<InterviewParticipantDto> request, Locale locale)  throws Exception {
		log.info("----begin get InterviewParticipant-----");
		Response<InterviewParticipantDto> response = new Response<InterviewParticipantDto>();
		List<InterviewParticipant> items = interviewParticipantRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<InterviewParticipantDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewParticipantTransformer.INSTANCE.toLiteDtos(items) : InterviewParticipantTransformer.INSTANCE.toDtos(items);

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
			response.setCount(interviewParticipantRepository.count(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("interviewParticipant", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get InterviewParticipant-----");
		return response;
	}

	public Response<InterviewParticipantDto> getAllByCriteria(Request<InterviewParticipantDto> request, Locale locale)  throws Exception {
		log.info("----begin get ALL InterviewParticipant (including deleted)-----");
		Response<InterviewParticipantDto> response = new Response<InterviewParticipantDto>();
		List<InterviewParticipant> items = interviewParticipantRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<InterviewParticipantDto> itemsDto = (Utilities.isTrue(request.getIsSimpleLoading())) ? InterviewParticipantTransformer.INSTANCE.toLiteDtos(items) : InterviewParticipantTransformer.INSTANCE.toDtos(items);

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
			response.setCount(interviewParticipantRepository.countAll(request, em, locale));
			response.setHasError(false);
		} else {
			response.setStatus(functionalError.DATA_EMPTY("interviewParticipant", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get ALL InterviewParticipant-----");
		return response;
	}

	public InterviewParticipantDto getFullInfos(InterviewParticipantDto dto, Integer size, Boolean isSimpleLoading, Locale locale) throws Exception {
		if (Utilities.isTrue(isSimpleLoading)) {
			return dto;
		}
		if (size > 1) {
			return dto;
		}
		return dto;
	}

	public Response<InterviewParticipantDto> custom(Request<InterviewParticipantDto> request, Locale locale) throws JsonProcessingException {
		log.info("----begin custom InterviewParticipantDto-----");
		Response<InterviewParticipantDto> response = new Response<InterviewParticipantDto>();
		response.setHasError(false);
		response.setCount(1L);
		response.setItems(Arrays.asList(new InterviewParticipantDto()));
		log.info("----end custom InterviewParticipantDto-----");
		return response;
	}
}
