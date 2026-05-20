package tech.synelia.quizapp.utils.enums;

import java.util.Locale;

/**
 * Enum représentant les rôles utilisateurs du système
 */
public enum UserRole {
    SUPER("super", "SUPER_ADMIN"),
    ADMIN("admin", "ADMIN"),
    RECRUITER("recruiter", "RECRUITER"),
    CANDIDATE("candidate", "CANDIDATE");

    private final String value;
    private final String systemRole;

    UserRole(String value, String systemRole) {
        this.value = value;
        this.systemRole = systemRole;
    }

    public String getValue() {
        return value;
    }

    public String getSystemRole() {
        return systemRole;
    }

    public static UserRole fromValue(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        if (normalized.isEmpty()) {
            return null;
        }

        normalized = normalized.toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "SUPER", "SUPER_ADMIN", "ROLE_SUPER", "ROLE_SUPER_ADMIN" -> SUPER;
            case "ADMIN", "ROLE_ADMIN" -> ADMIN;
            case "RECRUITER", "UTILISATEUR", "ROLE_RECRUITER", "ROLE_UTILISATEUR" -> RECRUITER;
            case "CANDIDATE", "ROLE_CANDIDATE" -> CANDIDATE;
            default -> null;
        };
    }

    public static String normalizeValue(String value) {
        UserRole role = fromValue(value);
        return role != null ? role.getValue() : null;
    }

    public static String normalizeSystemRole(String value) {
        UserRole role = fromValue(value);
        return role != null ? role.getSystemRole() : null;
    }
}
