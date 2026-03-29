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
 * TRANSFORMER for table "form_questions"
 */
@Mapper
public interface FormQuestionsTransformer {

	FormQuestionsTransformer INSTANCE = Mappers.getMapper(FormQuestionsTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.formVersion.id", target="formVersionId"),
		@Mapping(source="entity.question.id", target="questionId"),
	})
	FormQuestionsDto toDto(FormQuestions entity) throws ParseException;

	@Named("toLiteDto")
	default FormQuestionsDto toLiteDto(FormQuestions entity) {
		if (entity == null) {
			return null;
		}
		FormQuestionsDto dto = new FormQuestionsDto();
		dto.setId(entity.getId());
		return dto;
	}

	@IterableMapping(qualifiedByName = "toFullDto")
	List<FormQuestionsDto> toDtos(List<FormQuestions> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<FormQuestionsDto> toLiteDtos(List<FormQuestions> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<FormQuestionsDto> dtos = new ArrayList<FormQuestionsDto>();
		for (FormQuestions entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.questionOrder", target="questionOrder"),
		@Mapping(source="dto.chronoOverride", target="chronoOverride"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="formVersion", target="formVersion"),
		@Mapping(source="question", target="question"),
	})
	FormQuestions toEntity(FormQuestionsDto dto, FormVersion formVersion, Question question) throws ParseException;
}
