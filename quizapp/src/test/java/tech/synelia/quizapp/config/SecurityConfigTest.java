package tech.synelia.quizapp.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * Tests Vague 1 (évolution 450, A.1) : couverture des endpoints publics du parcours candidat.
 * La liste est exposée via {@link SecurityConfig#PUBLIC_APPLICATION_ENDPOINTS} (source de vérité)
 * utilisée directement par la chaîne de sécurité.
 */
class SecurityConfigTest {

	@Test
	void publicApplicationEndpoints_includeAllCandidateFacingRoutes() {
		assertThat(SecurityConfig.PUBLIC_APPLICATION_ENDPOINTS).containsExactlyInAnyOrder(
				"/applications/create",
				"/applications/verify-email",
				"/applications/get-quiz",
				"/applications/save-quiz-answer",
				"/applications/complete-quiz",
				"/applications/touch-quiz",
				"/applications/withdraw",
				"/applications/track",
				"/applications/respond-interview",
				"/applications/submit-ask");
	}

	@Test
	void publicApplicationEndpoints_doNotExposeRecruiterOrInternalRoutes() {
		assertThat(SecurityConfig.PUBLIC_APPLICATION_ENDPOINTS)
				.doesNotContain("/applications/progress")
				.doesNotContain("/applications/update")
				.doesNotContain("/applications/delete")
				.doesNotContain("/applications/getByCriteria");
	}

	@Test
	void publicApplicationEndpoints_containNoLegacyPattern() {
		assertThat(SecurityConfig.PUBLIC_APPLICATION_ENDPOINTS)
				.noneMatch(endpoint -> endpoint.contains("**") || endpoint.contains("verifyEmail"))
				.allMatch(endpoint -> endpoint.startsWith("/applications/"));
	}
}
