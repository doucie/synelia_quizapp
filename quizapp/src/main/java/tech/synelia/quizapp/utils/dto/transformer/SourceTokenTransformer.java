

/*
 * Java transformer for entity table source_token 
 * Created on 2025-08-22 ( Time 11:38:28 )
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
 * TRANSFORMER for table "source_token"
 * 
 * @author Geo
 *
 */
@Mapper
public interface SourceTokenTransformer {

	SourceTokenTransformer INSTANCE = Mappers.getMapper(SourceTokenTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.campaigns.id", target="campaignId"),
	})
	SourceTokenDto toDto(SourceToken entity) throws ParseException;

	@Named("toLiteDto")
    default SourceTokenDto toLiteDto(SourceToken entity) {
		if (entity == null) {
			return null;
		}
		SourceTokenDto dto = new SourceTokenDto();
								dto.setId( entity.getId() );
																																						return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<SourceTokenDto> toDtos(List<SourceToken> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<SourceTokenDto> toLiteDtos(List<SourceToken> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<SourceTokenDto> dtos = new ArrayList<SourceTokenDto>();
		for (SourceToken entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.tokenString", target="tokenString"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="campaigns", target="campaigns"),
	})
    SourceToken toEntity(SourceTokenDto dto, Campaigns campaigns) throws ParseException;
}
