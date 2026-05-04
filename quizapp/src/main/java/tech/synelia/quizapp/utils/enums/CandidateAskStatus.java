package tech.synelia.quizapp.utils.enums;

public enum CandidateAskStatus {
	PENDING("PENDING"),
	APPROVED("APPROVED"),
	REJECTED("REJECTED");

	private final String value;

	CandidateAskStatus(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static CandidateAskStatus fromValue(String value) {
		if (value == null) {
			return PENDING;
		}
		for (CandidateAskStatus status : values()) {
			if (status.value.equalsIgnoreCase(value.trim())) {
				return status;
			}
		}
		return PENDING;
	}
}