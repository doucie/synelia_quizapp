package tech.synelia.quizapp.business;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.EmailTemplate;
import tech.synelia.quizapp.dao.entity.MailLog;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.repository.EmailTemplateRepository;
import tech.synelia.quizapp.dao.repository.MailLogRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.StatusCode;
import tech.synelia.quizapp.utils.StatusMessage;
import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.Validate;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.MailLogDto;
import tech.synelia.quizapp.utils.dto.transformer.MailLogTransformer;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InternalErrorException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@Log
@Component
public class MailLogBusiness implements IBasicBusiness<Request<MailLogDto>, Response<MailLogDto>> {

	private static final List<String> ALLOWED_STATUSES = List.of("PENDING", "SENT", "FAILED");

	@Autowired
	private MailLogRepository mailLogRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private EmailTemplateRepository emailTemplateRepository;
	@Autowired
	private FunctionalError functionalError;
	@PersistenceContext
	private EntityManager em;

	@Override
	public Response<MailLogDto> create(Request<MailLogDto> request, Locale locale)
			throws ParseException, JsonProcessingException {
		log.info("----begin create MailLog-----");
		Response<MailLogDto> response = new Response<>();
		List<MailLog> items = new ArrayList<>();

		for (MailLogDto dto : request.getDatas()) {
			validateCreateFields(dto, locale);
			validateReferences(dto, locale);

			MailLog entityToSave = MailLogTransformer.INSTANCE.toEntity(dto);
			entityToSave.setStatus(normalizeStatus(dto.getStatus(), true, locale));
			entityToSave.setCreatedAt(Utilities.getCurrentDate());
			entityToSave.setCreatedBy(request.getUser());
			entityToSave.setIsDeleted(false);
			entityToSave.setSearchString(buildSearchString(entityToSave));
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<MailLog> itemsSaved = mailLogRepository.saveAll(items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("mail_log", locale));
			}

			List<MailLogDto> itemsDto = Utilities.isTrue(request.getIsSimpleLoading())
					? MailLogTransformer.INSTANCE.toLiteDtos(itemsSaved)
					: MailLogTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setHttpCode(HttpStatus.CREATED.value());
			response.setStatus(status);
			response.setItems(itemsDto);
			response.setHasError(false);
		}
		log.info("----end create MailLog-----");
		return response;
	}

	@Override
	public Response<MailLogDto> update(Request<MailLogDto> request, Locale locale)
			throws ParseException, JsonProcessingException {
		log.info("----begin update MailLog-----");
		Response<MailLogDto> response = new Response<>();
		List<MailLog> items = new ArrayList<>();

		for (MailLogDto dto : request.getDatas()) {
			MailLog entityToSave = loadExistingMailLog(dto, false, locale);
			applyUpdatableFields(entityToSave, dto, request.getUser(), locale);
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<MailLog> itemsSaved = mailLogRepository.saveAll(items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("mail_log", locale));
			}

			List<MailLogDto> itemsDto = Utilities.isTrue(request.getIsSimpleLoading())
					? MailLogTransformer.INSTANCE.toLiteDtos(itemsSaved)
					: MailLogTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end update MailLog-----");
		return response;
	}

	@Override
	public Response<MailLogDto> delete(Request<MailLogDto> request, Locale locale)
			throws ParseException, JsonProcessingException {
		log.info("----begin delete MailLog-----");
		Response<MailLogDto> response = new Response<>();
		List<MailLog> items = new ArrayList<>();

		for (MailLogDto dto : request.getDatas()) {
			MailLog existingEntity = loadExistingMailLog(dto, false, locale);
			existingEntity.setIsDeleted(true);
			existingEntity.setUpdatedAt(Utilities.getCurrentDate());
			existingEntity.setUpdatedBy(request.getUser());
			existingEntity.setSearchString(buildSearchString(existingEntity));
			items.add(existingEntity);
		}

		if (!items.isEmpty()) {
			mailLogRepository.saveAll(items);
			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end delete MailLog-----");
		return response;
	}

	@Override
	public Response<MailLogDto> getByCriteria(Request<MailLogDto> request, Locale locale) throws Exception {
		log.info("----begin get MailLog-----");
		Response<MailLogDto> response = new Response<>();
		List<MailLog> items = mailLogRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<MailLogDto> itemsDto = Utilities.isTrue(request.getIsSimpleLoading())
					? MailLogTransformer.INSTANCE.toLiteDtos(items)
					: MailLogTransformer.INSTANCE.toDtos(items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(mailLogRepository.count(request, em, locale));
		} else {
			response.setStatus(functionalError.DATA_EMPTY("mail_log", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get MailLog-----");
		return response;
	}

	public Response<MailLogDto> getAllByCriteria(Request<MailLogDto> request, Locale locale) throws Exception {
		log.info("----begin get ALL MailLog-----");
		Response<MailLogDto> response = new Response<>();
		List<MailLog> items = mailLogRepository.getAllByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<MailLogDto> itemsDto = Utilities.isTrue(request.getIsSimpleLoading())
					? MailLogTransformer.INSTANCE.toLiteDtos(items)
					: MailLogTransformer.INSTANCE.toDtos(items);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(mailLogRepository.countAll(request, em, locale));
		} else {
			response.setStatus(functionalError.DATA_EMPTY("mail_log", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get ALL MailLog-----");
		return response;
	}

	public Response<MailLogDto> updateAll(Request<MailLogDto> request, Locale locale)
			throws ParseException, JsonProcessingException {
		log.info("----begin updateAll MailLog-----");
		Response<MailLogDto> response = new Response<>();
		List<MailLog> items = new ArrayList<>();

		for (MailLogDto dto : request.getDatas()) {
			MailLog entityToSave = loadExistingMailLog(dto, true, locale);
			applyUpdatableFields(entityToSave, dto, request.getUser(), locale);
			if (dto.getIsDeleted() != null) {
				entityToSave.setIsDeleted(dto.getIsDeleted());
			}
			items.add(entityToSave);
		}

		if (!items.isEmpty()) {
			List<MailLog> itemsSaved = mailLogRepository.saveAll(items);
			if (itemsSaved == null) {
				throw new InternalErrorException(functionalError.SAVE_FAIL("mail_log", locale));
			}

			List<MailLogDto> itemsDto = Utilities.isTrue(request.getIsSimpleLoading())
					? MailLogTransformer.INSTANCE.toLiteDtos(itemsSaved)
					: MailLogTransformer.INSTANCE.toDtos(itemsSaved);

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(itemsDto);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
		}
		log.info("----end updateAll MailLog-----");
		return response;
	}

	public MailLogDto getFullInfos(MailLogDto dto, Integer size, Boolean isSimpleLoading, Locale locale) {
		return dto;
	}

	private void validateCreateFields(MailLogDto dto, Locale locale) {
		Map<String, Object> fieldsToVerify = new HashMap<>();
		fieldsToVerify.put("recipientEmail", dto.getRecipientEmail());
		fieldsToVerify.put("subject", dto.getSubject());
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
		}
	}

	private MailLog loadExistingMailLog(MailLogDto dto, boolean includeDeleted, Locale locale) {
		Map<String, Object> fieldsToVerify = new HashMap<>();
		fieldsToVerify.put("id", dto.getId());
		if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
		}

		MailLog entityToSave = mailLogRepository.findOne(dto.getId(), false);
		if (entityToSave == null && includeDeleted) {
			entityToSave = mailLogRepository.findOne(dto.getId(), true);
		}
		if (entityToSave == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("mail_log id -> " + dto.getId(), locale));
		}
		return entityToSave;
	}

	private void validateReferences(MailLogDto dto, Locale locale) {
		ensureUserExists(dto.getRecipientUserId(), "recipientUserId", locale);
		ensureUserExists(dto.getSenderUserId(), "senderUserId", locale);
		ensureEmailTemplateExists(dto.getEmailTemplateId(), locale);
	}

	private void applyUpdatableFields(MailLog entityToSave, MailLogDto dto, Integer requestUser, Locale locale)
			throws ParseException, JsonProcessingException {
		validateReferences(dto, locale);

		if (Utilities.notBlank(dto.getRecipientEmail())) {
			entityToSave.setRecipientEmail(dto.getRecipientEmail());
		}
		if (dto.getRecipientUserId() != null) {
			entityToSave.setRecipientUserId(dto.getRecipientUserId());
		}
		if (dto.getSenderUserId() != null) {
			entityToSave.setSenderUserId(dto.getSenderUserId());
		}
		if (dto.getEmailTemplateId() != null) {
			entityToSave.setEmailTemplateId(dto.getEmailTemplateId());
		}
		if (Utilities.notBlank(dto.getSubject())) {
			entityToSave.setSubject(dto.getSubject());
		}
		if (Utilities.shouldUpdate(dto.getBodyPreview())) {
			entityToSave.setBodyPreview(dto.getBodyPreview());
		}
		if (Utilities.notBlank(dto.getStatus())) {
			entityToSave.setStatus(normalizeStatus(dto.getStatus(), false, locale));
		}
		if (Utilities.shouldUpdate(dto.getErrorMessage())) {
			entityToSave.setErrorMessage(dto.getErrorMessage());
		}
		if (dto.getSentAt() != null && !dto.getSentAt().isBlank()) {
			entityToSave.setSentAt(MailLogTransformer.INSTANCE.toEntity(dto).getSentAt());
		}
		entityToSave.setUpdatedAt(Utilities.getCurrentDate());
		entityToSave.setUpdatedBy(requestUser);
		entityToSave.setSearchString(buildSearchString(entityToSave));
	}

	private void ensureUserExists(Integer userId, String fieldName, Locale locale) {
		if (userId == null || userId <= 0) {
			return;
		}
		User user = userRepository.findOne(userId, false);
		if (user == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user " + fieldName + " -> " + userId, locale));
		}
	}

	private void ensureEmailTemplateExists(Integer emailTemplateId, Locale locale) {
		if (emailTemplateId == null || emailTemplateId <= 0) {
			return;
		}
		EmailTemplate emailTemplate = emailTemplateRepository.findOne(emailTemplateId, false);
		if (emailTemplate == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("emailTemplate emailTemplateId -> " + emailTemplateId, locale));
		}
	}

	private String normalizeStatus(String status, boolean defaultToPending, Locale locale) {
		if (!Utilities.notBlank(status)) {
			if (defaultToPending) {
				return "PENDING";
			}
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("status", locale));
		}

		String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
		if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
			throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("status invalide (PENDING/SENT/FAILED) -> " + status, locale));
		}
		return normalizedStatus;
	}

	private String buildSearchString(MailLog entity) throws JsonProcessingException {
		return Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entity));
	}
}