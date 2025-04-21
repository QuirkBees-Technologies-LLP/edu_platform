import React, { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";

const AdminNavigation = ({ activePage, onPageChange, onBack }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "courses",
      label: "Courses",
      icon: BookOpen,
    },
    {
      id: "students",
      label: "Students",
      icon: Users,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const handlePageChange = (pageId) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-lg font-semibold text-gray-800">
              {navItems.find((item) => item.id === activePage)?.label ||
                "Admin"}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4 px-6 py-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activePage === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`lg:hidden ${
            isMobileMenuOpen ? "block" : "hidden"
          } border-t`}
        >
          <div className="px-2 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activePage === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;
