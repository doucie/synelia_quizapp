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
 * TRANSFORMER for table "question"
 */
@Mapper
public interface QuestionTransformer {

	QuestionTransformer INSTANCE = Mappers.getMapper(QuestionTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.allAnswersJustificationRequired", target="allAnswersJustificationRequired"),
		@Mapping(source="entity.manualCorrectionRequired", target="manualCorrectionRequired"),
		@Mapping(source="entity.freeTextResponsePlaceholder", target="freeTextResponsePlaceholder"),
		@Mapping(source="entity.specialities.id", target="specialityId"),
	})
	QuestionDto toDto(Question entity) throws ParseException;

	@Named("toLiteDto")
	default QuestionDto toLiteDto(Question entity) {
		if (entity == null) {
			return null;
		}
		QuestionDto dto = new QuestionDto();
		dto.setId(entity.getId());
		return dto;
	}

	@IterableMapping(qualifiedByName = "toFullDto")
	List<QuestionDto> toDtos(List<Question> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<QuestionDto> toLiteDtos(List<Question> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<QuestionDto> dtos = new ArrayList<QuestionDto>();
		for (Question entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.questionRef", target="questionRef"),
		@Mapping(source="dto.questionText", target="questionText"),
		@Mapping(source="dto.questionChrono", target="questionChrono"),
		@Mapping(source="dto.questionType", target="questionType"),
		@Mapping(source="dto.score", target="score"),
		@Mapping(source="dto.difficultyLevel", target="difficultyLevel"),
		@Mapping(source="dto.allAnswersJustificationRequired", target="allAnswersJustificationRequired"),
		@Mapping(source="dto.manualCorrectionRequired", target="manualCorrectionRequired"),
		@Mapping(source="dto.freeTextResponsePlaceholder", target="freeTextResponsePlaceholder"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="specialities", target="specialities"),
	})
	Question toEntity(QuestionDto dto, Specialities specialities) throws ParseException;
}
