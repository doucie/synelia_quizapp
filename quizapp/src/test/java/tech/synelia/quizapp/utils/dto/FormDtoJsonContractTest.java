package tech.synelia.quizapp.utils.dto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;

class FormDtoJsonContractTest {

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Test
	void deserializesFilterCampaignIdAndFilterCampaignIdParam() throws Exception {
		FormDto dto = objectMapper.readValue(
				"{" +
					"\"filterCampaignId\":11," +
					"\"filterCampaignIdParam\":{\"operator\":\"eq\"}" +
				"}",
				FormDto.class);

		assertThat(dto.getFilterCampaignId()).isEqualTo(11);
		assertThat(dto.getFilterCampaignIdParam()).isNotNull();
		assertThat(dto.getFilterCampaignIdParam().getOperator()).isEqualTo("eq");
	}

	@Test
	void rejectsLegacyCampaignIdAlias() {
		UnrecognizedPropertyException exception = assertThrows(
				UnrecognizedPropertyException.class,
				() -> objectMapper.readValue("{\"campaignId\":11}", FormDto.class));

		assertThat(exception.getPropertyName()).isEqualTo("campaignId");
	}
}