package tech.synelia.quizapp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@EnableAutoConfiguration(exclude = LdapAutoConfiguration.class)
class QuizappApplicationTests {

	@Test
	void contextLoads() {
	}

}
