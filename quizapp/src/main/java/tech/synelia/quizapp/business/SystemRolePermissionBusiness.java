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
public class SystemRolePermissionBusiness {

	@Autowired
	private SystemRolePermissionRepository systemRolePermissionRepository;
	@Autowired
	private FunctionalError functionalError;

	private static final String SUPER_ADMIN = "SUPER_ADMIN";

	/**
	 * Retourne les permissions de base d'un rôle système.
	 */
	public Response<SystemRolePermissionDto> getPermissionsForRole(Request<SystemRolePermissionDto> request, Locale locale) {
		Response<SystemRolePermissionDto> response = new Response<>();

		String systemRole = request.getData() != null ? request.getData().getSystemRole() : null;
		if (Utilities.isBlank(systemRole)) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("systemRole", locale));
		}

		List<SystemRolePermission> entities = systemRolePermissionRepository.findBySystemRole(systemRole);
		List<SystemRolePermissionDto> dtos = entities.stream().map(e -> {
			SystemRolePermissionDto dto = new SystemRolePermissionDto();
			dto.setId(e.getId());
			dto.setSystemRole(e.getSystemRole());
			dto.setFunctionality(e.getFunctionality());
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
	 * Ajouter une permission de base à un rôle — réservé SUPER_ADMIN.
	 * Interdit si systemRole == 'SUPER_ADMIN'.
	 */
	public Response<SystemRolePermissionDto> addPermission(Request<SystemRolePermissionDto> request, Locale locale) {
		Response<SystemRolePermissionDto> response = new Response<>();

		SystemRolePermissionDto dto = request.getData();
		if (dto == null || Utilities.isBlank(dto.getSystemRole()) || Utilities.isBlank(dto.getFunctionality())) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("systemRole or functionality", locale));
		}

		if (SUPER_ADMIN.equals(dto.getSystemRole())) {
			throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Impossible de modifier les permissions de SUPER_ADMIN", locale));
		}

		// Vérifier si la permission existe déjà
		boolean exists = systemRolePermissionRepository.existsBySystemRoleAndFunctionality(dto.getSystemRole(), dto.getFunctionality());
		if (exists) {
			throw new InternalErrorException(functionalError.DATA_EXIST("permission " + dto.getSystemRole() + "/" + dto.getFunctionality(), locale));
		}

		SystemRolePermission entity = new SystemRolePermission();
		entity.setSystemRole(dto.getSystemRole());
		entity.setFunctionality(dto.getFunctionality());
		entity.setCreatedAt(Utilities.getCurrentDate());
		entity.setCreatedBy(request.getUser());
		systemRolePermissionRepository.save(entity);

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
	 * Retirer une permission de base d'un rôle — réservé SUPER_ADMIN.
	 * Interdit si systemRole == 'SUPER_ADMIN'.
	 */
	public Response<SystemRolePermissionDto> removePermission(Request<SystemRolePermissionDto> request, Locale locale) {
		Response<SystemRolePermissionDto> response = new Response<>();

		SystemRolePermissionDto dto = request.getData();
		if (dto == null || Utilities.isBlank(dto.getSystemRole()) || Utilities.isBlank(dto.getFunctionality())) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("systemRole or functionality", locale));
		}

		if (SUPER_ADMIN.equals(dto.getSystemRole())) {
			throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Impossible de modifier les permissions de SUPER_ADMIN", locale));
		}

		// Trouver et supprimer
		List<SystemRolePermission> allPerms = systemRolePermissionRepository.findBySystemRole(dto.getSystemRole());
		SystemRolePermission toRemove = allPerms.stream()
				.filter(p -> dto.getFunctionality().equals(p.getFunctionality()))
				.findFirst()
				.orElse(null);

		if (toRemove == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("permission " + dto.getSystemRole() + "/" + dto.getFunctionality(), locale));
		}

		systemRolePermissionRepository.delete(toRemove);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Retourne toutes les permissions système (pour la page entité CRUD).
	 */
	public Response<SystemRolePermissionDto> getByCriteria(Request<SystemRolePermissionDto> request, Locale locale) {
		Response<SystemRolePermissionDto> response = new Response<>();

		List<SystemRolePermission> entities = systemRolePermissionRepository.findAll();
		List<SystemRolePermissionDto> dtos = entities.stream().map(e -> {
			SystemRolePermissionDto dto = new SystemRolePermissionDto();
			dto.setId(e.getId());
			dto.setSystemRole(e.getSystemRole());
			dto.setFunctionality(e.getFunctionality());
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
		response.setCount((long) dtos.size());
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	/**
	 * Modifier une permission système par ID.
	 */
	public Response<SystemRolePermissionDto> update(Request<SystemRolePermissionDto> request, Locale locale) {
		Response<SystemRolePermissionDto> response = new Response<>();

		SystemRolePermissionDto dto = request.getData();
		if (dto == null || dto.getId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}

		SystemRolePermission entity = systemRolePermissionRepository.findById(dto.getId()).orElse(null);
		if (entity == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("systemRolePermission id -> " + dto.getId(), locale));
		}

		if (SUPER_ADMIN.equals(entity.getSystemRole())) {
			throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Impossible de modifier les permissions de SUPER_ADMIN", locale));
		}

		if (Utilities.notBlank(dto.getSystemRole())) entity.setSystemRole(dto.getSystemRole());
		if (Utilities.notBlank(dto.getFunctionality())) entity.setFunctionality(dto.getFunctionality());
		entity.setUpdatedAt(Utilities.getCurrentDate());
		entity.setUpdatedBy(request.getUser());
		systemRolePermissionRepository.save(entity);

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
	 * Supprimer une permission système par ID (hard delete).
	 */
	public Response<SystemRolePermissionDto> delete(Request<SystemRolePermissionDto> request, Locale locale) {
		Response<SystemRolePermissionDto> response = new Response<>();

		SystemRolePermissionDto dto = request.getData();
		if (dto == null || dto.getId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}

		SystemRolePermission entity = systemRolePermissionRepository.findById(dto.getId()).orElse(null);
		if (entity == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("systemRolePermission id -> " + dto.getId(), locale));
		}

		if (SUPER_ADMIN.equals(entity.getSystemRole())) {
			throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Impossible de modifier les permissions de SUPER_ADMIN", locale));
		}

		systemRolePermissionRepository.delete(entity);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}
}
