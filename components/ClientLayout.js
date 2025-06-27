"use client";
import React, { useState } from "react";
import Navbar from "./Navbar";
import MenuBar from "./MenuBar";

const ClientLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <Navbar toggleMenu={() => setIsOpen(!isOpen)} />

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed top-14 h-[300px] left-0 z-50">
          <MenuBar isOpen={isOpen} closeSidebar={() => setIsOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <main className="p-2 ">{children}</main>
    </div>
  );
};

export default ClientLayout;
