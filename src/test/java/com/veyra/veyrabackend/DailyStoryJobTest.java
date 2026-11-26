package com.veyra.veyrabackend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;

class DailyStoryJobTest {

    private static final LocalDate TODAY =
            LocalDate.of(2026, 11, 26);

    @Test
    void morningCatchesUpOnlyMissedPastDays() {

        assertEquals(
                List.of(
                        LocalDate.of(2026, 11, 24),
                        LocalDate.of(2026, 11, 25)
                ),
                DailyStoryJob.catchUpDates(
                        TODAY,
                        LocalTime.of(8, 30),
                        LocalDate.of(2026, 11, 23),
                        3
                )
        );
    }

    @Test
    void afterElevenPmTodayIsIncluded() {

        assertEquals(
                List.of(
                        LocalDate.of(2026, 11, 25),
                        TODAY
                ),
                DailyStoryJob.catchUpDates(
                        TODAY,
                        LocalTime.of(23, 5),
                        LocalDate.of(2026, 11, 24),
                        3
                )
        );
    }

    @Test
    void catchUpIsCappedAtThreeDays() {

        List<LocalDate> dates = DailyStoryJob.catchUpDates(
                TODAY,
                LocalTime.of(23, 5),
                LocalDate.of(2026, 11, 1),
                3
        );

        assertEquals(3, dates.size());
        assertTrue(dates.contains(TODAY));
        assertEquals(LocalDate.of(2026, 11, 24), dates.get(0));
    }

    @Test
    void freshInstallBeforeElevenDoesNothing() {

        assertTrue(DailyStoryJob.catchUpDates(
                TODAY, LocalTime.of(10, 0), null, 3).isEmpty());
    }

    @Test
    void freshInstallAfterElevenAddsOnlyToday() {

        assertEquals(
                List.of(TODAY),
                DailyStoryJob.catchUpDates(
                        TODAY, LocalTime.of(23, 30), null, 3)
        );
    }

    @Test
    void nothingToDoWhenTheLatestDayIsAlreadyGenerated() {

        assertTrue(DailyStoryJob.catchUpDates(
                TODAY, LocalTime.of(8, 0), TODAY, 3).isEmpty());
        assertTrue(DailyStoryJob.catchUpDates(
                TODAY, LocalTime.of(23, 30), TODAY, 3).isEmpty());
    }
}
