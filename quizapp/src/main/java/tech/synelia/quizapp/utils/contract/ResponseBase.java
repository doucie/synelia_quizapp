
/*
 * Created on 2025-08-22 ( Time 11:38:41 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.utils.contract;

import lombok.*;
import tech.synelia.quizapp.utils.Status;

/**
 * Response Base
 * 
 * @author Geo
 *
 */
@Data
@ToString
@NoArgsConstructor
public class ResponseBase {

	protected  Status	 status = new Status();
	protected  boolean	 hasError;
	protected  String	 sessionUser;
	protected  Long		 count; // Nombre d'éléments dans cette page
	protected  Long		 totalCount; // Nombre total d'éléments dans la base de données (pour pagination)
	protected  int       httpCode;
}
