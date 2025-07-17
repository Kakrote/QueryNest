"use client"
import React from 'react'
import { useState } from 'react';
import { correctText } from '@/utils/correctText';
import { set, useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { askQuestion } from '@/redux/slices/questionSlice';
import { useRouter } from 'next/navigation';
import axios from 'axios';



const qoute = ["It is not the answer that enlightens, but the question."];

const askQuestions = () => {
    const [showFixOption, setShowFixOption] = useState(false);
    const [corrections, setCorrections] = useState({});
    const [fixing, setFixing] = useState(false);

    const { loading, success, error } = useAppSelector((s) => s.question);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { register, handleSubmit, reset, formState: { errors }, getValues, setValue } = useForm();


    const handleFixGrammar = async () => {
        setFixing(true);
        const values = getValues();
        const [fixedTitle, fixedContent, fixedTags] = await Promise.all([
            correctText(values.title),
            correctText(values.content),
            correctText(values.tags)
        ]);
        setFixing(false);
        setCorrections({
            title: fixedTitle,
            content: fixedContent,
            tags: fixedTags
        });
        setShowFixOption(true);

    }

    const onSubmit = async (data) => {
        console.log("Ask Question button hit")
        const payload = {
            ...data,
            tags: data.tags.split(',').map(tag => tag.trim())
        };
        console.log("verfying payload: ",payload)
        await dispatch(askQuestion(payload));
        console.log("retruning from api call")
        if (success) {
            reset();
            router.push('/')
        }
    }

    return (
        <main className='mt-14'>
            <div className='h-[80px] py-2 border-b'>

                <div className='flex justify-between'>
                    <span className='bg-gradient-to-br from-[10%] from-[#fa9b72fa] to-[#5153e9] bg-clip-text text-transparent text-center w-[60%] font-serif italic'>"{qoute}"</span>
                    <button
                        // onClick={handleAskQuestion}
                        className='p-2  bg-[#4255FF] text-[#ffff] text-[13px] text-center rounded-[4px] mt-5 '
                    >
                        Write Blog
                    </button>
                </div>

            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block font-medium mb-1">Title</label>
                    <input
                        type="text"
                        {...register('title', { required: true })}
                        className="w-full p-2 border rounded"
                        placeholder="Enter your question title"
                    />
                    {errors.title && <span className="text-red-500">Title is required</span>}
                </div>

                {/* Content */}
                <div>
                    <label className="block font-medium mb-1">Content</label>
                    <textarea
                        {...register('content', { required: true })}
                        className="w-full p-2 border rounded"
                        rows={6}
                        placeholder="Describe your problem in detail"
                    />
                    {errors.content && <span className="text-red-500">Content is required</span>}
                </div>

                {/* Tags */}
                <div>
                    <label className="block font-medium mb-1">Tags (comma separated)</label>
                    <input
                        type="text"
                        {...register('tags', { required: true })}
                        className="w-full p-2 border rounded"
                        placeholder="e.g., javascript, nextjs, api"
                    />
                    {errors.tags && <span className="text-red-500">At least one tag is required</span>}
                </div>

                {/* Fix Grammar Button */}
                <button
                    type="button"
                    onClick={handleFixGrammar}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    disabled={fixing}
                >
                    {fixing ? "Fixing..." : "✨ Fix Grammar & Spelling"}
                </button>

                {/* AI Correction Preview */}
                {showFixOption && (
                    <div className="p-3 mt-4 border rounded bg-gray-50">
                        <p className="font-semibold mb-2">AI-Suggested Corrections:</p>

                        <div className="mb-2">
                            <strong>Title:</strong>
                            <p className="italic text-blue-700">{corrections.title}</p>
                        </div>

                        <div className="mb-2">
                            <strong>Content:</strong>
                            <p className="italic text-blue-700 whitespace-pre-wrap">{corrections.content}</p>
                        </div>

                        <div className="mb-2">
                            <strong>Tags:</strong>
                            <p className="italic text-blue-700">{corrections.tags}</p>
                        </div>

                        <div className="flex gap-4 mt-2">
                            <button
                                type="button"
                                className="px-3 py-1 bg-green-600 text-white rounded"
                                onClick={() => {
                                    setValue("title", corrections.title);
                                    setValue("content", corrections.content);
                                    setValue("tags", corrections.tags);
                                    setShowFixOption(false);
                                }}
                            >
                                ✅ Use this version
                            </button>

                            <button
                                type="button"
                                className="px-3 py-1 bg-gray-400 text-white rounded"
                                onClick={() => setShowFixOption(false)}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* submiting the question */}
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Posting...' : 'Ask Question'}
                </button>

                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>


        </main>
    )
}

export default askQuestions
