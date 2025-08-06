'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchQuestions, clearSearchResults } from '@/redux/slices/questionSlice';
import { useRouter } from 'next/navigation';
import { Search, X, Loader } from 'lucide-react';
import QuestionCard from './QestionCard';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const inputRef = useRef(null);
  
  const { searchResults, searchLoading, searchError } = useAppSelector((s) => s.question);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      dispatch(searchQuestions(debouncedQuery));
    } else if (debouncedQuery.length === 0) {
      dispatch(clearSearchResults());
    }
  }, [debouncedQuery, dispatch]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setDebouncedQuery('');
      dispatch(clearSearchResults());
    }
  }, [isOpen, dispatch]);

  const handleQuestionClick = (id, slug) => {
    router.push(`/questions/${id}/${slug}`);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-x-4 top-16 mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Search Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search questions, topics, or keywords..."
              className="flex-1 text-lg border-none outline-none placeholder-gray-400"
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-1">Search QueryNest</p>
                <p className="text-sm">Find questions, answers, and topics</p>
              </div>
            )}

            {query.length > 0 && query.length < 2 && (
              <div className="p-6 text-center text-gray-500">
                <p>Type at least 2 characters to search</p>
              </div>
            )}

            {searchLoading && (
              <div className="p-6 text-center">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-500">Searching...</p>
              </div>
            )}

            {searchError && (
              <div className="p-6 text-center text-red-600">
                <p>Error: {searchError}</p>
              </div>
            )}

            {!searchLoading && debouncedQuery.length >= 2 && searchResults.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <p>No results found for "{debouncedQuery}"</p>
                <p className="text-sm mt-1">Try different keywords or check your spelling</p>
              </div>
            )}

            {!searchLoading && searchResults.length > 0 && (
              <div className="divide-y divide-gray-200">
                {searchResults.map((question) => (
                  <div key={question.id} className="hover:bg-gray-50 transition-colors">
                    <QuestionCard
                      question={question}
                      onClick={() => handleQuestionClick(question.id, question.slug)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {searchResults.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{debouncedQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
