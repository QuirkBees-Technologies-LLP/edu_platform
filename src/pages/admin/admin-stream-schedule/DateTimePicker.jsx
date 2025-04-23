import React from "react";
import DatePicker from "react-datepicker";

const DateTimePicker = ({
  value,
  onChange,
  placeholder = "Select date & time",
  className = "",
  options = {},
}) => {
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={2}
      timeCaption="Time"
      dateFormat="MMMM d, yyyy h:mm aa"
      placeholderText={placeholder}
      className={`form-control ${className}`}
      {...options}
    />
  );
};

export default DateTimePicker;
