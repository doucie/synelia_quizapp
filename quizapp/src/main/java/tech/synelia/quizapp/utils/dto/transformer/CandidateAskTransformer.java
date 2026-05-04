

/*
 * Java transformer for entity table candidate_ask 
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
 * TRANSFORMER for table "candidate_ask"
 * 
 * @author Geo
 *
 */
@Mapper
public interface CandidateAskTransformer {

	CandidateAskTransformer INSTANCE = Mappers.getMapper(CandidateAskTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.applications.id", target="applicationId"),
	})
	CandidateAskDto toDto(CandidateAsk entity) throws ParseException;

	@Named("toLiteDto")
    default CandidateAskDto toLiteDto(CandidateAsk entity) {
		if (entity == null) {
			return null;
		}
		CandidateAskDto dto = new CandidateAskDto();
								dto.setId( entity.getId() );
							dto.setAskStatus( entity.getAskStatus() );
							dto.setIsVerified( entity.getIsVerified() );
																		dto.setFirstName( entity.getFirstName() );
										dto.setLastName( entity.getLastName() );
										dto.setDecisionReason( entity.getDecisionReason() );
																																										return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<CandidateAskDto> toDtos(List<CandidateAsk> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<CandidateAskDto> toLiteDtos(List<CandidateAsk> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CandidateAskDto> dtos = new ArrayList<CandidateAskDto>();
		for (CandidateAsk entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.requestType", target="requestType"),
		@Mapping(source="dto.askStatus", target="askStatus"),
		@Mapping(source="dto.isVerified", target="isVerified"),
		@Mapping(source="dto.firstName", target="firstName"),
		@Mapping(source="dto.lastName", target="lastName"),
		@Mapping(source="dto.newEmail", target="newEmail"),
		@Mapping(source="dto.newPhone", target="newPhone"),
		@Mapping(source="dto.decisionReason", target="decisionReason"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="applications", target="applications"),
	})
    CandidateAsk toEntity(CandidateAskDto dto, Applications applications) throws ParseException;
}
