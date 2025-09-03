
/*
 * Created on 2025-08-22 ( Time 11:38:39 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.utils;

import org.springframework.dao.DataAccessException;

import lombok.Getter;


@Getter
public class CustomDataAccessException extends DataAccessException {
    private static final long serialVersionUID = 1L;
	private final String errorCode;
    private final String additionalInfo;

    public CustomDataAccessException(String msg, String errorCode, String additionalInfo, Throwable cause) {
        super(msg, cause);
        this.errorCode = errorCode;
        this.additionalInfo = additionalInfo;
    }

}