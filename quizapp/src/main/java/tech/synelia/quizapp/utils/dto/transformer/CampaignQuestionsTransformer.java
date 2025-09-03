

/*
 * Java transformer for entity table campaign_questions 
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
 * TRANSFORMER for table "campaign_questions"
 * 
 * @author Geo
 *
 */
@Mapper
public interface CampaignQuestionsTransformer {

	CampaignQuestionsTransformer INSTANCE = Mappers.getMapper(CampaignQuestionsTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.questions.id", target="questionId"),
		@Mapping(source="entity.campaigns.id", target="campaignId"),
	})
	CampaignQuestionsDto toDto(CampaignQuestions entity) throws ParseException;

	@Named("toLiteDto")
    default CampaignQuestionsDto toLiteDto(CampaignQuestions entity) {
		if (entity == null) {
			return null;
		}
		CampaignQuestionsDto dto = new CampaignQuestionsDto();
								dto.setId( entity.getId() );
																																						return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<CampaignQuestionsDto> toDtos(List<CampaignQuestions> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<CampaignQuestionsDto> toLiteDtos(List<CampaignQuestions> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CampaignQuestionsDto> dtos = new ArrayList<CampaignQuestionsDto>();
		for (CampaignQuestions entity : entities) {
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
		@Mapping(source="questions", target="questions"),
		@Mapping(source="campaigns", target="campaigns"),
	})
    CampaignQuestions toEntity(CampaignQuestionsDto dto, Questions questions, Campaigns campaigns) throws ParseException;
}
