
/*
 * Created on 2025-08-22 ( Time 11:38:41 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2018 Geo. All Rights Reserved.
 */

package tech.synelia.quizapp.utils.contract;

import java.util.List;
import jakarta.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.*;

/**
 * Response
 * 
 * @author Geo
 *
 */
@Data
@EqualsAndHashCode(callSuper = false) // Ignorer les champs de la superclasse (classe parente) ResponseBase
@ToString
@NoArgsConstructor
@XmlRootElement
@JsonInclude(Include.NON_NULL)
public class Response<T> extends ResponseBase {

	// Reponse avec une liste d'objets ou avec un seul objet
	protected List<T> items;
	protected T item;
}
