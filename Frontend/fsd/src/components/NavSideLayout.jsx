import React from "react";

const Layout = ({ navbar, sidebar, children }) => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700">
        {sidebar}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-gray-800 border-b border-gray-700">
          {navbar}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;