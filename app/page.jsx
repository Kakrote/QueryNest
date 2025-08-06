"use client";
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { fetchUserQuestions, fetchUserAnswers } from '@/redux/slices/userContentSlice';
import QuestionCard from '@/components/QestionCard';
import AnswerCard from '@/components/AnswerCard';
import { escapeHtml } from '@/utils/sanitize';

export default function Home() {
  const [activeTab, setActiveTab] = useState('questions');
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { user } = useAppSelector((state) => state.auth);
  const { userQuestions, userAnswers, loading, error } = useAppSelector((state) => state.userContent);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    // Fetch user data based on active tab
    if (activeTab === 'questions') {
      dispatch(fetchUserQuestions(user.id));
    } else if (activeTab === 'answers') {
      dispatch(fetchUserAnswers(user.id));
    }
  }, [user, activeTab, dispatch, router]);

  const handleQuestionClick = (id, slug) => {
    router.push(`/questions/${id}/${slug}`);
  };

  const handleAskQuestion = () => {
    router.push('/questions/askQuestion');
  };

  const refreshUserAnswers = () => {
    if (user?.id) {
      dispatch(fetchUserAnswers(user.id));
    }
  };

  const refreshUserQuestions = () => {
    if (user?.id) {
      dispatch(fetchUserQuestions(user.id));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Please login to view your content</h2>
          <button 
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 bg-[#4255FF] text-white rounded hover:bg-[#3a4ce3] transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="mt-16 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {escapeHtml(user.name)}!</h1>
        <button
          onClick={handleAskQuestion}
          className="px-4 py-2 bg-[#4255FF] text-white text-sm rounded hover:bg-[#3a4ce3] active:scale-95 transition"
        >
          Ask Question
        </button>
      </div>

      {/* Horizontal Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'questions'
                ? 'border-[#4255FF] text-[#4255FF]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Questions
            {userQuestions.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {userQuestions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'answers'
                ? 'border-[#4255FF] text-[#4255FF]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Answers
            {userAnswers.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {userAnswers.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-[80px] w-full rounded" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => activeTab === 'questions' ? dispatch(fetchUserQuestions(user.id)) : dispatch(fetchUserAnswers(user.id))}
              className="px-4 py-2 bg-[#4255FF] text-white rounded hover:bg-[#3a4ce3] transition"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Questions Tab Content */}
            {activeTab === 'questions' && (
              <div>
                {userQuestions.length > 0 ? (
                  <div className="space-y-0">
                    {userQuestions.map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        onClick={() => handleQuestionClick(question.id, question.slug)}
                        showDelete={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                    <p className="text-gray-500 mb-6">Start by asking your first question!</p>
                    <button
                      onClick={handleAskQuestion}
                      className="px-6 py-3 bg-[#4255FF] text-white rounded-lg hover:bg-[#3a4ce3] active:scale-95 transition"
                    >
                      Ask Your First Question
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Answers Tab Content */}
            {activeTab === 'answers' && (
              <div>
                {userAnswers.length > 0 ? (
                  <div className="space-y-0">
                    {userAnswers.map((answer) => (
                      <AnswerCard
                        key={answer.id}
                        answer={answer}
                        onRefresh={refreshUserAnswers}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No answers yet</h3>
                    <p className="text-gray-500 mb-6">Start answering questions to help the community!</p>
                    <button
                      onClick={() => router.push('/questions')}
                      className="px-6 py-3 bg-[#4255FF] text-white rounded-lg hover:bg-[#3a4ce3] active:scale-95 transition"
                    >
                      Browse Questions
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
