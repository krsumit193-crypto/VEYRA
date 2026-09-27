package com.veyra.veyrabackend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {

    @GetMapping("/")
    public String home() {
        return "VEYRA Backend is running 🚀";
    }

}