package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.business.*;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/entityPermission")
public class EntityPermissionController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private EntityPermissionBusiness entityPermissionBusiness;
    @Autowired
    private PermissionService permissionService;

    @RequestMapping(value="/grant", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<EntityPermissionDto>> grant(@RequestBody Request<EntityPermissionDto> request) throws Exception {
        log.info("start method /entityPermission/grant");
        Response<EntityPermissionDto> response = new Response<>();
        try {
            response = entityPermissionBusiness.grantPermission(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/revoke", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<EntityPermissionDto>> revoke(@RequestBody Request<EntityPermissionDto> request) throws Exception {
        log.info("start method /entityPermission/revoke");
        Response<EntityPermissionDto> response = new Response<>();
        try {
            response = entityPermissionBusiness.revokePermission(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/getForEntity", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<EntityPermissionDto>> getForEntity(@RequestBody Request<EntityPermissionDto> request) throws Exception {
        log.info("start method /entityPermission/getForEntity");
        Response<EntityPermissionDto> response = new Response<>();
        try {
            response = entityPermissionBusiness.getPermissionsForEntity(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/getForUser", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<EntityPermissionDto>> getForUser(@RequestBody Request<EntityPermissionDto> request) throws Exception {
        log.info("start method /entityPermission/getForUser");
        Response<EntityPermissionDto> response = new Response<>();
        try {
            response = entityPermissionBusiness.getPermissionsForUser(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/me", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<EntityPermissionDto>> me(@RequestBody Request<EntityPermissionDto> request) throws Exception {
        log.info("start method /entityPermission/me");
        Response<EntityPermissionDto> response = new Response<>();
        try {
            Integer userId = request.getUser();
            List<String> permissions = permissionService.getEffectivePermissions(userId);
            List<EntityPermissionDto> dtos = permissions.stream().map(p -> {
                EntityPermissionDto dto = new EntityPermissionDto();
                dto.setPermissionKey(p);
                return dto;
            }).collect(Collectors.toList());

            Status status = new Status();
            status.setCode(StatusCode.SUCCESS);
            status.setMessage(StatusMessage.SUCCESS);
            response.setItems(dtos);
            response.setCount((long) dtos.size());
            response.setHasError(false);
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
