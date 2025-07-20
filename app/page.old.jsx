'use client'
import React,{useEffect} from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'

const page = () => {
    const router=useRouter()
    const {token}=useAppSelector((s)=>s.auth)
    useEffect(() => {
        if(!token) router.push('/questions')
    },[])
    
  return (
    <div>
      
    </div>
  )
}

export default page
