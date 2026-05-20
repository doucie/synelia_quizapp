package tech.synelia.quizapp.business;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tech.synelia.quizapp.dao.entity.BusinessGroupPermission;
import tech.synelia.quizapp.dao.entity.EntityPermission;
import tech.synelia.quizapp.dao.entity.SystemRolePermission;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.UserBusinessGroup;
import tech.synelia.quizapp.dao.entity.UserPermissionOverride;
import tech.synelia.quizapp.dao.repository.BusinessGroupPermissionRepository;
import tech.synelia.quizapp.dao.repository.EntityPermissionRepository;
import tech.synelia.quizapp.dao.repository.SystemRolePermissionRepository;
import tech.synelia.quizapp.dao.repository.UserBusinessGroupRepository;
import tech.synelia.quizapp.dao.repository.UserPermissionOverrideRepository;
import tech.synelia.quizapp.dao.repository.UserRepository;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.utils.enums.UserRole;

@Service
public class PermissionService {

	@Autowired private UserRepository userRepository;
	@Autowired private SystemRolePermissionRepository systemRolePermissionRepository;
	@Autowired private UserBusinessGroupRepository userBusinessGroupRepository;
	@Autowired private BusinessGroupPermissionRepository businessGroupPermissionRepository;
	@Autowired private UserPermissionOverrideRepository userPermissionOverrideRepository;
	@Autowired private EntityPermissionRepository entityPermissionRepository;

	/**
	 * Vérifie si un utilisateur a une permission fonctionnelle.
	 * 1. SUPER_ADMIN → bypass complet
	 * 2. combined = system_role_permission ∪ business_group_permission
	 * 3. Appliquer user_permission_override (GRANT ajoute, DENY retire sauf plancher ADMIN)
	 * 4. Retourner functionality ∈ combined
	 */
	public boolean hasPermission(Integer userId, String functionality) {
		User user = userRepository.findOne(userId, false);
		UserRole userRole = resolveUserRole(user);
		if (userRole == null) return false;

		// 1. SUPER_ADMIN bypass
		if (UserRole.SUPER.equals(userRole)) return true;

		// 2-3. Calculer permissions effectives
		Set<String> combined = computeEffectivePermissions(user, userRole);

		// 4. Vérifier
		return combined.contains(functionality);
	}

	public boolean hasAnyPermission(Integer userId, String... functionalities) {
		if (functionalities == null || functionalities.length == 0) {
			return false;
		}
		for (String functionality : functionalities) {
			if (functionality != null && hasPermission(userId, functionality)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Vérifie si un utilisateur a une permission sur une entité spécifique.
	 * 1. SUPER_ADMIN → bypass
	 * 2. Résoudre les entity_permission actives via user, groupes métier et rôle système
	 * 3. Vérifier si la clé demandée est présente
	 */
	public boolean hasEntityPermission(Integer userId, String entityType, Integer entityId, String permissionKey) {
		User user = userRepository.findOne(userId, false);
		UserRole userRole = resolveUserRole(user);
		if (userRole == null) return false;

		// 1. SUPER_ADMIN bypass
		if (UserRole.SUPER.equals(userRole)) return true;

		for (EntityPermission permission : resolveActiveEntityPermissions(user, userRole, entityType, entityId)) {
			if (permissionKey.equalsIgnoreCase(permission.getPermissionKey())) {
				return true;
			}
		}
		return false;
	}

	public boolean hasAnyEntityPermission(Integer userId, String entityType, Integer entityId, String... permissionKeys) {
		if (permissionKeys == null || permissionKeys.length == 0) {
			return false;
		}
		User user = userRepository.findOne(userId, false);
		UserRole userRole = resolveUserRole(user);
		if (userRole == null) return false;

		if (UserRole.SUPER.equals(userRole)) return true;

		Set<String> requestedKeys = Arrays.stream(permissionKeys)
				.filter(key -> key != null && !key.isBlank())
				.map(String::toUpperCase)
				.collect(Collectors.toSet());
		if (requestedKeys.isEmpty()) {
			return false;
		}

		for (EntityPermission permission : resolveActiveEntityPermissions(user, userRole, entityType, entityId)) {
			if (requestedKeys.contains(permission.getPermissionKey().toUpperCase())) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Vérifie un droit entité, puis retombe sur les permissions globales effectives.
	 */
	public boolean hasScopedPermission(Integer userId, String entityType, Integer entityId, String globalPermission, String... entityPermissions) {
		String[] globalPermissions = globalPermission == null ? new String[0] : new String[] { globalPermission };
		return hasAnyScopedPermission(userId, entityType, entityId, globalPermissions, entityPermissions);
	}

	/**
	 * Variante multi-droits de la résolution avec priorité : override user,
	 * puis permissions entité, puis permissions globales effectives.
	 */
	public boolean hasAnyScopedPermission(Integer userId, String entityType, Integer entityId, String[] globalPermissions, String... entityPermissions) {
		User user = userRepository.findOne(userId, false);
		UserRole userRole = resolveUserRole(user);
		if (userRole == null) return false;

		if (UserRole.SUPER.equals(userRole)) return true;

		Boolean overrideDecision = resolveScopedOverrideDecision(user, userRole, globalPermissions);
		if (Boolean.TRUE.equals(overrideDecision)) {
			return true;
		}
		if (Boolean.FALSE.equals(overrideDecision)) {
			return false;
		}

		if (hasAnyEntityPermission(userId, entityType, entityId, entityPermissions)) {
			return true;
		}
		return hasAnyPermission(userId, globalPermissions);
	}

	/**
	 * Retourne la liste complète des permissions fonctionnelles résolues pour un utilisateur.
	 */
	public List<String> getEffectivePermissions(Integer userId) {
		User user = userRepository.findOne(userId, false);
		UserRole userRole = resolveUserRole(user);
		if (userRole == null) return Collections.emptyList();

		// SUPER_ADMIN a toutes les permissions
		if (UserRole.SUPER.equals(userRole)) {
			return Arrays.stream(FunctionalityEnum.values())
					.map(Enum::name)
					.collect(Collectors.toList());
		}

		Set<String> combined = computeEffectivePermissions(user, userRole);
		return new ArrayList<>(combined);
	}

	/**
	 * Retourne toutes les entity_permission actives résolues pour un user sur une entité spécifique.
	 */
	public List<EntityPermission> getEntityPermissions(Integer userId, String entityType, Integer entityId) {
		User user = userRepository.findOne(userId, false);
		UserRole userRole = resolveUserRole(user);
		if (userRole == null) return Collections.emptyList();

		return resolveActiveEntityPermissions(user, userRole, entityType, entityId);
	}

	/**
	 * Vérifie si un override est autorisé :
	 * - SUPER_ADMIN → jamais (aucun override possible)
	 * - ADMIN + DENY sur perm de base → non autorisé (plancher immuable)
	 * - Sinon → autorisé
	 */
	public boolean canOverride(Integer userId, String functionality, boolean isDeny) {
		User user = userRepository.findOne(userId, false);
		UserRole userRole = resolveUserRole(user);
		if (userRole == null) return false;

		// SUPER_ADMIN → jamais d'override
		if (UserRole.SUPER.equals(userRole)) return false;

		// ADMIN + DENY sur perm de base → non autorisé
		if (isDeny && UserRole.ADMIN.equals(userRole)) {
			boolean isActiveBasePermission = systemRolePermissionRepository.findBySystemRole(userRole.getSystemRole())
					.stream()
					.filter(this::isActiveSystemRolePermission)
					.map(SystemRolePermission::getFunctionality)
					.anyMatch(functionality::equals);
			if (isActiveBasePermission) {
				return false;
			}
		}

		return true;
	}

	// ---- Méthode interne de résolution ----

	private Set<String> computeEffectivePermissions(User user, UserRole userRole) {
		// a. basePerms = system_role_permission pour user.systemRole
		Set<String> basePerms = systemRolePermissionRepository.findBySystemRole(userRole.getSystemRole())
				.stream()
				.filter(this::isActiveSystemRolePermission)
				.map(SystemRolePermission::getFunctionality)
				.collect(Collectors.toSet());

		// b. businessPerms = union des business_group_permission de tous les groupes du user
		List<UserBusinessGroup> userGroups = userBusinessGroupRepository.findByUserId(user.getId())
				.stream()
				.filter(this::isActiveUserBusinessGroup)
				.collect(Collectors.toList());
		Set<String> businessPerms = new HashSet<>();
		for (UserBusinessGroup ubg : userGroups) {
			businessGroupPermissionRepository.findByBusinessGroupId(ubg.getBusinessGroup().getId())
					.stream()
					.filter(this::isActiveBusinessGroupPermission)
					.map(BusinessGroupPermission::getFunctionality)
					.forEach(businessPerms::add);
		}

		// c. combined = basePerms ∪ businessPerms
		Set<String> combined = new HashSet<>(basePerms);
		combined.addAll(businessPerms);

		// 3. Appliquer user_permission_override
		List<UserPermissionOverride> overrides = userPermissionOverrideRepository.findByUserId(user.getId());
		for (UserPermissionOverride override : overrides) {
			if (!isActiveUserPermissionOverride(override)) {
				continue;
			}
			if (Boolean.TRUE.equals(override.getIsAllowed())) {
				// GRANT → ajouter
				combined.add(override.getFunctionality());
			} else {
				// DENY → retirer SAUF plancher ADMIN
				if (UserRole.ADMIN.equals(userRole) && basePerms.contains(override.getFunctionality())) {
					continue;
				}
				combined.remove(override.getFunctionality());
			}
		}

		return combined;
	}

	private Boolean resolveScopedOverrideDecision(User user, UserRole userRole, String[] globalPermissions) {
		Set<String> requestedGlobalPermissions = normalizeFunctionalities(globalPermissions);
		if (user == null || userRole == null || requestedGlobalPermissions.isEmpty()) {
			return null;
		}

		Set<String> adminBasePermissions = Collections.emptySet();
		if (UserRole.ADMIN.equals(userRole)) {
			adminBasePermissions = systemRolePermissionRepository.findBySystemRole(userRole.getSystemRole())
					.stream()
					.filter(this::isActiveSystemRolePermission)
					.map(SystemRolePermission::getFunctionality)
					.filter(functionality -> functionality != null && !functionality.isBlank())
					.map(String::toUpperCase)
					.collect(Collectors.toSet());
		}

		Set<String> deniedPermissions = new HashSet<>();
		for (UserPermissionOverride override : userPermissionOverrideRepository.findByUserId(user.getId())) {
			if (!isActiveUserPermissionOverride(override) || override.getFunctionality() == null || override.getFunctionality().isBlank()) {
				continue;
			}

			String functionality = override.getFunctionality().toUpperCase();
			if (!requestedGlobalPermissions.contains(functionality)) {
				continue;
			}

			if (Boolean.TRUE.equals(override.getIsAllowed())) {
				return Boolean.TRUE;
			}

			if (UserRole.ADMIN.equals(userRole) && adminBasePermissions.contains(functionality)) {
				continue;
			}

			deniedPermissions.add(functionality);
		}

		if (deniedPermissions.containsAll(requestedGlobalPermissions)) {
			return Boolean.FALSE;
		}

		return null;
	}

	private Set<String> normalizeFunctionalities(String... functionalities) {
		if (functionalities == null || functionalities.length == 0) {
			return Collections.emptySet();
		}

		return Arrays.stream(functionalities)
				.filter(functionality -> functionality != null && !functionality.isBlank())
				.map(String::toUpperCase)
				.collect(Collectors.toSet());
	}

	private List<EntityPermission> resolveActiveEntityPermissions(User user, UserRole userRole, String entityType, Integer entityId) {
		if (user == null || userRole == null || entityType == null || entityId == null) {
			return Collections.emptyList();
		}

		Set<Integer> activeBusinessGroupIds = userBusinessGroupRepository.findByUserId(user.getId())
				.stream()
				.filter(this::isActiveUserBusinessGroup)
				.map(UserBusinessGroup::getBusinessGroup)
				.filter(group -> group != null && group.getId() != null)
				.map(group -> group.getId())
				.collect(Collectors.toSet());

		List<EntityPermission> resolvedPermissions = new ArrayList<>();
		for (EntityPermission permission : entityPermissionRepository.findByEntityTypeAndEntityId(entityType, entityId)) {
			if (!isActiveEntityPermission(permission)) {
				continue;
			}
			if (permission.getUser() != null && user.getId().equals(permission.getUser().getId())) {
				resolvedPermissions.add(permission);
				continue;
			}
			if (permission.getBusinessGroupId() != null && activeBusinessGroupIds.contains(permission.getBusinessGroupId())) {
				resolvedPermissions.add(permission);
				continue;
			}
			if (permission.getSystemRole() != null && userRole.getSystemRole().equalsIgnoreCase(permission.getSystemRole())) {
				resolvedPermissions.add(permission);
			}
		}

		return resolvedPermissions;
	}

	private boolean isActiveEntityPermission(EntityPermission permission) {
		return permission != null && !Boolean.TRUE.equals(permission.getIsDeleted());
	}

	private boolean isActiveUserBusinessGroup(UserBusinessGroup userBusinessGroup) {
		return userBusinessGroup != null
				&& !Boolean.TRUE.equals(userBusinessGroup.getIsDeleted())
				&& userBusinessGroup.getBusinessGroup() != null
				&& !Boolean.TRUE.equals(userBusinessGroup.getBusinessGroup().getIsDeleted());
	}

	private boolean isActiveBusinessGroupPermission(BusinessGroupPermission permission) {
		return permission != null && !Boolean.TRUE.equals(permission.getIsDeleted());
	}

	private boolean isActiveUserPermissionOverride(UserPermissionOverride override) {
		return override != null && !Boolean.TRUE.equals(override.getIsDeleted());
	}

	private boolean isActiveSystemRolePermission(SystemRolePermission permission) {
		return permission != null && !Boolean.TRUE.equals(permission.getIsDeleted());
	}

	private UserRole resolveUserRole(User user) {
		return user == null ? null : UserRole.fromValue(user.getUserRole());
	}
}
