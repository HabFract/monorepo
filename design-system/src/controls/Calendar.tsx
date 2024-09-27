import React, { ReactNode } from "react";

import "./common.css";
import { DateTime } from "luxon";
import TickBox from "./TickBox";
import { VerticalLeftOutlined, VerticalRightOutlined } from "@ant-design/icons";

export interface CalendarProps {
  mainCheckbox: ReactNode;
  orbitWins: object;
  currentDate: DateTime;
  setNewDate: Function;
}

const Calendar: React.FC<CalendarProps> = ({
  mainCheckbox,
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

  const renderSecondaryTickBox = (day: DateTime) => {
    const dayKey = day.toISODate();
    const isCompleted = orbitWins?.[dayKey as string] || false;
    return (
      <div key={dayKey} className="flex flex-1 relative">
        <TickBox
          completed={isCompleted}
          toggleIsCompleted={() => {}}
          size="secondary"
          id={`tickbox-${dayKey}`}
        />
        <label className="tickbox-label" htmlFor={`tickbox-${dayKey}`}>
          {day.weekdayShort}
          <br />
          <br />
          <br />
          <em>{day.day}</em>
        </label>
      </div>
    );
  };
  const daysAfterCurrent = Math.min(
    3,
    Math.floor(nowDate.diff(currentDate, "days").days),
  );
  const spacerDays = 3 - daysAfterCurrent;
  return (
    <div className="flex flex-col text-white">
      <div className="flex justify-between">
        <button className="date-nav-button" onClick={handlePreviousDay}>
          <VerticalRightOutlined />
        </button>
        <div className="current-date-label">
          {currentDate.weekdayShort}
          <br />
          <em>{currentDate.day}</em>
        </div>
        <button
          className={isLastDay ? "date-nav-button disabled" : "date-nav-button"}
          onClick={handleNextDay}
          disabled={currentDate.toISODate() === nowDate.toISODate()}
        >
          <VerticalLeftOutlined />
        </button>
      </div>
      <div className="flex">
        {
          /* Render tickboxes for the previous 3 days */
          <div className="flex justify-end flex-1 gap-1">
            {[-3, -2, -1].map((offset) =>
              renderSecondaryTickBox(currentDate.minus({ days: -offset })),
            )}
          </div>
        }
        <div className="flex flex-2 w-8">{mainCheckbox}</div>
        {/* Render tickboxes for upto the next 3 days, or spacers for the gaps */}
        <div className="flex justify-start gap-1 flex-1">
          {daysAfterCurrent >= 0 &&
            [...Array(daysAfterCurrent).keys()].map((offset) =>
              renderSecondaryTickBox(currentDate.plus({ days: offset + 1 })),
            )}
          {spacerDays > 0 &&
            [...Array(spacerDays).keys()].map((_, i) => (
              <div className="spacer flex flex-1" key={i} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
