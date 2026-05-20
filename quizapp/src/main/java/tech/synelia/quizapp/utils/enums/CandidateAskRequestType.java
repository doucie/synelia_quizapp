package tech.synelia.quizapp.utils.enums;

public enum CandidateAskRequestType {
    IDENTITY("IDENTITY"),
    EMAIL("EMAIL"),
    PHONE("PHONE");

    private final String value;

    CandidateAskRequestType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static CandidateAskRequestType fromValue(String value) {
        for (CandidateAskRequestType type : CandidateAskRequestType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid candidate ask request type: " + value);
    }
}