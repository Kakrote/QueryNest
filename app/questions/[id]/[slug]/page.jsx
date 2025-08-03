"use client";
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Share2Icon } from 'lucide-react';
import { Controller, useForm, reset } from 'react-hook-form';
import TiptapEditor from '@/components/TiptapEditor';
import VotingButtons from '@/components/VotingButtons';
import Answer from '@/components/Answer';
import { fetchAnswersByQuestionId, submitAnswer, clearSubmitSuccess } from '@/redux/slices/answerSlice';
import axios from 'axios';
// import { headers } from 'next/headers';


const QuestionPage = () => {
  const { id, slug } = useParams(); // question id and slug
  const { control, handleSubmit, reset } = useForm();
  const dispatch = useAppDispatch();
  
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
      <div className='flex justify-end items-center py-4 border-b'>
        <button className='px-4 py-2 bg-[#4255FF] text-white text-sm rounded hover:bg-[#3a4ce3] active:scale-95 transition'>
          View Answers
        </button>
      </div>

      {/* Question Card */}
      <section className='mt-6 border-b pb-4'>
        {/* Title */}
        <h1 className='text-3xl  text-[#0C2AF2]'>{title}</h1>

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
          <button className='hover:scale-110 transition border rounded-lg p-2'>
            <Share2Icon size={26} color='#0E93FF' />
          </button>
        </div>

        {/* Right Content */}
        <div className='flex-1'>
          {/* Content */}
          <p className='text-lg text-gray-800'>{content}</p>

          {/* Tags */}
          <div className='flex flex-wrap gap-2 mt-3'>
            {tags.map((tag, index) => (
              <span
                key={tag.id || tag.name || index}
                className='text-sm bg-[#E4E6FA] text-[#0f0f0f] px-3 py-1 rounded-full'
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Meta info */}
          <div className='flex mt-4 justify-end space-x-3 text-sm text-gray-500'>
            <span className='text-[#0C2AF2] font-medium'>{author?.name || "Anonymous"}</span>
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
          <button className='flex items-center gap-2 bg-[#0946FF] text-white px-4 py-1.5 rounded hover:bg-[#083be0] active:scale-95 transition'>
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

            <div className="flex justify-between items-center mt-4">
              {!user && (
                <p className="text-sm text-gray-600">
                  Please <span className="text-blue-600">login</span> to submit an answer
                </p>
              )}
              
              <button
                type="submit"
                disabled={submitLoading || !user}
                className="ms-auto block px-6 py-2 bg-[#0946FF] text-white rounded hover:bg-[#083be0] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <div>
        <span className='text-[#0946FF] '>Related Qiestions</span>
      </div>
    </main>
  );
};

export default QuestionPage;
