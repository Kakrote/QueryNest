import React from 'react';
import VotingButtons from './VotingButtons';

const Answer = ({ answer }) => {
  if (!answer) return null;

  const {
    id,
    content,
    author,
    createdAt,
    _count = {},
  } = answer;

  const voteCount = _count.vote || 0;

  return (
    <div className="border-b py-6 border-gray-200">
      <div className="flex gap-4">
        {/* Voting Section */}
        <VotingButtons 
          answerId={id} 
          initialVoteCount={voteCount}
          size="small"
        />

        {/* Answer Content */}
        <div className="flex-1">
          {/* Content */}
          <div 
            className="prose prose-sm max-w-none text-gray-800 mb-4"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Author and Date */}
          <div className="flex justify-end items-center space-x-3 text-sm text-gray-500">
            <span className="text-blue-600 font-medium">
              {author?.name || "Anonymous"}
            </span>
            <span>{new Date(createdAt).toLocaleTimeString()}</span>
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Answer;
