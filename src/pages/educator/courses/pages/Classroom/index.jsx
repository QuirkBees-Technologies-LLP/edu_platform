import React from "react";

// components
import ClassroomContent from "./Content";

const Classroom = ({ defaultActiveTab, hideToggle }) => {
  return <ClassroomContent defaultActiveTab={defaultActiveTab} hideToggle={hideToggle} />;
};

export default Classroom;
