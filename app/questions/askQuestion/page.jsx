"use client"
import React from 'react'
import { useState } from 'react';
import { correctText } from '@/utils/correctText';
import { set, useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { askQuestion } from '@/redux/slices/questionSlice';
import { useRouter } from 'next/navigation';
import TiptapEditor from '@/components/TiptapEditor';
import axios from 'axios';



const qoute = ["It is not the answer that enlightens, but the question."];

const askQuestions = () => {
    const [showFixOption, setShowFixOption] = useState(false);
    const [corrections, setCorrections] = useState({});
    const [fixing, setFixing] = useState(false);

    const { loading, success, error } = useAppSelector((s) => s.question);
    const { token } = useAppSelector((s) => s.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { register, handleSubmit, reset, formState: { errors }, getValues, setValue, control } = useForm();


    const handleFixGrammar = async () => {
        setFixing(true);
        try {
            const values = getValues();
            console.log("Form values:", values);
            
            // Check if user is authenticated
            if (!token) {
                alert("Please login to use grammar correction feature.");
                setFixing(false);
                return;
            }
            
            // Extract plain text from rich text content for grammar checking
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = values.content || '';
            const plainTextContent = tempDiv.textContent || tempDiv.innerText || '';
            
            console.log("Plain text content:", plainTextContent);
            
            // Check if we have text to correct
            if (!values.title && !plainTextContent && !values.tags) {
                alert("Please fill in some content before using grammar correction.");
                setFixing(false);
                return;
            }
            
            // Create correction functions that use the token from Redux
            const correctTextWithToken = async (text, type = 'text') => {
                if (!text || text.trim().length < 3) return text;
                
                try {
                    const res = await axios.post("/api/spellCheck", { text, type }, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    return res.data.corrected || text;
                } catch (error) {
                    console.error("Correction API failed:", error);
                    return text;
                }
            };
            
            const [fixedTitle, fixedContent, fixedTags] = await Promise.all([
                correctTextWithToken(values.title || '', 'text'),
                correctTextWithToken(plainTextContent, 'text'),
                correctTextWithToken(values.tags || '', 'tags')
            ]);
            
            console.log("Corrections received:", { fixedTitle, fixedContent, fixedTags });
            
            setCorrections({
                title: fixedTitle,
                content: fixedContent,
                tags: fixedTags
            });
            setShowFixOption(true);
        } catch (error) {
            console.error("Grammar fix error:", error);
            alert("Failed to fix grammar. Please try again.");
        } finally {
            setFixing(false);
        }
    }

    const onSubmit = async (data) => {
        console.log("Ask Question button hit")
        
        // Clean and validate tags
        const tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        
        const payload = {
            ...data,
            tags: tags
        };
        
        console.log("verifying payload: ", payload)
        
        try {
            await dispatch(askQuestion(payload)).unwrap();
            console.log("Question posted successfully")
            reset();
            router.push('/questions'); // Navigate to questions list instead of home
        } catch (error) {
            console.error("Error posting question:", error);
            // Error is already handled by Redux state, so user will see it in the UI
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 max-w-4xl mx-auto">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        <p className="font-medium">Error posting question:</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {/* Success Display */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                        <p>Question posted successfully!</p>
                    </div>
                )}
                
                {/* Title */}
                <div>
                    <label className="block font-medium mb-2 text-gray-700">Question Title</label>
                    <input
                        type="text"
                        {...register('title', { 
                            required: "Title is required",
                            minLength: {
                                value: 5,
                                message: "Title must be at least 5 characters long"
                            },
                            maxLength: {
                                value: 200,
                                message: "Title must be no more than 200 characters"
                            }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter a clear, concise question title"
                    />
                    {errors.title && <span className="text-red-500 text-sm mt-1 block">{errors.title.message}</span>}
                </div>

                {/* Content */}
                <div>
                    <label className="block font-medium mb-2 text-gray-700">Question Details</label>
                    <Controller
                        name="content"
                        control={control}
                        defaultValue=""
                        rules={{ 
                            required: "Content is required",
                            validate: (value) => {
                                // Extract text content for validation
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = value || '';
                                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                                
                                if (textContent.trim().length < 10) {
                                    return "Question content must be at least 10 characters long";
                                }
                                if (textContent.length > 5000) {
                                    return "Question content must be no more than 5,000 characters";
                                }
                                return true;
                            }
                        }}
                        render={({ field }) => (
                            <TiptapEditor 
                                value={field.value} 
                                onChange={field.onChange}
                                placeholder="Describe your problem in detail. You can use formatting, code blocks, lists, and more..."
                            />
                        )}
                    />
                    {errors.content && <span className="text-red-500 text-sm mt-1 block">{errors.content.message}</span>}
                </div>

                {/* Tags */}
                <div>
                    <label className="block font-medium mb-2 text-gray-700">Tags</label>
                    <input
                        type="text"
                        {...register('tags', { 
                            required: "At least one tag is required",
                            validate: (value) => {
                                const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                                
                                if (tags.length === 0) {
                                    return "At least one tag is required";
                                }
                                if (tags.length > 10) {
                                    return "Maximum 10 tags allowed";
                                }
                                
                                for (const tag of tags) {
                                    if (tag.length < 2) {
                                        return "Each tag must be at least 2 characters long";
                                    }
                                    if (tag.length > 30) {
                                        return "Each tag must be no more than 30 characters";
                                    }
                                }
                                
                                return true;
                            }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., javascript, nextjs, api, react (comma separated)"
                    />
                    <p className="text-sm text-gray-500 mt-1">Add relevant tags to help others find your question</p>
                    {errors.tags && <span className="text-red-500 text-sm mt-1 block">{errors.tags.message}</span>}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4 border-t">
                    {/* Fix Grammar Button */}
                    <button
                        type="button"
                        onClick={handleFixGrammar}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={fixing}
                    >
                        {fixing ? "Fixing..." : "✨ Fix Grammar & Spelling"}
                    </button>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                        disabled={loading}
                    >
                        {loading ? 'Posting...' : 'Ask Question'}
                    </button>
                </div>

                {/* AI Correction Preview */}
                {showFixOption && (
                    <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50">
                        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            ✨ AI-Suggested Corrections
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="font-medium text-gray-700">Title:</label>
                                <p className="italic text-blue-800 bg-white p-2 rounded border mt-1">{corrections.title}</p>
                            </div>

                            <div>
                                <label className="font-medium text-gray-700">Content:</label>
                                <p className="italic text-blue-800 bg-white p-3 rounded border mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">{corrections.content}</p>
                            </div>

                            <div>
                                <label className="font-medium text-gray-700">Tags:</label>
                                <p className="italic text-blue-800 bg-white p-2 rounded border mt-1">{corrections.tags}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                type="button"
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                                onClick={() => {
                                    setValue("title", corrections.title);
                                    setValue("content", `<p>${corrections.content}</p>`); // Wrap in HTML for Tiptap
                                    setValue("tags", corrections.tags);
                                    setShowFixOption(false);
                                }}
                            >
                                ✅ Use this version
                            </button>

                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
                                onClick={() => setShowFixOption(false)}
                            >
                                ❌ Keep original
                            </button>
                        </div>
                    </div>
                )}

                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}
            </form>


        </main>
    )
}

export default askQuestions
