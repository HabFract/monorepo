import React, { ReactNode } from "react";

import "./common.css";
import { DateTime } from "luxon";

export interface CalendarDayProps {
  dateString: string;
  completed: boolean;
  onClickDay: (date: DateTime) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  dateString,
  completed,
  onClickDay
}) => {
  const dateFromIso = DateTime.fromISO(dateString);
  const day = dateFromIso.day;
  const weekDay = dateFromIso.weekdayShort;
  return (
    <div className="calendar-day">
      <div className="calendar-day-title">
        { weekDay }
      </div>
      <div onClick={() => onClickDay(dateFromIso)} className={completed ? "calendar-day-complete" : "calendar-day-incomplete"}>
        { day }
      </div>
    </div>
  );
};

export default CalendarDay;
