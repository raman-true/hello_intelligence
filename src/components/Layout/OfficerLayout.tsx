import React from 'react';
import { OfficerSidebar } from './OfficerSidebar';
import { OfficerHeader } from './OfficerHeader';

interface OfficerLayoutProps {
  children: React.ReactNode;
}

export const OfficerLayout: React.FC<OfficerLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-crisp-black">
      <OfficerSidebar />
      <div className="flex-1 flex flex-col">
        <OfficerHeader />
        <main className="flex-1 overflow-auto" style={{ height: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};