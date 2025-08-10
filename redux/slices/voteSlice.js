import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for voting on questions/answers
export const submitVote = createAsyncThunk(
  'vote/submitVote',
  async ({ voteType, questionId, answerId }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
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
      const message = error.response?.data?.message || error.message || 'Failed to submit vote';
      console.error('Vote submission error:', message);
      return rejectWithValue(
        typeof message === 'string' ? message : 'Failed to submit vote'
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
        if (action.payload && typeof action.payload === 'object') {
          const { questionId, answerId, voteType, vote } = action.payload;
          const key = questionId ? `question_${questionId}` : `answer_${answerId}`;
          
          // Store user's vote
          state.userVotes[key] = {
            type: voteType,
            voteId: vote?.id,
          };
        }
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
        if (action.payload && typeof action.payload === 'object') {
          const { questionId, answerId, upvotes = 0, downvotes = 0, score = 0 } = action.payload;
          const key = questionId ? `question_${questionId}` : `answer_${answerId}`;
          
          // Ensure all values are numbers
          const numUpvotes = Number(upvotes) || 0;
          const numDownvotes = Number(downvotes) || 0;
          const numScore = Number(score) || (numUpvotes - numDownvotes);
          
          // Store vote counts
          state.votes[key] = {
            upvotes: numUpvotes,
            downvotes: numDownvotes,
            total: numUpvotes + numDownvotes,
            score: numScore, // net score (upvotes - downvotes)
          };
        }
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
        if (action.payload && typeof action.payload === 'object') {
          const { questionId, answerId, userVote } = action.payload;
          const key = questionId ? `question_${questionId}` : `answer_${answerId}`;
          
          // Store user's vote (userVote can be 'UP', 'DOWN', or null)
          if (userVote) {
            state.userVotes[key] = {
              type: userVote,
            };
          } else {
            // Remove any existing vote if userVote is null
            delete state.userVotes[key];
          }
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
