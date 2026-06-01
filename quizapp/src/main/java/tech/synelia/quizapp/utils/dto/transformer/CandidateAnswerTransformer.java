package tech.synelia.quizapp.utils.dto.transformer;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.utils.contract.*;
import tech.synelia.quizapp.utils.dto.*;

/**
 * TRANSFORMER for table "candidate_answer"
 */
@Mapper
public interface CandidateAnswerTransformer {

	CandidateAnswerTransformer INSTANCE = Mappers.getMapper(CandidateAnswerTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.manualCorrectedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="manualCorrectedAt"),
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.manualCorrectionScore", target="manualCorrectionScore"),
		@Mapping(source="entity.applications.id", target="applicationId"),
		@Mapping(source="entity.applicationQuizAttempt.id", target="applicationQuizAttemptId"),
		@Mapping(source="entity.question.id", target="questionId"),
		@Mapping(source="entity.question.questionText", target="questionText"),
		@Mapping(source="entity.question.questionType", target="questionType"),
		@Mapping(source="entity.question.score", target="questionScore"),
		@Mapping(source="entity.question.manualCorrectionRequired", target="manualCorrectionRequired"),
		@Mapping(source="entity.applicationQuizAttempt.quizStatus", target="applicationQuizAttemptQuizStatus"),
		@Mapping(source="entity.applicationQuizAttempt.manualCorrectionStatus", target="applicationQuizAttemptManualCorrectionStatus"),
		@Mapping(source="entity.applicationQuizAttempt.score", target="applicationQuizAttemptScore"),
		@Mapping(source="entity.applicationQuizAttempt.scorePercent", target="applicationQuizAttemptScorePercent"),
		@Mapping(source="entity.applicationQuizAttempt.lastActivityAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="applicationQuizAttemptLastActivityAt"),
		@Mapping(source="entity.applicationQuizAttempt.startedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="applicationQuizAttemptStartedAt"),
		@Mapping(source="entity.applicationQuizAttempt.completedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="applicationQuizAttemptCompletedAt"),
		@Mapping(source="entity.answer.id", target="answerId"),
		@Mapping(source="entity.answer.answerText", target="answerText"),
		@Mapping(source="entity.answer.answerOrder", target="answerOrder"),
	})
	CandidateAnswerDto toDto(CandidateAnswer entity) throws ParseException;

	@Named("toLiteDto")
	default CandidateAnswerDto toLiteDto(CandidateAnswer entity) {
		if (entity == null) {
			return null;
		}
		CandidateAnswerDto dto = new CandidateAnswerDto();
		dto.setId(entity.getId());
		return dto;
	}

	@IterableMapping(qualifiedByName = "toFullDto")
	List<CandidateAnswerDto> toDtos(List<CandidateAnswer> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<CandidateAnswerDto> toLiteDtos(List<CandidateAnswer> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CandidateAnswerDto> dtos = new ArrayList<CandidateAnswerDto>();
		for (CandidateAnswer entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.freeTextResponse", target="freeTextResponse"),
		@Mapping(source="dto.isSelected", target="isSelected"),
		@Mapping(source="dto.manualIsCorrect", target="manualIsCorrect"),
		@Mapping(source="dto.manualCorrectionComment", target="manualCorrectionComment"),
		@Mapping(source="dto.manualCorrectionScore", target="manualCorrectionScore"),
		@Mapping(source="dto.manualCorrectedAt", dateFormat="dd/MM/yyyy HH:mm:ss", target="manualCorrectedAt"),
		@Mapping(source="dto.manualCorrectedBy", target="manualCorrectedBy"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="applications", target="applications"),
		@Mapping(target="applicationQuizAttempt", ignore=true),
		@Mapping(source="question", target="question"),
		@Mapping(source="answer", target="answer"),
	})
	CandidateAnswer toEntity(CandidateAnswerDto dto, Applications applications, Question question, Answer answer) throws ParseException;
}
