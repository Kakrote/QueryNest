import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for voting on questions/answers
export const submitVote = createAsyncThunk(
  'vote/submitVote',
  async ({ voteType, questionId, answerId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        '/api/vote',
        {
          voteType,
          questionId,
          answerId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        ...response.data,
        voteType,
        questionId,
        answerId,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to submit vote'
      );
    }
  }
);

// Async thunk for getting vote counts
export const getVoteCount = createAsyncThunk(
  'vote/getVoteCount',
  async ({ questionId, answerId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (questionId) params.append('questionId', questionId);
      if (answerId) params.append('answerId', answerId);

      const response = await axios.get(`/api/vote?${params.toString()}`);
      
      return {
        ...response.data,
        questionId,
        answerId,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to get vote count'
      );
    }
  }
);

// Async thunk for getting user vote
export const getUserVote = createAsyncThunk(
  'vote/getUserVote',
  async ({ userId, questionId, answerId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('userId', userId);
      if (questionId) params.append('questionId', questionId);
      if (answerId) params.append('answerId', answerId);

      const response = await axios.get(`/api/vote?${params.toString()}`);
      
      return {
        ...response.data,
        questionId,
        answerId,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to get user vote'
      );
    }
  }
);

const voteSlice = createSlice({
  name: 'vote',
  initialState: {
    loading: false,
    error: null,
    votes: {}, // Store votes by questionId or answerId
    userVotes: {}, // Store user's votes by questionId or answerId
  },
  reducers: {
    clearVoteError: (state) => {
      state.error = null;
    },
    resetVoteState: (state) => {
      state.loading = false;
      state.error = null;
      state.votes = {};
      state.userVotes = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit vote cases
      .addCase(submitVote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitVote.fulfilled, (state, action) => {
        state.loading = false;
        const { questionId, answerId, voteType, vote } = action.payload;
        const key = questionId ? `question_${questionId}` : `answer_${answerId}`;
        
        // Store user's vote
        state.userVotes[key] = {
          type: voteType,
          voteId: vote?.id,
        };
      })
      .addCase(submitVote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get vote count cases
      .addCase(getVoteCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVoteCount.fulfilled, (state, action) => {
        state.loading = false;
        const { questionId, answerId, data } = action.payload;
        const key = questionId ? `question_${questionId}` : `answer_${answerId}`;
        
        // Store vote counts
        state.votes[key] = {
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          total: data.total || 0,
        };
      })
      .addCase(getVoteCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user vote cases
      .addCase(getUserVote.pending, (state) => {
        // Don't show loading for user vote checks
      })
      .addCase(getUserVote.fulfilled, (state, action) => {
        const { questionId, answerId, data } = action.payload;
        const key = questionId ? `question_${questionId}` : `answer_${answerId}`;
        
        // Store user's vote
        if (data.userVote) {
          state.userVotes[key] = {
            type: data.userVote,
          };
        }
      })
      .addCase(getUserVote.rejected, (state, action) => {
        // Silently handle user vote errors
        console.warn('Failed to get user vote:', action.payload);
      });
  },
});

export const { clearVoteError, resetVoteState } = voteSlice.actions;
export default voteSlice.reducer;
