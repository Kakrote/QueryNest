"use client";
import { useParams } from 'next/navigation';
import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { ThumbsUp, ThumbsDown, Share2Icon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import TiptapEditor from '@/components/TiptapEditor';
import axios from 'axios';


const QuestionPage = () => {
  const { id,slug} = useParams(); // question id and slug
  const { control, handleSubmit } = useForm();
  const token=localStorage.getItem('token')
  const onSubmit = async (data) => {
    // console.log("Answer: ", data.answer)
    console.log(data)
    // data ke andar mata data missing hai like userId and question slug 
    // const payload={
    //   ...data,
    //   questionslug:slug, 
    // }
    // const res=await axios.post('/api/answers') 
  }
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
    <main className='mt-16 px-4 w-full mx-auto'>
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
        {/* Left Icons Panel */}
        <div className='flex border rounded-lg h-fit p-2 flex-col items-center gap-4'>
          <button className='hover:scale-110 transition'>
            <ThumbsUp size={28} color='#0E93FF' />
          </button>
          <button className='hover:scale-110 transition'>
            <ThumbsDown size={28} color='#0E93FF' />
          </button>
          <button className='hover:scale-110 transition'>
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
          <h2 className='text-xl font-medium text-gray-800'>Share with someone who might know the answer</h2>
          <button className='flex items-center gap-2 bg-[#0946FF] text-white px-4 py-1.5 rounded hover:bg-[#083be0] active:scale-95 transition'>
            <span>Share</span>
            <Share2Icon size={20} />
          </button>
        </div>

        {/* Answer input area (placeholder) */}
        <div className=''>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 border rounded">
            <Controller
              name="answer"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TiptapEditor value={field.value} onChange={field.onChange} />
              )}
            />

            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-[#0946FF] text-white rounded hover:bg-[#083be0] active:scale-95 transition"
            >
              Submit Answer
            </button>
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
