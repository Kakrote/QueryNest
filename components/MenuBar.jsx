'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Home, MessageSquareCode, Tags, Settings, LogIn, Newspaper } from 'lucide-react';

const navItems = [
  { name: 'Home', path: '/', icon: Home, authRequired: true },
  { name: 'Questions', path: '/questions', icon: MessageSquareCode },
  { name: 'Tags', path: '/tags', icon: Tags },
  { name: 'Articles', path: '/articles', icon: Newspaper },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const MenuBar = ({ isOpen, closeSideBar }) => {
  console.log("isOpen",isOpen)
  console.log("closeSideBar",closeSideBar)
  console.log("isOpen",isOpen)
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAppSelector((s) => s.auth);

  return (
    <div className="w-[180px] h-full space-y-6 bg-[#e2e8f0] text-[#1e1828] rounded-md shadow-lg p-4">
      <div className="space-y-1">
        {!token && (
          <NavItem
            name="Log In"
            path="/auth/login"
            icon={LogIn}
            pathname={pathname}
            router={router}
            closeSideBar={closeSideBar}
          />
        )}

        {navItems.map((item) => {
          if (item.authRequired && !token) return null;
          return (
            <NavItem
              key={item.name}
              name={item.name}
              path={item.path}
              icon={item.icon}
              pathname={pathname}
              router={router}
              closeSideBar={closeSideBar}
            />
          );
        })}
      </div>
    </div>
  );
};

const NavItem = ({ name, path, icon: Icon, pathname, router, closeSideBar }) => {
  const isActive = pathname === path;

  const handelNavClick = () => {
    closeSideBar?.(); // ✅ First close sidebar
    setTimeout(() => {
      router.push(path); // ✅ Then navigate
    }, 100); // Small delay allows UI update before unmount
  };

  return (
    <div
      onClick={handelNavClick}
      className={`relative flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-300
        ${isActive ? 'bg-blue-600 text-white font-medium shadow-md' : 'hover:bg-blue-100 hover:text-blue-700 text-gray-800'}
      `}
    >
      {/* Left border indicator */}
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-r bg-blue-700 transition-all duration-300
          ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}
        `}
      ></span>

      <Icon className="w-4 h-4" />
      <span className="text-sm">{name}</span>
    </div>
  );
};

export default MenuBar;
