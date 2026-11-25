package com.veyra.veyrabackend;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String dataDir;

    public WebConfig(
            @Value("${veyra.data.dir:data}") String dataDir
    ) {
        this.dataDir = dataDir;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "null"
                )
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*");
    }

    /**
     * Avatars created by the daily generator live outside the jar, so they
     * are served from the data directory.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String location = Path.of(dataDir, "images")
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();

        if (!location.endsWith("/")) {
            location = location + "/";
        }

        registry.addResourceHandler("/generated-images/**")
                .addResourceLocations(location);
    }
}
