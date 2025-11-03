import React from "react";
import { Select, ConfigProvider } from "antd";

const CustomSelect = ({
  mode = "multiple",
  options = [],
  value,
  onChange,
  onBlur,
  placeholder = "Select options...",
  size = "middle",
  style = {},
  disabled = false,
  loading = false,
  allowClear = true,
  showSearch = true,
  filterOption = true,
  maxTagCount = "responsive",
  popupMatchSelectWidth = false,
  popupClassName = "",
  ...props
}) => {
  const theme = {
    token: {
      colorPrimary: "#106278",
      borderRadius: 6,
      controlHeight: 36,
    },
    components: {
      Select: {
        optionSelectedBg: "#e6f3f7",
        optionActiveBg: "#f0f8fa",
        multipleItemBg: "#e6f3f7",
        multipleItemBorderColor: "#106278",
        multipleItemColor: "#106278",
        multipleItemHoverBg: "#d1e7f0",
        multipleItemHoverBorderColor: "#106278",
      },
    },
  };

  const normalizedValue =
    mode === "multiple"
      ? Array.isArray(value)
        ? value.map(String)
        : []
      : value
        ? String(value)
        : undefined;

  const handleChange = (val) => {
    if (mode === "multiple") {
      onChange?.(val.map(String));
    } else {
      onChange?.(String(val));
    }
  };

  return (
    <ConfigProvider theme={theme}>
      <Select
        mode={mode}
        value={normalizedValue}
        options={options}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        size={size}
        style={{ width: "100%", ...style }}
        disabled={disabled}
        loading={loading}
        allowClear={allowClear}
        showSearch={showSearch}
        filterOption={filterOption}
        maxTagCount={maxTagCount}
        popupMatchSelectWidth={popupMatchSelectWidth}
        popupClassName={`custom-select-popup ${popupClassName}`}
        getPopupContainer={(trigger) => trigger.parentNode}
        dropdownStyle={{
          maxHeight: 250,
          overflowY: "auto",
        }}
        {...props}
      />
    </ConfigProvider>
  );
};

export default CustomSelect;
