/*
 * Created on 2025-08-22 ( Time 11:38:40 )
 * Generator tool : Telosys Tools Generator ( version 3.3.0 )
 * Copyright 2025 Synelia. All Rights Reserved.
 */

package tech.synelia.quizapp.rest;

import com.zaxxer.hikari.HikariDataSource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import lombok.extern.java.Log;

@Log
@Component
public class ConnectionInterceptor implements HandlerInterceptor {

    private final HikariDataSource dataSource;

    public ConnectionInterceptor(HikariDataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        dataSource.getHikariPoolMXBean().softEvictConnections();
        log.info("-- Connexion dormantes fermées après l'appel du service. --");
    }
}
