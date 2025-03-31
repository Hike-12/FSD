"use client";

import React from "react";

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const sidebarCategories = [
    { name: "All Competitions", icon: "🏆", count: 42 },
    // ... other categories
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
      
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-gray-900 border-r border-gray-800 z-40 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Sidebar content remains the same */}
      </aside>
    </>
  );
};