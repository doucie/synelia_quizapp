package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;

import java.util.*;
import java.util.stream.Collectors;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.dao.entity.*;
import tech.synelia.quizapp.dao.repository.*;
import tech.synelia.quizapp.utils.enums.UserRole;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/authPermissions")
public class AuthPermissionsController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private PermissionService permissionService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserBusinessGroupRepository userBusinessGroupRepository;

    /**
     * POST /authPermissions/me — le frontend appelle ça au login pour charger :
     * - systemRole (String)
     * - businessGroups (List<BusinessGroupDto>)
     * - effectivePermissions (List<String>)
     */
    @RequestMapping(value="/me", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<UserDto>> me(@RequestBody Request<UserDto> request) throws Exception {
        log.info("start method /authPermissions/me");
        Response<UserDto> response = new Response<>();
        try {
            Integer userId = request.getUser();
            if (userId == null) {
                response.setHasError(true);
                Status status = new Status();
                status.setCode(StatusCode.FUNC_FAIL);
                status.setMessage("User non authentifié");
                response.setStatus(status);
                return ResponseEntity.ok().body(response);
            }

            User user = userRepository.findOne(userId, false);
            if (user == null) {
                response.setHasError(true);
                Status status = new Status();
                status.setCode(StatusCode.FUNC_FAIL);
                status.setMessage("User introuvable");
                response.setStatus(status);
                return ResponseEntity.ok().body(response);
            }

            // Construire le DTO de réponse
            UserDto dto = new UserDto();
            dto.setId(user.getId());
            String normalizedUserRole = UserRole.normalizeValue(user.getUserRole());
            dto.setUserRole(normalizedUserRole != null ? normalizedUserRole : user.getUserRole());

            // Groupes métiers
            List<UserBusinessGroup> ubgs = userBusinessGroupRepository.findByUserId(userId);
            if (ubgs != null && !ubgs.isEmpty()) {
                List<BusinessGroupDto> groupDtos = ubgs.stream().map(ubg -> {
                    BusinessGroupDto bgDto = new BusinessGroupDto();
                    bgDto.setId(ubg.getBusinessGroup().getId());
                    bgDto.setGroupName(ubg.getBusinessGroup().getGroupName());
                    bgDto.setGroupDesc(ubg.getBusinessGroup().getGroupDesc());
                    return bgDto;
                }).collect(Collectors.toList());
                dto.setBusinessGroups(groupDtos);
            } else {
                dto.setBusinessGroups(new ArrayList<>());
            }

            // Permissions effectives
            List<String> permissions = permissionService.getEffectivePermissions(userId);
            dto.setEffectivePermissions(permissions);

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(Arrays.asList(dto));
            response.setHasError(false);
            response.setStatus(status);
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private java.util.Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
