package tech.synelia.quizapp.rest.api;

import java.util.List;
import java.util.Locale;

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

import tech.synelia.quizapp.business.EvaluationsBusiness;
import tech.synelia.quizapp.rest.fact.ControllerFactory;
import tech.synelia.quizapp.utils.Status;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.EvaluationItemDto;
import tech.synelia.quizapp.utils.dto.EvaluationsDto;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;

@ExtendWith(MockitoExtension.class)
class EvaluationsControllerTest {

	@Mock
	private ControllerFactory<EvaluationsDto> controllerFactory;
	@Mock
	private EvaluationsBusiness evaluationsBusiness;

	@InjectMocks
	private EvaluationsController evaluationsController;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(evaluationsController).build();
	}

	@Test
	void create_returnsBadRequestWhenBusinessReturnsNullCreatedItems() throws Exception {
		Response<EvaluationsDto> response = new Response<>();
		response.setHasError(false);
		response.setItems(null);

		when(controllerFactory.create(eq(evaluationsBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_EVALUATIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/evaluations/create")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"datas\": [
						    {
						      \"candidateInterviewId\": 55,
						      \"interviewParticipantId\": 88,
						      \"globalScore\": 74,
						      \"globalComment\": \"Evaluation explicite\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(false));

		verify(controllerFactory).create(eq(evaluationsBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_EVALUATIONS));
	}

	@Test
	void create_returnsBadRequestWhenBusinessReturnsNoCreatedItems() throws Exception {
		Response<EvaluationsDto> response = new Response<>();
		response.setHasError(false);
		response.setItems(List.of());

		when(controllerFactory.create(eq(evaluationsBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_EVALUATIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/evaluations/create")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"datas\": [
						    {
						      \"candidateInterviewId\": 55,
						      \"interviewParticipantId\": 88,
						      \"globalScore\": 74,
						      \"globalComment\": \"Evaluation explicite\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(false));

		verify(controllerFactory).create(eq(evaluationsBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_EVALUATIONS));
	}

	@Test
	void create_returnsBadRequestWhenBusinessReturnsError() throws Exception {
		Response<EvaluationsDto> response = new Response<>();
		response.setHasError(true);

		when(controllerFactory.create(eq(evaluationsBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_EVALUATIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/evaluations/create")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"datas\": [
						    {
						      \"candidateInterviewId\": 55,
						      \"interviewParticipantId\": 88,
						      \"globalScore\": 74,
						      \"globalComment\": \"Evaluation explicite\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(true));

		verify(controllerFactory).create(eq(evaluationsBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_EVALUATIONS));
	}

	@Test
	void create_acceptsParticipantAnchoredPayloadOverHttp() throws Exception {
		EvaluationItemDto evaluationItem = new EvaluationItemDto();
		evaluationItem.setId(801);
		evaluationItem.setPipelineStageEvaluationCriterionId(501);
		evaluationItem.setCriterionOrder(1);
		evaluationItem.setLabel("Communication");
		evaluationItem.setCriterionType("SCORE");
		evaluationItem.setScoreValue(4.5d);
		evaluationItem.setTextValue("Bonne communication");
		evaluationItem.setMaxScoreSnapshot(5d);

		EvaluationsDto createdEvaluation = new EvaluationsDto();
		createdEvaluation.setId(701);
		createdEvaluation.setCandidateInterviewId(55);
		createdEvaluation.setInterviewParticipantId(88);
		createdEvaluation.setGlobalScore(74d);
		createdEvaluation.setGlobalComment("Evaluation explicite");
		createdEvaluation.setEvaluationItems(List.of(evaluationItem));

		Response<EvaluationsDto> response = new Response<>();
		response.setHasError(false);
		response.setItems(List.of(createdEvaluation));

		when(controllerFactory.create(eq(evaluationsBusiness), any(Request.class), eq(FunctionalityEnum.CREATE_EVALUATIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/evaluations/create")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"datas\": [
						    {
						      \"candidateInterviewId\": 55,
						      \"interviewParticipantId\": 88,
						      \"evaluationItems\": [
						        {
						          \"pipelineStageEvaluationCriterionId\": 501,
						          \"criterionOrder\": 1,
						          \"label\": \"Communication\",
						          \"criterionType\": \"SCORE\",
						          \"scoreValue\": 4.5,
						          \"textValue\": \"Bonne communication\",
						          \"maxScoreSnapshot\": 5
						        }
						      ],
						      \"globalScore\": 74,
						      \"globalComment\": \"Evaluation explicite\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isCreated())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(false))
				.andExpect(jsonPath("$.items[0].id").value(701))
				.andExpect(jsonPath("$.items[0].candidateInterviewId").value(55))
				.andExpect(jsonPath("$.items[0].interviewParticipantId").value(88))
				.andExpect(jsonPath("$.items[0].globalScore").value(74.0))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].pipelineStageEvaluationCriterionId").value(501))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].criterionOrder").value(1))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].label").value("Communication"))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].scoreValue").value(4.5))
				.andExpect(jsonPath("$.items[0].globalComment").value("Evaluation explicite"));

		ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
		verify(controllerFactory).create(eq(evaluationsBusiness), requestCaptor.capture(), eq(FunctionalityEnum.CREATE_EVALUATIONS));

		@SuppressWarnings("unchecked")
		Request<EvaluationsDto> capturedRequest = requestCaptor.getValue();
		assertThat(capturedRequest.getUser()).isEqualTo(44);
		assertThat(capturedRequest.getDatas()).hasSize(1);

		EvaluationsDto evaluation = capturedRequest.getDatas().get(0);
		assertThat(evaluation.getCandidateInterviewId()).isEqualTo(55);
		assertThat(evaluation.getInterviewParticipantId()).isEqualTo(88);
		assertThat(evaluation.getGlobalScore()).isEqualTo(74d);
		assertThat(evaluation.getGlobalComment()).isEqualTo("Evaluation explicite");
		assertThat(evaluation.getEvaluationItems()).hasSize(1);
		assertThat(evaluation.getEvaluationItems().get(0).getPipelineStageEvaluationCriterionId()).isEqualTo(501);
		assertThat(evaluation.getEvaluationItems().get(0).getCriterionOrder()).isEqualTo(1);
		assertThat(evaluation.getEvaluationItems().get(0).getLabel()).isEqualTo("Communication");
		assertThat(evaluation.getEvaluationItems().get(0).getScoreValue()).isEqualTo(4.5d);
	}

	@Test
	void update_acceptsParticipantAnchoredPayloadOverHttp() throws Exception {
		EvaluationItemDto evaluationItem = new EvaluationItemDto();
		evaluationItem.setId(802);
		evaluationItem.setPipelineStageEvaluationCriterionId(502);
		evaluationItem.setCriterionOrder(2);
		evaluationItem.setLabel("Technique");
		evaluationItem.setCriterionType("SCORE");
		evaluationItem.setScoreValue(3.5d);
		evaluationItem.setTextValue("Assez solide");
		evaluationItem.setMaxScoreSnapshot(5d);

		EvaluationsDto updatedEvaluation = new EvaluationsDto();
		updatedEvaluation.setId(701);
		updatedEvaluation.setCandidateInterviewId(55);
		updatedEvaluation.setInterviewParticipantId(88);
		updatedEvaluation.setGlobalScore(81d);
		updatedEvaluation.setGlobalComment("Commentaire mis a jour");
		updatedEvaluation.setEvaluationItems(List.of(evaluationItem));

		Response<EvaluationsDto> response = new Response<>();
		response.setHasError(false);
		response.setItems(List.of(updatedEvaluation));

		when(controllerFactory.update(eq(evaluationsBusiness), any(Request.class), eq(FunctionalityEnum.UPDATE_EVALUATIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/evaluations/update")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"datas\": [
						    {
						      \"id\": 701,
						      \"candidateInterviewId\": 55,
						      \"interviewParticipantId\": 88,
						      \"evaluationItems\": [
						        {
						          \"pipelineStageEvaluationCriterionId\": 502,
						          \"criterionOrder\": 2,
						          \"label\": \"Technique\",
						          \"criterionType\": \"SCORE\",
						          \"scoreValue\": 3.5,
						          \"textValue\": \"Assez solide\",
						          \"maxScoreSnapshot\": 5
						        }
						      ],
						      \"globalScore\": 81,
						      \"globalComment\": \"Commentaire mis a jour\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(false))
				.andExpect(jsonPath("$.items[0].id").value(701))
				.andExpect(jsonPath("$.items[0].candidateInterviewId").value(55))
				.andExpect(jsonPath("$.items[0].interviewParticipantId").value(88))
				.andExpect(jsonPath("$.items[0].globalScore").value(81.0))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].pipelineStageEvaluationCriterionId").value(502))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].criterionOrder").value(2))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].label").value("Technique"))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].scoreValue").value(3.5))
				.andExpect(jsonPath("$.items[0].globalComment").value("Commentaire mis a jour"));

		ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
		verify(controllerFactory).update(eq(evaluationsBusiness), requestCaptor.capture(), eq(FunctionalityEnum.UPDATE_EVALUATIONS));

		@SuppressWarnings("unchecked")
		Request<EvaluationsDto> capturedRequest = requestCaptor.getValue();
		assertThat(capturedRequest.getUser()).isEqualTo(44);
		assertThat(capturedRequest.getDatas()).hasSize(1);

		EvaluationsDto evaluation = capturedRequest.getDatas().get(0);
		assertThat(evaluation.getId()).isEqualTo(701);
		assertThat(evaluation.getCandidateInterviewId()).isEqualTo(55);
		assertThat(evaluation.getInterviewParticipantId()).isEqualTo(88);
		assertThat(evaluation.getGlobalScore()).isEqualTo(81d);
		assertThat(evaluation.getGlobalComment()).isEqualTo("Commentaire mis a jour");
		assertThat(evaluation.getEvaluationItems()).hasSize(1);
		assertThat(evaluation.getEvaluationItems().get(0).getPipelineStageEvaluationCriterionId()).isEqualTo(502);
		assertThat(evaluation.getEvaluationItems().get(0).getCriterionOrder()).isEqualTo(2);
		assertThat(evaluation.getEvaluationItems().get(0).getLabel()).isEqualTo("Technique");
		assertThat(evaluation.getEvaluationItems().get(0).getScoreValue()).isEqualTo(3.5d);
	}

	@Test
	void update_returnsErrorPayloadAsIsWhenBusinessFails() throws Exception {
		Response<EvaluationsDto> response = new Response<>();
		response.setHasError(true);
		response.setStatus(buildStatus("FUNC_ERROR", "Evaluation update refused"));

		when(controllerFactory.update(eq(evaluationsBusiness), any(Request.class), eq(FunctionalityEnum.UPDATE_EVALUATIONS)))
				.thenReturn(response);

		mockMvc.perform(post("/evaluations/update")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"datas\": [
						    {
						      \"id\": 701,
						      \"candidateInterviewId\": 55,
						      \"interviewParticipantId\": 88,
						      \"globalScore\": 81,
						      \"globalComment\": \"Commentaire mis a jour\"
						    }
						  ]
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(true))
				.andExpect(jsonPath("$.status.code").value("FUNC_ERROR"))
				.andExpect(jsonPath("$.status.message").value("Evaluation update refused"));

		verify(controllerFactory).update(eq(evaluationsBusiness), any(Request.class), eq(FunctionalityEnum.UPDATE_EVALUATIONS));
	}

	@Test
	void getCriteria_returnsStageCriteriaOverHttp() throws Exception {
		EvaluationItemDto evaluationItem = new EvaluationItemDto();
		evaluationItem.setPipelineStageEvaluationCriterionId(501);
		evaluationItem.setCriterionOrder(1);
		evaluationItem.setLabel("Communication");
		evaluationItem.setCriterionType("SCORE");
		evaluationItem.setMaxScoreSnapshot(5d);
		evaluationItem.setWeightSnapshot(2d);

		EvaluationsDto criteriaDto = new EvaluationsDto();
		criteriaDto.setCandidateInterviewId(55);
		criteriaDto.setEvaluationItems(List.of(evaluationItem));

		Response<EvaluationsDto> response = new Response<>();
		response.setHasError(false);
		response.setItems(List.of(criteriaDto));

		when(evaluationsBusiness.getCriteria(any(Request.class), any(Locale.class))).thenReturn(response);

		mockMvc.perform(post("/evaluations/getCriteria")
					.contentType(APPLICATION_JSON)
					.accept(APPLICATION_JSON)
					.content("""
						{
						  \"user\": 44,
						  \"data\": {
						    \"candidateInterviewId\": 55
						  }
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
				.andExpect(jsonPath("$.hasError").value(false))
				.andExpect(jsonPath("$.items[0].candidateInterviewId").value(55))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].pipelineStageEvaluationCriterionId").value(501))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].criterionOrder").value(1))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].label").value("Communication"))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].criterionType").value("SCORE"))
				.andExpect(jsonPath("$.items[0].evaluationItems[0].maxScoreSnapshot").value(5.0));

		ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
		verify(evaluationsBusiness).getCriteria(requestCaptor.capture(), any(Locale.class));

		@SuppressWarnings("unchecked")
		Request<EvaluationsDto> capturedRequest = requestCaptor.getValue();
		assertThat(capturedRequest.getUser()).isEqualTo(44);
		assertThat(capturedRequest.getData()).isNotNull();
		assertThat(capturedRequest.getData().getCandidateInterviewId()).isEqualTo(55);
	}

	private Status buildStatus(String code, String message) {
		Status status = new Status();
		status.setCode(code);
		status.setMessage(message);
		return status;
	}
}