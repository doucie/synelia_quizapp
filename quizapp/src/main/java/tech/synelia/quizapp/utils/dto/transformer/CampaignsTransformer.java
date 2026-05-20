/*
 * Java transformer for entity table campaigns
 * Created on 2025-08-22 ( Time 11:38:25 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.utils.dto.transformer;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import tech.synelia.quizapp.dao.entity.Campaigns;
import tech.synelia.quizapp.dao.entity.PipelineTemplate;
import tech.synelia.quizapp.dao.entity.Specialities;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.utils.dto.CampaignsDto;

/**
 * TRANSFORMER for table "campaigns"
 */
public interface CampaignsTransformer {

	CampaignsTransformer INSTANCE = new CampaignsTransformer() {
	};

	default CampaignsDto toDto(Campaigns entity) throws ParseException {
		if (entity == null) {
			return null;
		}

		CampaignsDto dto = new CampaignsDto();
		dto.setId(entity.getId());
		dto.setCampaignTitle(entity.getCampaignTitle());
		dto.setCampaignDesc(entity.getCampaignDesc());
		dto.setCampaignStatus(entity.getCampaignStatus());
		dto.setCampaignStart(formatDate(entity.getCampaignStart(), "yyyy-MM-dd"));
		dto.setCampaignEnd(formatDate(entity.getCampaignEnd(), "yyyy-MM-dd"));
		dto.setMaxApply(entity.getMaxApply());
		dto.setAllCanEvaluate(entity.getAllCanEvaluate());
		dto.setTotalQuestions(entity.getTotalQuestions());
		dto.setIsTimed(entity.getIsTimed());
		dto.setIsArchived(entity.getIsArchived());
		dto.setTimeAllForms(entity.getTimeAllForms());
		dto.setFormAssignmentStrategy(entity.getFormAssignmentStrategy());
		dto.setFormAssignmentExhaustionPolicy(entity.getFormAssignmentExhaustionPolicy());
		dto.setCreatedAt(formatDate(entity.getCreatedAt(), "dd/MM/yyyy"));
		dto.setCreatedBy(entity.getCreatedBy());
		dto.setUpdatedAt(formatDate(entity.getUpdatedAt(), "dd/MM/yyyy"));
		dto.setUpdatedBy(entity.getUpdatedBy());
		dto.setIsDeleted(entity.getIsDeleted());
		dto.setSearchString(entity.getSearchString());

		if (entity.getUser() != null) {
			dto.setCreatorId(entity.getUser().getId());
			dto.setUserFirstName(entity.getUser().getFirstName());
			dto.setUserLastName(entity.getUser().getLastName());
			if (entity.getUser().getUsername() != null && !entity.getUser().getUsername().isBlank()) {
				dto.setCreatorName(entity.getUser().getUsername());
			}
		}

		if (entity.getSpecialities() != null) {
			dto.setSpecialityId(entity.getSpecialities().getId());
			dto.setSpecialityName(entity.getSpecialities().getSpecialityName());
		}

		if (entity.getPipelineTemplate() != null) {
			dto.setPipelineTemplateId(entity.getPipelineTemplate().getId());
			dto.setPipelineTemplateName(entity.getPipelineTemplate().getTemplateName());
		}

		return dto;
	}

	default CampaignsDto toLiteDto(Campaigns entity) {
		if (entity == null) {
			return null;
		}
		CampaignsDto dto = new CampaignsDto();
		dto.setId(entity.getId());
		return dto;
	}

	default List<CampaignsDto> toDtos(List<Campaigns> entities) throws ParseException {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CampaignsDto> dtos = new ArrayList<>();
		for (Campaigns entity : entities) {
			dtos.add(toDto(entity));
		}
		return dtos;
	}

	default List<CampaignsDto> toLiteDtos(List<Campaigns> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<CampaignsDto> dtos = new ArrayList<>();
		for (Campaigns entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	default Campaigns toEntity(CampaignsDto dto, User user, Specialities specialities, PipelineTemplate pipelineTemplate)
			throws ParseException {
		if (dto == null) {
			return null;
		}

		Campaigns entity = new Campaigns();
		entity.setId(dto.getId());
		entity.setCampaignTitle(dto.getCampaignTitle());
		entity.setCampaignDesc(dto.getCampaignDesc());
		entity.setCampaignStatus(dto.getCampaignStatus());
		entity.setCampaignStart(parseDate(dto.getCampaignStart(), "yyyy-MM-dd"));
		entity.setCampaignEnd(parseDate(dto.getCampaignEnd(), "yyyy-MM-dd"));
		entity.setMaxApply(dto.getMaxApply());
		entity.setAllCanEvaluate(dto.getAllCanEvaluate());
		entity.setTotalQuestions(dto.getTotalQuestions());
		entity.setIsTimed(dto.getIsTimed());
		entity.setIsArchived(dto.getIsArchived());
		entity.setTimeAllForms(dto.getTimeAllForms());
		entity.setFormAssignmentStrategy(dto.getFormAssignmentStrategy());
		entity.setFormAssignmentExhaustionPolicy(dto.getFormAssignmentExhaustionPolicy());
		entity.setCreatedAt(parseDate(dto.getCreatedAt(), "dd/MM/yyyy"));
		entity.setCreatedBy(dto.getCreatedBy());
		entity.setUpdatedAt(parseDate(dto.getUpdatedAt(), "dd/MM/yyyy"));
		entity.setUpdatedBy(dto.getUpdatedBy());
		entity.setIsDeleted(dto.getIsDeleted());
		entity.setSearchString(dto.getSearchString());
		entity.setUser(user);
		entity.setSpecialities(specialities);
		entity.setPipelineTemplate(pipelineTemplate);
		return entity;
	}

	private static String formatDate(java.util.Date value, String pattern) {
		if (value == null) {
			return null;
		}
		return new SimpleDateFormat(pattern).format(value);
	}

	private static java.util.Date parseDate(String value, String pattern) throws ParseException {
		if (value == null || value.isBlank()) {
			return null;
		}
		return new SimpleDateFormat(pattern).parse(value);
	}
}
