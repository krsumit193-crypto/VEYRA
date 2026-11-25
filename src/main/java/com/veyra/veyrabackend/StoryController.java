package com.veyra.veyrabackend;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/stories")
public class StoryController {

    private final StoryCatalog storyCatalog;
    private final DailyStoryService dailyStoryService;

    @Value("${veyra.admin.token:}")
    private String adminToken;

    public StoryController(
            StoryCatalog storyCatalog,
            DailyStoryService dailyStoryService
    ) {
        this.storyCatalog = storyCatalog;
        this.dailyStoryService = dailyStoryService;
    }

    @GetMapping
    public List<StorySummary> all() {
        return storyCatalog.getAll()
                .stream()
                .map(StorySummary::from)
                .toList();
    }

    /**
     * Manual trigger for the daily generator. Disabled unless
     * {@code veyra.admin.token} is configured.
     */
    @PostMapping("/daily")
    public StorySummary generateDaily(
            @RequestHeader(value = "X-Veyra-Admin", required = false)
            String token
    ) {

        if (adminToken == null
                || adminToken.isBlank()
                || !adminToken.equals(token)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin token required."
            );
        }

        return StorySummary.from(dailyStoryService.generate());
    }
}
