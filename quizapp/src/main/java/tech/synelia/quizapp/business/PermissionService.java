package tech.synelia.quizapp.business;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;

@Service
public class PermissionService {

	@Autowired private UserRepository userRepository;
	@Autowired private SystemRolePermissionRepository systemRolePermissionRepository;
	@Autowired private UserBusinessGroupRepository userBusinessGroupRepository;
	@Autowired private BusinessGroupPermissionRepository businessGroupPermissionRepository;
	@Autowired private UserPermissionOverrideRepository userPermissionOverrideRepository;
	@Autowired private EntityPermissionRepository entityPermissionRepository;

	private static final String SUPER_ADMIN = "SUPER_ADMIN";
	private static final String ADMIN = "ADMIN";

	/**
	 * Vérifie si un utilisateur a une permission fonctionnelle.
	 * 1. SUPER_ADMIN → bypass complet
	 * 2. combined = system_role_permission ∪ business_group_permission
	 * 3. Appliquer user_permission_override (GRANT ajoute, DENY retire sauf plancher ADMIN)
	 * 4. Retourner functionality ∈ combined
	 */
	public boolean hasPermission(Integer userId, String functionality) {
		User user = userRepository.findOne(userId, false);
		if (user == null) return false;

		// 1. SUPER_ADMIN bypass
		if (SUPER_ADMIN.equals(user.getUserRole())) return true;

		// 2-3. Calculer permissions effectives
		Set<String> combined = computeEffectivePermissions(user);

		// 4. Vérifier
		return combined.contains(functionality);
	}

	/**
	 * Vérifie si un utilisateur a une permission sur une entité spécifique.
	 * 1. SUPER_ADMIN → bypass
	 * 2. Chercher entity_permission → si existe, true
	 * 3. Sinon → false
	 */
	public boolean hasEntityPermission(Integer userId, String entityType, Integer entityId, String permissionKey) {
		User user = userRepository.findOne(userId, false);
		if (user == null) return false;

		// 1. SUPER_ADMIN bypass
		if (SUPER_ADMIN.equals(user.getUserRole())) return true;

		// 2. Chercher entity_permission
		EntityPermission ep = entityPermissionRepository.findByUserIdAndEntityTypeAndEntityIdAndPermissionKey(
				userId, entityType, entityId, permissionKey);
		return ep != null;
	}

	/**
	 * Retourne la liste complète des permissions fonctionnelles résolues pour un utilisateur.
	 */
	public List<String> getEffectivePermissions(Integer userId) {
		User user = userRepository.findOne(userId, false);
		if (user == null) return Collections.emptyList();

		// SUPER_ADMIN a toutes les permissions
		if (SUPER_ADMIN.equals(user.getUserRole())) {
			return Arrays.stream(FunctionalityEnum.values())
					.map(Enum::name)
					.collect(Collectors.toList());
		}

		Set<String> combined = computeEffectivePermissions(user);
		return new ArrayList<>(combined);
	}

	/**
	 * Retourne toutes les permissions entity_permission d'un user sur une entité spécifique.
	 */
	public List<EntityPermission> getEntityPermissions(Integer userId, String entityType, Integer entityId) {
		User user = userRepository.findOne(userId, false);
		if (user == null) return Collections.emptyList();

		return entityPermissionRepository.findByUserIdAndEntityTypeAndEntityId(userId, entityType, entityId);
	}

	/**
	 * Vérifie si un override est autorisé :
	 * - SUPER_ADMIN → jamais (aucun override possible)
	 * - ADMIN + DENY sur perm de base → non autorisé (plancher immuable)
	 * - Sinon → autorisé
	 */
	public boolean canOverride(Integer userId, String functionality, boolean isDeny) {
		User user = userRepository.findOne(userId, false);
		if (user == null) return false;

		// SUPER_ADMIN → jamais d'override
		if (SUPER_ADMIN.equals(user.getUserRole())) return false;

		// ADMIN + DENY sur perm de base → non autorisé
		if (isDeny && ADMIN.equals(user.getUserRole())) {
			if (systemRolePermissionRepository.existsBySystemRoleAndFunctionality(ADMIN, functionality)) {
				return false;
			}
		}

		return true;
	}

	// ---- Méthode interne de résolution ----

	private Set<String> computeEffectivePermissions(User user) {
		// a. basePerms = system_role_permission pour user.systemRole
		Set<String> basePerms = systemRolePermissionRepository.findBySystemRole(user.getUserRole())
				.stream()
				.map(SystemRolePermission::getFunctionality)
				.collect(Collectors.toSet());

		// b. businessPerms = union des business_group_permission de tous les groupes du user
		List<UserBusinessGroup> userGroups = userBusinessGroupRepository.findByUserId(user.getId());
		Set<String> businessPerms = new HashSet<>();
		for (UserBusinessGroup ubg : userGroups) {
			businessGroupPermissionRepository.findByBusinessGroupId(ubg.getBusinessGroup().getId())
					.stream()
					.map(BusinessGroupPermission::getFunctionality)
					.forEach(businessPerms::add);
		}

		// c. combined = basePerms ∪ businessPerms
		Set<String> combined = new HashSet<>(basePerms);
		combined.addAll(businessPerms);

		// 3. Appliquer user_permission_override
		List<UserPermissionOverride> overrides = userPermissionOverrideRepository.findByUserId(user.getId());
		for (UserPermissionOverride override : overrides) {
			if (Boolean.TRUE.equals(override.getIsAllowed())) {
				// GRANT → ajouter
				combined.add(override.getFunctionality());
			} else {
				// DENY → retirer SAUF plancher ADMIN
				if (ADMIN.equals(user.getUserRole()) && basePerms.contains(override.getFunctionality())) {
					continue;
				}
				combined.remove(override.getFunctionality());
			}
		}

		return combined;
	}
}
