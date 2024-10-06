import React, { ReactNode, useState } from "react";

import "./common.css";
import { DateTime } from "luxon";
import CalendarDay from "./CalendarDay";
import SwipeUpTab from "./SwipeUpTab";

export interface CalendarProps {
  orbitWins: object;
  currentDate: DateTime;
  setNewDate: Function;
}

const Calendar: React.FC<CalendarProps> = ({
  orbitWins,
  currentDate,
  setNewDate,
}) => {
  // Get a reference for the actual current date
  const nowDate = DateTime.local();
  const handlePreviousDay = () => {
    setNewDate(currentDate.minus({ days: 1 }));
  };
  const isLastDay = currentDate.toISODate() == nowDate.toISODate();
  const handleNextDay = () => {
    if (!isLastDay) {
      setNewDate(currentDate.plus({ days: 1 }));
    }
  };

  const renderCalendarDay = (date: DateTime) => {
    const dateString = date.toISODate()!;
    const isCompleted = orbitWins?.[dateString as string] || false;
    const isTodaySelected = date.toFormat('MM-dd-yyyy') === currentDate.toFormat('MM-dd-yyyy');
    
    return (
      <span key={dateString} className={isTodaySelected ? "calendar-day-container current" : "calendar-day-container"}>
        <CalendarDay
          dateString={dateString}
          completed={isCompleted}
        />
      </span>
    );
  };

  const daysAfterCurrent = Math.min(
    3,
    Math.floor(nowDate.diff(currentDate, "days").days),
  );
  const spacerDays = 3 - daysAfterCurrent;
  return (
    <>
        <div className="current-calendar-context-container">
          <button className="date-nav-button" onClick={handlePreviousDay}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="current-date-string">{currentDate.toLocaleString(DateTime.DATE_FULL)}</span>
          <button
            className={isLastDay ? "date-nav-button disabled" : "date-nav-button"}
            onClick={handleNextDay}
            disabled={currentDate.toISODate() === nowDate.toISODate()}
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
        <div className="calendar-days-container">
          {
            /* Render calendar days for the previous 3 days */
            <>
              {[-3, -2, -1].map((offset) =>
                renderCalendarDay(currentDate.minus({ days: -offset })),
              )}
            </>
          }
          {renderCalendarDay(currentDate)}
          {/* Render calendar days for upto the next 3 days, or spacers for the gaps */}
            {daysAfterCurrent >= 0 &&
              [...Array(daysAfterCurrent).keys()].map((offset) =>
                renderCalendarDay(currentDate.plus({ days: offset + 1 })),
            )}
            {spacerDays > 0 &&
              [...Array(spacerDays).keys()].map((_, i) => (
                <div className="spacer flex flex-1" key={i} />
              ))}
        </div>
    </>
  );
};

export default Calendar;
