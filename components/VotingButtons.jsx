import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { submitVote, getVoteCount, getUserVote } from '@/redux/slices/voteSlice';
import ErrorBoundary from './ErrorBoundary';

const VotingButtons = ({ 
  questionId = null, 
  answerId = null, 
  initialVoteCount = 0,
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  const dispatch = useAppDispatch();
  const { loading, votes = {}, userVotes = {}, error } = useAppSelector((state) => state.vote || {});
  const { user } = useAppSelector((state) => state.auth || {});
  
  const key = questionId ? `question_${questionId}` : `answer_${answerId}`;
  const voteData = votes[key] || { 
    upvotes: 0, 
    downvotes: 0, 
    total: Number(initialVoteCount) || 0,
    score: Number(initialVoteCount) || 0
  };
  const userVote = userVotes[key] || null;

  // Validate and ensure numeric values
  const safeVoteData = {
    upvotes: Number(voteData.upvotes) || 0,
    downvotes: Number(voteData.downvotes) || 0,
    score: Number(voteData.score) || 0,
    total: Number(voteData.total) || 0
  };

  // Size configurations
  const sizeConfig = {
    small: { icon: 20, padding: 'p-1', text: 'text-xs' },
    normal: { icon: 28, padding: 'p-2', text: 'text-sm' },
    large: { icon: 32, padding: 'p-3', text: 'text-base' }
  };
  
  const config = sizeConfig[size] || sizeConfig.normal;

  useEffect(() => {
    // Fetch vote count when component mounts
    if (questionId || answerId) {
      dispatch(getVoteCount({ questionId, answerId }));
      
      // Also fetch user's vote if logged in
      if (user?.id) {
        dispatch(getUserVote({ 
          userId: user.id, 
          questionId, 
          answerId 
        }));
      }
    }
  }, [dispatch, questionId, answerId, user?.id]);

  const handleVote = async (voteType) => {
    if (!user) {
      const userConfirmed = confirm(
        'You need to login to vote. Would you like to go to the login page?'
      );
      if (userConfirmed) {
        window.location.href = '/auth/login';
      }
      return;
    }

    try {
      await dispatch(submitVote({ 
        voteType, 
        questionId, 
        answerId 
      })).unwrap();
      
      // Refresh vote count after voting
      await dispatch(getVoteCount({ questionId, answerId }));
      
      // Re-fetch user's vote to update button states
      if (user?.id) {
        dispatch(getUserVote({ 
          userId: user.id, 
          questionId, 
          answerId 
        }));
      }
    } catch (error) {
      console.error('Voting error:', error);
      alert(error || 'Failed to submit vote');
    }
  };

  const isUpvoted = userVote?.type === 'UP';
  const isDownvoted = userVote?.type === 'DOWN';

  return (
    <ErrorBoundary fallback={<div className="p-2 text-red-500 text-xs">Vote error</div>}>
      <div className={`flex flex-col items-center gap-2 border rounded-lg h-fit ${config.padding}`}>
        {/* Upvote Button */}
        <button 
          onClick={() => handleVote('UP')}
          disabled={loading}
          className={`hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isUpvoted ? 'text-green-600' : 'text-blue-500 hover:text-green-600'
          }`}
          title="Upvote"
        >
          <ThumbsUp 
            size={config.icon} 
            fill={isUpvoted ? 'currentColor' : 'none'}
          />
        </button>

        {/* Vote Count - Show net score (upvotes - downvotes) */}
        <div className={`font-semibold ${config.text} ${
          safeVoteData.score > 0 ? 'text-green-600' : 
          safeVoteData.score < 0 ? 'text-red-500' : 'text-gray-600'
        }`}>
          {safeVoteData.score !== 0 ? safeVoteData.score : (safeVoteData.upvotes - safeVoteData.downvotes) || 0}
        </div>

        {/* Downvote Button */}
        <button 
          onClick={() => handleVote('DOWN')}
          disabled={loading}
          className={`hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rotate-180 ${
            isDownvoted ? 'text-red-600' : 'text-blue-500 hover:text-red-600'
          }`}
          title="Downvote"
        >
          <ThumbsUp 
            size={config.icon} 
            fill={isDownvoted ? 'currentColor' : 'none'}
          />
        </button>

        {/* Loading indicator */}
        {loading && (
          <div className={`${config.text} text-gray-500 animate-pulse`}>
            ...
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className={`${config.text} text-red-500 text-center max-w-20`}>
            Error
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default VotingButtons;
