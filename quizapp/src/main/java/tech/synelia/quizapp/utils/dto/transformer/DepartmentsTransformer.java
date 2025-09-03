

/*
 * Java transformer for entity table departments 
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
 * TRANSFORMER for table "departments"
 * 
 * @author Geo
 *
 */
@Mapper
public interface DepartmentsTransformer {

	DepartmentsTransformer INSTANCE = Mappers.getMapper(DepartmentsTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
	})
	DepartmentsDto toDto(Departments entity) throws ParseException;

	@Named("toLiteDto")
    default DepartmentsDto toLiteDto(Departments entity) {
		if (entity == null) {
			return null;
		}
		DepartmentsDto dto = new DepartmentsDto();
								dto.setId( entity.getId() );
																																						return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<DepartmentsDto> toDtos(List<Departments> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<DepartmentsDto> toLiteDtos(List<Departments> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<DepartmentsDto> dtos = new ArrayList<DepartmentsDto>();
		for (Departments entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.departmentName", target="departmentName"),
		@Mapping(source="dto.departmentDesc", target="departmentDesc"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
	})
    Departments toEntity(DepartmentsDto dto) throws ParseException;
}
