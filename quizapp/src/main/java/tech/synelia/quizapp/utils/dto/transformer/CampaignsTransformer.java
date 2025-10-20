

/*
 * Java transformer for entity table campaigns 
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
 * TRANSFORMER for table "campaigns"
 * 
 * @author Geo
 *
 */
@Mapper
public interface CampaignsTransformer {

	CampaignsTransformer INSTANCE = Mappers.getMapper(CampaignsTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.campaignStart", dateFormat="dd/MM/yyyy", target="campaignStart"),
		@Mapping(source="entity.campaignEnd", dateFormat="dd/MM/yyyy", target="campaignEnd"),
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.user.id", target="creatorId"),
		@Mapping(source="entity.user.firstName", target="userFirstName"),
		@Mapping(source="entity.user.lastName", target="userLastName"),
		@Mapping(source="entity.specialities.id", target="specialityId"),
	})
	CampaignsDto toDto(Campaigns entity) throws ParseException;

	@Named("toLiteDto")
    default CampaignsDto toLiteDto(Campaigns entity) {
		if (entity == null) {
			return null;
		}
		CampaignsDto dto = new CampaignsDto();
								dto.setId( entity.getId() );
																																																																						return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<CampaignsDto> toDtos(List<Campaigns> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<CampaignsDto> toLiteDtos(List<Campaigns> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CampaignsDto> dtos = new ArrayList<CampaignsDto>();
		for (Campaigns entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.campaignTitle", target="campaignTitle"),
		@Mapping(source="dto.campaignDesc", target="campaignDesc"),
		@Mapping(source="dto.campaignStatus", target="campaignStatus"),
		@Mapping(source="dto.campaignStart", dateFormat="dd/MM/yyyy",target="campaignStart"),
	@Mapping(source="dto.campaignEnd", dateFormat="dd/MM/yyyy",target="campaignEnd"),
	@Mapping(source="dto.maxApply", target="maxApply"),
	@Mapping(source="dto.allCanEvaluate", target="allCanEvaluate"),
	@Mapping(source="dto.totalQuestions", target="totalQuestions"),
	@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="user", target="user"),
		@Mapping(source="specialities", target="specialities"),
	})
    Campaigns toEntity(CampaignsDto dto, User user, Specialities specialities) throws ParseException;
}
