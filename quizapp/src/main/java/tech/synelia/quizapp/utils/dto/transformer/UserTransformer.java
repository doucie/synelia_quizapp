

/*
 * Java transformer for entity table user 
 * Created on 2025-08-22 ( Time 11:38:28 )
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
 * TRANSFORMER for table "user"
 * 
 * @author Geo
 *
 */
@Mapper
public interface UserTransformer {

	UserTransformer INSTANCE = Mappers.getMapper(UserTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.lastConnectionDate", dateFormat="dd/MM/yyyy", target="lastConnectionDate"),
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.pageSizePreference", target="pageSizePreference"),
		@Mapping(source="entity.adminMode", target="adminMode"),
	})
	UserDto toDto(User entity) throws ParseException;

	@Named("toLiteDto")
    default UserDto toLiteDto(User entity) {
		if (entity == null) {
			return null;
		}
		UserDto dto = new UserDto();
							dto.setId( entity.getId() );
									dto.setFirstName( entity.getFirstName() );
									dto.setLastName( entity.getLastName() );
									dto.setEmail( entity.getEmail() );
									dto.setUserRole( entity.getUserRole() );
									dto.setPageSizePreference( entity.getPageSizePreference() );
									dto.setAdminMode( entity.getAdminMode() );
																																																		return dto;
    }	@IterableMapping(qualifiedByName = "toFullDto")
    List<UserDto> toDtos(List<User> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<UserDto> toLiteDtos(List<User> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<UserDto> dtos = new ArrayList<UserDto>();
		for (User entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.firstName", target="firstName"),
		@Mapping(source="dto.lastName", target="lastName"),
		@Mapping(source="dto.username", target="username"),
		@Mapping(source="dto.email", target="email"),
		@Mapping(source="dto.phone", target="phone"),
		@Mapping(source="dto.password", target="password"),
		@Mapping(source="dto.isDefaultPassword", target="isDefaultPassword"),
		@Mapping(source="dto.userRole", target="userRole"),
		@Mapping(source="dto.isOnline", target="isOnline"),
		@Mapping(source="dto.isLocked", target="isLocked"),
		@Mapping(source="dto.lastConnectionDate", dateFormat="dd/MM/yyyy",target="lastConnectionDate"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.adminMode", target="adminMode"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="dto.pageSizePreference", target="pageSizePreference"),
	})
    User toEntity(UserDto dto) throws ParseException;
}
