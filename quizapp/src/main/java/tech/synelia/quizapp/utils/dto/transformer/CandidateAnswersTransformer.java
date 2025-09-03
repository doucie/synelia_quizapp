

/*
 * Java transformer for entity table candidate_answers 
 * Created on 2025-08-22 ( Time 11:38:25 )
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
 * TRANSFORMER for table "candidate_answers"
 * 
 * @author Geo
 *
 */
@Mapper
public interface CandidateAnswersTransformer {

	CandidateAnswersTransformer INSTANCE = Mappers.getMapper(CandidateAnswersTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.applications.id", target="applicationId"),
		@Mapping(source="entity.questionsAnswers.id", target="questionsAnswersId"),
	})
	CandidateAnswersDto toDto(CandidateAnswers entity) throws ParseException;

	@Named("toLiteDto")
    default CandidateAnswersDto toLiteDto(CandidateAnswers entity) {
		if (entity == null) {
			return null;
		}
		CandidateAnswersDto dto = new CandidateAnswersDto();
								dto.setId( entity.getId() );
																																						return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<CandidateAnswersDto> toDtos(List<CandidateAnswers> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<CandidateAnswersDto> toLiteDtos(List<CandidateAnswers> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CandidateAnswersDto> dtos = new ArrayList<CandidateAnswersDto>();
		for (CandidateAnswers entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="applications", target="applications"),
		@Mapping(source="questionsAnswers", target="questionsAnswers"),
	})
    CandidateAnswers toEntity(CandidateAnswersDto dto, Applications applications, QuestionsAnswers questionsAnswers) throws ParseException;
}
