"use client";
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Share2Icon } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Controller, useForm, reset } from 'react-hook-form';
import TiptapEditor from '@/components/TiptapEditor';
import VotingButtons from '@/components/VotingButtons';
import Answer from '@/components/Answer';
import { fetchAnswersByQuestionId, submitAnswer, clearSubmitSuccess } from '@/redux/slices/answerSlice';
import { deleteQuestion } from '@/redux/slices/questionSlice';
import axios from 'axios';
import { sanitizeHtml, stripHtml, escapeHtml, sanitizeUserInput } from '@/utils/sanitize';
// import { headers } from 'next/headers';


const QuestionPage = () => {
  const { id, slug } = useParams(); // question id and slug
  const { control, handleSubmit, reset } = useForm();
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Redux state
  const { user } = useAppSelector((state) => state.auth);
  const { answers: answerData, loading: answersLoading, submitLoading, submitSuccess, submitError } = useAppSelector((state) => state.answer);
  
  const questionAnswers = answerData[id] || [];

  useEffect(() => {
    if (id) {
      dispatch(fetchAnswersByQuestionId(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (submitSuccess) {
      reset(); // Clear the form
      dispatch(clearSubmitSuccess());
      // Refresh answers after successful submission
      dispatch(fetchAnswersByQuestionId(id));
    }
  }, [submitSuccess, reset, dispatch, id]);

  const onSubmit = async (data) => {
    if (!user) {
      alert('Please login to submit an answer');
      return;
    }

    try {
      await dispatch(submitAnswer({
        content: data.content,
        questionslug: slug,
      })).unwrap();
    } catch (error) {
      console.error('Submit answer error:', error);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!user || user.id !== question?.author?.id) {
      alert('You can only delete your own questions');
      return;
    }

    const confirmDelete = confirm(
      'Are you sure you want to delete this question? This action cannot be undone and will delete all answers and comments.'
    );

    if (confirmDelete) {
      try {
        await dispatch(deleteQuestion(id)).unwrap();
        alert('Question deleted successfully');
        router.push('/questions'); // Redirect to questions list
      } catch (error) {
        alert(error || 'Failed to delete question');
      }
    }
  };
  const question = useAppSelector((state) =>
    state.question.questions.find((q) => String(q.id) === String(id))
  );

  if (!question) return <div className="mt-20 text-center text-gray-500">Loading...</div>;

  const {
    title,
    content,
    tags = [],
    author,
    createdAt,
    _count = {},
  } = question;

  const {
    vote = 0,
    answers = 0,
  } = _count;

  return (
    <main className='mt-16 md:px-4 w-full mx-auto'>
      {/* Header Action */}
      <div className='flex justify-between items-center py-4 border-b'>
        <div>
          {/* Show delete button only to question author */}
          {user && user.id === author?.id && (
            <button 
              onClick={handleDeleteQuestion}
              className='flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 active:scale-95 transition mr-3'
              title="Delete this question"
            >
              <Trash2 size={16} />
              Delete Question
            </button>
          )}
        </div>
        <button className='px-4 py-2 bg-[#4255FF] text-white text-sm rounded hover:bg-[#3a4ce3] active:scale-95 transition'>
          View Answers
        </button>
      </div>

      {/* Question Card */}
      <section className='mt-6 border-b pb-4'>
        {/* Title */}
        <h1 className='text-3xl  text-[#0C2AF2]'>{sanitizeUserInput(title)}</h1>

        {/* Vote & Answer count */}
        <div className='mt-2 flex space-x-6 text-gray-700 text-[13px]'>
          <span>{vote} Vote{vote !== 1 && 's'}</span>
          <span>{answers} Answer{answers !== 1 && 's'}</span>
        </div>
      </section>

      {/* Content Area */}
      <section className='flex mt-6 gap-6 border-b pb-6'>
        {/* Left Voting Panel */}
        <VotingButtons 
          questionId={id} 
          initialVoteCount={vote}
          size="normal"
        />

        {/* Share Button */}
        <div className='flex flex-col items-center gap-4'>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: title,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className='hover:scale-110 transition border rounded-lg p-2'
            title="Share this question"
          >
            <Share2Icon size={26} color='#0E93FF' />
          </button>
        </div>

        {/* Right Content */}
        <div className='flex-1'>
          {/* Content */}
          <p className='text-lg text-gray-800'>{sanitizeUserInput(content)}</p>

          {/* Tags */}
          <div className='flex flex-wrap gap-2 mt-3'>
            {tags.map((tag, index) => (
              <span
                key={tag.id || tag.name || index}
                className='text-sm bg-[#E4E6FA] text-[#0f0f0f] px-3 py-1 rounded-full'
              >
                {sanitizeUserInput(tag.name)}
              </span>
            ))}
          </div>

          {/* Meta info */}
          <div className='flex mt-4 justify-end space-x-3 text-sm text-gray-500'>
            <span className='text-[#0C2AF2] font-medium'>{sanitizeUserInput(author?.name || "Anonymous")}</span>
            <span>{new Date(createdAt).toLocaleTimeString()}</span>
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </section>

      {/* Answer Suggestion Section */}
      <section className='mt-6 px-2'>
        <div className='flex items-center justify-between border-b pb-4 mb-4'>
          <h2 className='text-xl font-medium text-gray-800'>
            {questionAnswers.length > 0 ? `${questionAnswers.length} Answer${questionAnswers.length !== 1 ? 's' : ''}` : 'Share with someone who might know the answer'}
          </h2>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: title,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className='flex items-center gap-2 bg-[#0946FF] text-white px-4 py-1.5 rounded hover:bg-[#083be0] active:scale-95 transition'
            title="Share this question"
          >
            <span>Share</span>
            <Share2Icon size={20} />
          </button>
        </div>

        {/* Existing Answers */}
        {questionAnswers.length > 0 && (
          <div className="mb-8">
            {answersLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 h-[120px] w-full rounded" />
                ))}
              </div>
            )}
            
            {!answersLoading && questionAnswers.map((answer) => (
              <Answer key={answer.id} answer={answer} />
            ))}
          </div>
        )}

        {/* Answer input area */}
        <div className=''>
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {questionAnswers.length > 0 ? 'Add Your Answer' : 'Be the first to answer!'}
          </h3>
          
          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {submitError}
            </div>
          )}

          {/* Show login prompt for non-authenticated users */}
          {!user ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Login Required</h4>
              <p className="text-blue-700 mb-4">
                To answer this question, vote, or interact with the community, please log in to your account.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => window.location.href = '/auth/signup'}
                  className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 md:p-4 border rounded">
              <Controller
                name="content"
                control={control}
                defaultValue=""
                rules={{ required: "Answer content is required" }}
                render={({ field }) => (
                  <TiptapEditor 
                    value={field.value} 
                    onChange={field.onChange}
                    placeholder="Write your answer here. Be helpful and provide details..."
                  />
                )}
              />

              <div className="flex justify-end items-center mt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2 bg-[#0946FF] text-white rounded hover:bg-[#083be0] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitLoading ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <div>
        <span className='text-[#0946FF] '>Related Qiestions</span>
      </div>
    </main>
  );
};

export default QuestionPage;
