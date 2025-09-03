

/*
 * Java transformer for entity table interviews 
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
 * TRANSFORMER for table "interviews"
 * 
 * @author Geo
 *
 */
@Mapper
public interface InterviewsTransformer {

	InterviewsTransformer INSTANCE = Mappers.getMapper(InterviewsTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.interviewStart", dateFormat="dd/MM/yyyy", target="interviewStart"),
		@Mapping(source="entity.interviewEnd", dateFormat="dd/MM/yyyy", target="interviewEnd"),
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.campaigns.id", target="campaignId"),
	})
	InterviewsDto toDto(Interviews entity) throws ParseException;

	@Named("toLiteDto")
    default InterviewsDto toLiteDto(Interviews entity) {
		if (entity == null) {
			return null;
		}
		InterviewsDto dto = new InterviewsDto();
								dto.setId( entity.getId() );
																																																						return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<InterviewsDto> toDtos(List<Interviews> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<InterviewsDto> toLiteDtos(List<Interviews> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<InterviewsDto> dtos = new ArrayList<InterviewsDto>();
		for (Interviews entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.interviewLocation", target="interviewLocation"),
		@Mapping(source="dto.interviewStart", dateFormat="dd/MM/yyyy",target="interviewStart"),
		@Mapping(source="dto.interviewEnd", dateFormat="dd/MM/yyyy",target="interviewEnd"),
		@Mapping(source="dto.interviewType", target="interviewType"),
		@Mapping(source="dto.markedOutOf", target="markedOutOf"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="campaigns", target="campaigns"),
	})
    Interviews toEntity(InterviewsDto dto, Campaigns campaigns) throws ParseException;
}
