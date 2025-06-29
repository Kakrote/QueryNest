import React from 'react';

const QuestionCard = ({ question, onClick }) => {
  if (!question) return null;

  const {
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
      className="border-b p-2 relative cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      {/* Voting + Answer count */}
      <div className='space-x-5 text-[10px] p-2'>
        <span>{vote} Votes</span>
        <span>{answers} Answers</span>
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
