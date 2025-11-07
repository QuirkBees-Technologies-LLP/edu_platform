import { useEffect, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FiCalendar } from "react-icons/fi";
import { useSettings } from "../providers/SettingsProvider";

const DateRangePicker = ({
  onDateRangeChange,
  initialStartDate = null,
  initialEndDate = null,
}) => {
  const { getThemeMode } = useSettings();
  const theme = getThemeMode();
  const isDark = theme === "dark";

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectedRange, setSelectedRange] = useState("");
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [show, setShow] = useState(false);

  const dropdownRef = useRef(null);
  const today = new Date();

  const formatDate = (date) => date.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateRanges = {
    Today: { start: today, end: today },
    Yesterday: { start: yesterday, end: yesterday },
    "Last 7 Days": {
      start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
      end: today,
    },
    "Last 30 Days": {
      start: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
      end: today,
    },
    "This Month": {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    },
    "Last Month": {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    },
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
        if (showCustomRange) handleCustomRangeCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCustomRange]);

  const handleRangeSelect = (rangeName) => {
    if (rangeName === "Custom Range") {
      setShowCustomRange(true);
      setSelectedRange("Custom Range");
      setTempStartDate(startDate ? formatDate(startDate) : formatDate(today));
      setTempEndDate(endDate ? formatDate(endDate) : formatDate(today));
      return;
    }

    const range = dateRanges[rangeName];
    setStartDate(range.start);
    setEndDate(range.end);
    setSelectedRange(rangeName);
    setShowCustomRange(false);
    setShow(false);
    onDateRangeChange?.(range.start, range.end, rangeName);
  };

  const handleCustomRangeApply = () => {
    if (!tempStartDate || !tempEndDate) return;
    const start = new Date(tempStartDate);
    const end = new Date(tempEndDate);
    if (start > end) return;
    setStartDate(start);
    setEndDate(end);
    setShowCustomRange(false);
    setShow(false);
    onDateRangeChange?.(start, end, "Custom Range");
  };

  const handleCustomRangeCancel = () => {
    setShowCustomRange(false);
    setTempStartDate("");
    setTempEndDate("");
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedRange("");
    setTempStartDate("");
    setTempEndDate("");
    setShowCustomRange(false);
    setShow(false);
    onDateRangeChange?.(null, null, null);
  };

  const displayLabel = selectedRange || "Filter By Date";

  const colors = {
    bg: isDark ? "#1f1f1f" : "#ffffff",
    bgHover: isDark ? "#2a2a2a" : "#f9fafb",
    bgActive: isDark ? "#2e2e2e" : "#f3f4f6",
    text: isDark ? "#f3f4f6" : "#111827",
    subText: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#3f3f46" : "#d1d5db",
    borderHover: isDark ? "#565658" : "#9ca3af",
    shadow: isDark
      ? "0 4px 16px rgba(0,0,0,0.5)"
      : "0 4px 16px rgba(0,0,0,0.1)",
  };

  const styles = {
    container: {
      position: "relative",
      display: "inline-block",
      width: "280px",
    },
    toggle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      height: "38px",
      padding: "8px 12px",
      border: `1px solid ${colors.border}`,
      borderRadius: "6px",
      background: colors.bg,
      color: colors.text,
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    dropdown: {
      position: "absolute",
      top: "calc(100% + 6px)",
      left: "-50px",
      zIndex: 9999,
      width: "fit-content",
      minWidth: "260px",
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
      boxShadow: colors.shadow,
      padding: "8px 0",
      display: show ? "block" : "none",
    },
    item: {
      width: "100%",
      padding: "8px 14px",
      fontSize: "14px",
      textAlign: "left",
      border: "none",
      background: "transparent",
      color: colors.text,
      cursor: "pointer",
      transition: "background-color 0.15s ease, color 0.15s ease",
    },
    closeBtn: {
      position: "absolute",
      top: "10px",
      right: "8px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: colors.subText,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "color 0.2s, transform 0.2s",
    },
    customContainer: {
      padding: "12px",
      borderTop: `1px solid ${colors.border}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
    },
    dateRow: {
      display: "flex",
      gap: "8px",
    },
    input: {
      flex: 1,
      height: "36px",
      width: "150px",
      padding: "6px 8px",
      border: `1px solid ${colors.border}`,
      borderRadius: "6px",
      fontSize: "14px",
      textAlign: "center",
      background: colors.bg,
      color: colors.text,
      caretColor: colors.text,
      transition: "border 0.2s ease",
    },
    buttonRow: {
      display: "flex",
      gap: "8px",
      justifyContent: "center",
      width: "100%",
    },
    btn: {
      padding: "6px 14px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "13px",
      transition: "background 0.2s ease",
      minWidth: "70px",
    },
    btnApply: {
      background: "#2563eb",
      color: "#fff",
    },
    btnCancel: {
      background: isDark ? "#3f3f46" : "#e5e7eb",
      color: isDark ? "#e5e7eb" : "#374151",
    },
  };

  return (
    <div ref={dropdownRef} style={styles.container}>
      <button
        style={styles.toggle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.border = `1px solid ${colors.borderHover}`)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.border = `1px solid ${colors.border}`)
        }
        onClick={() => setShow(!show)}
      >
        <FiCalendar size={16} />
        <span>{displayLabel}</span>
        <i
          className="bi bi-chevron-down"
          style={{
            transform: show ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {selectedRange && (
        <button
          style={styles.closeBtn}
          onClick={handleClear}
          onMouseEnter={(e) => (e.currentTarget.style.color = colors.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = colors.subText)}
        >
          <RxCross2 size={18} />
        </button>
      )}

      <div style={styles.dropdown}>
        {!showCustomRange ? (
          <>
            {Object.keys(dateRanges).map((rangeName) => (
              <button
                key={rangeName}
                style={{
                  ...styles.item,
                  backgroundColor:
                    selectedRange === rangeName
                      ? colors.bgActive
                      : "transparent",
                  fontWeight: selectedRange === rangeName ? "500" : "normal",
                }}
                onClick={() => handleRangeSelect(rangeName)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.bgHover)
                }
                onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  selectedRange === rangeName
                    ? colors.bgActive
                    : "transparent")
                }
              >
                {rangeName}
              </button>
            ))}
            <button
              style={styles.item}
              onClick={() => handleRangeSelect("Custom Range")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = colors.bgHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              Custom Range
            </button>
          </>
        ) : (
          <div style={styles.customContainer}>
            <div style={styles.dateRow}>
              <input
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                max={formatDate(today)}
                style={styles.input}
              />
              <input
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                min={tempStartDate}
                max={formatDate(today)}
                style={styles.input}
              />
            </div>
            <div style={styles.buttonRow}>
              <button
                style={{ ...styles.btn, ...styles.btnCancel }}
                onClick={handleCustomRangeCancel}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.btn,
                  ...styles.btnApply,
                  opacity: tempStartDate && tempEndDate ? 1 : 0.6,
                  cursor:
                    tempStartDate && tempEndDate ? "pointer" : "not-allowed",
                }}
                disabled={!tempStartDate || !tempEndDate}
                onClick={handleCustomRangeApply}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomDateRangePicker = ({ handleDateRangeChangeCallback }) => {
  const handleDateRangeChange = (start, end, rangeName) => {
    handleDateRangeChangeCallback?.(start, end, rangeName);
  };

  return (
    <div style={{ padding: 0 }}>
      <DateRangePicker onDateRangeChange={handleDateRangeChange} />
    </div>
  );
};

export default CustomDateRangePicker;
