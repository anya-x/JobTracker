package com.jobtracker.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Configuration
public class RateLimitConfig {

    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    private static final Duration CLEANUP_INTERVAL = Duration.ofMinutes(5);

    @Bean
    @Order(1)
    public Filter rateLimitFilter() {
        return new RateLimitFilter();
    }

    private static class RateLimitFilter implements Filter {
        private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();
        private final ScheduledExecutorService cleanupScheduler = Executors.newScheduledThreadPool(1);

        @Override
        public void init(FilterConfig filterConfig) {
            // Schedule periodic cleanup of old entries
            cleanupScheduler.scheduleAtFixedRate(
                this::cleanupOldEntries,
                CLEANUP_INTERVAL.toMinutes(),
                CLEANUP_INTERVAL.toMinutes(),
                TimeUnit.MINUTES
            );
        }

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {

            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            String clientIp = getClientIp(httpRequest);

            RequestCounter counter = requestCounts.computeIfAbsent(clientIp, k -> new RequestCounter());

            if (counter.incrementAndCheck()) {
                chain.doFilter(request, response);
            } else {
                httpResponse.setStatus(429);
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            }
        }

        @Override
        public void destroy() {
            cleanupScheduler.shutdown();
        }

        private String getClientIp(HttpServletRequest request) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }

        private void cleanupOldEntries() {
            long currentTime = System.currentTimeMillis();
            requestCounts.entrySet().removeIf(entry ->
                currentTime - entry.getValue().getLastRequestTime() > CLEANUP_INTERVAL.toMillis()
            );
        }
    }

    private static class RequestCounter {
        private int count = 0;
        private long windowStart = System.currentTimeMillis();
        private long lastRequestTime = System.currentTimeMillis();

        public synchronized boolean incrementAndCheck() {
            long currentTime = System.currentTimeMillis();
            lastRequestTime = currentTime;

            // Reset counter if window has passed
            if (currentTime - windowStart > 60000) {
                count = 0;
                windowStart = currentTime;
            }

            count++;
            return count <= MAX_REQUESTS_PER_MINUTE;
        }

        public long getLastRequestTime() {
            return lastRequestTime;
        }
    }
}
