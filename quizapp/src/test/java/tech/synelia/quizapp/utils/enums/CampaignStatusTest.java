package tech.synelia.quizapp.utils.enums;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class CampaignStatusTest {

	@Test
	void canTransitionTo_matchesDocumentedLifecycleMatrix() {
		for (CampaignStatus source : CampaignStatus.values()) {
			for (CampaignStatus target : CampaignStatus.values()) {
				assertEquals(isAllowed(source, target), source.canTransitionTo(target), source + " -> " + target);
			}
		}
	}

	private boolean isAllowed(CampaignStatus source, CampaignStatus target) {
		if (source == target) {
			return true;
		}

		return switch (source) {
			case DRAFT -> target == CampaignStatus.PENDING || target == CampaignStatus.OPEN;
			case PENDING -> target == CampaignStatus.OPEN;
			case OPEN -> target == CampaignStatus.PAUSED || target == CampaignStatus.CLOSED;
			case PAUSED -> target == CampaignStatus.OPEN || target == CampaignStatus.CLOSED;
			case CLOSED -> false;
		};
	}
}