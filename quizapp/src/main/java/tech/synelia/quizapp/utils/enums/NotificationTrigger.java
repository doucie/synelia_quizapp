package tech.synelia.quizapp.utils.enums;

public enum NotificationTrigger {
    STAGE_EMAIL("STAGE_EMAIL");

    private final String value;

    NotificationTrigger(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static NotificationTrigger fromValue(String value) {
        for (NotificationTrigger trigger : values()) {
            if (trigger.value.equalsIgnoreCase(value)) {
                return trigger;
            }
        }
        throw new IllegalArgumentException("Invalid notification trigger: " + value);
    }
}
