// ── Permission-related interfaces ──────────────────

export interface BusinessGroup {
  id?: number;
  groupName?: string;
  groupDesc?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface SystemRolePermission {
  id?: number;
  systemRole?: string;
  functionality?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface UserPermissionOverride {
  id?: number;
  userId?: number;
  functionality?: string;
  accessType?: 'GRANT' | 'DENY';
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface EntityPermission {
  id?: number;
  userId?: number;
  entityType?: string;
  entityId?: number;
  permissionKey?: string;
  granted?: boolean;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface BusinessGroupPermission {
  id?: number;
  businessGroupId?: number;
  functionality?: string;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

export interface UserBusinessGroup {
  id?: number;
  userId?: number;
  businessGroupId?: number;
  createdAt?: string;
  createdBy?: number;
  updatedAt?: string;
  updatedBy?: number;
  isDeleted?: boolean;
}

/** Réponse du endpoint /authPermissions/me */
export interface AuthPermissionsData {
  id?: number;
  userRole?: string;
  businessGroups?: BusinessGroup[];
  effectivePermissions?: string[];
}
