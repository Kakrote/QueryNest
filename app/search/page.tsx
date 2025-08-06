'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchQuestions, clearSearchResults } from '@/redux/slices/questionSlice';
import { Search, Filter, SortAsc, SortDesc, Calendar, ThumbsUp, MessageSquare } from 'lucide-react';
import QuestionCard from '@/components/QestionCard';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  const { searchResults, searchLoading, searchError } = useAppSelector((s) => s.question);

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      dispatch(searchQuestions(urlQuery));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      dispatch(searchQuestions(query.trim()));
    }
  };

  const handleQuestionClick = (id, slug) => {
    router.push(`/questions/${id}/${slug}`);
  };

  const sortedResults = React.useMemo(() => {
    if (!searchResults) return [];
    
    const results = [...searchResults];
    
    switch (sortBy) {
      case 'newest':
        return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'votes':
        return results.sort((a, b) => (b.vote?.length || 0) - (a.vote?.length || 0));
      case 'answers':
        return results.sort((a, b) => (b.answers?.length || 0) - (a.answers?.length || 0));
      default:
        return results;
    }
  }, [searchResults, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Search className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Search QueryNest</h1>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions, topics, or keywords..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {query && (
          <>
            {/* Search Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {searchLoading ? 'Searching...' : 
                   searchResults.length === 0 ? 'No results found' :
                   `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`
                  }
                  {query && !searchLoading && (
                    <span className="text-gray-600 font-normal"> for "{query}"</span>
                  )}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <label className="text-sm text-gray-600 mr-2">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="votes">Most Voted</option>
                    <option value="answers">Most Answered</option>
                  </select>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters (if shown) */}
            {showFilters && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option value="">Any time</option>
                      <option value="today">Today</option>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                      <option value="year">This year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      placeholder="e.g., javascript, react"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Answer Status</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option value="">All questions</option>
                      <option value="answered">Has answers</option>
                      <option value="unanswered">No answers</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="space-y-0">
              {searchLoading && (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white rounded-lg p-6 border border-gray-200">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              )}

              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-800 font-medium">Search Error</p>
                  <p className="text-red-600 mt-1">{searchError}</p>
                </div>
              )}

              {!searchLoading && !searchError && sortedResults.length === 0 && query && (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any questions matching "{query}"
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Try different keywords or phrases</p>
                    <p>• Check your spelling</p>
                    <p>• Use more general terms</p>
                  </div>
                </div>
              )}

              {!searchLoading && sortedResults.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {sortedResults.map((question, index) => (
                    <div key={question.id} className={index !== sortedResults.length - 1 ? 'border-b border-gray-200' : ''}>
                      <QuestionCard
                        question={question}
                        onClick={() => handleQuestionClick(question.id, question.slug)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!query && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Search QueryNest</h3>
            <p className="text-gray-600 mb-6">
              Find answers to your questions by searching through thousands of posts
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Search className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Keywords</p>
                  <p className="text-sm text-gray-600">Search by topic or problem</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Popular Questions</p>
                  <p className="text-sm text-gray-600">Highly voted content</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Recent Activity</p>
                  <p className="text-sm text-gray-600">Latest discussions</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
