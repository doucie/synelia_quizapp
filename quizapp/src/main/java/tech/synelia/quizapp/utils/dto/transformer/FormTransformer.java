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
 * TRANSFORMER for table "form"
 */
@Mapper
public interface FormTransformer {

	FormTransformer INSTANCE = Mappers.getMapper(FormTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.campaigns.id", target="campaignId"),
	})
	FormDto toDto(Form entity) throws ParseException;

	@Named("toLiteDto")
	default FormDto toLiteDto(Form entity) {
		if (entity == null) {
			return null;
		}
		FormDto dto = new FormDto();
		dto.setId(entity.getId());
		return dto;
	}

	@IterableMapping(qualifiedByName = "toFullDto")
	List<FormDto> toDtos(List<Form> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<FormDto> toLiteDtos(List<Form> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<FormDto> dtos = new ArrayList<FormDto>();
		for (Form entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.formName", target="formName"),
		@Mapping(source="dto.formDesc", target="formDesc"),
		@Mapping(source="dto.isActive", target="isActive"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="campaigns", target="campaigns"),
	})
	Form toEntity(FormDto dto, Campaigns campaigns) throws ParseException;
}
