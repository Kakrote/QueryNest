"use client";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { LucideMenu } from "lucide-react";
import { SearchIcon, LucideUserCircle2, Bell, Settings, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import SearchModal from "./SearchModal";

export default function Navbar({ toggleMenu }) {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      // Open search modal with Ctrl+K or Cmd+K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearchModal(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
  <nav className="fixed top-0 w-full h-[50px] items-center gap-2 sm:gap-4 z-[999] flex bg-white/90 supports-[backdrop-filter]:bg-white/70 px-2 sm:px-4 py-2 border-b border-blue-200 backdrop-blur-md shadow-sm">
      {/* menu toggler */}
      <button onClick={toggleMenu} className="text-blue-700 hover:text-blue-900 active:scale-105 transition duration-150 lg:hidden p-1 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400">
        <LucideMenu size={22} />
      </button>

      {/* logo */}
      <Link href="/" className="flex justify-center md:justify-start min-w-0">
        <h1 className="truncate max-w-[160px] sm:max-w-none text-base sm:text-lg md:text-2xl text-blue-800 font-semibold tracking-wide leading-none">QueryNest</h1>
      </Link>

      {/* Links for desktop */}
      <div className="flex gap-5">

      </div>

  <div  className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => setShowSearchModal(true)}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm"
          title="Search (Ctrl+K)"
        >
          <SearchIcon className="w-5 h-5 shrink-0" />
          <span className="hidden md:block">Search</span>
          <span className="hidden lg:block text-[10px] text-gray-400 border border-gray-300 rounded px-1 py-0.5 leading-none">
            Ctrl+K
          </span>
        </button>
        {!token ? (
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <Link href={"/auth/login"}>
              <button className="text-center border px-3 py-1.5 rounded-md border-[#4255FF] text-[#4255FF] font-semibold text-xs sm:text-sm leading-none tracking-tight hover:bg-blue-50 transition">Log In</button>
            </Link>
            <Link href={"/auth/signup"}>
              <button className="text-center border bg-[#4255FF] px-3 py-1.5 rounded-md text-white font-semibold text-xs sm:text-sm leading-none tracking-tight hover:bg-blue-600 transition">Sign Up</button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-2 sm:gap-3 relative items-center">
            <button className="p-1.5 rounded-md hover:bg-blue-50 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            
            {/* User Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-haspopup="menu"
                aria-expanded={showUserMenu}
              >
                <LucideUserCircle2 className="w-6 h-6" />
                <ChevronDown size={14} />
              </button>
              
              {showUserMenu && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-fade-in">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-gray-500 text-xs">{user?.email}</div>
                    </div>
                    <Link 
                      href="/settings" 
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
    </nav>
  );
}
