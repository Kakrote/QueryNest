import React from 'react'
import { useAppSelector } from '@/store/hooks'
import { Home, MessageSquareCode, Tags, Settings, LogIn, Newspaper } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MenuBar = ({ isOpen, closeSidebar }) => {
  const { user, token } = useAppSelector((s) => s.auth);
  const router = useRouter();

  return (
    <div className='w-[200px] h-full space-y-10 bg-white  shadow-lg p-4'>
      {/* Top */}
      <div className="space-y-3">
        {!token ? (
          <button onClick={() => router.push('/auth/login')} className='flex items-center gap-2 text-sm'>
            <LogIn className="w-4 h-4" /> <span>Log In</span>
          </button>
        ) : (
          <button onClick={() => router.push('/')} className='flex items-center gap-2 text-sm'>
            <Home className="w-4 h-4" /> <span>Home</span>
          </button>
        )}
        <button className='flex items-center gap-2 text-sm'>
          <MessageSquareCode className="w-4 h-4" /> <span>Questions</span>
        </button>
        <button className='flex items-center gap-2 text-sm'>
          <Tags className="w-4 h-4" /> <span>Tags</span>
        </button>
      </div>

      {/* Bottom */}
      <div className="space-y-3">
        <button className='flex items-center gap-2 text-sm'>
          <Newspaper className="w-4 h-4" /> <span>Articles</span>
        </button>
        <button className='flex items-center gap-2 text-sm'>
          <Settings className="w-4 h-4" /> <span>Settings</span>
        </button>
      </div>
    </div>
  )
}

export default MenuBar
