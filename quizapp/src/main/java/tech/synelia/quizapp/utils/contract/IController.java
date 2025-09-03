
/*
 * Created on 2025-08-22 ( Time 11:38:41 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.utils.contract;

import tech.synelia.quizapp.utils.enums.*;

/**
 * IController
 * 
 * @author Geo
 *
 */
public interface IController<DTO> {
    Response<DTO> create(IBasicBusiness iBasicBusiness, Request<DTO> request, FunctionalityEnum functionalityEnum) throws Exception;

    Response<DTO> update(IBasicBusiness iBasicBusiness, Request<DTO> request, FunctionalityEnum functionalityEnum) throws Exception;

    Response<DTO> delete(IBasicBusiness iBasicBusiness, Request<DTO> request, FunctionalityEnum functionalityEnum) throws Exception;

    Response<DTO> getByCriteria(IBasicBusiness iBasicBusiness, Request<DTO> request, FunctionalityEnum functionalityEnum) throws Exception;
}

