/*
* Created on 2021-08-19 ( Time 16:54:31 )
* Generator tool : Telosys Tools Generator ( version 3.1.2 )
* Copyright 2018 Geo. All Rights Reserved.
*/

package tech.synelia.quizapp.utils;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author Geo
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("public")
                .pathsToMatch("/api/**")
                .build();
    }

    @Bean
    public io.swagger.v3.oas.models.OpenAPI customOpenAPI() {
        return new io.swagger.v3.oas.models.OpenAPI()
                .info(new Info()
                        .title("API Documentation")
                        .version("1.0")
                        .description("Documentation of the REST API")
                        .contact(new Contact()
                                .name("Support")
                                .email("support@example.com")));
    }
}
