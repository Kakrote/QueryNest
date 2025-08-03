import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { submitVote, getVoteCount, getUserVote } from '@/redux/slices/voteSlice';

const VotingButtons = ({ 
  questionId = null, 
  answerId = null, 
  initialVoteCount = 0,
  size = 'normal' // 'small', 'normal', 'large'
}) => {
  const dispatch = useAppDispatch();
  const { loading, votes, userVotes, error } = useAppSelector((state) => state.vote);
  const { user } = useAppSelector((state) => state.auth);
  
  const key = questionId ? `question_${questionId}` : `answer_${answerId}`;
  const voteData = votes[key] || { upvotes: 0, downvotes: 0, total: initialVoteCount };
  const userVote = userVotes[key];

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
      alert('Please login to vote');
      return;
    }

    try {
      await dispatch(submitVote({ 
        voteType, 
        questionId, 
        answerId 
      })).unwrap();
      
      // Refresh vote count after voting
      dispatch(getVoteCount({ questionId, answerId }));
    } catch (error) {
      console.error('Voting error:', error);
      alert(error || 'Failed to submit vote');
    }
  };

  const isUpvoted = userVote?.type === 'UP';
  const isDownvoted = userVote?.type === 'DOWN';

  return (
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

      {/* Vote Count */}
      <div className={`font-semibold ${config.text} ${
        voteData.total > 0 ? 'text-green-600' : 
        voteData.total < 0 ? 'text-red-500' : 'text-gray-600'
      }`}>
        {voteData.total}
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
  );
};

export default VotingButtons;
