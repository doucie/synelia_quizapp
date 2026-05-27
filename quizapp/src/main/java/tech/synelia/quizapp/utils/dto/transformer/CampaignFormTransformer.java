package tech.synelia.quizapp.utils.dto.transformer;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import tech.synelia.quizapp.dao.entity.CampaignForm;
import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.Form;
import tech.synelia.quizapp.utils.contract.FullTransformerQualifier;
import tech.synelia.quizapp.utils.dto.CampaignFormDto;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CampaignFormTransformer {

	CampaignFormTransformer INSTANCE = Mappers.getMapper(CampaignFormTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source = "entity.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
		@Mapping(source = "entity.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
		@Mapping(source = "entity.campaigns.id", target = "campaignId"),
		@Mapping(source = "entity.campaigns.campaignTitle", target = "campaignName"),
		@Mapping(source = "entity.form.id", target = "formId"),
		@Mapping(source = "entity.form.formName", target = "formName"),
		@Mapping(source = "entity.form.formDesc", target = "formDesc"),
		@Mapping(source = "entity.form.isActive", target = "formActive")
	})
	CampaignFormDto toDto(CampaignForm entity) throws ParseException;

	@Named("toLiteDto")
	default CampaignFormDto toLiteDto(CampaignForm entity) {
		if (entity == null) {
			return null;
		}
		CampaignFormDto dto = new CampaignFormDto();
		dto.setId(entity.getId());
		return dto;
	}

	@IterableMapping(qualifiedByName = "toFullDto")
	List<CampaignFormDto> toDtos(List<CampaignForm> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<CampaignFormDto> toLiteDtos(List<CampaignForm> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CampaignFormDto> dtos = new ArrayList<>();
		for (CampaignForm entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source = "dto.id", target = "id"),
		@Mapping(source = "dto.assignmentOrder", target = "assignmentOrder"),
		@Mapping(source = "dto.createdAt", dateFormat = "dd/MM/yyyy", target = "createdAt"),
		@Mapping(source = "dto.createdBy", target = "createdBy"),
		@Mapping(source = "dto.updatedAt", dateFormat = "dd/MM/yyyy", target = "updatedAt"),
		@Mapping(source = "dto.updatedBy", target = "updatedBy"),
		@Mapping(source = "dto.isDeleted", target = "isDeleted"),
		@Mapping(source = "dto.searchString", target = "searchString"),
		@Mapping(source = "campaign", target = "campaigns"),
		@Mapping(source = "form", target = "form")
	})
	CampaignForm toEntity(CampaignFormDto dto, Campaigns campaign, Form form) throws ParseException;
}