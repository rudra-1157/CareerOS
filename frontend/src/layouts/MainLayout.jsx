import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import Modal from '../components/common/Modal';

const MainLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-main-bg)] text-[var(--color-text-main)] flex transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <TopHeader onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />
          <div className="transition-opacity duration-150">
            <Outlet />
          </div>
        </main>
      </div>

      {/* System Global Modal */}
      <Modal />
    </div>
  );
};

export default MainLayout;
