import React, { useState } from "react";
import { BookOpen, Users, Settings, Menu, X } from "lucide-react";

import { useAuthContext } from "../../auth/useAuthContext";
// components
import ClassroomSection from "./pages/Classroom";
import SettingsSection from "./pages/Settings";

const ClassroomShowcaseContent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("classroom"); // Default active page
  const { auth } = useAuthContext();

  // Base navigation items that everyone can see
  const baseNavItems = [
    { icon: BookOpen, label: "Classroom", href: "#classroom" },
  ];

  // Admin/Instructor only navigation items
  const adminNavItems = [
    { icon: Settings, label: "Settings", href: "#settings" },
  ];

  // Combine navigation items based on user role
  const navItems = [
    ...baseNavItems,
    ...(auth?.user?.role === "INSTRUCTOR" || auth?.user?.role === "ADMIN"
      ? adminNavItems
      : []),
  ];

  const handleNavigation = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const renderContent = () => {
    switch (activePage) {
      case "classroom":
        return <ClassroomSection />;
      case "students":
        return auth?.user?.role === "INSTRUCTOR" ||
          auth?.user?.role === "ADMIN" ? (
          <div>Students Management</div>
        ) : null;
      case "settings":
        return auth?.user?.role === "INSTRUCTOR" ||
          auth?.user?.role === "ADMIN" ? (
          <SettingsSection />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => handleNavigation(item.label.toLowerCase())}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      activePage === item.label.toLowerCase()
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 mr-2 ${
                        activePage === item.label.toLowerCase()
                          ? "text-blue-600"
                          : ""
                      }`}
                    />
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Empty div to balance the mobile menu button */}
            <div className="md:hidden w-10"></div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => handleNavigation(item.label.toLowerCase())}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    activePage === item.label.toLowerCase()
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 mr-2 ${
                      activePage === item.label.toLowerCase()
                        ? "text-blue-600"
                        : ""
                    }`}
                  />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</div>
    </div>
  );
};

export { ClassroomShowcaseContent };
