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
public class BusinessGroupBusiness {

	@Autowired
	private BusinessGroupRepository businessGroupRepository;
	@Autowired
	private BusinessGroupPermissionRepository businessGroupPermissionRepository;
	@Autowired
	private UserBusinessGroupRepository userBusinessGroupRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private FunctionalError functionalError;

	/**
	 * Créer un groupe métier.
	 */
	public Response<BusinessGroupDto> create(Request<BusinessGroupDto> request, Locale locale) {
		Response<BusinessGroupDto> response = new Response<>();

		BusinessGroupDto dto = request.getData();
		if (dto == null || Utilities.isBlank(dto.getGroupName())) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("groupName", locale));
		}

		// Vérifier unicité du nom
		List<BusinessGroup> existing = businessGroupRepository.findByGroupName(dto.getGroupName(), false);
		if (existing != null && !existing.isEmpty()) {
			throw new InternalErrorException(functionalError.DATA_EXIST("businessGroup groupName -> " + dto.getGroupName(), locale));
		}

		BusinessGroup entity = new BusinessGroup();
		entity.setGroupName(dto.getGroupName());
		entity.setGroupDesc(dto.getGroupDesc());
		entity.setCreatedAt(Utilities.getCurrentDate());
		entity.setCreatedBy(request.getUser());
		entity.setIsDeleted(false);
		entity.setSearchString(dto.getGroupName() + " " + (dto.getGroupDesc() != null ? dto.getGroupDesc() : ""));
		businessGroupRepository.save(entity);

		dto.setId(entity.getId());

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setItems(Arrays.asList(dto));
		response.setHasError(false);
		response.setHttpCode(HttpStatus.CREATED.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Modifier un groupe métier.
	 */
	public Response<BusinessGroupDto> update(Request<BusinessGroupDto> request, Locale locale) {
		Response<BusinessGroupDto> response = new Response<>();

		BusinessGroupDto dto = request.getData();
		if (dto == null || dto.getId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}

		BusinessGroup entity = businessGroupRepository.findOne(dto.getId(), false);
		if (entity == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("businessGroup id -> " + dto.getId(), locale));
		}

		if (Utilities.shouldUpdate(dto.getGroupName())) entity.setGroupName(dto.getGroupName());
		if (Utilities.shouldUpdate(dto.getGroupDesc())) entity.setGroupDesc(dto.getGroupDesc());
		entity.setUpdatedAt(Utilities.getCurrentDate());
		entity.setUpdatedBy(request.getUser());
		entity.setSearchString(entity.getGroupName() + " " + (entity.getGroupDesc() != null ? entity.getGroupDesc() : ""));
		businessGroupRepository.save(entity);

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
	 * Supprimer (soft) un groupe métier.
	 */
	public Response<BusinessGroupDto> delete(Request<BusinessGroupDto> request, Locale locale) {
		Response<BusinessGroupDto> response = new Response<>();

		BusinessGroupDto dto = request.getData();
		if (dto == null || dto.getId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}

		BusinessGroup entity = businessGroupRepository.findOne(dto.getId(), false);
		if (entity == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("businessGroup id -> " + dto.getId(), locale));
		}

		entity.setIsDeleted(true);
		entity.setUpdatedAt(Utilities.getCurrentDate());
		entity.setUpdatedBy(request.getUser());
		businessGroupRepository.save(entity);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Retourne un groupe métier avec sa liste de fonctionnalités.
	 */
	public Response<BusinessGroupDto> getGroupWithPermissions(Request<BusinessGroupDto> request, Locale locale) {
		Response<BusinessGroupDto> response = new Response<>();

		Integer groupId = request.getData() != null ? request.getData().getId() : null;
		if (groupId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}

		BusinessGroup entity = businessGroupRepository.findOne(groupId, false);
		if (entity == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("businessGroup id -> " + groupId, locale));
		}

		BusinessGroupDto dto = new BusinessGroupDto();
		dto.setId(entity.getId());
		dto.setGroupName(entity.getGroupName());
		dto.setGroupDesc(entity.getGroupDesc());

		List<BusinessGroupPermission> perms = businessGroupPermissionRepository.findByBusinessGroupId(groupId);
		dto.setFunctionalities(perms.stream().map(BusinessGroupPermission::getFunctionality).collect(Collectors.toList()));

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
	 * Ajouter une permission à un groupe métier.
	 */
	public Response<BusinessGroupDto> addPermission(Request<BusinessGroupDto> request, Locale locale) {
		Response<BusinessGroupDto> response = new Response<>();

		BusinessGroupDto dto = request.getData();
		if (dto == null || dto.getId() == null || dto.getFunctionalities() == null || dto.getFunctionalities().isEmpty()) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id or functionalities", locale));
		}

		BusinessGroup group = businessGroupRepository.findOne(dto.getId(), false);
		if (group == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("businessGroup id -> " + dto.getId(), locale));
		}

		for (String functionality : dto.getFunctionalities()) {
			boolean exists = businessGroupPermissionRepository.existsByBusinessGroupIdAndFunctionality(dto.getId(), functionality);
			if (!exists) {
				BusinessGroupPermission perm = new BusinessGroupPermission();
				perm.setBusinessGroup(group);
				perm.setFunctionality(functionality);
				perm.setCreatedAt(Utilities.getCurrentDate());
				perm.setCreatedBy(request.getUser());
				businessGroupPermissionRepository.save(perm);
			}
		}

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Retirer une permission d'un groupe métier.
	 */
	public Response<BusinessGroupDto> removePermission(Request<BusinessGroupDto> request, Locale locale) {
		Response<BusinessGroupDto> response = new Response<>();

		BusinessGroupDto dto = request.getData();
		if (dto == null || dto.getId() == null || dto.getFunctionalities() == null || dto.getFunctionalities().isEmpty()) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id or functionalities", locale));
		}

		List<BusinessGroupPermission> allPerms = businessGroupPermissionRepository.findByBusinessGroupId(dto.getId());
		for (String functionality : dto.getFunctionalities()) {
			allPerms.stream()
					.filter(p -> functionality.equals(p.getFunctionality()))
					.findFirst()
					.ifPresent(p -> businessGroupPermissionRepository.delete(p));
		}

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Assigner un utilisateur à un groupe métier.
	 */
	public Response<BusinessGroupDto> assignUserToGroup(Request<BusinessGroupDto> request, Locale locale) {
		Response<BusinessGroupDto> response = new Response<>();

		if (request.getData() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("data", locale));
		}

		// Convention: data.id = groupId, user = userId (dans la request)
		Integer groupId = request.getData().getId();
		Integer userId = request.getUser();

		if (groupId == null || userId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("groupId or userId", locale));
		}

		BusinessGroup group = businessGroupRepository.findOne(groupId, false);
		if (group == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("businessGroup id -> " + groupId, locale));
		}

		User user = userRepository.findOne(userId, false);
		if (user == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user id -> " + userId, locale));
		}

		// Vérifier s'il n'est pas déjà dans le groupe
		List<UserBusinessGroup> existing = userBusinessGroupRepository.findByUserId(userId);
		boolean alreadyIn = existing.stream().anyMatch(ubg -> ubg.getBusinessGroup().getId().equals(groupId));
		if (alreadyIn) {
			throw new InternalErrorException(functionalError.DATA_EXIST("user " + userId + " dans groupe " + groupId, locale));
		}

		UserBusinessGroup ubg = new UserBusinessGroup();
		ubg.setUser(user);
		ubg.setBusinessGroup(group);
		ubg.setCreatedAt(Utilities.getCurrentDate());
		ubg.setCreatedBy(request.getUser());
		userBusinessGroupRepository.save(ubg);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.CREATED.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Retirer un utilisateur d'un groupe métier.
	 */
	public Response<BusinessGroupDto> removeUserFromGroup(Request<BusinessGroupDto> request, Locale locale) {
		Response<BusinessGroupDto> response = new Response<>();

		if (request.getData() == null || request.getData().getId() == null || request.getUser() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("groupId or userId", locale));
		}

		Integer groupId = request.getData().getId();
		Integer userId = request.getUser();

		List<UserBusinessGroup> userGroups = userBusinessGroupRepository.findByUserId(userId);
		UserBusinessGroup toRemove = userGroups.stream()
				.filter(ubg -> ubg.getBusinessGroup().getId().equals(groupId))
				.findFirst()
				.orElse(null);

		if (toRemove == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user " + userId + " dans groupe " + groupId, locale));
		}

		userBusinessGroupRepository.delete(toRemove);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Retourne tous les utilisateurs d'un groupe métier.
	 */
	public Response<UserDto> getUsersInGroup(Request<BusinessGroupDto> request, Locale locale) {
		Response<UserDto> response = new Response<>();

		Integer groupId = request.getData() != null ? request.getData().getId() : null;
		if (groupId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}

		List<UserBusinessGroup> userGroups = userBusinessGroupRepository.findByBusinessGroupId(groupId);
		List<UserDto> userDtos = userGroups.stream().map(ubg -> {
			User u = ubg.getUser();
			UserDto userDto = new UserDto();
			userDto.setId(u.getId());
			userDto.setFirstName(u.getFirstName());
			userDto.setLastName(u.getLastName());
			userDto.setUsername(u.getUsername());
			userDto.setEmail(u.getEmail());
			userDto.setUserRole(u.getUserRole());
			return userDto;
		}).collect(Collectors.toList());

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setItems(userDtos);
		response.setCount((long) userDtos.size());
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Retourne tous les groupes (non supprimés).
	 */
	public Response<BusinessGroupDto> getByCriteria(Request<BusinessGroupDto> request, Locale locale) {
		Response<BusinessGroupDto> response = new Response<>();

		List<BusinessGroup> entities = businessGroupRepository.findByIsDeleted(false);
		List<BusinessGroupDto> dtos = entities.stream().map(e -> {
			BusinessGroupDto dto = new BusinessGroupDto();
			dto.setId(e.getId());
			dto.setGroupName(e.getGroupName());
			dto.setGroupDesc(e.getGroupDesc());
			return dto;
		}).collect(Collectors.toList());

		if (dtos.isEmpty()) {
			throw new EntityNotFoundException(functionalError.DATA_EMPTY("businessGroup", locale));
		}

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
