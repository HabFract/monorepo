import React, { ReactNode } from 'react';

import './common.css';
import { useAtom } from 'jotai';
import { currentDayAtom } from '../../../ui/src/state/date';
import { DateTime } from 'luxon';

export interface CalendarProps {

}

const Calendar: React.FC<CalendarProps> = () => {
    const [currentDay, setCurrentDay] = useAtom(currentDayAtom);
    
    // Initialize the current date based on the atom's value
    const now = DateTime.local();
    const currentDate = DateTime.fromISO(currentDay.toISODate());

    const handlePreviousDay = () => {
        setCurrentDay((prev) => prev.minus({ days: 1 }));
    };

    const handleNextDay = () => {
        if (currentDate.toISODate() !== now.toISODate()) {
            setCurrentDay((prev) => prev.plus({ days: 1 }));
        }
    };

    const renderDayInfo = (day: DateTime) => {
        return `${day.weekdayShort}${day.day}`;
    };

    const renderCheckboxes = (day: DateTime) => {
        return (
            <div className='flex gap-1'>
                <input type="checkbox" id={`checkbox-${day.toISODate()}`} />
                <label htmlFor={`checkbox-${day.toISODate()}`}>{renderDayInfo(day)}</label>
            </div>
        );
    };

    return (
        <div>
            <button onClick={handlePreviousDay}>Previous</button>
            <div>{renderDayInfo(currentDate)}</div>
            <button onClick={handleNextDay} disabled={currentDate.toISODate() === now.toISODate()}>Next</button>
            <div>
                {/* Render checkboxes for the previous 3 days */}
                {[-3, -2, -1].map(offset => renderCheckboxes(currentDate.minus({ days: -offset })))}
                {/* Render the current day checkbox */}
                {renderCheckboxes(currentDate)}
                {/* Render checkboxes for the next 3 days */}
                {[1, 2, 3].map(offset => renderCheckboxes(currentDate.plus({ days: offset })))}
            </div>
        </div>
    );
};

export default Calendar;