package tech.synelia.quizapp.rest.api;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;

import tech.synelia.quizapp.utils.dto.*;
import tech.synelia.quizapp.utils.contract.Request;
import tech.synelia.quizapp.utils.contract.Response;
import tech.synelia.quizapp.utils.enums.FunctionalityEnum;
import tech.synelia.quizapp.business.*;
import tech.synelia.quizapp.rest.fact.ControllerFactory;

@Log
@CrossOrigin("*")
@RestController
@RequestMapping(value="/businessGroupPermission")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'UTILISATEUR')")
public class BusinessGroupPermissionController {

    @Autowired
    private HttpServletRequest requestBasic;
    @Autowired
    private ControllerFactory<BusinessGroupPermissionDto> controllerFactory;
    @Autowired
    private BusinessGroupPermissionBusiness businessGroupPermissionBusiness;

    @RequestMapping(value="/create", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public ResponseEntity<Response<BusinessGroupPermissionDto>> create(@RequestBody Request<BusinessGroupPermissionDto> request) throws Exception {
        log.info("start method /businessGroupPermission/create");
        Response<BusinessGroupPermissionDto> response = controllerFactory.create(businessGroupPermissionBusiness, request, FunctionalityEnum.CREATE_BUSINESS_GROUP_PERMISSION);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().buildAndExpand(response.getItems().get(0)).toUri();
        log.info("end method /businessGroupPermission/create");
        return ResponseEntity.created(uri).body(response);
    }

    @RequestMapping(value="/update", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<BusinessGroupPermissionDto> update(@RequestBody Request<BusinessGroupPermissionDto> request) throws Exception {
        log.info("start method /businessGroupPermission/update");
        Response<BusinessGroupPermissionDto> response = controllerFactory.update(businessGroupPermissionBusiness, request, FunctionalityEnum.UPDATE_BUSINESS_GROUP_PERMISSION);
        log.info("end method /businessGroupPermission/update");
        return response;
    }

    @RequestMapping(value="/delete", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<BusinessGroupPermissionDto> delete(@RequestBody Request<BusinessGroupPermissionDto> request) throws Exception {
        log.info("start method /businessGroupPermission/delete");
        Response<BusinessGroupPermissionDto> response = controllerFactory.delete(businessGroupPermissionBusiness, request, FunctionalityEnum.DELETE_BUSINESS_GROUP_PERMISSION);
        log.info("end method /businessGroupPermission/delete");
        return response;
    }

    @RequestMapping(value="/getByCriteria", method=RequestMethod.POST, consumes={"application/json"}, produces={"application/json"})
    public Response<BusinessGroupPermissionDto> getByCriteria(@RequestBody Request<BusinessGroupPermissionDto> request) throws Exception {
        log.info("start method /businessGroupPermission/getByCriteria");
        Response<BusinessGroupPermissionDto> response = controllerFactory.getByCriteria(businessGroupPermissionBusiness, request, FunctionalityEnum.VIEW_BUSINESS_GROUP_PERMISSION);
        log.info("end method /businessGroupPermission/getByCriteria");
        return response;
    }
}
