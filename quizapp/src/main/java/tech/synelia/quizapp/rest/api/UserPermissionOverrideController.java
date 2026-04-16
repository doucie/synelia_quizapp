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
@RequestMapping(value="/userPermissionOverride")
public class UserPermissionOverrideController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private UserPermissionOverrideBusiness userPermissionOverrideBusiness;

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

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
