package tech.synelia.quizapp.utils.enums;

public enum ManualCorrectionStatus {
    NOT_REQUIRED("NOT_REQUIRED"),
    PENDING("PENDING"),
    COMPLETED("COMPLETED");

    private final String value;

    ManualCorrectionStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ManualCorrectionStatus fromValue(String value) {
        for (ManualCorrectionStatus status : ManualCorrectionStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid manual correction status: " + value);
    }
}