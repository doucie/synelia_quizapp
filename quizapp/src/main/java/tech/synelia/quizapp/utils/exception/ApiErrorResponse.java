/*
 * Created on 2025-08-22 ( Time 11:38:40 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2023 O-sey. All Rights Reserved.
 */

package tech.synelia.quizapp.utils.exception;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

import tech.synelia.quizapp.utils.Status;


@Builder
@Data
public class ApiErrorResponse {
    private   Status            status;
    private   Integer           httpCode;
    protected boolean           hasError;
    protected LocalDateTime     timestamp;
}