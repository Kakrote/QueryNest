"use client";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { LucideMenu } from "lucide-react";
import { SearchIcon, LucideUserCircle2, Bell } from "lucide-react";

export default function Navbar({ toggleMenu }) {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);

  return (
    <nav className="fixed top-0 w-full h-[50px] items-center gap-4 z-[999] flex bg-[#ffff] px-4 py-2 border-b border-blue-200  backdrop-blur-md shadow-sm">
      {/* menu toggler */}
      <button onClick={toggleMenu} className="text-blue-700  hover:text-blue-900 active:scale-105 transition duration-150">
        <LucideMenu size={24} />
      </button>

      {/* logo */}
      <Link href="/" className="flex justify-center md:justify-start">
        <h1 className="text-lg text-center md:text-2xl text-blue-800 font-semibold tracking-wide">QueryNest</h1>
      </Link>

      {/* Links for desktop */}
      <div className="flex gap-5">

      </div>

      <div  className="ml-auto flex gap-5">
        <SearchIcon />
        {!token ? (
          <div className="flex space-x-3 items-center justify-center gap-5">
            <Link href={"/auth/login"}>
              <button className="text-center border p-2 rounded-md border-[#4255FF] text-[#5D7BFF] font-bold text-[15px] leading-[150%] tracking-tight">Log In</button>
            </Link>
            <Link href={"/auth/signup"}>
              <button className="text-center border bg-[#4255FF] p-2 rounded-md text-[#ffff] font-bold text-[15px] leading-[150%] tracking-tight">sign up</button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-5">
            <span className="text-center flex items-center ">
              <LucideUserCircle2 />
            </span>
            <span className="flex items-center">
              <Bell />
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
