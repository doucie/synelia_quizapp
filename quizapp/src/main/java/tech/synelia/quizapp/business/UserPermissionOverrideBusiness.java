package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;

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
}
