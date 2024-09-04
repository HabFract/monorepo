import React, { ReactNode } from 'react';

import './common.css';
import { useAtom } from 'jotai';
import { currentDayAtom } from '../../../ui/src/state/date';
import { DateTime } from 'luxon';
import TickBox from './TickBox';
import { VerticalLeftOutlined, VerticalRightOutlined } from '@ant-design/icons';

export interface CalendarProps {
    mainCheckbox: ReactNode
}

const Calendar: React.FC<CalendarProps> = ({ mainCheckbox }) => {
    const [currentDay, setCurrentDay] = useAtom(currentDayAtom);
    // Initialize the current date in state based on the atom's value

    const now = DateTime.local();
    const currentDate = DateTime.fromISO(currentDay.toISODate());
    // Get a reference for the actual current date
    const nowDate = DateTime.local();

    const handlePreviousDay = () => {
        setCurrentDay((prev) => prev.minus({ days: 1 }));
    };
    const isLastDay = currentDate.toISODate() == now.toISODate();
    const handleNextDay = () => {
        if (!isLastDay) {
            setCurrentDay((prev) => prev.plus({ days: 1 }));
        }
    };

    const renderTickBoxes = (day: DateTime) => {
        const dayKey = day.toISODate();
        return (
            <div className='flex flex-1 relative'>
                <TickBox
                    completed={true}
                    toggleIsCompleted={() => console.log('hi')}
                    size="secondary"
                    id={`tickbox-${dayKey}`}
                />
                <label className='tickbox-label' htmlFor={`tickbox-${dayKey}`}>
                    {day.weekdayShort}
                    <br />
                    <br />
                    <br />
                    <br />
                    <em>{day.day}</em>
                </label>
            </div>
        );
    };
    const daysAfterCurrent = Math.min(3, Math.floor(nowDate.diff(currentDate, 'days').days))
    const spacerDays = 3 - daysAfterCurrent;
    return (
        <div className='flex flex-col text-white'>
            <div className="flex justify-between">
                <button className="date-nav-button" onClick={handlePreviousDay}><VerticalRightOutlined /></button>
                <div className='current-date-label'>{currentDate.weekdayShort}<br /><em>{currentDate.day}</em></div>
                <button className={isLastDay ? "date-nav-button disabled" : "date-nav-button"} onClick={handleNextDay} disabled={currentDate.toISODate() === now.toISODate()}><VerticalLeftOutlined /></button>
            </div>
            <div className='flex'>
                {/* Render checkboxes for the previous 3 days */
                    [-3, -2, -1].map(offset => renderTickBoxes(currentDate.minus({ days: -offset })))}
                <div className='flex flex-1'>{mainCheckbox}</div>
                {/* Render checkboxes for upto the next 3 days */}
                {daysAfterCurrent >= 0 && [...Array(daysAfterCurrent).keys()].map(offset => renderTickBoxes(currentDate.plus({ days: offset + 1 })))}
                {spacerDays > 0 && [...Array(spacerDays).keys()].map((_, i) => <div className='spacer flex flex-1' key={i} />)}
            </div>
        </div>
    );
};

export default Calendar;