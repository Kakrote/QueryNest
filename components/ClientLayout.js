'use client';
import React, { useState, useRef, useEffect } from 'react';
import Navbar from './Navbar';
import MenuBar from './MenuBar';

const ClientLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Close sidebar if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)&&!event.target.closest('nav')) {
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
    <div className="relative min-h-screen">
      <Navbar toggleMenu={() => setIsOpen(!isOpen)} />

      {/* Sidebar */}
      {isOpen && (
        <div
          ref={sidebarRef}
          className="fixed top-14 h-[300px] left-0 z-50"
        >
          <MenuBar isOpen={isOpen} closeSideBar={() => setIsOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <main className="p-2">{children}</main>
    </div>
  );
};

export default ClientLayout;
