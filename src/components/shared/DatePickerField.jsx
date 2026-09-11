import React, { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import "./DatePickerField.css";

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAY_LABELS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

// Parse YYYY-MM-DD without UTC timezone shifts
const parseYMD = (str) => {
    if (!str || typeof str !== "string") return null;
    const parts = str.trim().split("-");
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    const date = new Date(y, m, d);
    if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) return null;
    return date;
};

// Format Date object to YYYY-MM-DD string
const formatYMD = (d) => {
    if (!d || isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const DatePickerField = ({
    value = "",
    onChange,
    placeholder = "AAAA-MM-DD (opcional)",
    id,
    disabled = false,
    dropUp = true
}) => {
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [textValue, setTextValue] = useState(value || "");

    // Reference month and year for calendar navigation
    const initialDate = parseYMD(value) || new Date();
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

    // Keep textValue in sync if value prop changes from outside
    useEffect(() => {
        setTextValue(value || "");
        if (value) {
            const parsed = parseYMD(value);
            if (parsed) {
                setViewYear(parsed.getFullYear());
                setViewMonth(parsed.getMonth());
            }
        }
    }, [value]);

    // Close calendar on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen]);

    // Handle manual keyboard typing
    const handleInputChange = (e) => {
        const inputStr = e.target.value;
        setTextValue(inputStr);

        if (!inputStr.trim()) {
            onChange("");
            return;
        }

        const parsed = parseYMD(inputStr);
        if (parsed) {
            onChange(formatYMD(parsed));
            setViewYear(parsed.getFullYear());
            setViewMonth(parsed.getMonth());
        }
    };

    const handleInputBlur = () => {
        if (!textValue.trim()) {
            onChange("");
            return;
        }
        const parsed = parseYMD(textValue);
        if (parsed) {
            const normalized = formatYMD(parsed);
            setTextValue(normalized);
            onChange(normalized);
        } else {
            // Revert back to previous valid prop value if user typed nonsense
            setTextValue(value || "");
        }
    };

    // Calendar Navigation
    const handlePrevMonth = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((prev) => prev - 1);
        } else {
            setViewMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((prev) => prev + 1);
        } else {
            setViewMonth((prev) => prev + 1);
        }
    };

    // Day Selection
    const handleSelectDay = (year, month, day) => {
        const selected = new Date(year, month, day);
        const ymd = formatYMD(selected);
        setTextValue(ymd);
        onChange(ymd);
        setIsOpen(false);
    };

    // Clear value
    const handleClear = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setTextValue("");
        onChange("");
        inputRef.current?.focus();
    };

    // Quick Presets
    const handleApplyPreset = (monthsToAdd = 0, daysToAdd = 0) => {
        const today = new Date();
        const target = new Date(today.getFullYear(), today.getMonth() + monthsToAdd, today.getDate() + daysToAdd);
        const ymd = formatYMD(target);
        setTextValue(ymd);
        onChange(ymd);
        setViewYear(target.getFullYear());
        setViewMonth(target.getMonth());
        setIsOpen(false);
    };

    // Generate Calendar Grid
    const selectedDate = parseYMD(value);
    const today = new Date();

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0

    const calendarCells = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        calendarCells.push({
            day: dayNum,
            month: viewMonth === 0 ? 11 : viewMonth - 1,
            year: viewMonth === 0 ? viewYear - 1 : viewYear,
            isOtherMonth: true
        });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
        calendarCells.push({
            day,
            month: viewMonth,
            year: viewYear,
            isOtherMonth: false
        });
    }

    // Next month leading days to complete grid (multiples of 7)
    const remainingCells = (7 - (calendarCells.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
        calendarCells.push({
            day,
            month: viewMonth === 11 ? 0 : viewMonth + 1,
            year: viewMonth === 11 ? viewYear + 1 : viewYear,
            isOtherMonth: true
        });
    }

    return (
        <div className="dl-datepicker-container" ref={containerRef}>
            <div className="dl-datepicker-input-wrapper">
                <input
                    id={id}
                    ref={inputRef}
                    type="text"
                    className="dl-datepicker-input"
                    value={textValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={10}
                />

                <div className="dl-datepicker-actions">
                    {value && !disabled && (
                        <button
                            type="button"
                            className="dl-datepicker-btn-clear"
                            onClick={handleClear}
                            title="Quitar fecha (sin límite)"
                            aria-label="Limpiar fecha"
                        >
                            <X size={15} />
                        </button>
                    )}

                    <button
                        type="button"
                        className={`dl-datepicker-btn-toggle ${isOpen ? "active" : ""}`}
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        title="Desplegar calendario"
                        aria-label="Abrir calendario"
                    >
                        <Calendar size={16} />
                    </button>
                </div>
            </div>

            {/* Dropdown Calendar Popover */}
            {isOpen && (
                <div className={`dl-datepicker-popover ${dropUp ? "drop-up" : "drop-down"}`} role="dialog" aria-modal="true">
                    {/* Header */}
                    <div className="dl-calendar-header">
                        <button
                            type="button"
                            className="dl-calendar-nav-btn"
                            onClick={handlePrevMonth}
                            title="Mes anterior"
                            aria-label="Mes anterior"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="dl-calendar-title">
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </div>

                        <button
                            type="button"
                            className="dl-calendar-nav-btn"
                            onClick={handleNextMonth}
                            title="Mes siguiente"
                            aria-label="Mes siguiente"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="dl-calendar-weekdays">
                        {WEEKDAY_LABELS.map((w, idx) => (
                            <div key={idx} className="dl-calendar-weekday">
                                {w}
                            </div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="dl-calendar-days-grid">
                        {calendarCells.map((cell, idx) => {
                            const isToday =
                                today.getDate() === cell.day &&
                                today.getMonth() === cell.month &&
                                today.getFullYear() === cell.year;

                            const isSelected =
                                selectedDate &&
                                selectedDate.getDate() === cell.day &&
                                selectedDate.getMonth() === cell.month &&
                                selectedDate.getFullYear() === cell.year;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                                    className={`dl-calendar-day-btn ${cell.isOtherMonth ? "other-month" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                                    title={`${cell.day} de ${MONTH_NAMES[cell.month]} ${cell.year}`}
                                >
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Presets */}
                    <div className="dl-calendar-presets">
                        <button
                            type="button"
                            className="dl-preset-chip"
                            onClick={() => handleApplyPreset(0, 0)}
                        >
                            Hoy
                        </button>
                        <button
                            type="button"
                            className="dl-preset-chip"
                            onClick={() => handleApplyPreset(1, 0)}
                        >
                            +1 Mes
                        </button>
                        <button
                            type="button"
                            className="dl-preset-chip"
                            onClick={() => handleApplyPreset(3, 0)}
                        >
                            +3 Meses
                        </button>
                        <button
                            type="button"
                            className="dl-preset-chip"
                            onClick={() => handleApplyPreset(6, 0)}
                        >
                            +6 Meses
                        </button>
                        <button
                            type="button"
                            className="dl-preset-chip"
                            onClick={() => handleApplyPreset(12, 0)}
                        >
                            +1 Año
                        </button>
                        <button
                            type="button"
                            className="dl-preset-chip dl-preset-chip-clear"
                            onClick={() => {
                                setTextValue("");
                                onChange("");
                                setIsOpen(false);
                            }}
                        >
                            Sin límite
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePickerField;
