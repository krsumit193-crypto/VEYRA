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
        String backgroundClass
) {

    public static StorySummary from(Story story) {
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
                story.getBackgroundClass()
        );
    }
}
