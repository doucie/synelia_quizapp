

/*
 * Java transformer for entity table questions_answers 
 * Created on 2025-08-22 ( Time 11:38:27 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

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
 * TRANSFORMER for table "questions_answers"
 * 
 * @author Geo
 *
 */
@Mapper
public interface QuestionsAnswersTransformer {

	QuestionsAnswersTransformer INSTANCE = Mappers.getMapper(QuestionsAnswersTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.questions.id", target="questionId"),
		@Mapping(source="entity.answers.id", target="answerId"),
	})
	QuestionsAnswersDto toDto(QuestionsAnswers entity) throws ParseException;

	@Named("toLiteDto")
    default QuestionsAnswersDto toLiteDto(QuestionsAnswers entity) {
		if (entity == null) {
			return null;
		}
		QuestionsAnswersDto dto = new QuestionsAnswersDto();
								dto.setId( entity.getId() );
																																										return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<QuestionsAnswersDto> toDtos(List<QuestionsAnswers> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<QuestionsAnswersDto> toLiteDtos(List<QuestionsAnswers> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<QuestionsAnswersDto> dtos = new ArrayList<QuestionsAnswersDto>();
		for (QuestionsAnswers entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.isCorrect", target="isCorrect"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="questions", target="questions"),
		@Mapping(source="answers", target="answers"),
	})
    QuestionsAnswers toEntity(QuestionsAnswersDto dto, Questions questions, Answers answers) throws ParseException;
}
