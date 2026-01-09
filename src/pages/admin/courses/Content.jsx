import React, { useState } from "react";
import { BookOpen, Users, Settings, Menu, X } from "lucide-react";
import { useAuthContext } from "../../../auth/useAuthContext";

// components
import SettingsSection from "./pages/Settings";
import Classroom from "./pages/Classroom";
const Content = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    return hash || "classroom";
  });
  const { auth } = useAuthContext();

  const baseNavItems = [
    { icon: BookOpen, label: "Classroom", href: "#classroom" },
  ];

  const adminNavItems = [
    { icon: Settings, label: "Settings", href: "#settings" },
  ];

  const navItems = [
    ...baseNavItems,
    ...(auth?.user?.role === "educator" || auth?.user?.role === "admin"
      ? adminNavItems
      : []),
  ];

  const handleNavigation = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
    window.location.hash = page; // this sets the hash in the URL
  };
  const renderContent = () => {
    switch (activePage) {
      case "classroom":
        return <Classroom />;
      case "settings":
        return <SettingsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="card mb-10">
      <div className="card-body pt-0">
        <div className="min-h-screen">
          {/* Navigation Bar */}
          <nav className="border-b-2 py-3">
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
                        onClick={() =>
                          handleNavigation(item.label.toLowerCase())
                        }
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          activePage === item.label.toLowerCase()
                            ? "bg-primary-light text-primary"
                            : "bg-light text-gray-700 hover:bg-gray-50 dark:hover:bg-dark"
                        }`}
                      >
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
                <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => handleNavigation(item.label.toLowerCase())}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        activePage === item.label.toLowerCase()
                          ? "bg-primary-light text-primary"
                          : " bg-light text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-dark"
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
          <main className="pt-8">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default Content;
