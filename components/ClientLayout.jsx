'use client';
import React, { useState, useRef, useEffect } from 'react';
import Navbar from './Navbar';
import MenuBar from './MenuBar';

const ClientLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Close sidebar if clicked outside (for small screens only)
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('nav')
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative min-h-screen flex">
  
      <div className="lg:block lg:fixed lg:top-0 lg:left-0 lg:h-[calc(100vh-3.5rem)] lg:z-30">
        <MenuBar isOpen={true} closeSideBar={() => {}} />
      </div>

      {/* Sidebar for small screens */}
      {isOpen && (
        <div
          ref={sidebarRef}
          className="fixed left-0 z-50 block lg:hidden"
        >
          <MenuBar isOpen={isOpen} closeSideBar={() => setIsOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full">
        <Navbar toggleMenu={() => setIsOpen(!isOpen)} />

        {/* ✅ Padding on left so content doesn’t hide behind sidebar */}
        <main className="p-4 lg:pl-[200px]">{children}</main>
      </div>
    </div>
  );
};

export default ClientLayout;
