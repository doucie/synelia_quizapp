package tech.synelia.quizapp.utils.enums;

public enum EntityPermissionKey {
    ADMIN("ADMIN"),
    CREATOR("CREATOR"),
    UPDATE("UPDATE"),
    DELETE("DELETE"),
    EVALUATE("EVALUATE"),
    CORRECT_TEST("CORRECT_TEST"),
    PLANIFY("PLANIFY"),
    ADVANCE_PIPELINE("ADVANCE_PIPELINE"),
    FOLLOW("FOLLOW");

    private final String value;

    EntityPermissionKey(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static EntityPermissionKey fromValue(String value) {
        for (EntityPermissionKey key : EntityPermissionKey.values()) {
            if (key.value.equalsIgnoreCase(value)) {
                return key;
            }
        }
        throw new IllegalArgumentException("Invalid entity permission key: " + value);
    }
}