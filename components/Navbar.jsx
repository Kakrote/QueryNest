'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '@/redux/slices/authSlice';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          StackClone
        </Link>

        {/* Right‑side actions */}
        {!token ? (
          <div className="space-x-3">
            <Link
              href="/login"
              className="px-4 py-1 rounded border text-md hover:bg-gray-100 text-[#5D7BFF]  border-[#5D7BFF] "
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1 rounded bg-blue-600 text-white text-md"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/ask-question"
              className="hidden sm:inline-block px-4 py-1 rounded bg-green-600 text-white text-sm"
            >
              Ask Question
            </Link>

            {/* Avatar dropdown */}
            <div className="relative group">
              <Image
                src={`https://ui-avatars.com/api/?name=${user.name}`}
                width={32}
                height={32}
                alt="avatar"
                className="rounded-full cursor-pointer"
              />
              <ul className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                <li>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => dispatch(logout())}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
