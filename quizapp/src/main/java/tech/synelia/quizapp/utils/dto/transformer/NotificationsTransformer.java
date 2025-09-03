

/*
 * Java transformer for entity table notifications 
 * Created on 2025-08-22 ( Time 11:38:27 )
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
 * TRANSFORMER for table "notifications"
 * 
 * @author Geo
 *
 */
@Mapper
public interface NotificationsTransformer {

	NotificationsTransformer INSTANCE = Mappers.getMapper(NotificationsTransformer.class);

	@FullTransformerQualifier
	@Named("toFullDto")
	@Mappings({
		@Mapping(source="entity.createdAt", dateFormat="dd/MM/yyyy", target="createdAt"),
		@Mapping(source="entity.updatedAt", dateFormat="dd/MM/yyyy", target="updatedAt"),
		@Mapping(source="entity.user.id", target="userId"),
		@Mapping(source="entity.user.firstName", target="userFirstName"),
		@Mapping(source="entity.user.lastName", target="userLastName"),
	})
	NotificationsDto toDto(Notifications entity) throws ParseException;

	@Named("toLiteDto")
    default NotificationsDto toLiteDto(Notifications entity) {
		if (entity == null) {
			return null;
		}
		NotificationsDto dto = new NotificationsDto();
								dto.setId( entity.getId() );
																																																		return dto;
    }

	@IterableMapping(qualifiedByName = "toFullDto")
    List<NotificationsDto> toDtos(List<Notifications> entities) throws ParseException;

	@IterableMapping(qualifiedByName = "toLiteDto")
	default List<NotificationsDto> toLiteDtos(List<Notifications> entities) {
		if (entities == null || entities.isEmpty()) {
			return new ArrayList<>();
		}
		List<NotificationsDto> dtos = new ArrayList<NotificationsDto>();
		for (Notifications entity : entities) {
			dtos.add(toLiteDto(entity));
		}
		return dtos;
	}

	@Mappings({
		@Mapping(source="dto.id", target="id"),
		@Mapping(source="dto.notifType", target="notifType"),
		@Mapping(source="dto.notifActor", target="notifActor"),
		@Mapping(source="dto.notifLink", target="notifLink"),
		@Mapping(source="dto.isRead", target="isRead"),
		@Mapping(source="dto.createdAt", dateFormat="dd/MM/yyyy",target="createdAt"),
		@Mapping(source="dto.createdBy", target="createdBy"),
		@Mapping(source="dto.updatedAt", dateFormat="dd/MM/yyyy",target="updatedAt"),
		@Mapping(source="dto.updatedBy", target="updatedBy"),
		@Mapping(source="dto.isDeleted", target="isDeleted"),
		@Mapping(source="dto.searchString", target="searchString"),
		@Mapping(source="user", target="user"),
	})
    Notifications toEntity(NotificationsDto dto, User user) throws ParseException;
}
