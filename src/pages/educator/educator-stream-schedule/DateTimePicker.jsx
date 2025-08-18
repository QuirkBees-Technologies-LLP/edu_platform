import React from "react";
import DatePicker from "react-datepicker";

const DateTimePicker = ({
  value,
  onChange,
  placeholder = "Select date & time",
  className = "",
  options = {},
  isPickerOpen,
  setIsPickerOpen
}) => {
  const handleChange = (date) => {
    onChange(date);
    // Only close when time is selected (not just date)
    if (date instanceof Date && date.getHours() !== 0 && date.getMinutes() !== 0) {
      setIsPickerOpen(false);
    }
  };
  return (
    <DatePicker
      selected={value}
      onChange={handleChange}
      onClickOutside={() => setIsPickerOpen(false)} // Close when clicking outside
      onInputClick={() => setIsPickerOpen(true)} // Open on input click
      open={isPickerOpen} // Control open / close state
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={5}
      timeCaption="Time"
      dateFormat="MMMM d, yyyy h:mm aa"
      placeholderText={placeholder}
      className={`form-control ${className}`}
      {...options}
    />
  );
};

export default DateTimePicker;
