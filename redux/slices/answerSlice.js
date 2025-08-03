import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching answers by question ID
export const fetchAnswersByQuestionId = createAsyncThunk(
  'answer/fetchAnswersByQuestionId',
  async (questionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/answers?questionId=${questionId}`);
      return {
        questionId,
        answers: response.data.answers || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch answers'
      );
    }
  }
);

// Async thunk for submitting an answer
export const submitAnswer = createAsyncThunk(
  'answer/submitAnswer',
  async ({ content, questionslug }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        '/api/answers',
        { content, questionslug },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.answer;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to submit answer'
      );
    }
  }
);

const answerSlice = createSlice({
  name: 'answer',
  initialState: {
    answers: {},
    loading: false,
    submitLoading: false,
    error: null,
    submitError: null,
    submitSuccess: false,
  },
  reducers: {
    clearAnswerError: (state) => {
      state.error = null;
      state.submitError = null;
    },
    resetAnswerState: (state) => {
      state.answers = {};
      state.loading = false;
      state.submitLoading = false;
      state.error = null;
      state.submitError = null;
      state.submitSuccess = false;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch answers cases
      .addCase(fetchAnswersByQuestionId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnswersByQuestionId.fulfilled, (state, action) => {
        state.loading = false;
        const { questionId, answers } = action.payload;
        state.answers[questionId] = answers;
      })
      .addCase(fetchAnswersByQuestionId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit answer cases
      .addCase(submitAnswer.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitSuccess = true;
        
        // Add the new answer to the appropriate question's answers
        const answer = action.payload;
        if (answer && answer.questionId) {
          if (!state.answers[answer.questionId]) {
            state.answers[answer.questionId] = [];
          }
          state.answers[answer.questionId].unshift(answer);
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearAnswerError, resetAnswerState, clearSubmitSuccess } = answerSlice.actions;
export default answerSlice.reducer;
