package tech.synelia.quizapp.business;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.util.*;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.exception.*;
import tech.synelia.quizapp.utils.contract.IBasicBusiness;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.transformer.*;
import tech.synelia.quizapp.dao.entity.GroupChangeRequest;
import tech.synelia.quizapp.dao.entity.User;
import tech.synelia.quizapp.dao.entity.BusinessGroup;
import tech.synelia.quizapp.dao.entity.UserBusinessGroup;
import tech.synelia.quizapp.dao.entity.Notifications;
import tech.synelia.quizapp.dao.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Log
@Component
public class GroupChangeRequestBusiness implements IBasicBusiness<Request<GroupChangeRequestDto>, Response<GroupChangeRequestDto>> {

    @Autowired
    private GroupChangeRequestRepository groupChangeRequestRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BusinessGroupRepository businessGroupRepository;
    @Autowired
    private UserBusinessGroupRepository userBusinessGroupRepository;
    @Autowired
    private NotificationsRepository notificationsRepository;
    @Autowired
    private FunctionalError functionalError;
    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public Response<GroupChangeRequestDto> create(Request<GroupChangeRequestDto> request, Locale locale) throws ParseException {
        log.info("----begin create GroupChangeRequest-----");
        Response<GroupChangeRequestDto> response = new Response<>();
        List<GroupChangeRequest> items = new ArrayList<>();

        for (GroupChangeRequestDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("userId", dto.getUserId());
            fieldsToVerify.put("targetGroupId", dto.getTargetGroupId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            // Securite : un utilisateur ne peut creer une demande que pour lui-meme ;
            // ADMIN/SUPER_ADMIN peuvent creer pour autrui.
            Integer requesterId = request.getUser();
            if (requesterId != null && !requesterId.equals(dto.getUserId())) {
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                boolean isPrivileged = auth != null && auth.getAuthorities().stream()
                        .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ROLE_SUPER_ADMIN".equals(a.getAuthority()));
                if (!isPrivileged) {
                    throw new InvalidEntityException(functionalError.DATA_NOT_EXIST("Vous ne pouvez creer une demande que pour vous-meme", locale));
                }
            }

            User user = userRepository.findOne(dto.getUserId(), false);
            if (user == null) {
                response.setStatus(functionalError.DATA_NOT_EXIST("User", locale));
                response.setHasError(true);
                return response;
            }

            BusinessGroup targetGroup = businessGroupRepository.findOne(dto.getTargetGroupId(), false);
            if (targetGroup == null) {
                response.setStatus(functionalError.DATA_NOT_EXIST("BusinessGroup", locale));
                response.setHasError(true);
                return response;
            }

            if (hasActiveMembership(dto.getUserId(), dto.getTargetGroupId())) {
                response.setStatus(functionalError.DATA_EXIST("user already belongs to this business group", locale));
                response.setHasError(true);
                return response;
            }

            // Check for existing pending request
            List<GroupChangeRequest> existingPending = groupChangeRequestRepository.findPendingByUserId(dto.getUserId());
            for (GroupChangeRequest pending : existingPending) {
                if (pending.getTargetGroup() != null && pending.getTargetGroup().getId().equals(dto.getTargetGroupId())) {
                    response.setStatus(functionalError.DATA_EXIST("A pending request for this group already exists", locale));
                    response.setHasError(true);
                    return response;
                }
            }

            GroupChangeRequest entity = new GroupChangeRequest();
            entity.setUser(user);
            entity.setTargetGroup(targetGroup);
            entity.setReason(dto.getReason());
            entity.setStatus("PENDING");
            entity.setRequestedAt(new Date());
            entity.setCreatedAt(new Date());
            entity.setCreatedBy(request.getUser());
            entity.setIsDeleted(false);
            items.add(entity);

            // Notify moderators of the target group
            notifyGroupModerators(targetGroup, user, request.getUser());
        }

        if (!items.isEmpty()) {
            List<GroupChangeRequest> saved = groupChangeRequestRepository.saveAll(items);
            List<GroupChangeRequestDto> dtos = GroupChangeRequestTransformer.INSTANCE.toLiteDtos(saved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(dtos);
            response.setHasError(false);
            response.setStatus(status);
        }
        log.info("----end create GroupChangeRequest-----");
        return response;
    }

    @Override
    @Transactional
    public Response<GroupChangeRequestDto> update(Request<GroupChangeRequestDto> request, Locale locale) throws ParseException {
        log.info("----begin update GroupChangeRequest-----");
        Response<GroupChangeRequestDto> response = new Response<>();
        List<GroupChangeRequest> items = new ArrayList<>();

        for (GroupChangeRequestDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            GroupChangeRequest existing = groupChangeRequestRepository.findOne(dto.getId(), false);
            if (existing == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("GroupChangeRequest id -> " + dto.getId(), locale));
            }

            if (dto.getStatus() != null) {
                existing.setStatus(dto.getStatus());
                if ("APPROVED".equals(dto.getStatus()) || "REJECTED".equals(dto.getStatus())) {
                    existing.setProcessedAt(new Date());
                    existing.setProcessedBy(request.getUser());

                    // If approved, add user to the target group
                    if ("APPROVED".equals(dto.getStatus())) {
                        approveRequest(existing, request.getUser());
                    }

                    // Notify the requester
                    notifyRequester(existing, dto.getStatus());
                }
            }
            if (dto.getReason() != null) {
                existing.setReason(dto.getReason());
            }
            existing.setUpdatedAt(new Date());
            existing.setUpdatedBy(request.getUser());
            items.add(existing);
        }

        if (!items.isEmpty()) {
            List<GroupChangeRequest> saved = groupChangeRequestRepository.saveAll(items);
            List<GroupChangeRequestDto> dtos = GroupChangeRequestTransformer.INSTANCE.toLiteDtos(saved);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(dtos);
            response.setHasError(false);
            response.setStatus(status);
        }
        log.info("----end update GroupChangeRequest-----");
        return response;
    }

    @Override
    @Transactional
    public Response<GroupChangeRequestDto> delete(Request<GroupChangeRequestDto> request, Locale locale) throws ParseException {
        log.info("----begin delete GroupChangeRequest-----");
        Response<GroupChangeRequestDto> response = new Response<>();

        for (GroupChangeRequestDto dto : request.getDatas()) {
            Map<String, Object> fieldsToVerify = new HashMap<>();
            fieldsToVerify.put("id", dto.getId());
            if (!Validate.RequiredValue(fieldsToVerify).isGood()) {
                throw new InvalidEntityException(functionalError.FIELD_EMPTY(Validate.getValidate().getField(), locale));
            }

            GroupChangeRequest existing = groupChangeRequestRepository.findOne(dto.getId(), false);
            if (existing == null) {
                throw new EntityNotFoundException(functionalError.DATA_NOT_EXIST("GroupChangeRequest -> " + dto.getId(), locale));
            }

            existing.setIsDeleted(true);
            existing.setUpdatedAt(new Date());
            existing.setUpdatedBy(request.getUser());
            groupChangeRequestRepository.save(existing);
        }

        Status status = new Status();
        status.setCode(StatusCode.SUCCESS);
        status.setMessage(StatusMessage.SUCCESS);
        response.setHasError(false);
        response.setStatus(status);
        log.info("----end delete GroupChangeRequest-----");
        return response;
    }

    @Override
    public Response<GroupChangeRequestDto> getByCriteria(Request<GroupChangeRequestDto> request, Locale locale) throws ParseException {
        log.info("----begin get GroupChangeRequest by criteria-----");
        Response<GroupChangeRequestDto> response = new Response<>();

        try {
            List<GroupChangeRequest> items = groupChangeRequestRepository.getByCriteria(request, em, locale);

            if (items != null && !items.isEmpty()) {
                List<GroupChangeRequestDto> dtos = GroupChangeRequestTransformer.INSTANCE.toLiteDtos(items);

                Status status = new Status();
                status.setCode(StatusCode.SUCCESS);
                status.setMessage(StatusMessage.SUCCESS);
                response.setItems(dtos);
                response.setHasError(false);
                response.setStatus(status);
                response.setCount(groupChangeRequestRepository.count(request, em, locale));
            } else {
                response.setStatus(functionalError.DATA_EMPTY("group_change_request", locale));
                response.setHasError(false);
                return response;
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        log.info("----end get GroupChangeRequest by criteria-----");
        return response;
    }

    private void approveRequest(GroupChangeRequest request, Integer processedBy) {
        ensureUserMembership(request.getUser(), request.getTargetGroup(), processedBy);
    }

    private boolean hasActiveMembership(Integer userId, Integer groupId) {
        return userBusinessGroupRepository.findByUserIdAndBusinessGroupId(userId, groupId).stream()
                .anyMatch(this::isActiveMembership);
    }

    private void ensureUserMembership(User user, BusinessGroup targetGroup, Integer processedBy) {
        List<UserBusinessGroup> memberships = userBusinessGroupRepository
                .findByUserIdAndBusinessGroupId(user.getId(), targetGroup.getId());

        Optional<UserBusinessGroup> activeMembership = memberships.stream()
                .filter(this::isActiveMembership)
                .findFirst();
        if (activeMembership.isPresent()) {
            return;
        }

        UserBusinessGroup membership = memberships.stream().findFirst().orElseGet(UserBusinessGroup::new);
        Date now = new Date();

        membership.setUser(user);
        membership.setBusinessGroup(targetGroup);
        membership.setIsDeleted(false);

        if (membership.getId() == null) {
            membership.setCreatedAt(now);
            membership.setCreatedBy(processedBy);
            membership.setIsModerator(false);
        } else {
            membership.setUpdatedAt(now);
            membership.setUpdatedBy(processedBy);
            if (membership.getIsModerator() == null) {
                membership.setIsModerator(false);
            }
        }

        userBusinessGroupRepository.save(membership);
    }

    private boolean isActiveMembership(UserBusinessGroup membership) {
        return membership != null && !Boolean.TRUE.equals(membership.getIsDeleted());
    }

    private void notifyGroupModerators(BusinessGroup targetGroup, User requester, Integer createdBy) {
        List<UserBusinessGroup> moderators = userBusinessGroupRepository.findModeratorsForGroup(targetGroup.getId());
        for (UserBusinessGroup mod : moderators) {
            if (mod.getUser() != null) {
                createNotification(
                    mod.getUser(),
                    "GROUP_CHANGE_REQUEST",
                    requester.getFirstName() + " " + requester.getLastName() + " demande à rejoindre le groupe " + targetGroup.getGroupName(),
                    createdBy
                );
            }
        }
    }

    private void notifyRequester(GroupChangeRequest request, String newStatus) {
        String message;
        if ("APPROVED".equals(newStatus)) {
            message = "Votre demande pour rejoindre le groupe " + request.getTargetGroup().getGroupName() + " a été approuvée.";
        } else {
            message = "Votre demande pour rejoindre le groupe " + request.getTargetGroup().getGroupName() + " a été refusée.";
        }
        createNotification(request.getUser(), "GROUP_CHANGE_" + newStatus, message, request.getProcessedBy());
    }

    private void createNotification(User targetUser, String type, String link, Integer createdBy) {
        Notifications notif = new Notifications();
        notif.setUser(targetUser);
        notif.setNotifType(type);
        notif.setNotifLink(link);
        notif.setIsRead(false);
        notif.setCreatedAt(new Date());
        notif.setCreatedBy(createdBy);
        notif.setIsDeleted(false);
        notif.setObjectTableName("group_change_request");
        notificationsRepository.save(notif);
    }
}
