import React, { ReactNode, useState } from "react";

import "./common.css";
import { DateTime } from "luxon";
import CalendarDay from "./CalendarDay";
import { Frequency } from "@ui/src/state";

export interface CalendarProps {
  orbitWins: object;
  currentDate: DateTime;
  setNewDate: Function;
  orbitFrequency: Frequency.Rationals;
  disabled?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  orbitWins,
  currentDate,
  setNewDate,
  orbitFrequency,
  disabled = false
}) => {
  // Get a reference for the actual current date
  const nowDate = DateTime.local();
  const handlePreviousDay = () => {
    setNewDate(currentDate.minus({ days: 1 }));
  };
  const isLastDay = currentDate.toLocaleString() == nowDate.toLocaleString();
  const handleNextDay = () => {
    if (!isLastDay) {
      setNewDate(currentDate.plus({ days: 1 }));
    }
  };
  const renderCalendarDay = (date: DateTime) => {
    const dateString = date.toLocaleString()!;
    const winDataForDay = orbitWins?.[dateString as string];
    const isCompleted = orbitFrequency > 1 ? (Array.isArray(winDataForDay) && winDataForDay?.every(val => val)) : (typeof winDataForDay == 'undefined' ? false : winDataForDay);
    const isTodaySelected = date.toFormat('MM-dd-yyyy') === currentDate.toFormat('MM-dd-yyyy');

    return (
      <span key={dateString} className={isTodaySelected ? "calendar-day-container current" : "calendar-day-container"}>
        <CalendarDay
          dateString={date.toISODate()!}
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
      <div className={disabled ? "current-calendar-context-container" : "disabled current-calendar-context-container"}>
        <button className="date-nav-button" onClick={handlePreviousDay}>
          <svg stroke="white" className="date-nav-icon h-8 w-8 ml-1" width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" strokeWidth={0} xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5229 2 12 2ZM13.5315 7.41435C13.8549 7.15559 14.3269 7.20803 14.5857 7.53148C14.8444 7.85492 14.792 8.32689 14.4685 8.58565L10.2006 12L14.4685 15.4143C14.792 15.6731 14.8444 16.1451 14.5857 16.4685C14.3269 16.792 13.8549 16.8444 13.5315 16.5857L9.01952 12.9761C8.39401 12.4757 8.39401 11.5243 9.01952 11.0239L13.5315 7.41435Z" fill="currentColor" />
          </svg>
        </button>
        <span className="current-date-string mb-2">{currentDate.toLocaleString({ month: 'short', weekday: 'long', day: 'numeric' })}</span>
        <button
          className={isLastDay ? "date-nav-button disabled" : "date-nav-button"}
          onClick={handleNextDay}
          disabled={currentDate.toISODate() === nowDate.toISODate()}
        >
          <svg stroke="white" className="date-nav-icon h-8 w-8 mr-1" width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" strokeWidth={0} xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM10.4685 7.41435C10.1451 7.15559 9.6731 7.20803 9.41435 7.53148C9.15559 7.85493 9.20803 8.3269 9.53148 8.58565L13.7994 12L9.53148 15.4143C9.20803 15.6731 9.15559 16.1451 9.41435 16.4685C9.6731 16.792 10.1451 16.8444 10.4685 16.5857L14.9805 12.9761C15.606 12.4757 15.606 11.5243 14.9805 11.0239L10.4685 7.41435Z" fill="currentColor" />
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
