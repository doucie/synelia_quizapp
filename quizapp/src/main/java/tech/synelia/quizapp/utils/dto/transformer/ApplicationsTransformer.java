

/*
 * Java transformer for entity table applications 
 * Created on 2025-08-22 ( Time 11:38:24 )
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
 * TRANSFORMER for table "applications"
 * 
 * @author Geo
 *
 */
@Mapper
public interface ApplicationsTransformer {

	ApplicationsTransformer INSTANCE = Mappers.getMapper(ApplicationsTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.sourceToken.id", target="sourceTokenId"),
		@Mapping(source="entity.formVersion.id", target="formVersionId"),
		@Mapping(source="entity.quizTimedSnapshot", target="quizTimedSnapshot"),
		@Mapping(source="entity.quizTotalTimeAllowedSnapshot", target="quizTotalTimeAllowedSnapshot"),
	})
	ApplicationsDto toDto(Applications entity) throws ParseException;

	@Named("toLiteDto")
    default ApplicationsDto toLiteDto(Applications entity) {
		if (entity == null) {
			return null;
		}
		ApplicationsDto dto = new ApplicationsDto();
								dto.setId( entity.getId() );
																																																																										return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<ApplicationsDto> toDtos(List<Applications> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<ApplicationsDto> toLiteDtos(List<Applications> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<ApplicationsDto> dtos = new ArrayList<ApplicationsDto>();
		for (Applications entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.candidateFirstName", target="candidateFirstName"),
		@Mapping(source="dto.candidateLastName", target="candidateLastName"),
		@Mapping(source="dto.candidateEmail", target="candidateEmail"),
		@Mapping(source="dto.candidatePhone", target="candidatePhone"),
		@Mapping(source="dto.candidateCvPath", target="candidateCvPath"),
		@Mapping(source="dto.candidateBirthDate", dateFormat="yyyy-MM-dd", target="candidateBirthDate"),
		@Mapping(source="dto.motivationLetter", target="motivationLetter"),
		@Mapping(source="dto.emailVerified", target="emailVerified"),
		@Mapping(source="dto.quizScore", target="quizScore"),
		@Mapping(source="dto.totalEvaluationScore", target="totalEvaluationScore"),
		@Mapping(source="dto.totalEvaluationNumber", target="totalEvaluationNumber"),
		@Mapping(source="dto.totalEvaluationPercentage", target="totalEvaluationPercentage"),
		@Mapping(source="dto.applicationStatus", target="applicationStatus"),
		@Mapping(source="dto.quizManualCorrectionStatus", target="quizManualCorrectionStatus"),
		@Mapping(source="dto.quizTimedSnapshot", target="quizTimedSnapshot"),
		@Mapping(source="dto.quizTotalTimeAllowedSnapshot", target="quizTotalTimeAllowedSnapshot"),
		@Mapping(target="createdAt", ignore=true), // Backend sets this
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(target="updatedAt", ignore=true), // Backend sets this
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="sourceToken", target="sourceToken"),
		@Mapping(source="formVersion", target="formVersion"),
	})
    Applications toEntity(ApplicationsDto dto, SourceToken sourceToken, FormVersion formVersion) throws ParseException;
}
