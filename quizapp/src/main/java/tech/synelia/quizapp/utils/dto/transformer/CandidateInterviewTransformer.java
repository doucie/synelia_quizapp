

/*
 * Java transformer for entity table candidate_interview 
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
 * TRANSFORMER for table "candidate_interview"
 * 
 * @author Geo
 *
 */
@Mapper
public interface CandidateInterviewTransformer {

	CandidateInterviewTransformer INSTANCE = Mappers.getMapper(CandidateInterviewTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.interviewStart", dateFormat="dd/MM/yyyy", target="interviewStart"),
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.applications.id", target="applicationId"),
		@Mapping(source="entity.interviews.id", target="interviewId"),
		@Mapping(source="entity.alternativeDateRequested", dateFormat="dd/MM/yyyy", target="alternativeDateRequested"),
	})
	CandidateInterviewDto toDto(CandidateInterview entity) throws ParseException;

	@Named("toLiteDto")
    default CandidateInterviewDto toLiteDto(CandidateInterview entity) {
		if (entity == null) {
			return null;
		}
		CandidateInterviewDto dto = new CandidateInterviewDto();
								dto.setId( entity.getId() );
																																														return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<CandidateInterviewDto> toDtos(List<CandidateInterview> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<CandidateInterviewDto> toLiteDtos(List<CandidateInterview> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CandidateInterviewDto> dtos = new ArrayList<CandidateInterviewDto>();
		for (CandidateInterview entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.interviewStart", dateFormat="dd/MM/yyyy",target="interviewStart"),
		@Mapping(source="dto.interviewDuration", target="interviewDuration"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="dto.declineReason", target="declineReason"),
		@Mapping(source="dto.alternativeDateRequested", dateFormat="dd/MM/yyyy", target="alternativeDateRequested"),
		@Mapping(source="applications", target="applications"),
		@Mapping(source="interviews", target="interviews"),
	})
    CandidateInterview toEntity(CandidateInterviewDto dto, Applications applications, Interviews interviews) throws ParseException;
}
