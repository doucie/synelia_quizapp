package tech.synelia.quizapp.user.managment;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import lombok.Data;
import lombok.ToString;
// import tech.synelia.quizapp.utils.contract.SearchParam;
// import tech.synelia.quizapp.utils.dto.FonctionaliteDto;

@Data
@ToString
@JsonInclude(Include.NON_NULL)
@JsonPropertyOrder(alphabetic = true)
public class UserManagmentDto {
	
	private String email;
	private String password;
	private String oldPassword;
	// Registration with invitation code
	private String code;
	private String firstName;
	private String lastName;

}