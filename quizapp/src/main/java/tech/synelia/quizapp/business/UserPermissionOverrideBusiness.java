package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;
import java.util.stream.Collectors;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;

@Log
@Component
public class UserPermissionOverrideBusiness {

	@Autowired
	private UserPermissionOverrideRepository userPermissionOverrideRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private PermissionService permissionService;
	@Autowired
	private FunctionalError functionalError;
	@PersistenceContext
	private EntityManager em;

	/**
	 * Créer ou mettre à jour un override de permission pour un utilisateur.
	 * Vérifie canOverride() avant de procéder.
	 */
	public Response<UserPermissionOverrideDto> setOverride(Request<UserPermissionOverrideDto> request, Locale locale) {
		Response<UserPermissionOverrideDto> response = new Response<>();

		UserPermissionOverrideDto dto = request.getData();
		if (dto == null || dto.getUserId() == null || Utilities.isBlank(dto.getFunctionality()) || dto.getIsAllowed() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("userId, functionality or isAllowed", locale));
		}

		// Validation enum strict functionality (D-013)
		String funcUpper = normalizeFunctionality(dto.getFunctionality(), locale);
		dto.setFunctionality(funcUpper);

		User user = userRepository.findOne(dto.getUserId(), false);
		if (user == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user id -> " + dto.getUserId(), locale));
		}

		// Vérifier si l'override est autorisé
		boolean isDeny = !dto.getIsAllowed();
		if (!permissionService.canOverride(dto.getUserId(), dto.getFunctionality(), isDeny)) {
			throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION(
					"Override non autorisé pour cet utilisateur/permission", locale));
		}

		// Chercher un override existant
		UserPermissionOverride existing = userPermissionOverrideRepository.findByUserIdAndFunctionality(
				dto.getUserId(), dto.getFunctionality());

		if (existing != null) {
			// Mettre à jour
			existing.setIsAllowed(dto.getIsAllowed());
			existing.setUpdatedAt(Utilities.getCurrentDate());
			existing.setUpdatedBy(request.getUser());
			userPermissionOverrideRepository.save(existing);
			dto.setId(existing.getId());
		} else {
			// Créer
			UserPermissionOverride entity = new UserPermissionOverride();
			entity.setUser(user);
			entity.setFunctionality(dto.getFunctionality());
			entity.setIsAllowed(dto.getIsAllowed());
			entity.setCreatedAt(Utilities.getCurrentDate());
			entity.setCreatedBy(request.getUser());
			userPermissionOverrideRepository.save(entity);
			dto.setId(entity.getId());
		}

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setItems(Arrays.asList(dto));
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Supprimer un override de permission.
	 */
	public Response<UserPermissionOverrideDto> removeOverride(Request<UserPermissionOverrideDto> request, Locale locale) {
		Response<UserPermissionOverrideDto> response = new Response<>();

		UserPermissionOverrideDto dto = request.getData();
		if (dto == null || dto.getUserId() == null || Utilities.isBlank(dto.getFunctionality())) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("userId or functionality", locale));
		}
		dto.setFunctionality(normalizeFunctionality(dto.getFunctionality(), locale));

		UserPermissionOverride existing = userPermissionOverrideRepository.findByUserIdAndFunctionality(
				dto.getUserId(), dto.getFunctionality());
		if (existing == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST(
					"override " + dto.getUserId() + "/" + dto.getFunctionality(), locale));
		}

		userPermissionOverrideRepository.delete(existing);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Retourne toutes les surcharges d'un utilisateur.
	 */
	public Response<UserPermissionOverrideDto> getOverridesForUser(Request<UserPermissionOverrideDto> request, Locale locale) {
		Response<UserPermissionOverrideDto> response = new Response<>();

		Integer userId = request.getData() != null ? request.getData().getUserId() : null;
		if (userId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("userId", locale));
		}

		List<UserPermissionOverride> entities = userPermissionOverrideRepository.findByUserId(userId);
		List<UserPermissionOverrideDto> dtos = entities.stream().map(e -> {
			UserPermissionOverrideDto dto = new UserPermissionOverrideDto();
			dto.setId(e.getId());
			dto.setUserId(e.getUser().getId());
			dto.setFunctionality(e.getFunctionality());
			dto.setIsAllowed(e.getIsAllowed());
			return dto;
		}).collect(Collectors.toList());

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setItems(dtos);
		response.setCount((long) dtos.size());
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Retourne toutes les surcharges de permissions (pour page entité CRUD).
	 */
	public Response<UserPermissionOverrideDto> getByCriteria(Request<UserPermissionOverrideDto> request, Locale locale) throws Exception {
		log.info("----begin get UserPermissionOverride-----");
		normalizeCriteria(request, locale);
		Response<UserPermissionOverrideDto> response = new Response<>();

		List<UserPermissionOverride> items = userPermissionOverrideRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<UserPermissionOverrideDto> dtos = items.stream().map(e -> {
				UserPermissionOverrideDto dto = new UserPermissionOverrideDto();
				dto.setId(e.getId());
				dto.setUserId(e.getUser() != null ? e.getUser().getId() : null);
				dto.setFunctionality(e.getFunctionality());
				dto.setIsAllowed(e.getIsAllowed());
				java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
				if (e.getCreatedAt() != null) dto.setCreatedAt(sdf.format(e.getCreatedAt()));
				dto.setCreatedBy(e.getCreatedBy());
				if (e.getUpdatedAt() != null) dto.setUpdatedAt(sdf.format(e.getUpdatedAt()));
				dto.setUpdatedBy(e.getUpdatedBy());
				return dto;
			}).collect(Collectors.toList());

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(dtos);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(userPermissionOverrideRepository.count(request, em, locale));
		} else {
			response.setStatus(functionalError.DATA_EMPTY("user_permission_override", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get UserPermissionOverride-----");
		return response;
	}

	private void normalizeCriteria(Request<UserPermissionOverrideDto> request, Locale locale) {
		UserPermissionOverrideDto dto = request != null ? request.getData() : null;
		if (dto == null || !Utilities.notBlank(dto.getFunctionality())) {
			return;
		}

		dto.setFunctionality(normalizeFunctionality(dto.getFunctionality(), locale));
	}

	private String normalizeFunctionality(String functionality, Locale locale) {
		String normalizedFunctionality = functionality.trim().toUpperCase(java.util.Locale.ROOT);
		try {
			return tech.synelia.quizapp.utils.enums.FunctionalityEnum.valueOf(normalizedFunctionality).name();
		} catch (IllegalArgumentException ex) {
			throw new InvalidEntityException(functionalError.DATA_NOT_EXIST(
					"functionality invalide -> " + functionality,
					locale));
		}
	}

	/**
	 * Supprimer un override par ID (hard delete).
	 */
	public Response<UserPermissionOverrideDto> delete(Request<UserPermissionOverrideDto> request, Locale locale) {
		Response<UserPermissionOverrideDto> response = new Response<>();

		UserPermissionOverrideDto dto = request.getData();
		if (dto == null || dto.getId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}

		UserPermissionOverride entity = userPermissionOverrideRepository.findById(dto.getId()).orElse(null);
		if (entity == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("userPermissionOverride id -> " + dto.getId(), locale));
		}

		userPermissionOverrideRepository.delete(entity);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}
}
