package tech.synelia.quizapp.utils.enums;

public enum CandidateResponseStatus {
    PENDING("PENDING"),
    ACCEPTED("ACCEPTED"),
    DECLINED("DECLINED"),
    RESCHEDULE_REQUESTED("RESCHEDULE_REQUESTED");

    private final String value;

    CandidateResponseStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static CandidateResponseStatus fromValue(String value) {
        for (CandidateResponseStatus status : CandidateResponseStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid candidate response status: " + value);
    }
}
