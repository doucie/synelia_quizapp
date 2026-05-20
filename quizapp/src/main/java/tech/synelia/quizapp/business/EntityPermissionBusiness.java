package tech.synelia.quizapp.business;

import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.java.Log;
import tech.synelia.quizapp.dao.entity.EntityPermission;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.repository.BusinessGroupRepository;
import tech.synelia.quizapp.dao.repository.EntityPermissionRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.FunctionalError;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.StatusCode;
import tech.synelia.quizapp.utils.StatusMessage;
import tech.synelia.quizapp.utils.Utilities;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.EntityPermissionDto;
import tech.synelia.quizapp.utils.enums.EntityPermissionKey;
import tech.synelia.quizapp.utils.enums.EntityPermissionType;
import tech.synelia.quizapp.utils.enums.UserRole;
import tech.synelia.quizapp.utils.exception.EntityNotFoundException;
import tech.synelia.quizapp.utils.exception.InvalidEntityException;

@Log
@Component
public class EntityPermissionBusiness {

	@Autowired
	private EntityPermissionRepository entityPermissionRepository;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private BusinessGroupRepository businessGroupRepository;
	@Autowired
	private FunctionalError functionalError;
	@PersistenceContext
	private EntityManager em;

	/**
	 * Accorder une permission sur une entité pour un scope user/groupe/role.
	 */
	public Response<EntityPermissionDto> grantPermission(Request<EntityPermissionDto> request, Locale locale) {
		Response<EntityPermissionDto> response = new Response<>();

		EntityPermissionDto dto = normalizeAndValidatePermissionRequest(request.getData(), locale);
		User user = resolveUserScopeForGrant(dto, locale);

		// Vérifier si cette permission existe déjà
		EntityPermission existing = findExistingPermission(dto);

		if (existing != null) {
			// Si soft-deleted, réactiver
			if (Boolean.TRUE.equals(existing.getIsDeleted())) {
				applyScope(existing, dto, user);
				existing.setIsDeleted(false);
				existing.setUpdatedAt(Utilities.getCurrentDate());
				existing.setUpdatedBy(request.getUser());
				existing.setSearchString(buildSearchString(existing));
				entityPermissionRepository.save(existing);
				dto.setId(existing.getId());
			} else {
				dto.setId(existing.getId());
			}
		} else {
			EntityPermission entity = new EntityPermission();
			applyScope(entity, dto, user);
			entity.setEntityType(dto.getEntityType());
			entity.setEntityId(dto.getEntityId());
			entity.setPermissionKey(dto.getPermissionKey());
			entity.setIsDeleted(false);
			entity.setCreatedAt(Utilities.getCurrentDate());
			entity.setCreatedBy(request.getUser());
			entity.setSearchString(buildSearchString(entity));
			entityPermissionRepository.save(entity);
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
	 * Révoquer (soft-delete) une permission sur une entité pour un scope user/groupe/role.
	 */
	public Response<EntityPermissionDto> revokePermission(Request<EntityPermissionDto> request, Locale locale) {
		Response<EntityPermissionDto> response = new Response<>();

		EntityPermissionDto dto = normalizeAndValidatePermissionRequest(request.getData(), locale);

		EntityPermission existing = findExistingPermission(dto);

		if (existing == null || Boolean.TRUE.equals(existing.getIsDeleted())) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST(
					"entity permission " + dto.getEntityType() + "/" + dto.getEntityId() + "/" + dto.getPermissionKey() + " / " + buildScopeDescription(dto), locale));
		}

		existing.setIsDeleted(true);
		existing.setUpdatedAt(Utilities.getCurrentDate());
		existing.setUpdatedBy(request.getUser());
		existing.setSearchString(buildSearchString(existing));
		entityPermissionRepository.save(existing);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}

	private EntityPermissionDto normalizeAndValidatePermissionRequest(EntityPermissionDto dto, Locale locale) {
		if (dto == null || Utilities.isBlank(dto.getEntityType()) || dto.getEntityId() == null || Utilities.isBlank(dto.getPermissionKey())) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("entityType, entityId or permissionKey", locale));
		}

		validateSingleScope(dto, locale);

		String entityTypeUpper = normalizeEntityType(dto.getEntityType(), locale);
		String permissionKeyUpper = normalizePermissionKey(dto.getPermissionKey(), locale);

		dto.setEntityType(entityTypeUpper);
		dto.setPermissionKey(permissionKeyUpper);
		if (Utilities.notBlank(dto.getSystemRole())) {
			dto.setSystemRole(normalizeSystemRole(dto.getSystemRole(), locale));
		}

		return dto;
	}

	private void validateSingleScope(EntityPermissionDto dto, Locale locale) {
		int scopeCount = 0;
		if (dto.getUserId() != null) {
			scopeCount++;
		}
		if (dto.getBusinessGroupId() != null) {
			scopeCount++;
		}
		if (Utilities.notBlank(dto.getSystemRole())) {
			scopeCount++;
		}

		if (scopeCount != 1) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("exactement un scope parmi userId, businessGroupId ou systemRole", locale));
		}
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

	private String normalizeEntityType(String entityType, Locale locale) {
		try {
			return EntityPermissionType.fromValue(entityType).getValue();
		} catch (IllegalArgumentException exception) {
			throw new InvalidEntityException(functionalError.DATA_NOT_EXIST(
					"entityType invalide (CAMPAIGN/INTERVIEW/APPLICATION/QUIZ/FORM) -> " + entityType,
					locale));
		}
	}

	private String normalizePermissionKey(String permissionKey, Locale locale) {
		try {
			return EntityPermissionKey.fromValue(permissionKey).getValue();
		} catch (IllegalArgumentException exception) {
			throw new InvalidEntityException(functionalError.DATA_NOT_EXIST(
					"permissionKey invalide (ADMIN/CREATOR/UPDATE/DELETE/EVALUATE/CORRECT_TEST/PLANIFY/ADVANCE_PIPELINE/FOLLOW) -> " + permissionKey,
					locale));
		}
	}

	private User resolveUserScopeForGrant(EntityPermissionDto dto, Locale locale) {
		if (dto.getUserId() != null) {
			User user = userRepository.findOne(dto.getUserId(), false);
			if (user == null) {
				throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user id -> " + dto.getUserId(), locale));
			}
			return user;
		}

		if (dto.getBusinessGroupId() != null && businessGroupRepository.findOne(dto.getBusinessGroupId(), false) == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("businessGroup id -> " + dto.getBusinessGroupId(), locale));
		}

		return null;
	}

	private EntityPermission findExistingPermission(EntityPermissionDto dto) {
		if (dto.getUserId() != null) {
			return entityPermissionRepository.findByUserIdAndEntityTypeAndEntityIdAndPermissionKey(
					dto.getUserId(), dto.getEntityType(), dto.getEntityId(), dto.getPermissionKey());
		}
		if (dto.getBusinessGroupId() != null) {
			return entityPermissionRepository.findByBusinessGroupIdAndEntityTypeAndEntityIdAndPermissionKey(
					dto.getBusinessGroupId(), dto.getEntityType(), dto.getEntityId(), dto.getPermissionKey());
		}
		return entityPermissionRepository.findBySystemRoleAndEntityTypeAndEntityIdAndPermissionKey(
				dto.getSystemRole(), dto.getEntityType(), dto.getEntityId(), dto.getPermissionKey());
	}

	private void applyScope(EntityPermission entity, EntityPermissionDto dto, User user) {
		entity.setUser(user);
		entity.setBusinessGroupId(dto.getBusinessGroupId());
		entity.setSystemRole(dto.getSystemRole());
	}

	private String buildSearchString(EntityPermission entity) {
		try {
			return Utilities.extractValuesFromJson(Utilities.convertObjectToJson(entity));
		} catch (JsonProcessingException e) {
			throw new IllegalStateException("Unable to build entity_permission search string", e);
		}
	}

	private String buildScopeDescription(EntityPermissionDto dto) {
		if (dto.getUserId() != null) {
			return "userId=" + dto.getUserId();
		}
		if (dto.getBusinessGroupId() != null) {
			return "businessGroupId=" + dto.getBusinessGroupId();
		}
		return "systemRole=" + dto.getSystemRole();
	}

	/**
	 * Retourne toutes les permissions (non supprimées) sur une entité donnée (tous les utilisateurs).
	 */
	public Response<EntityPermissionDto> getPermissionsForEntity(Request<EntityPermissionDto> request, Locale locale) {
		Response<EntityPermissionDto> response = new Response<>();

		EntityPermissionDto dto = request.getData();
		if (dto == null || Utilities.isBlank(dto.getEntityType()) || dto.getEntityId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("entityType or entityId", locale));
		}
		dto.setEntityType(normalizeEntityType(dto.getEntityType(), locale));

		List<EntityPermission> entities = entityPermissionRepository
				.findByEntityTypeAndEntityId(dto.getEntityType(), dto.getEntityId());

		List<EntityPermissionDto> dtos = entities.stream()
				.filter(e -> !Boolean.TRUE.equals(e.getIsDeleted()))
				.map(e -> {
					EntityPermissionDto d = new EntityPermissionDto();
					d.setId(e.getId());
					d.setUserId(e.getUser() != null ? e.getUser().getId() : null);
					d.setBusinessGroupId(e.getBusinessGroupId());
					d.setSystemRole(e.getSystemRole());
					d.setEntityType(e.getEntityType());
					d.setEntityId(e.getEntityId());
					d.setPermissionKey(e.getPermissionKey());
					d.setGranted(true);
					if (e.getUser() != null) {
						d.setUserFirstName(e.getUser().getFirstName());
						d.setUserLastName(e.getUser().getLastName());
						d.setUserEmail(e.getUser().getEmail());
						d.setUserName(e.getUser().getUsername());
						d.setUserRole(e.getUser().getUserRole());
					}
					return d;
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
	 * Retourne toutes les permissions entités (non supprimées) d'un utilisateur donné.
	 */
	public Response<EntityPermissionDto> getPermissionsForUser(Request<EntityPermissionDto> request, Locale locale) {
		Response<EntityPermissionDto> response = new Response<>();

		Integer userId = request.getData() != null ? request.getData().getUserId() : null;
		if (userId == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("userId", locale));
		}

		// On récupère toutes les entity permissions via une requête custom
		List<EntityPermission> entities = entityPermissionRepository.findByUserId(userId);

		List<EntityPermissionDto> dtos = entities.stream()
				.filter(e -> !Boolean.TRUE.equals(e.getIsDeleted()))
				.map(e -> {
					EntityPermissionDto d = new EntityPermissionDto();
					d.setId(e.getId());
					d.setUserId(e.getUser().getId());
					d.setEntityType(e.getEntityType());
					d.setEntityId(e.getEntityId());
					d.setPermissionKey(e.getPermissionKey());
					d.setGranted(true);
					d.setUserFirstName(e.getUser().getFirstName());
					d.setUserLastName(e.getUser().getLastName());
					d.setUserEmail(e.getUser().getEmail());
					d.setUserName(e.getUser().getUsername());
					d.setUserRole(e.getUser().getUserRole());
					return d;
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
	 * Retourne toutes les permissions entités (pour page entité CRUD).
	 * Supporte le filtre isDeleted.
	 */
	public Response<EntityPermissionDto> getByCriteria(Request<EntityPermissionDto> request, Locale locale) throws Exception {
		log.info("----begin get EntityPermission-----");
		normalizeCriteria(request, locale);
		Response<EntityPermissionDto> response = new Response<>();

		List<EntityPermission> items = entityPermissionRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<EntityPermissionDto> dtos = items.stream().map(e -> {
				EntityPermissionDto d = new EntityPermissionDto();
				d.setId(e.getId());
				d.setUserId(e.getUser() != null ? e.getUser().getId() : null);
				d.setBusinessGroupId(e.getBusinessGroupId());
				d.setSystemRole(e.getSystemRole());
				d.setEntityType(e.getEntityType());
				d.setEntityId(e.getEntityId());
				d.setPermissionKey(e.getPermissionKey());
				d.setGranted(!Boolean.TRUE.equals(e.getIsDeleted()));
				d.setIsDeleted(e.getIsDeleted());
				if (e.getUser() != null) {
					d.setUserFirstName(e.getUser().getFirstName());
					d.setUserLastName(e.getUser().getLastName());
					d.setUserEmail(e.getUser().getEmail());
					d.setUserName(e.getUser().getUsername());
					d.setUserRole(e.getUser().getUserRole());
				}
				java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
				if (e.getCreatedAt() != null) d.setCreatedAt(sdf.format(e.getCreatedAt()));
				d.setCreatedBy(e.getCreatedBy());
				if (e.getUpdatedAt() != null) d.setUpdatedAt(sdf.format(e.getUpdatedAt()));
				d.setUpdatedBy(e.getUpdatedBy());
				return d;
			}).collect(Collectors.toList());

			Status status = new Status();
			status.setCode(StatusCode.SUCCESS);
			status.setMessage(StatusMessage.SUCCESS);
			response.setItems(dtos);
			response.setHasError(false);
			response.setHttpCode(HttpStatus.OK.value());
			response.setStatus(status);
			response.setCount(entityPermissionRepository.count(request, em, locale));
		} else {
			response.setStatus(functionalError.DATA_EMPTY("entity_permission", locale));
			response.setHasError(false);
			return response;
		}
		log.info("----end get EntityPermission-----");
		return response;
	}

	private void normalizeCriteria(Request<EntityPermissionDto> request, Locale locale) {
		EntityPermissionDto dto = request != null ? request.getData() : null;
		if (dto == null) {
			return;
		}

		if (Utilities.notBlank(dto.getEntityType())) {
			dto.setEntityType(normalizeEntityType(dto.getEntityType(), locale));
		}
		if (Utilities.notBlank(dto.getPermissionKey())) {
			dto.setPermissionKey(normalizePermissionKey(dto.getPermissionKey(), locale));
		}
		if (Utilities.notBlank(dto.getSystemRole())) {
			dto.setSystemRole(normalizeSystemRole(dto.getSystemRole(), locale));
		}
	}

	/**
	 * Supprimer (soft-delete) une permission entité par ID.
	 */
	public Response<EntityPermissionDto> delete(Request<EntityPermissionDto> request, Locale locale) {
		Response<EntityPermissionDto> response = new Response<>();

		EntityPermissionDto dto = request.getData();
		if (dto == null || dto.getId() == null) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("id", locale));
		}

		EntityPermission entity = entityPermissionRepository.findById(dto.getId()).orElse(null);
		if (entity == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("entityPermission id -> " + dto.getId(), locale));
		}

		entity.setIsDeleted(true);
		entity.setUpdatedAt(Utilities.getCurrentDate());
		entity.setUpdatedBy(request.getUser());
		entityPermissionRepository.save(entity);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
	}
}
