package tech.synelia.quizapp.rest.api;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import tech.synelia.quizapp.business.DecisionBusiness;
import tech.synelia.quizapp.rest.fact.ControllerFactory;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.dto.DecisionDto;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;

@ExtendWith(MockitoExtension.class)
class DecisionControllerTest {

	@Mock
	private ControllerFactory<DecisionDto> controllerFactory;
	@Mock
	private DecisionBusiness decisionBusiness;

	@InjectMocks
	private DecisionController decisionController;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(decisionController).build();
	}

	@Test
	void create_returnsBadRequestWhenBusinessReturnsNullCreatedItems() throws Exception {
		Response<DecisionDto> response = new Response<>();
		response.setHasError(false);
		response.setItems(null);

		when(controllerFactory.create(eq(decisionBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_DECISIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/decisions/create")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"datas\": [
						    {
						      \"decisionType\": \"PRE_SCREEN_ACCEPTED\",
						      \"isCancel\": true,
						      \"applicationId\": 10,
						      \"userId\": 44,
						      \"pipelineStageId\": 21,
						      \"applicationProgressId\": 99,
						      \"decisionMode\": \"CANCEL\",
						      \"cancelsDecisionId\": 500,
						      \"justification\": \"Audit trail mismatch\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(false));

		verify(controllerFactory).create(eq(decisionBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_DECISIONS));
	}

	@Test
	void create_returnsBadRequestWhenBusinessReturnsNoCreatedItems() throws Exception {
		Response<DecisionDto> response = new Response<>();
		response.setHasError(false);
		response.setItems(List.of());

		when(controllerFactory.create(eq(decisionBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_DECISIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/decisions/create")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"datas\": [
						    {
						      \"decisionType\": \"PRE_SCREEN_ACCEPTED\",
						      \"isCancel\": true,
						      \"applicationId\": 10,
						      \"userId\": 44,
						      \"pipelineStageId\": 21,
						      \"applicationProgressId\": 99,
						      \"decisionMode\": \"CANCEL\",
						      \"cancelsDecisionId\": 500,
						      \"justification\": \"Audit trail mismatch\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(false));

		verify(controllerFactory).create(eq(decisionBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_DECISIONS));
	}

	@Test
	void create_returnsBadRequestWhenBusinessReturnsError() throws Exception {
		Response<DecisionDto> response = new Response<>();
		response.setHasError(true);

		when(controllerFactory.create(eq(decisionBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_DECISIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/decisions/create")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"datas\": [
						    {
						      \"decisionType\": \"PRE_SCREEN_ACCEPTED\",
						      \"isCancel\": true,
						      \"applicationId\": 10,
						      \"userId\": 44,
						      \"pipelineStageId\": 21,
						      \"applicationProgressId\": 99,
						      \"decisionMode\": \"CANCEL\",
						      \"cancelsDecisionId\": 500,
						      \"justification\": \"Audit trail mismatch\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(true));

		verify(controllerFactory).create(eq(decisionBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_DECISIONS));
	}

	@Test
	void create_acceptsHistorizedCancellationPayloadOverHttp() throws Exception {
		DecisionDto createdDecision = new DecisionDto();
		createdDecision.setId(501);
		createdDecision.setDecisionType("PRE_SCREEN_ACCEPTED");
		createdDecision.setIsCancel(true);
		createdDecision.setApplicationId(10);
		createdDecision.setUserId(44);
		createdDecision.setPipelineStageId(21);
		createdDecision.setApplicationProgressId(99);
		createdDecision.setDecisionMode("CANCEL");
		createdDecision.setCancelsDecisionId(500);
		createdDecision.setJustification("Audit trail mismatch");

		Response<DecisionDto> response = new Response<>();
		response.setHasError(false);
		response.setItems(List.of(createdDecision));

		when(controllerFactory.create(eq(decisionBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_DECISIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/decisions/create")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"datas\": [
						    {
						      \"decisionType\": \"PRE_SCREEN_ACCEPTED\",
						      \"isCancel\": true,
						      \"applicationId\": 10,
						      \"userId\": 44,
						      \"pipelineStageId\": 21,
						      \"applicationProgressId\": 99,
						      \"decisionMode\": \"CANCEL\",
						      \"cancelsDecisionId\": 500,
						      \"justification\": \"Audit trail mismatch\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isCreated())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(false))
				.andExpect(jsonPath("$.items[0].id").value(501))
				.andExpect(jsonPath("$.items[0].decisionMode").value("CANCEL"))
				.andExpect(jsonPath("$.items[0].applicationProgressId").value(99))
				.andExpect(jsonPath("$.items[0].cancelsDecisionId").value(500))
				.andExpect(jsonPath("$.items[0].justification").value("Audit trail mismatch"));

		ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
		verify(controllerFactory).create(eq(decisionBusiness), requestCaptor.capture(), eq(FunctionalityEnum.CREATE_DECISIONS));

		@SuppressWarnings("unchecked")
		Request<DecisionDto> capturedRequest = requestCaptor.getValue();
		assertThat(capturedRequest.getUser()).isEqualTo(44);
		assertThat(capturedRequest.getDatas()).hasSize(1);

		DecisionDto cancellationDecision = capturedRequest.getDatas().get(0);
		assertThat(cancellationDecision.getDecisionType()).isEqualTo("PRE_SCREEN_ACCEPTED");
		assertThat(cancellationDecision.getIsCancel()).isTrue();
		assertThat(cancellationDecision.getApplicationId()).isEqualTo(10);
		assertThat(cancellationDecision.getUserId()).isEqualTo(44);
		assertThat(cancellationDecision.getPipelineStageId()).isEqualTo(21);
		assertThat(cancellationDecision.getApplicationProgressId()).isEqualTo(99);
		assertThat(cancellationDecision.getDecisionMode()).isEqualTo("CANCEL");
		assertThat(cancellationDecision.getCancelsDecisionId()).isEqualTo(500);
		assertThat(cancellationDecision.getJustification()).isEqualTo("Audit trail mismatch");
	}

	@Test
	void update_acceptsPartialDecisionPayloadOverHttp() throws Exception {
		DecisionDto updatedDecision = new DecisionDto();
		updatedDecision.setId(91);
		updatedDecision.setJustification("Justification corrigée");

		Response<DecisionDto> response = new Response<>();
		response.setHasError(false);
		response.setItems(List.of(updatedDecision));

		when(controllerFactory.update(eq(decisionBusiness), any(Request.class), eq(FunctionalityEnum.UPDATE_DECISIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/decisions/update")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 77,
						  \"isSimpleLoading\": true,
						  \"datas\": [
						    {
						      \"id\": 91,
						      \"justification\": \"Justification corrigée\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(false))
				.andExpect(jsonPath("$.items[0].id").value(91))
				.andExpect(jsonPath("$.items[0].justification").value("Justification corrigée"))
				.andExpect(jsonPath("$.items[0].decisionType").doesNotExist())
				.andExpect(jsonPath("$.items[0].applicationProgressId").doesNotExist())
				.andExpect(jsonPath("$.items[0].cancelsDecisionId").doesNotExist());

		ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
		verify(controllerFactory).update(eq(decisionBusiness), requestCaptor.capture(), eq(FunctionalityEnum.UPDATE_DECISIONS));

		@SuppressWarnings("unchecked")
		Request<DecisionDto> capturedRequest = requestCaptor.getValue();
		assertThat(capturedRequest.getUser()).isEqualTo(77);
		assertThat(capturedRequest.getIsSimpleLoading()).isTrue();
		assertThat(capturedRequest.getDatas()).hasSize(1);

		DecisionDto partialDecision = capturedRequest.getDatas().get(0);
		assertThat(partialDecision.getId()).isEqualTo(91);
		assertThat(partialDecision.getJustification()).isEqualTo("Justification corrigée");
		assertThat(partialDecision.getDecisionType()).isNull();
		assertThat(partialDecision.getApplicationProgressId()).isNull();
		assertThat(partialDecision.getCancelsDecisionId()).isNull();
	}

	@Test
	void update_returnsErrorPayloadAsIsWhenBusinessFails() throws Exception {
		Response<DecisionDto> response = new Response<>();
		response.setHasError(true);
		response.setStatus(buildStatus("FUNC_ERROR", "Decision update refused"));

		when(controllerFactory.update(eq(decisionBusiness), any(Request.class), eq(FunctionalityEnum.UPDATE_DECISIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/decisions/update")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 77,
						  \"isSimpleLoading\": true,
						  \"datas\": [
						    {
						      \"id\": 91,
						      \"justification\": \"Justification corrigée\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(true))
				.andExpect(jsonPath("$.status.code").value("FUNC_ERROR"))
				.andExpect(jsonPath("$.status.message").value("Decision update refused"));

		verify(controllerFactory).update(eq(decisionBusiness), any(Request.class), eq(FunctionalityEnum.UPDATE_DECISIONS));
	}

	private Status buildStatus(String code, String message) {
		Status status = new Status();
		status.setCode(code);
		status.setMessage(message);
		return status;
	}
}