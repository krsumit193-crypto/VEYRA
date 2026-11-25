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
    private final AvatarService avatarService;

    @Value("${veyra.admin.token:}")
    private String adminToken;

    public StoryController(
            StoryCatalog storyCatalog,
            DailyStoryService dailyStoryService,
            AvatarService avatarService
    ) {
        this.storyCatalog = storyCatalog;
        this.dailyStoryService = dailyStoryService;
        this.avatarService = avatarService;
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

        requireAdmin(token);

        return StorySummary.from(dailyStoryService.generate());
    }

    /**
     * Regenerates portraits for stories that still use a bundled placeholder.
     * Useful for filling in the whole catalog after adding an image key.
     */
    @PostMapping("/avatars")
    public List<StorySummary> refreshAvatars(
            @RequestHeader(value = "X-Veyra-Admin", required = false)
            String token
    ) {

        requireAdmin(token);

        return storyCatalog.getAll()
                .stream()
                .filter(this::needsAvatar)
                .peek(story -> {
                    story.setAvatar(avatarService.generate(story));
                    storyCatalog.saveGenerated(story);
                })
                .map(StorySummary::from)
                .toList();
    }

    private boolean needsAvatar(Story story) {

        String avatar = story.getAvatar();

        return avatar == null
                || avatar.isBlank()
                || avatar.startsWith("images/");
    }

    private void requireAdmin(String token) {

        if (adminToken == null
                || adminToken.isBlank()
                || !adminToken.equals(token)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Admin token required."
            );
        }
    }
}
