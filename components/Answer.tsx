import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateAnswer, deleteAnswer, clearUpdateSuccess, clearDeleteSuccess } from '@/redux/slices/answerSlice';
import { Edit, Trash2, Save, X } from 'lucide-react';
import VotingButtons from './VotingButtons';
import TiptapEditor from './TiptapEditor';
import { sanitizeRichText, escapeHtml } from '@/utils/sanitize';

const Answer = ({ answer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { updateLoading, deleteLoading, updateSuccess, deleteSuccess, updateError, deleteError } = useAppSelector((state) => state.answer);

  if (!answer) return null;

  const {
    id,
    content,
    author,
    createdAt,
    _count = {},
  } = answer;

  const voteCount = _count.vote || 0;
  const isOwner = user && user.id === author?.id;

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

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      alert('Answer content cannot be empty');
      return;
    }

    try {
      await dispatch(updateAnswer({
        answerId: id,
        newContent: editContent
      })).unwrap();
    } catch (error) {
      console.error('Update answer error:', error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this answer? This action cannot be undone.'
    );

    if (confirmDelete) {
      try {
        await dispatch(deleteAnswer(id)).unwrap();
      } catch (error) {
        console.error('Delete answer error:', error);
        alert(error || 'Failed to delete answer');
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Voting Section */}
        <VotingButtons 
          answerId={id} 
          initialVoteCount={voteCount}
          size="small"
        />

        {/* Answer Content */}
        <div className="flex-1">
          {/* Error Messages */}
          {updateError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {updateError}
            </div>
          )}
          {deleteError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {deleteError}
            </div>
          )}

          {/* Content */}
          {isEditing ? (
            <div className="mb-4">
              <TiptapEditor 
                value={editContent} 
                onChange={setEditContent}
                placeholder="Edit your answer..."
              />
              {/* Save/Cancel Buttons in Edit Mode */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateLoading}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="prose prose-sm max-w-none text-gray-800 mb-4"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
            />
          )}

          {/* Author Info and Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {/* Author and Date */}
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span className="text-blue-600 font-medium">
                {escapeHtml(author?.name || "Anonymous")}
              </span>
              <span>•</span>
              <span>{new Date(createdAt).toLocaleDateString()}</span>
              <span>{new Date(createdAt).toLocaleTimeString()}</span>
            </div>

            {/* Edit/Delete Buttons (only for answer owner) */}
            {isOwner && !isEditing && (
              <div className="flex space-x-2">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Answer;
