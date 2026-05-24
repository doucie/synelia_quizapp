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
 * TRANSFORMER for table "answer"
 */
@Mapper
public interface AnswerTransformer {

	AnswerTransformer INSTANCE = Mappers.getMapper(AnswerTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.allowAdditionalComment", target="allowAdditionalComment"),
		@Mapping(source="entity.additionalCommentRequired", target="additionalCommentRequired"),
		@Mapping(source="entity.additionalCommentPlaceholder", target="additionalCommentPlaceholder"),
		@Mapping(source="entity.question.id", target="questionId"),
	})
	AnswerDto toDto(Answer entity) throws ParseException;

	@Named("toLiteDto")
	default AnswerDto toLiteDto(Answer entity) {
		if (entity == null) {
			return null;
		}
		AnswerDto dto = new AnswerDto();
		dto.setId(entity.getId());
		return dto;
	}

	@IterableMapping(qualifiedByName = "toFullDto")
	List<AnswerDto> toDtos(List<Answer> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<AnswerDto> toLiteDtos(List<Answer> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<AnswerDto> dtos = new ArrayList<AnswerDto>();
		for (Answer entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.answerText", target="answerText"),
		@Mapping(source="dto.answerType", target="answerType"),
		@Mapping(source="dto.allowAdditionalComment", target="allowAdditionalComment"),
		@Mapping(source="dto.additionalCommentRequired", target="additionalCommentRequired"),
		@Mapping(source="dto.additionalCommentPlaceholder", target="additionalCommentPlaceholder"),
		@Mapping(source="dto.answerOrder", target="answerOrder"),
		@Mapping(source="dto.isCorrect", target="isCorrect"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="question", target="question"),
	})
	Answer toEntity(AnswerDto dto, Question question) throws ParseException;
}
