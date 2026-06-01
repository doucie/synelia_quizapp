

/*
 * Java transformer for entity table evaluations 
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
 * TRANSFORMER for table "evaluations"
 * 
 * @author Geo
 *
 */
@Mapper
public interface EvaluationsTransformer {

	EvaluationsTransformer INSTANCE = Mappers.getMapper(EvaluationsTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.candidateInterview.id", target="candidateInterviewId"),
		@Mapping(source="entity.interviewParticipant.id", target="interviewParticipantId"),
	})
	EvaluationsDto toDto(Evaluations entity) throws ParseException;

	@Named("toLiteDto")
    default EvaluationsDto toLiteDto(Evaluations entity) {
		if (entity == null) {
			return null;
		}
		EvaluationsDto dto = new EvaluationsDto();
								dto.setId( entity.getId() );
																																										return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<EvaluationsDto> toDtos(List<Evaluations> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<EvaluationsDto> toLiteDtos(List<Evaluations> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<EvaluationsDto> dtos = new ArrayList<EvaluationsDto>();
		for (Evaluations entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.candidateMark", target="candidateMark"),
		@Mapping(source="dto.recruiterComment", target="recruiterComment"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="candidateInterview", target="candidateInterview"),
		@Mapping(source="interviewParticipant", target="interviewParticipant"),
	})
    Evaluations toEntity(EvaluationsDto dto, CandidateInterview candidateInterview, InterviewParticipant interviewParticipant) throws ParseException;
}
