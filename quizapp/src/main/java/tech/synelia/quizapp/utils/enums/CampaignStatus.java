package tech.synelia.quizapp.utils.enums;

public enum CampaignStatus {
    DRAFT("DRAFT"),
    PENDING("PENDING"),
    OPEN("OPEN"),
    PAUSED("PAUSED"),
    CLOSED("CLOSED");

    private final String value;

    CampaignStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public boolean canTransitionTo(CampaignStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }

        return switch (this) {
            case DRAFT -> target == PENDING || target == OPEN || target == CLOSED;
            case PENDING -> target == OPEN || target == DRAFT || target == CLOSED;
            case OPEN -> target == PAUSED || target == DRAFT || target == CLOSED;
            case PAUSED -> target == OPEN || target == DRAFT || target == CLOSED;
            case CLOSED -> target == DRAFT || target == PENDING || target == OPEN;
        };
    }

    public static CampaignStatus fromValue(String value) {
        for (CampaignStatus status : CampaignStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid campaign status: " + value);
    }
}