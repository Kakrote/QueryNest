"use client"
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchQuestions } from '@/redux/slices/questionSlice'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import QuestionCard from './QestionCard'

const pageSize = 10;

const QuestionsList = () => {
    const dispatch = useAppDispatch();
    const [filter, setFilter] = useState("latest");
    const [localPage, setLocalPage] = useState(1); // controlled local page state
    const [quickSearch, setQuickSearch] = useState('');
    const { questions = [], loading, error, totalPages } = useAppSelector((s) => s.question);
    const { votes } = useAppSelector((s) => s.vote); // Listen to vote changes
    const user = useAppSelector((s) => s.auth.user);
    const router = useRouter()

    useEffect(() => {
        dispatch(fetchQuestions({ filter, page: localPage, limit: pageSize }))
    }, [filter, localPage]);

    // Refresh questions when votes change
    useEffect(() => {
        if (Object.keys(votes).length > 0) {
            // Small delay to ensure backend is updated
            const timeoutId = setTimeout(() => {
                dispatch(fetchQuestions({ filter, page: localPage, limit: pageSize }))
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [votes, filter, localPage, dispatch]);

    useEffect(() => {
        setLocalPage(1); // Reset to page 1 if filter changes
    }, [filter]);

    const handleQuestionClick = (id,slug) => {
        // if (!user) router.push("/auth/login");
        router.push(`/questions/${id}/${slug}`); // Navigate to question details page
    };

    const handleAskQuestion = () => {
        if (!user) router.push('/auth/login');
        else router.push('/questions/askQuestion');
    };

    const handleQuickSearch = (e) => {
        e.preventDefault();
        if (quickSearch.trim()) {
            router.push(`/search?q=${encodeURIComponent(quickSearch.trim())}`);
        }
    };

    // Filter questions based on quick search
    const filteredQuestions = (questions || []).filter(question => 
        quickSearch === '' || 
        question.title.toLowerCase().includes(quickSearch.toLowerCase()) ||
        question.content.toLowerCase().includes(quickSearch.toLowerCase()) ||
        (question.tags && question.tags.some(tag => tag.name.toLowerCase().includes(quickSearch.toLowerCase())))
    );

    return (
        <div className="relative top-14">
            <div className='h-[200px] border-b w-full relative space-y-6 p-3 '>
                <div className='flex justify-between'>
                    <h1 className="text-2xl font-bold mb-4">Top Questions</h1>
                    <button
                        onClick={handleAskQuestion}
                        className='p-2 bg-[#4255FF] text-white text-[13px] rounded mt-5'
                    >
                        Ask Question?
                    </button>
                </div>

                {/* Quick Search */}
                <form onSubmit={handleQuickSearch} className="flex gap-2 max-w-md">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={quickSearch}
                            onChange={(e) => setQuickSearch(e.target.value)}
                            placeholder="Quick search questions..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {quickSearch && (
                        <button
                            type="submit"
                            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                        >
                            Search All
                        </button>
                    )}
                </form>

                <div className="flex p-0.5 border rounded border-[#CCC5C5] justify-center w-[275px] gap-4 mb-6">
                    {["latest", "liked", "frequent"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-md text-[11px] p-2 tracking-tight ${
                                filter === f ? "bg-[#4255FF] text-white" : ""
                            }`}
                        >
                            {f === "latest" ? "Latest" : f === "liked" ? "Most Liked" : "Frequently Asked"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questions List */}
            {loading && (
                <div className="space-y-4 mt-4">
                    {[...Array(pageSize)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-100 h-[80px] w-full rounded" />
                    ))}
                </div>
            )}
            {error && <p className='text-red-700'>{error}</p>}

            {!loading && questions && questions.length > 0 ? (
                <>
                    {filteredQuestions.map((q) => (
                        <QuestionCard
                            key={q.id || q.title}
                            question={q}
                            onClick={() => handleQuestionClick(q.id,q.slug)}
                        />
                    ))}
                    
                    {filteredQuestions.length === 0 && quickSearch && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">No questions match "{quickSearch}"</p>
                            <button
                                onClick={() => router.push(`/search?q=${encodeURIComponent(quickSearch)}`)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                                Search all questions →
                            </button>
                        </div>
                    )}

                    {/* Pagination - Page Numbers */}
                    {totalPages > 1 && (
                        <div className="flex p-2 justify-center gap-2 mt-6">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setLocalPage(i + 1)}
                                    className={`px-3 py-1 border rounded ${
                                        localPage === i + 1
                                            ? "bg-[#4255FF] text-white"
                                            : "bg-white text-black border-gray-300"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                !loading && <p className="text-center text-gray-500 mt-4">No Questions Found</p>
            )}
        </div>
    )
}

export default QuestionsList
