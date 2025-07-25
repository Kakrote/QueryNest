import React from 'react';
import { useRouter } from 'next/navigation';

const AnswerCard = ({ answer, onClick }) => {
  if (!answer) return null;

  const {
    content,
    question,
    createdAt,
    votes = [],
  } = answer;

  const router = useRouter();

  const handleClick = () => {
    if (question?.id && question?.slug) {
      router.push(`/questions/${question.id}/${question.slug}`);
    }
  };

  return (
    <div
      className="border-b p-2 relative cursor-pointer hover:bg-gray-50"
      onClick={handleClick}
    >
      {/* Answer Stats */}
      <div className='space-x-5 text-[10px] p-2'>
        <span>{votes.length} Votes</span>
        <span className='text-green-600'>✓ Answered</span>
      </div>

      {/* Question Title */}
      <div>
        <h3 className='text-[#0C2AF2] px-2 text-lg'>{question?.title || "Unknown Question"}</h3>
        <div className='px-2'>
          <p className='text-[12px] line-clamp-2 text-[#343D4E]'>
            Your answer: {content.substring(0, 100)}...
          </p>
        </div>
      </div>

      {/* Tags */}
      {question?.tags && (
        <div className='p-2 mt-1 space-x-2'>
          {question.tags.map((tag, index) => (
            <span
              key={tag.id || tag.name || index}
              className='text-sm bg-[#E4E6FA] text-[#0f0f0f] px-2 py-0.5 rounded'>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className='flex justify-end px-3 space-x-3 text-sm'>
        <span className='text-[#0C2AF2]'>Answered by you</span>
        <span className='text-[#343D4ED6]/60'>{new Date(createdAt).toLocaleTimeString()}</span>
        <span className='text-[#343D4ED6]/60'>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default AnswerCard;
