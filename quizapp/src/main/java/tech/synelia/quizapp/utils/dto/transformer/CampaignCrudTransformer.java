

/*
 * Java transformer for entity table campaign_crud 
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

import tech.synelia.quizapp.dao.entity.CampaignCrud;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.utils.contract.FullTransformerQualifier;
import tech.synelia.quizapp.utils.dto.CampaignCrudDto;


/**
 * TRANSFORMER for table "campaign_crud"
 * 
 * @author Geo
 *
 */
@Mapper
public interface CampaignCrudTransformer {

	CampaignCrudTransformer INSTANCE = Mappers.getMapper(CampaignCrudTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.user.id", target="userId"),
		@Mapping(source="entity.user.firstName", target="userFirstName"),
		@Mapping(source="entity.user.lastName", target="userLastName"),
		@Mapping(source="entity.user.email", target="userEmail"),
		@Mapping(source="entity.user.userRole", target="userRole"),
		@Mapping(source="entity.user.username", target="userName"),
		@Mapping(source="entity.campaigns.id", target="campaignId"),
		@Mapping(target="idParam", ignore=true),
		@Mapping(target="canUpdateParam", ignore=true),
		@Mapping(target="canDeleteParam", ignore=true),
		@Mapping(target="canEvaluateParam", ignore=true),
		@Mapping(target="followParam", ignore=true),
		@Mapping(target="isAdminParam", ignore=true),
		@Mapping(target="canPlanifyParam", ignore=true),
		@Mapping(target="canAcceptPreScreenParam", ignore=true),
		@Mapping(target="canAcceptFinalParam", ignore=true),
		@Mapping(target="createdAtParam", ignore=true),
		@Mapping(target="createdByParam", ignore=true),
		@Mapping(target="updatedAtParam", ignore=true),
		@Mapping(target="updatedByParam", ignore=true),
		@Mapping(target="isDeletedParam", ignore=true),
		@Mapping(target="searchStringParam", ignore=true),
		@Mapping(target="campaignIdParam", ignore=true),
		@Mapping(target="userIdParam", ignore=true),
		@Mapping(target="userFirstNameParam", ignore=true),
		@Mapping(target="userLastNameParam", ignore=true),
	})
	CampaignCrudDto toDto(CampaignCrud entity) throws ParseException;	@Named("toLiteDto")
    default CampaignCrudDto toLiteDto(CampaignCrud entity) {
		if (entity == null) {
			return null;
		}
		CampaignCrudDto dto = new CampaignCrudDto();
								dto.setId( entity.getId() );
																																																						return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<CampaignCrudDto> toDtos(List<CampaignCrud> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<CampaignCrudDto> toLiteDtos(List<CampaignCrud> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CampaignCrudDto> dtos = new ArrayList<>();
		for (CampaignCrud entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.canUpdate", target="canUpdate"),
		@Mapping(source="dto.canDelete", target="canDelete"),
		@Mapping(source="dto.canEvaluate", target="canEvaluate"),
		@Mapping(source="dto.follow", target="follow"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="user", target="user"),
		@Mapping(source="campaigns", target="campaigns"),
	})
    CampaignCrud toEntity(CampaignCrudDto dto, User user, Campaigns campaigns) throws ParseException;
}
