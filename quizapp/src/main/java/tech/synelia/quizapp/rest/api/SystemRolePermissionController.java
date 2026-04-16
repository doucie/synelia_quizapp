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

import java.util.Locale;

import tech.synelia.quizapp.utils.*;
import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.business.*;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/systemRolePermission")
public class SystemRolePermissionController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private SystemRolePermissionBusiness systemRolePermissionBusiness;

    @RequestMapping(value="/getByRole", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<SystemRolePermissionDto>> getByRole(@RequestBody Request<SystemRolePermissionDto> request) throws Exception {
        log.info("start method /systemRolePermission/getByRole");
        Response<SystemRolePermissionDto> response = new Response<>();
        try {
            response = systemRolePermissionBusiness.getPermissionsForRole(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/addPermission", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<SystemRolePermissionDto>> addPermission(@RequestBody Request<SystemRolePermissionDto> request) throws Exception {
        log.info("start method /systemRolePermission/addPermission");
        Response<SystemRolePermissionDto> response = new Response<>();
        try {
            response = systemRolePermissionBusiness.addPermission(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/removePermission", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<SystemRolePermissionDto>> removePermission(@RequestBody Request<SystemRolePermissionDto> request) throws Exception {
        log.info("start method /systemRolePermission/removePermission");
        Response<SystemRolePermissionDto> response = new Response<>();
        try {
            response = systemRolePermissionBusiness.removePermission(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
