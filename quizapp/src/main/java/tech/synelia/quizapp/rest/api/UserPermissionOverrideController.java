package tech.synelia.quizapp.rest.api;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;
import tech.synelia.quizapp.business.UserPermissionOverrideBusiness;
import tech.synelia.quizapp.utils.ExceptionUtils;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.dto.UserPermissionOverrideDto;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/userPermissionOverride")
public class UserPermissionOverrideController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private UserPermissionOverrideBusiness userPermissionOverrideBusiness;

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @RequestMapping(value="/setOverride", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<UserPermissionOverrideDto>> setOverride(@RequestBody Request<UserPermissionOverrideDto> request) throws Exception {
        log.info("start method /userPermissionOverride/setOverride");
        Response<UserPermissionOverrideDto> response = new Response<>();
        try {
            response = userPermissionOverrideBusiness.setOverride(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @RequestMapping(value="/removeOverride", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<UserPermissionOverrideDto>> removeOverride(@RequestBody Request<UserPermissionOverrideDto> request) throws Exception {
        log.info("start method /userPermissionOverride/removeOverride");
        Response<UserPermissionOverrideDto> response = new Response<>();
        try {
            response = userPermissionOverrideBusiness.removeOverride(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @RequestMapping(value="/getByUser", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<UserPermissionOverrideDto>> getByUser(@RequestBody Request<UserPermissionOverrideDto> request) throws Exception {
        log.info("start method /userPermissionOverride/getByUser");
        Response<UserPermissionOverrideDto> response = new Response<>();
        try {
            response = userPermissionOverrideBusiness.getOverridesForUser(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<UserPermissionOverrideDto>> getByCriteria(@RequestBody Request<UserPermissionOverrideDto> request) throws Exception {
        log.info("start method /userPermissionOverride/getByCriteria");
        Response<UserPermissionOverrideDto> response = new Response<>();
        try {
            response = userPermissionOverrideBusiness.getByCriteria(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/getAllByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<UserPermissionOverrideDto>> getAllByCriteria(@RequestBody Request<UserPermissionOverrideDto> request) throws Exception {
        log.info("start method /userPermissionOverride/getAllByCriteria");
        Response<UserPermissionOverrideDto> response = new Response<>();
        try {
            response = userPermissionOverrideBusiness.getByCriteria(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<UserPermissionOverrideDto>> delete(@RequestBody Request<UserPermissionOverrideDto> request) throws Exception {
        log.info("start method /userPermissionOverride/delete");
        Response<UserPermissionOverrideDto> response = new Response<>();
        try {
            response = userPermissionOverrideBusiness.delete(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
