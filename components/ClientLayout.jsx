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

  const NAV_HEIGHT = 50; // px (keep in sync with Navbar)

  return (
    <div className="relative min-h-screen flex bg-white text-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:fixed lg:top-[50px] lg:left-0 lg:h-[calc(100vh-50px)] lg:z-30">
        <MenuBar isOpen={true} closeSideBar={() => {}} />
      </div>

      {/* Mobile Sidebar + Backdrop */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={sidebarRef}
            className="fixed top-[50px] left-0 h-[calc(100vh-50px)] w-56 z-50 shadow-xl animate-slide-in"
            aria-label="Mobile navigation sidebar"
          >
            <MenuBar isOpen={isOpen} closeSideBar={() => setIsOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full min-w-0">
        <Navbar toggleMenu={() => setIsOpen(!isOpen)} />
        <main
          className="pt-[60px] pb-8 px-4 sm:px-6 md:px-8 w-full max-w-screen-2xl mx-auto transition-[padding] duration-200 ease-out lg:pl-[230px]"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
