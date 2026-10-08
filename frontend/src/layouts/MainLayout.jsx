import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import Modal from '../components/common/Modal';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <Sidebar />
      <main className="ml-[72px] md:ml-[235px] w-[calc(100%-72px)] md:w-[calc(100%-235px)] p-[20px] md:p-[28px_34px] transition-all duration-200">
        <TopHeader />
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </main>
      <Modal />
    </div>
  );
};

export default MainLayout;
