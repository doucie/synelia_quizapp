package tech.synelia.quizapp.utils.enums;

public enum EntityPermissionType {
    CAMPAIGN("CAMPAIGN"),
    INTERVIEW("INTERVIEW"),
    APPLICATION("APPLICATION"),
    QUIZ("QUIZ"),
    FORM("FORM");

    private final String value;

    EntityPermissionType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static EntityPermissionType fromValue(String value) {
        for (EntityPermissionType type : EntityPermissionType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid entity permission type: " + value);
    }
}