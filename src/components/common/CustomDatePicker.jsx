import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { formatDate } from '../../utils';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CustomDatePicker = ({
    value,
    onChange,
    label,
    placeholder = "Select Date",
    min,
    max,
    className = "",
    required = false,
    disabled = false,
    error = null,
    align = 'left' // 'left' | 'right'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [placement, setPlacement] = useState('bottom'); // 'bottom' | 'top'
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);

    // Parse value strings (YYYY-MM-DD) to Date objects
    const parseDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return null;
        // Validate format (should be YYYY-MM-DD)
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        const [year, month, day] = parts.map(Number);
        // Validate parts are valid numbers
        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
        // Validate reasonable date ranges
        if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;
        return new Date(year, month - 1, day);
    };

    // Format Date using local logic is removed, using utils one instead in usage


    // Display format DD-MM-YYYY
    const formatDisplay = (dateStr) => {
        if (!dateStr) return '';
        // Handle edge cases for malformed date strings
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        // Ensure all parts are valid
        if (!year || !month || !day) return '';
        return `${day}-${month}-${year}`;
    };

    const selectedDate = parseDate(value);

    // View state: 'days', 'months', 'years'
    const [view, setView] = useState('days');
    const [viewDate, setViewDate] = useState(selectedDate || new Date());

    useEffect(() => {
        if (selectedDate) setViewDate(selectedDate);
        setView('days'); // Reset to days view on reopen
    }, [isOpen]); // Reset view when opening

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to avoid overflow issues, though Date(y, m+1, 0) is standard for last day
    const textDate = (y, m, d) => new Date(y, m, d);
    const getDaysInMonth = (year, month) => textDate(year, month + 1, 0).getDate();

    // Auto-flip logic
    useLayoutEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const dropdownHeight = 400; // Approximate max height of dropdown

            // If not enough space below AND enough space above, flip to top
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                setPlacement('top');
            } else {
                setPlacement('bottom');
            }
        }
    }, [isOpen]);

    const generateCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];

        // Padding for first row
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const handleSelect = (date) => {
        if (disabled) return;
        onChange(formatDate(date, 'input')); // Using 'input' format which gives YYYY-MM-DD
        setIsOpen(false);
    };

    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const changeYear = (offset) => {
        setViewDate(new Date(viewDate.getFullYear() + offset, 0, 1));
    };

    const handleYearSelect = (year) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setView('months');
    };

    const handleMonthSelect = (monthIndex) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
        setView('days');
    };

    const setToday = () => {
        const today = new Date();
        handleSelect(today);
        setViewDate(today);
        setView('days');
    };

    const clearDate = (e) => {
        e.stopPropagation();
        onChange('');
        setIsOpen(false);
    };

    const isSameDay = (d1, d2) => {
        return d1 && d2 &&
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const isToday = (date) => isSameDay(date, new Date());

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="text-sm font-medium text-[#374151] dark:text-gray-600 mb-1.5 block">
                    {label} {required && <span className="text-[#EF4444]">*</span>}
                </label>
            )}

            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between px-3 py-2.5 
                    bg-white dark:bg-coal-300 border rounded-xl cursor-pointer transition-all duration-200
                    ${error ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-900' : isOpen ? 'ring-2 ring-[#0EA5E9]/30 border-[#0EA5E9] shadow-sm' : 'border-slate-200 dark:border-coal-100 hover:border-slate-300 dark:hover:border-coal-400'}
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-coal-600' : ''}
                `}
            >
                <div className="flex items-center gap-2 text-sm truncate">
                    <Calendar size={16} className={error ? "text-red-400" : "text-slate-400 dark:text-gray-400"} />
                    <span className={`truncate ${value ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 dark:text-gray-500'}`}>
                        {value ? formatDisplay(value) : placeholder}
                    </span>
                </div>
                {value && !disabled && (
                    <div onClick={clearDate} className="p-1 hover:bg-slate-100 dark:hover:bg-coal-400 rounded-full text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <X size={14} />
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={`
                        absolute z-[60] 
                        bg-white dark:bg-coal-600 border border-slate-100 dark:border-coal-100 rounded-2xl shadow-2xl dark:shadow-xl dark:shadow-black/50 overflow-hidden 
                        min-w-[300px] p-4 max-w-[calc(100vw-2rem)]
                        animate-in fade-in zoom-in-95 duration-200
                        ${placement === 'top'
                            ? 'bottom-full mb-2 origin-bottom'
                            : 'top-full mt-2 origin-top'
                        }
                        ${align === 'right' ? 'right-0' : 'left-0'}
                    `}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        {view === 'days' && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => changeMonth(-1)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-coal-300 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('years')}
                                    className="text-sm font-bold text-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-coal-300 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeMonth(1)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-coal-300 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                        {view === 'months' && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => changeYear(-1)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-coal-300 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('years')}
                                    className="text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-coal-300 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    {viewDate.getFullYear()}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeYear(1)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-coal-300 rounded-lg text-slate-600 dark:text-gray-700 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                        {view === 'years' && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => changeYear(-12)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-coal-300 rounded-lg text-slate-600 dark:text-gray-300 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-bold text-slate-800 dark:text-white">
                                    {viewDate.getFullYear() - 6} - {viewDate.getFullYear() + 5}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => changeYear(12)}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-coal-300 rounded-lg text-slate-600 dark:text-gray-300 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Views */}
                    {view === 'days' && (
                        <>
                            <div className="grid grid-cols-7 mb-2">
                                {DAYS.map(day => (
                                    <div key={day} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-400 py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {generateCalendar().map((date, idx) => {
                                    if (!date) return <div key={`empty-${idx}`} />;

                                    const isSelected = isSameDay(date, selectedDate);
                                    const isCurrentDay = isToday(date);

                                    return (
                                        <button
                                            type="button"
                                            key={idx}
                                            onClick={() => handleSelect(date)}
                                            className={`
                                                h-9 w-9 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200
                                                ${isSelected
                                                    ? 'bg-[#0EA5E9] text-white shadow-md'
                                                    : 'text-slate-700 dark:text-gray-700 hover:bg-slate-100 dark:hover:bg-coal-400 hover:scale-105 active:scale-95'}
                                                ${!isSelected && isCurrentDay ? 'text-[#0EA5E9] font-bold bg-blue-50 dark:bg-[#0EA5E9]/10 ring-1 ring-blue-100 dark:ring-[#0EA5E9]/30' : ''}
                                            `}
                                        >
                                            {date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {view === 'months' && (
                        <div className="grid grid-cols-3 gap-3">
                            {MONTHS.map((month, idx) => {
                                const isSelected = selectedDate && selectedDate.getMonth() === idx && selectedDate.getFullYear() === viewDate.getFullYear();
                                const isCurrentMonth = new Date().getMonth() === idx && new Date().getFullYear() === viewDate.getFullYear();

                                return (
                                    <button
                                        type="button"
                                        key={month}
                                        onClick={() => handleMonthSelect(idx)}
                                        className={`
                                            py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                            ${isSelected
                                                ? 'bg-[#0EA5E9] text-white shadow-md'
                                                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-coal-400 hover:scale-105 active:scale-95'}
                                            ${!isSelected && isCurrentMonth ? 'text-[#0EA5E9] font-bold bg-blue-50 dark:bg-[#0EA5E9]/10 ring-1 ring-blue-100 dark:ring-[#0EA5E9]/30' : ''}
                                        `}
                                    >
                                        {month.substring(0, 3)}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {view === 'years' && (
                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 12 }, (_, i) => viewDate.getFullYear() - 6 + i).map((year) => {
                                const isSelected = selectedDate && selectedDate.getFullYear() === year;
                                const isCurrentYear = new Date().getFullYear() === year;

                                return (
                                    <button
                                        type="button"
                                        key={year}
                                        onClick={() => handleYearSelect(year)}
                                        className={`
                                            py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                            ${isSelected
                                                ? 'bg-[#0EA5E9] text-white shadow-md'
                                                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-coal-400 hover:scale-105 active:scale-95'}
                                            ${!isSelected && isCurrentYear ? 'text-[#0EA5E9] font-bold bg-blue-50 dark:bg-[#0EA5E9]/10 ring-1 ring-blue-100 dark:ring-[#0EA5E9]/30' : ''}
                                        `}
                                    >
                                        {year}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-coal-100">
                        <button
                            type="button"
                            onClick={(e) => clearDate(e)}
                            className="text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-coal-400"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={setToday}
                            className="text-xs font-bold text-[#0EA5E9] hover:text-[#0284C7] dark:hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-[#0EA5E9]/10"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
