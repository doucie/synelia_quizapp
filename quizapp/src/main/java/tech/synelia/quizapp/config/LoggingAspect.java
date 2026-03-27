package tech.synelia.quizapp.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("execution(* tech.synelia.quizapp.rest.api..*(..))")
    public Object logController(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        long start = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            logger.info("{} completed in {} ms", method, duration);
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - start;
            logger.error("{} failed after {} ms: {}", method, duration, ex.getMessage());
            throw ex;
        }
    }
}
