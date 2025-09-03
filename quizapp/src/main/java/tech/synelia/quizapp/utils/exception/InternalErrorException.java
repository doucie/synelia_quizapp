package tech.synelia.quizapp.utils.exception;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import tech.synelia.quizapp.utils.Status;

/**
 * APIExceptionHandler
 *
 * @author Sayd & Souleymane
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InternalErrorException extends RuntimeException{
    private Status status;
}
