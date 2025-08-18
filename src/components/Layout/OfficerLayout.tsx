import React, { useState } from 'react';
import { OfficerSidebar } from './OfficerSidebar';
import { OfficerHeader } from './OfficerHeader';

interface OfficerLayoutProps {
  children: React.ReactNode;
}

export const OfficerLayout: React.FC<OfficerLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-crisp-black">
      {/* Officer Sidebar for larger screens, or as an overlay for smaller screens */}
      <OfficerSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 flex flex-col min-w-0"> {/* Added min-w-0 to prevent overflow */}
        <OfficerHeader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4 md:p-6" style={{ height: 'calc(100vh - 64px)' }}> {/* Added padding for content */}
          {children}
        </main>
      </div>
    </div>
  );
};
