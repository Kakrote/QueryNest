import React from 'react';
import { ThumbsUp, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { deleteQuestion } from '@/redux/slices/questionSlice';
import { sanitizeUserInput } from '@/utils/sanitize';

const QuestionCard = ({ question, onClick, showDelete = false }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
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

  const handleDeleteQuestion = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    const confirmDelete = confirm(
      `Are you sure you want to delete "${sanitizeUserInput(title)}"? This action cannot be undone.`
    );

    if (confirmDelete) {
      try {
        await dispatch(deleteQuestion(id)).unwrap();
        alert('Question deleted successfully');
      } catch (error) {
        alert(error || 'Failed to delete question');
      }
    }
  };

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
        <h3 className='text-[#0C2AF2] px-2 text-lg'>{sanitizeUserInput(title)}</h3>
        <div className='px-2'>
          <p className='text-[12px] line-clamp-2   text-[#343D4E]'>{sanitizeUserInput(content)}</p>
        </div>
      </div>

      {/* Tags */}
      <div className='p-2 mt-1 space-x-2'>
        {tags.map((tag, index) => (
          <span
            key={tag.id || tag.name}
            className='text-sm bg-[#E4E6FA] text-[#0f0f0f] px-2 py-0.5 rounded'>
            {sanitizeUserInput(tag.name)}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className='flex justify-between items-center px-3 space-x-3 text-sm'>
        <div className='flex space-x-3'>
          <span className='text-[#0C2AF2]'>{sanitizeUserInput(author?.name || "Anonymous")}</span>
          <span className='text-[#343D4ED6]/60'>{new Date(createdAt).toLocaleTimeString()}</span>
          <span className='text-[#343D4ED6]/60'>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
        
        {/* Delete button for author's own questions */}
        {showDelete && user && user.id === author?.id && (
          <button
            onClick={handleDeleteQuestion}
            className='flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors text-xs'
            title="Delete question"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
