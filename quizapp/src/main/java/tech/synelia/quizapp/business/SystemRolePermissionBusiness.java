package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;

import java.util.*;
import java.util.stream.Collectors;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.utils.enums.UserRole;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Log
@Component
public class SystemRolePermissionBusiness {

	@Autowired
	private SystemRolePermissionRepository systemRolePermissionRepository;
	@Autowired
	private FunctionalError functionalError;
	@PersistenceContext
	private EntityManager em;

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
		systemRole = normalizeSystemRole(systemRole, locale);

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

		String normalizedSystemRole = normalizeSystemRole(dto.getSystemRole(), locale);
		String normalizedFunctionality = normalizeFunctionality(dto.getFunctionality(), locale);

		if (SUPER_ADMIN.equals(normalizedSystemRole)) {
			throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Impossible de modifier les permissions de SUPER_ADMIN", locale));
		}

		// Vérifier si la permission existe déjà
		boolean exists = systemRolePermissionRepository.existsBySystemRoleAndFunctionality(normalizedSystemRole, normalizedFunctionality);
		if (exists) {
			throw new InternalErrorException(functionalError.DATA_EXIST("permission " + normalizedSystemRole + "/" + normalizedFunctionality, locale));
		}

		SystemRolePermission entity = new SystemRolePermission();
		entity.setSystemRole(normalizedSystemRole);
		entity.setFunctionality(normalizedFunctionality);
		entity.setCreatedAt(Utilities.getCurrentDate());
		entity.setCreatedBy(request.getUser());
		systemRolePermissionRepository.save(entity);
		dto.setSystemRole(normalizedSystemRole);
		dto.setFunctionality(normalizedFunctionality);

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

		String normalizedSystemRole = normalizeSystemRole(dto.getSystemRole(), locale);
		String normalizedFunctionality = normalizeFunctionality(dto.getFunctionality(), locale);

		if (SUPER_ADMIN.equals(normalizedSystemRole)) {
			throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Impossible de modifier les permissions de SUPER_ADMIN", locale));
		}

		// Trouver et supprimer
		List<SystemRolePermission> allPerms = systemRolePermissionRepository.findBySystemRole(normalizedSystemRole);
		SystemRolePermission toRemove = allPerms.stream()
				.filter(p -> normalizedFunctionality.equals(p.getFunctionality()))
				.findFirst()
				.orElse(null);

		if (toRemove == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("permission " + normalizedSystemRole + "/" + normalizedFunctionality, locale));
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
	public Response<SystemRolePermissionDto> getByCriteria(Request<SystemRolePermissionDto> request, Locale locale) throws Exception {
		log.info("----begin get SystemRolePermission-----");
		normalizeCriteria(request, locale);
		Response<SystemRolePermissionDto> response = new Response<>();

		List<SystemRolePermission> items = systemRolePermissionRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<SystemRolePermissionDto> dtos = items.stream().map(e -> {
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
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(systemRolePermissionRepository.count(request, em, locale));
		} else {
			response.setStatus(functionalError.DATA_EMPTY("system_role_permission", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get SystemRolePermission-----");
		return response;
	}

	private void normalizeCriteria(Request<SystemRolePermissionDto> request, Locale locale) {
		SystemRolePermissionDto dto = request != null ? request.getData() : null;
		if (dto == null) {
			return;
		}

		if (Utilities.notBlank(dto.getSystemRole())) {
			dto.setSystemRole(normalizeSystemRole(dto.getSystemRole(), locale));
		}
		if (Utilities.notBlank(dto.getFunctionality())) {
			dto.setFunctionality(normalizeFunctionality(dto.getFunctionality(), locale));
		}
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

		if (Utilities.notBlank(dto.getSystemRole())) {
			String normalizedSystemRole = normalizeSystemRole(dto.getSystemRole(), locale);
			if (SUPER_ADMIN.equals(normalizedSystemRole)) {
				throw new InvalidEntityException(functionalError.DISALLOWED_OPERATION("Impossible de modifier les permissions de SUPER_ADMIN", locale));
			}
			entity.setSystemRole(normalizedSystemRole);
			dto.setSystemRole(normalizedSystemRole);
		}
		if (Utilities.notBlank(dto.getFunctionality())) {
			String normalizedFunctionality = normalizeFunctionality(dto.getFunctionality(), locale);
			entity.setFunctionality(normalizedFunctionality);
			dto.setFunctionality(normalizedFunctionality);
		}
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

	private String normalizeSystemRole(String systemRole, Locale locale) {
		String normalizedSystemRole = UserRole.normalizeSystemRole(systemRole);
		if (normalizedSystemRole == null) {
			throw new InvalidEntityException(functionalError.DATA_NOT_EXIST(
					"systemRole invalide (SUPER_ADMIN/ADMIN/RECRUITER/CANDIDATE) -> " + systemRole,
					locale));
		}
		return normalizedSystemRole;
	}

	private String normalizeFunctionality(String functionality, Locale locale) {
		String normalizedFunctionality = functionality != null ? functionality.trim().toUpperCase(Locale.ROOT) : null;
		try {
			return FunctionalityEnum.valueOf(normalizedFunctionality).name();
		} catch (RuntimeException exception) {
			throw new InvalidEntityException(functionalError.DATA_NOT_EXIST(
					"functionality invalide -> " + functionality,
					locale));
		}
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
