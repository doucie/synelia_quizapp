package tech.synelia.quizapp.business;

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
	private FunctionalError functionalError;
	@PersistenceContext
	private EntityManager em;

	/**
	 * Accorder une permission sur une entité à un utilisateur.
	 */
	public Response<EntityPermissionDto> grantPermission(Request<EntityPermissionDto> request, Locale locale) {
		Response<EntityPermissionDto> response = new Response<>();

		EntityPermissionDto dto = request.getData();
		if (dto == null || dto.getUserId() == null || Utilities.isBlank(dto.getEntityType())
				|| dto.getEntityId() == null || Utilities.isBlank(dto.getPermissionKey())) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("userId, entityType, entityId or permissionKey", locale));
		}

		User user = userRepository.findOne(dto.getUserId(), false);
		if (user == null) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("user id -> " + dto.getUserId(), locale));
		}

		// Vérifier si cette permission existe déjà
		EntityPermission existing = entityPermissionRepository
				.findByUserIdAndEntityTypeAndEntityIdAndPermissionKey(
						dto.getUserId(), dto.getEntityType(), dto.getEntityId(), dto.getPermissionKey());

		if (existing != null) {
			// Si soft-deleted, réactiver
			if (Boolean.TRUE.equals(existing.getIsDeleted())) {
				existing.setIsDeleted(false);
				existing.setUpdatedAt(Utilities.getCurrentDate());
				existing.setUpdatedBy(request.getUser());
				entityPermissionRepository.save(existing);
				dto.setId(existing.getId());
			} else {
				dto.setId(existing.getId());
			}
		} else {
			EntityPermission entity = new EntityPermission();
			entity.setUser(user);
			entity.setEntityType(dto.getEntityType());
			entity.setEntityId(dto.getEntityId());
			entity.setPermissionKey(dto.getPermissionKey());
			entity.setIsDeleted(false);
			entity.setCreatedAt(Utilities.getCurrentDate());
			entity.setCreatedBy(request.getUser());
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
	 * Révoquer (soft-delete) une permission sur une entité.
	 */
	public Response<EntityPermissionDto> revokePermission(Request<EntityPermissionDto> request, Locale locale) {
		Response<EntityPermissionDto> response = new Response<>();

		EntityPermissionDto dto = request.getData();
		if (dto == null || dto.getUserId() == null || Utilities.isBlank(dto.getEntityType())
				|| dto.getEntityId() == null || Utilities.isBlank(dto.getPermissionKey())) {
			throw new InvalidEntityException(functionalError.FIELD_EMPTY("userId, entityType, entityId or permissionKey", locale));
		}

		EntityPermission existing = entityPermissionRepository
				.findByUserIdAndEntityTypeAndEntityIdAndPermissionKey(
						dto.getUserId(), dto.getEntityType(), dto.getEntityId(), dto.getPermissionKey());

		if (existing == null || Boolean.TRUE.equals(existing.getIsDeleted())) {
			throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST(
					"entity permission " + dto.getEntityType() + "/" + dto.getEntityId() + "/" + dto.getPermissionKey(), locale));
		}

		existing.setIsDeleted(true);
		existing.setUpdatedAt(Utilities.getCurrentDate());
		existing.setUpdatedBy(request.getUser());
		entityPermissionRepository.save(existing);

		Status status = new Status();
		status.setCode(StatusCode.SUCCESS);
		status.setMessage(StatusMessage.SUCCESS);
		response.setHasError(false);
		response.setHttpCode(HttpStatus.OK.value());
		response.setStatus(status);
		return response;
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

		List<EntityPermission> entities = entityPermissionRepository
				.findByEntityTypeAndEntityId(dto.getEntityType(), dto.getEntityId());

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
		Response<EntityPermissionDto> response = new Response<>();

		List<EntityPermission> items = entityPermissionRepository.getByCriteria(request, em, locale);

		if (items != null && !items.isEmpty()) {
			List<EntityPermissionDto> dtos = items.stream().map(e -> {
				EntityPermissionDto d = new EntityPermissionDto();
				d.setId(e.getId());
				d.setUserId(e.getUser() != null ? e.getUser().getId() : null);
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
