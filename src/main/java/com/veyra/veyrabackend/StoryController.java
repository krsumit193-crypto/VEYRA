package com.veyra.veyrabackend;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/stories")
public class StoryController {

    private final StoryCatalog storyCatalog;

    public StoryController(StoryCatalog storyCatalog) {
        this.storyCatalog = storyCatalog;
    }

    @GetMapping
    public List<StorySummary> all() {
        return storyCatalog.getAll()
                .stream()
                .map(StorySummary::from)
                .toList();
    }
}
