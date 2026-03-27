package tech.synelia.quizapp.utils.enums;

/**
 * Enum représentant les rôles utilisateurs du système
 */
public enum UserRole {
    SUPER("super"),
    ADMIN("admin"),
    RECRUITER("recruiter"),
    CANDIDATE("candidate");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserRole fromValue(String value) {
        if (value == null) return null;
        for (UserRole role : values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        return null;
    }
}
