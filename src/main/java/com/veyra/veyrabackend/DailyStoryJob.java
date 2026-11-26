package com.veyra.veyrabackend;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

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

    /** Never generate more than three backfilled personas on a single start. */
    private static final int MAX_CATCH_UP_DAYS = 3;
    private static final LocalTime DAILY_TIME = LocalTime.of(23, 0);

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
     * If the app was closed at 11 PM, add the missed personas on the next start
     * instead of silently losing those days. A fresh install does not backfill
     * its whole history: it only adds today when 11 PM has already passed.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void catchUp() {

        List<LocalDate> dates = catchUpDates(
                LocalDate.now(zone),
                LocalTime.now(zone),
                catalog.latestGeneratedDate(),
                MAX_CATCH_UP_DAYS
        );

        for (LocalDate date : dates) {

            String value = date.toString();

            if (catalog.hasGeneratedOn(value)) {
                continue;
            }

            try {
                Story story = service.generateFor(date);

                log.info(
                        "VEYRA catch-up story for {}: {} ({})",
                        value,
                        story.getTitle(),
                        story.getId()
                );

            } catch (Exception e) {
                log.warn(
                        "VEYRA catch-up stopped at {}: {}",
                        value,
                        e.getMessage()
                );
                // A bad key or rate limit will fail every following day too.
                break;
            }
        }
    }

    /**
     * Pure date maths for the catch-up, kept separate so it can be tested
     * without waiting for a particular wall-clock time.
     *
     * @param lastGenerated newest generated date, or {@code null} for a fresh install
     */
    static List<LocalDate> catchUpDates(LocalDate today, LocalTime now,
                                        LocalDate lastGenerated, int maxDays) {

        boolean afterDailyTime = !now.isBefore(DAILY_TIME);
        LocalDate end = afterDailyTime ? today : today.minusDays(1);

        LocalDate start;

        if (lastGenerated == null) {
            start = afterDailyTime ? today : null;
        } else {
            start = lastGenerated.plusDays(1);
        }

        if (start == null || start.isAfter(end)) {
            return List.of();
        }

        LocalDate earliest = today.minusDays(Math.max(1, maxDays) - 1L);

        if (start.isBefore(earliest)) {
            start = earliest;
        }

        List<LocalDate> dates = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            dates.add(date);
        }

        return dates;
    }
}
