import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateAnswer, deleteAnswer, clearUpdateSuccess, clearDeleteSuccess } from '@/redux/slices/answerSlice';
import { updateUserAnswer, removeUserAnswer } from '@/redux/slices/userContentSlice';
import { Edit, Trash2, Save, X } from 'lucide-react';
import VotingButtons from './VotingButtons';
import TiptapEditor from './TiptapEditor';

const AnswerCard = ({ answer, onClick, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { user } = useAppSelector((state) => state.auth);
  const { updateLoading, deleteLoading, updateSuccess, deleteSuccess, updateError, deleteError } = useAppSelector((state) => state.answer);

  if (!answer) return null;

  const {
    id,
    content,
    question,
    createdAt,
    votes = [],
    _count = {},
  } = answer;

  const voteCount = _count.vote || votes.length;

  useEffect(() => {
    if (updateSuccess) {
      setIsEditing(false);
      dispatch(clearUpdateSuccess());
    }
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    if (deleteSuccess) {
      dispatch(clearDeleteSuccess());
    }
  }, [deleteSuccess, dispatch]);

  const handleClick = () => {
    if (question?.id && question?.slug && !isEditing) {
      router.push(`/questions/${question.id}/${question.slug}`);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setEditContent(content);
    setIsEditing(true);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditContent('');
  };

  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    if (!editContent.trim()) {
      alert('Answer content cannot be empty');
      return;
    }

    try {
      // Optimistic update
      dispatch(updateUserAnswer({ answerId: id, newContent: editContent }));
      
      await dispatch(updateAnswer({
        answerId: id,
        newContent: editContent
      })).unwrap();
    } catch (error) {
      console.error('Update answer error:', error);
      // Revert optimistic update on error by refreshing
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmDelete = confirm(
      'Are you sure you want to delete this answer? This action cannot be undone.'
    );

    if (confirmDelete) {
      try {
        // Optimistic update - remove immediately
        dispatch(removeUserAnswer(id));
        
        await dispatch(deleteAnswer(id)).unwrap();
      } catch (error) {
        console.error('Delete answer error:', error);
        alert(error || 'Failed to delete answer');
        // Revert optimistic update on error by refreshing
        if (onRefresh) {
          onRefresh();
        }
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Error Messages */}
      {updateError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {updateError}
        </div>
      )}
      {deleteError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {deleteError}
        </div>
      )}

      <div className="flex gap-4">
        {/* Voting Section */}
        <VotingButtons 
          answerId={id} 
          initialVoteCount={voteCount}
          size="small"
        />

        {/* Answer Content */}
        <div className="flex-1">
          {/* Question Title */}
          <div 
            className={`${!isEditing ? 'cursor-pointer hover:bg-gray-50' : ''} p-2 rounded`}
            onClick={handleClick}
          >
            <h3 className='text-[#0C2AF2] text-lg font-medium'>{question?.title || "Unknown Question"}</h3>
            
            {/* Answer Content */}
            {isEditing ? (
              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                <TiptapEditor 
                  value={editContent} 
                  onChange={setEditContent}
                  placeholder="Edit your answer..."
                />
              </div>
            ) : (
              <div className='mt-2'>
                <p className='text-[12px] line-clamp-3 text-[#343D4E]'>
                  Your answer: {content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
              </div>
            )}

            {/* Tags */}
            {question?.tags && !isEditing && (
              <div className='mt-3 space-x-2'>
                {question.tags.map((tag, index) => (
                  <span
                    key={tag.id || tag.name || index}
                    className='text-sm bg-[#E4E6FA] text-[#0f0f0f] px-2 py-0.5 rounded'>
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Edit/Delete Buttons */}
          <div className='flex justify-between items-center pt-3 mt-3 border-t border-gray-100'>
            {/* Author and Date Info */}
            <div className='flex items-center space-x-3 text-sm text-gray-500'>
              <span className='text-[#0C2AF2] font-medium'>Answered by you</span>
              <span>•</span>
              <span>{new Date(createdAt).toLocaleDateString()}</span>
              <span>{new Date(createdAt).toLocaleTimeString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateLoading}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={14} />
                    {updateLoading ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Edit answer"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete answer"
                  >
                    <Trash2 size={14} />
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;
