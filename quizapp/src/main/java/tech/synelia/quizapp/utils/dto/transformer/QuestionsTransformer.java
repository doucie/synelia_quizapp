

/*
 * Java transformer for entity table questions 
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
 * TRANSFORMER for table "questions"
 * 
 * @author Geo
 *
 */
@Mapper
public interface QuestionsTransformer {

	QuestionsTransformer INSTANCE = Mappers.getMapper(QuestionsTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.specialities.id", target="specialityId"),
	})
	QuestionsDto toDto(Questions entity) throws ParseException;

	@Named("toLiteDto")
    default QuestionsDto toLiteDto(Questions entity) {
		if (entity == null) {
			return null;
		}
		QuestionsDto dto = new QuestionsDto();
								dto.setId( entity.getId() );
																																										return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<QuestionsDto> toDtos(List<Questions> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<QuestionsDto> toLiteDtos(List<Questions> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<QuestionsDto> dtos = new ArrayList<QuestionsDto>();
		for (Questions entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.questionContent", target="questionContent"),
		@Mapping(source="dto.questionChrono", target="questionChrono"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="specialities", target="specialities"),
	})
    Questions toEntity(QuestionsDto dto, Specialities specialities) throws ParseException;
}
