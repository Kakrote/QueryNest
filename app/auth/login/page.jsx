"use client"
import React,{useState,useEffect} from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginUser } from '@/redux/slices/authSlice'

const Login = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [errorMessage, setErrorMessage] = useState('');
    const {loading, error, token}=useAppSelector((s)=>s.auth);

    console.log("token: ",token)

    useEffect(() => {
      if(token){
        router.push('/questions')
      }
    }, [token,router])

    const onSubmit=async(data)=>{
        try{
            console.log("hiting the login button")
            await dispatch(loginUser(data)).unwrap();
            console.log("response from loginging")
            router.push('/')
        }
        catch(err){
            console.log("check eoor")
            setErrorMessage(err||error);
        }
    }
    

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Welcome Back 👋</h2>

        {errorMessage && (
          <div className="text-red-600 text-sm text-center mb-4">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              type="email"
              id="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">Password</label>
            <input
              type="password"
              id="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-md font-semibold transition-all duration-200 ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-sm text-center mt-4">
            <span className='text-black'>New here? </span>
            <Link href="/signup" className="text-blue-600 underline hover:text-blue-800">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login
