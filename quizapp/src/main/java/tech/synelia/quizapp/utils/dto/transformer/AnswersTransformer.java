

/*
 * Java transformer for entity table answers 
 * Created on 2025-08-22 ( Time 11:38:23 )
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
 * TRANSFORMER for table "answers"
 * 
 * @author Geo
 *
 */
@Mapper
public interface AnswersTransformer {

	AnswersTransformer INSTANCE = Mappers.getMapper(AnswersTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
	})
	AnswersDto toDto(Answers entity) throws ParseException;

	@Named("toLiteDto")
    default AnswersDto toLiteDto(Answers entity) {
		if (entity == null) {
			return null;
		}
		AnswersDto dto = new AnswersDto();
								dto.setId( entity.getId() );
																																		return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<AnswersDto> toDtos(List<Answers> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<AnswersDto> toLiteDtos(List<Answers> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<AnswersDto> dtos = new ArrayList<AnswersDto>();
		for (Answers entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.answerContent", target="answerContent"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
	})
    Answers toEntity(AnswersDto dto) throws ParseException;
}
