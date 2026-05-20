package tech.synelia.quizapp.business;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import tech.synelia.quizapp.dao.entity.BusinessGroup;
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

@ExtendWith(MockitoExtension.class)
class PermissionServiceTest {

	@Mock
	private UserRepository userRepository;
	@Mock
	private SystemRolePermissionRepository systemRolePermissionRepository;
	@Mock
	private UserBusinessGroupRepository userBusinessGroupRepository;
	@Mock
	private BusinessGroupPermissionRepository businessGroupPermissionRepository;
	@Mock
	private UserPermissionOverrideRepository userPermissionOverrideRepository;
	@Mock
	private EntityPermissionRepository entityPermissionRepository;

	@InjectMocks
	private PermissionService permissionService;

	@Test
	void hasEntityPermission_returnsTrueForDirectUserPermission() {
		User user = user(10, UserRole.RECRUITER);
		EntityPermission directPermission = entityPermission("CAMPAIGN", 42, "UPDATE");
		directPermission.setUser(user);

		when(userRepository.findOne(10, false)).thenReturn(user);
		when(userBusinessGroupRepository.findByUserId(10)).thenReturn(List.of());
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 42)).thenReturn(List.of(directPermission));

		assertThat(permissionService.hasEntityPermission(10, "CAMPAIGN", 42, "UPDATE")).isTrue();
	}

	@Test
	void hasEntityPermission_returnsTrueForActiveBusinessGroupPermission() {
		User user = user(11, UserRole.RECRUITER);
		BusinessGroup group = businessGroup(7, false);
		UserBusinessGroup membership = userBusinessGroup(user, group, false);
		EntityPermission groupPermission = entityPermission("CAMPAIGN", 77, "PLANIFY");
		groupPermission.setBusinessGroupId(7);

		when(userRepository.findOne(11, false)).thenReturn(user);
		when(userBusinessGroupRepository.findByUserId(11)).thenReturn(List.of(membership));
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 77)).thenReturn(List.of(groupPermission));

		assertThat(permissionService.hasEntityPermission(11, "CAMPAIGN", 77, "PLANIFY")).isTrue();
	}

	@Test
	void hasEntityPermission_returnsTrueForMatchingSystemRolePermission() {
		User user = user(12, UserRole.ADMIN);
		EntityPermission rolePermission = entityPermission("CAMPAIGN", 91, "DELETE");
		rolePermission.setSystemRole(UserRole.ADMIN.getSystemRole());

		when(userRepository.findOne(12, false)).thenReturn(user);
		when(userBusinessGroupRepository.findByUserId(12)).thenReturn(List.of());
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 91)).thenReturn(List.of(rolePermission));

		assertThat(permissionService.hasEntityPermission(12, "CAMPAIGN", 91, "DELETE")).isTrue();
	}

	@Test
	void hasEntityPermission_ignoresDeletedPermissionsAndDeletedMemberships() {
		User user = user(13, UserRole.RECRUITER);
		BusinessGroup activeGroup = businessGroup(3, false);
		UserBusinessGroup deletedMembership = userBusinessGroup(user, activeGroup, true);
		EntityPermission deletedDirectPermission = entityPermission("CAMPAIGN", 15, "FOLLOW");
		deletedDirectPermission.setUser(user);
		deletedDirectPermission.setIsDeleted(true);
		EntityPermission groupPermission = entityPermission("CAMPAIGN", 15, "FOLLOW");
		groupPermission.setBusinessGroupId(3);

		when(userRepository.findOne(13, false)).thenReturn(user);
		when(userBusinessGroupRepository.findByUserId(13)).thenReturn(List.of(deletedMembership));
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 15)).thenReturn(List.of(deletedDirectPermission, groupPermission));

		assertThat(permissionService.hasEntityPermission(13, "CAMPAIGN", 15, "FOLLOW")).isFalse();
	}

	@Test
	void getEffectivePermissions_appliesActiveOverridesAndIgnoresDeletedSources() {
		User user = user(14, UserRole.ADMIN);
		BusinessGroup group = businessGroup(9, false);
		UserBusinessGroup membership = userBusinessGroup(user, group, false);

		SystemRolePermission viewCampaigns = systemRolePermission(UserRole.ADMIN.getSystemRole(), FunctionalityEnum.VIEW_CAMPAIGNS.getValue(), false);
		SystemRolePermission deletedBasePermission = systemRolePermission(UserRole.ADMIN.getSystemRole(), FunctionalityEnum.DELETE_CAMPAIGNS.getValue(), true);

		BusinessGroupPermission planify = businessGroupPermission(9, FunctionalityEnum.PLANIFY.getValue(), false);
		BusinessGroupPermission deletedFollow = businessGroupPermission(9, FunctionalityEnum.FOLLOW.getValue(), true);

		UserPermissionOverride grantCorrectTest = userOverride(user, FunctionalityEnum.CORRECT_TEST.getValue(), true, false);
		UserPermissionOverride denyBasePermission = userOverride(user, FunctionalityEnum.VIEW_CAMPAIGNS.getValue(), false, false);
		UserPermissionOverride deletedDenyPlanify = userOverride(user, FunctionalityEnum.PLANIFY.getValue(), false, true);

		when(userRepository.findOne(14, false)).thenReturn(user);
		when(systemRolePermissionRepository.findBySystemRole(UserRole.ADMIN.getSystemRole())).thenReturn(List.of(viewCampaigns, deletedBasePermission));
		when(userBusinessGroupRepository.findByUserId(14)).thenReturn(List.of(membership));
		when(businessGroupPermissionRepository.findByBusinessGroupId(9)).thenReturn(List.of(planify, deletedFollow));
		when(userPermissionOverrideRepository.findByUserId(14)).thenReturn(List.of(grantCorrectTest, denyBasePermission, deletedDenyPlanify));

		assertThat(permissionService.getEffectivePermissions(14))
				.contains(FunctionalityEnum.VIEW_CAMPAIGNS.getValue(), FunctionalityEnum.PLANIFY.getValue(), FunctionalityEnum.CORRECT_TEST.getValue())
				.doesNotContain(FunctionalityEnum.DELETE_CAMPAIGNS.getValue(), FunctionalityEnum.FOLLOW.getValue());
	}

	@Test
	void canOverride_deniesAdminDenyOnlyForActiveBasePermission() {
		User user = user(15, UserRole.ADMIN);
		SystemRolePermission deletedBasePermission = systemRolePermission(UserRole.ADMIN.getSystemRole(), FunctionalityEnum.DELETE_CAMPAIGNS.getValue(), true);
		SystemRolePermission activeBasePermission = systemRolePermission(UserRole.ADMIN.getSystemRole(), FunctionalityEnum.UPDATE_CAMPAIGNS.getValue(), false);

		when(userRepository.findOne(15, false)).thenReturn(user);
		when(systemRolePermissionRepository.findBySystemRole(UserRole.ADMIN.getSystemRole())).thenReturn(List.of(deletedBasePermission, activeBasePermission));

		assertThat(permissionService.canOverride(15, FunctionalityEnum.UPDATE_CAMPAIGNS.getValue(), true)).isFalse();
		assertThat(permissionService.canOverride(15, FunctionalityEnum.DELETE_CAMPAIGNS.getValue(), true)).isTrue();
	}

	@Test
	void hasAnyScopedPermission_returnsTrueFromEntityPermissionBeforeGlobalFallback() {
		User user = user(16, UserRole.RECRUITER);
		EntityPermission directPermission = entityPermission("CAMPAIGN", 88, "ADVANCE_PIPELINE");
		directPermission.setUser(user);

		when(userRepository.findOne(16, false)).thenReturn(user);
		when(userBusinessGroupRepository.findByUserId(16)).thenReturn(List.of());
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 88)).thenReturn(List.of(directPermission));

		assertThat(permissionService.hasAnyScopedPermission(
				16,
				"CAMPAIGN",
				88,
				new String[] { FunctionalityEnum.UPDATE_APPLICATION_PROGRESS.getValue() },
				"ADMIN",
				"ADVANCE_PIPELINE")).isTrue();
	}

	@Test
	void hasScopedPermission_fallsBackToGlobalPermissionWhenEntityPermissionIsMissing() {
		User user = user(17, UserRole.ADMIN);
		SystemRolePermission activeBasePermission = systemRolePermission(UserRole.ADMIN.getSystemRole(), FunctionalityEnum.CORRECT_TEST.getValue(), false);

		when(userRepository.findOne(17, false)).thenReturn(user);
		when(userBusinessGroupRepository.findByUserId(17)).thenReturn(List.of());
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 65)).thenReturn(List.of());
		when(systemRolePermissionRepository.findBySystemRole(UserRole.ADMIN.getSystemRole())).thenReturn(List.of(activeBasePermission));
		when(userPermissionOverrideRepository.findByUserId(17)).thenReturn(List.of());

		assertThat(permissionService.hasScopedPermission(
				17,
				"CAMPAIGN",
				65,
				FunctionalityEnum.CORRECT_TEST.getValue(),
				"ADMIN",
				"CORRECT_TEST")).isTrue();
	}

	@Test
	void hasScopedPermission_deniesEntityGrantWhenMatchingUserOverrideDeniesGlobalFallback() {
		User user = user(18, UserRole.RECRUITER);
		EntityPermission directPermission = entityPermission("CAMPAIGN", 73, "CORRECT_TEST");
		directPermission.setUser(user);
		UserPermissionOverride denyOverride = userOverride(user, FunctionalityEnum.CORRECT_TEST.getValue(), false, false);

		when(userRepository.findOne(18, false)).thenReturn(user);
		when(userPermissionOverrideRepository.findByUserId(18)).thenReturn(List.of(denyOverride));

		assertThat(permissionService.hasScopedPermission(
				18,
				"CAMPAIGN",
				73,
				FunctionalityEnum.CORRECT_TEST.getValue(),
				"ADMIN",
				"CORRECT_TEST")).isFalse();
	}

	@Test
	void hasAnyScopedPermission_keepsEntityGrantWhenOnlyOneGlobalAlternativeIsDenied() {
		User user = user(19, UserRole.RECRUITER);
		EntityPermission directPermission = entityPermission("CAMPAIGN", 74, "ADVANCE_PIPELINE");
		directPermission.setUser(user);
		UserPermissionOverride denyOverride = userOverride(user, FunctionalityEnum.UPDATE_APPLICATION_PROGRESS.getValue(), false, false);

		when(userRepository.findOne(19, false)).thenReturn(user);
		when(userPermissionOverrideRepository.findByUserId(19)).thenReturn(List.of(denyOverride));
		when(userBusinessGroupRepository.findByUserId(19)).thenReturn(List.of());
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 74)).thenReturn(List.of(directPermission));

		assertThat(permissionService.hasAnyScopedPermission(
				19,
				"CAMPAIGN",
				74,
				new String[] {
					FunctionalityEnum.UPDATE_APPLICATION_PROGRESS.getValue(),
					FunctionalityEnum.ADVANCE_PIPELINE.getValue()
				},
				"ADMIN",
				"ADVANCE_PIPELINE")).isTrue();
	}

	@Test
	void hasScopedPermission_ignoresAdminDenyOverrideForActiveBasePermission() {
		User user = user(20, UserRole.ADMIN);
		EntityPermission directPermission = entityPermission("CAMPAIGN", 75, "UPDATE");
		directPermission.setUser(user);
		SystemRolePermission activeBasePermission = systemRolePermission(UserRole.ADMIN.getSystemRole(), FunctionalityEnum.UPDATE_CAMPAIGNS.getValue(), false);
		UserPermissionOverride denyOverride = userOverride(user, FunctionalityEnum.UPDATE_CAMPAIGNS.getValue(), false, false);

		when(userRepository.findOne(20, false)).thenReturn(user);
		when(userPermissionOverrideRepository.findByUserId(20)).thenReturn(List.of(denyOverride));
		when(systemRolePermissionRepository.findBySystemRole(UserRole.ADMIN.getSystemRole())).thenReturn(List.of(activeBasePermission));
		when(userBusinessGroupRepository.findByUserId(20)).thenReturn(List.of());
		when(entityPermissionRepository.findByEntityTypeAndEntityId("CAMPAIGN", 75)).thenReturn(List.of(directPermission));

		assertThat(permissionService.hasScopedPermission(
				20,
				"CAMPAIGN",
				75,
				FunctionalityEnum.UPDATE_CAMPAIGNS.getValue(),
				"ADMIN",
				"UPDATE")).isTrue();
	}

	private User user(Integer id, UserRole role) {
		User user = new User();
		user.setId(id);
		user.setUserRole(role.getValue());
		return user;
	}

	private BusinessGroup businessGroup(Integer id, boolean isDeleted) {
		BusinessGroup group = new BusinessGroup();
		group.setId(id);
		group.setIsDeleted(isDeleted);
		return group;
	}

	private UserBusinessGroup userBusinessGroup(User user, BusinessGroup group, boolean isDeleted) {
		UserBusinessGroup userBusinessGroup = new UserBusinessGroup();
		userBusinessGroup.setUser(user);
		userBusinessGroup.setBusinessGroup(group);
		userBusinessGroup.setIsDeleted(isDeleted);
		return userBusinessGroup;
	}

	private EntityPermission entityPermission(String entityType, Integer entityId, String permissionKey) {
		EntityPermission permission = new EntityPermission();
		permission.setEntityType(entityType);
		permission.setEntityId(entityId);
		permission.setPermissionKey(permissionKey);
		permission.setIsDeleted(false);
		return permission;
	}

	private BusinessGroupPermission businessGroupPermission(Integer groupId, String functionality, boolean isDeleted) {
		BusinessGroupPermission permission = new BusinessGroupPermission();
		permission.setBusinessGroup(businessGroup(groupId, false));
		permission.setFunctionality(functionality);
		permission.setIsDeleted(isDeleted);
		return permission;
	}

	private SystemRolePermission systemRolePermission(String systemRole, String functionality, boolean isDeleted) {
		SystemRolePermission permission = new SystemRolePermission();
		permission.setSystemRole(systemRole);
		permission.setFunctionality(functionality);
		permission.setIsDeleted(isDeleted);
		return permission;
	}

	private UserPermissionOverride userOverride(User user, String functionality, boolean isAllowed, boolean isDeleted) {
		UserPermissionOverride override = new UserPermissionOverride();
		override.setUser(user);
		override.setFunctionality(functionality);
		override.setIsAllowed(isAllowed);
		override.setIsDeleted(isDeleted);
		return override;
	}
}