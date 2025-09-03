

/*
 * Java transformer for entity table candidate_token 
 * Created on 2025-08-22 ( Time 11:38:26 )
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
 * TRANSFORMER for table "candidate_token"
 * 
 * @author Geo
 *
 */
@Mapper
public interface CandidateTokenTransformer {

	CandidateTokenTransformer INSTANCE = Mappers.getMapper(CandidateTokenTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.applications.id", target="applicationId"),
	})
	CandidateTokenDto toDto(CandidateToken entity) throws ParseException;

	@Named("toLiteDto")
    default CandidateTokenDto toLiteDto(CandidateToken entity) {
		if (entity == null) {
			return null;
		}
		CandidateTokenDto dto = new CandidateTokenDto();
								dto.setId( entity.getId() );
																																						return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<CandidateTokenDto> toDtos(List<CandidateToken> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<CandidateTokenDto> toLiteDtos(List<CandidateToken> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CandidateTokenDto> dtos = new ArrayList<CandidateTokenDto>();
		for (CandidateToken entity : entities) {
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
		@Mapping(source="applications", target="applications"),
	})
    CandidateToken toEntity(CandidateTokenDto dto, Applications applications) throws ParseException;
}
