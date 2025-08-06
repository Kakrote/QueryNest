import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper function to safely access localStorage
const safeLocalStorage = {
    getItem: (key) => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    },
    setItem: (key, value) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    removeItem: (key) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    }
};

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
      const token = safeLocalStorage.getItem('token');
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

// Async thunk for updating an answer
export const updateAnswer = createAsyncThunk(
  'answer/updateAnswer',
  async ({ answerId, newContent }, { rejectWithValue }) => {
    try {
      const token = safeLocalStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.put(
        '/api/answers',
        { answerId, newContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { answerId, newContent, ...response.data.update };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update answer'
      );
    }
  }
);

// Async thunk for deleting an answer
export const deleteAnswer = createAsyncThunk(
  'answer/deleteAnswer',
  async (answerId, { rejectWithValue }) => {
    try {
      const token = safeLocalStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.delete('/api/answers', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { answerId },
      });

      return { answerId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete answer'
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
    updateLoading: false,
    deleteLoading: false,
    error: null,
    submitError: null,
    updateError: null,
    deleteError: null,
    submitSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,
  },
  reducers: {
    clearAnswerError: (state) => {
      state.error = null;
      state.submitError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    resetAnswerState: (state) => {
      state.answers = {};
      state.loading = false;
      state.submitLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.error = null;
      state.submitError = null;
      state.updateError = null;
      state.deleteError = null;
      state.submitSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearDeleteSuccess: (state) => {
      state.deleteSuccess = false;
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
      })

      // Update answer cases
      .addCase(updateAnswer.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateAnswer.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        
        // Update the answer in the state
        const { answerId, newContent } = action.payload;
        Object.keys(state.answers).forEach(questionId => {
          const answerIndex = state.answers[questionId].findIndex(answer => answer.id === answerId);
          if (answerIndex !== -1) {
            state.answers[questionId][answerIndex].content = newContent;
          }
        });
      })
      .addCase(updateAnswer.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      // Delete answer cases
      .addCase(deleteAnswer.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteAnswer.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
        
        // Remove the answer from the state
        const { answerId } = action.payload;
        Object.keys(state.answers).forEach(questionId => {
          state.answers[questionId] = state.answers[questionId].filter(answer => answer.id !== answerId);
        });
      })
      .addCase(deleteAnswer.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearAnswerError, resetAnswerState, clearSubmitSuccess, clearUpdateSuccess, clearDeleteSuccess } = answerSlice.actions;
export default answerSlice.reducer;
