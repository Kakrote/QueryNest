"use client"
import React from 'react'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchQuestions } from '@/redux/slices/questionSlice'
import { useRouter } from 'next/navigation'
import QuestionCard from './QestionCard'

const QuestionsList = () => {
    const dispatch = useAppDispatch();
    const [filter, setFilter] = useState("latest");
    const { questions, loading, error } = useAppSelector((s) => s.question);
    const user = useAppSelector((s) => s.auth.user);
    const router = useRouter()

    useEffect(() => {
        dispatch(fetchQuestions({ filter: "latest", page: 1 }))
    }, [filter]);

    const handleQuestionClick = (id) => {
        if (!user) {
            router.push("/auth/login")
        } else {
            router.push(`/question/${id}`)
        }
    }

    const handleAskQuestion = () => {
        if (!user) router.push('/auth/login')
        console.log("ask question")
    }

    return (
        <div className="relative top-14">

            <div className='h-[160px] border-b w-full relative space-y-10 p-3 '>


                <div className='flex justify-between'>
                    <h1 className="text-2xl font-bold mb-4">Top Questions</h1>
                    <button
                        onClick={handleAskQuestion}
                        className='p-2  bg-[#4255FF] text-[#ffff] text-[13px] text-center rounded-[4px] mt-5 '
                    >
                        Ask Question?
                    </button>
                </div>

                {/* Filter Buttons */}
                <div className="flex p-0.5 border rounded-[4px] border-[#CCC5C5] justify-center w-[275px] gap-4 mb-6  ">
                    <button
                        className=' rounded-md active:bg-gray-500 text-[11px] p-2 tracking-tight  '
                        onClick={() => setFilter("latest")}>Latest</button>
                    <button
                        className=' rounded-md active:bg-gray-500 text-[11px] p-2 tracking-tight  '
                        onClick={() => setFilter("liked")}>Most Liked</button>
                    <button
                        className=' rounded-md active:bg-gray-500 text-[11px] p-2 tracking-tight  '
                        onClick={() => setFilter("frequent")}>Frequently Asked</button>
                </div>
            </div>

            {/* Questions List */}
            {loading && <p>Loading...</p>}
            {error && <p className='text-red-700'>{error}</p> }
            {
                questions.length>0?(
                    questions.map((q)=>(
                        <QuestionCard
                        key={q.id}
                        question={q}
                        onClick={()=>handleQuestionClick(q.id)}
                        />
                    ))
                ):(
                    <p>No Questions Found</p>
                )
            }
        </div>
    )
}

export default QuestionsList
