'use client';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { LucideMenu } from 'lucide-react';
import { SearchIcon, LucideUserCircle2, Bell } from 'lucide-react';

export default function Navbar({ toggleMenu }) {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);

  return (
    <nav className='fixed top-0 w-full h-[60px] z-[999] flex bg-[#ffff]   items-center justify-between px-4 py-2 border-b border-blue-200  backdrop-blur-md shadow-sm'>
      <div className="leftside flex gap-3">

        {/* menu toggler */}
        <div className='md:hidden'>

          <button
            onClick={toggleMenu}
            className='text-blue-700  hover:text-blue-900 active:scale-105 transition duration-150'
          >
            <LucideMenu />
          </button>
        </div>

        {/* logo */}
        <div className="flex-1 flex justify-center md:justify-start">
          <h1 className="text-lg text-center md:text-2xl text-blue-800 font-semibold tracking-wide">
            QueryNest
          </h1>
        </div>
      </div>

      <div className="rightside flex gap-2">
        <span className='p-2'><SearchIcon /></span>
        {!token ? (
          <div className='flex space-x-3 items-center justify-center'>
            <Link href={'/auth/login'}>
              <button
                className='text-center border p-2 rounded-md border-[#4255FF] text-[#5D7BFF] font-bold text-[15px] leading-[150%] tracking-tight'>
                Log In
              </button>
            </Link>
            <Link href={'/auth/signup'}>
            <button
              className='text-center border bg-[#4255FF] p-2 rounded-md text-[#ffff] font-bold text-[15px] leading-[150%] tracking-tight'>
              sign up
            </button>
                </Link>
          </div>
        ) : (
          <div className='flex gap-2'>
            <span className='text-center flex items-center '><LucideUserCircle2 /></span>
            <span className='flex items-center'><Bell /></span>
          </div>
        )}
      </div>
    </nav>
  );
}
