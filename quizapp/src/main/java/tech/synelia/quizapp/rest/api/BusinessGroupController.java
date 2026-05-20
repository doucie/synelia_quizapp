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
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@RequestMapping(value="/businessGroup")
public class BusinessGroupController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ExceptionUtils exceptionUtils;

    @Autowired
    private BusinessGroupBusiness businessGroupBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> create(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/create");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.create(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> update(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/update");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.update(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> delete(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/delete");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.delete(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> getByCriteria(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/getByCriteria");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.getByCriteria(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/getAllByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> getAllByCriteria(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/getAllByCriteria");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.getByCriteria(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/updateAll", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> updateAll(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/updateAll");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.update(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @RequestMapping(value="/updateDeleted", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> updateDeleted(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/updateDeleted");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.update(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/getGroupWithPermissions", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> getGroupWithPermissions(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/getGroupWithPermissions");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.getGroupWithPermissions(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/addPermission", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> addPermission(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/addPermission");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.addPermission(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/removePermission", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> removePermission(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/removePermission");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.removePermission(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/assignUser", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> assignUser(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/assignUser");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.assignUserToGroup(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/removeUser", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupDto>> removeUser(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/removeUser");
        Response<BusinessGroupDto> response = new Response<>();
        try {
            response = businessGroupBusiness.removeUserFromGroup(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    @RequestMapping(value="/getUsers", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<UserDto>> getUsers(@RequestBody Request<BusinessGroupDto> request) throws Exception {
        log.info("start method /businessGroup/getUsers");
        Response<UserDto> response = new Response<>();
        try {
            response = businessGroupBusiness.getUsersInGroup(request, locale(requestBasic));
        } catch (Exception e) {
            exceptionUtils.EXCEPTION(response, locale(requestBasic), e);
        }
        return ResponseEntity.ok().body(response);
    }

    private Locale locale(HttpServletRequest request) {
        return request.getLocale();
    }
}
