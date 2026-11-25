package com.veyra.veyrabackend;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Adds one fresh persona every day at 11 PM (Asia/Kolkata by default).
 */
@Component
public class DailyStoryJob {

    private static final Logger log =
            LoggerFactory.getLogger(DailyStoryJob.class);

    private final DailyStoryService service;
    private final StoryCatalog catalog;
    private final ZoneId zone;

    public DailyStoryJob(
            DailyStoryService service,
            StoryCatalog catalog,
            @Value("${veyra.daily.zone:Asia/Kolkata}") String zoneId
    ) {
        this.service = service;
        this.catalog = catalog;
        this.zone = ZoneId.of(zoneId);
    }

    @Scheduled(
            cron = "${veyra.daily.cron:0 0 23 * * *}",
            zone = "${veyra.daily.zone:Asia/Kolkata}"
    )
    public void generateDailyStory() {

        try {
            Story story = service.generate();

            log.info(
                    "VEYRA daily story ready: {} ({})",
                    story.getTitle(),
                    story.getId()
            );

        } catch (Exception e) {
            log.warn("VEYRA daily story skipped: {}", e.getMessage());
        }
    }

    /**
     * If the app was closed at 11 PM, add today's story on the next start
     * instead of silently skipping the day.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void catchUp() {

        if (LocalTime.now(zone).isBefore(LocalTime.of(23, 0))) {
            return;
        }

        if (catalog.hasGeneratedOn(LocalDate.now(zone).toString())) {
            return;
        }

        generateDailyStory();
    }
}
