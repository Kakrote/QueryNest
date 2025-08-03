import React from 'react';
import { ThumbsUp } from 'lucide-react';

const QuestionCard = ({ question, onClick }) => {
  if (!question) return null;

  const {
    id,
    title,
    content,
    tags = [],
    author,
    createdAt,
    _count = {}, // fallback
  } = question;

  const {
    vote = 0,
    answers = 0,
  } = _count;

  return (
    <div
      className="border-b p-2 relative cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      {/* Voting + Answer count */}
      <div className='flex items-center justify-between p-2'>
        <div className='flex space-x-5 text-[10px] items-center'>
          <div className={`flex items-center gap-1 ${vote > 0 ? 'text-green-600' : vote < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            <ThumbsUp size={12} />
            <span>{vote} Vote{vote !== 1 ? 's' : ''}</span>
          </div>
          <span className='text-blue-600'>{answers} Answer{answers !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="text-xs text-gray-500">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Title + Description */}
      <div>
        <h3 className='text-[#0C2AF2] px-2 text-lg'>{title}</h3>
        <div className='px-2'>
          <p className='text-[12px] line-clamp-2   text-[#343D4E]'>{content}</p>
        </div>
      </div>

      {/* Tags */}
      <div className='p-2 mt-1 space-x-2'>
        {tags.map((tag, index) => (
          <span
            key={tag.id || tag.name}
            className='text-sm bg-[#E4E6FA] text-[#0f0f0f] px-2 py-0.5 rounded'>
            {tag.name}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className='flex justify-end px-3 space-x-3 text-sm'>
        <span className='text-[#0C2AF2]'>{author?.name || "Anonymous"}</span>
        <span className='text-[#343D4ED6]/60'>{new Date(createdAt).toLocaleTimeString()}</span>
        <span className='text-[#343D4ED6]/60'>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default QuestionCard;
