package com.veyra.veyrabackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VeyraBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(VeyraBackendApplication.class, args);
    }
}
