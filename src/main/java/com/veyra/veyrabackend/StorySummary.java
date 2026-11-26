package com.veyra.veyrabackend;

import java.util.List;

public record StorySummary(
        String id,
        String title,
        String section,
        List<String> genres,
        Integer featuredRank,
        String avatar,
        String hook,
        String openingMessage,
        String status,
        String backgroundClass,
        String createdOn,
        boolean newToday
) {

    public static StorySummary from(Story story) {
        return from(story, null);
    }

    /**
     * @param today today's date in the configured daily zone, or {@code null}
     *              when the caller does not need the new-arrival flag
     */
    public static StorySummary from(Story story, String today) {

        return new StorySummary(
                story.getId(),
                story.getTitle(),
                story.getSection(),
                story.getGenres(),
                story.getFeaturedRank(),
                story.getAvatar(),
                story.getHook(),
                story.getOpeningMessage(),
                story.getStatus(),
                story.getBackgroundClass(),
                story.getCreatedOn(),
                today != null && today.equals(story.getCreatedOn())
        );
    }
}
