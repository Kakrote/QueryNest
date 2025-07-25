import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch user's questions
export const fetchUserQuestions = createAsyncThunk(
    'userContent/fetchUserQuestions',
    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/users/${userId}/questions`);
            return res.data.questions;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user questions");
        }
    }
);

// Fetch user's answers
export const fetchUserAnswers = createAsyncThunk(
    'userContent/fetchUserAnswers',
    async (userId, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/users/${userId}/answers`);
            return res.data.answers;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user answers");
        }
    }
);

const userContentSlice = createSlice({
    name: "userContent",
    initialState: {
        userQuestions: [],
        userAnswers: [],
        loading: false,
        error: null,
    },
    reducers: {
        resetUserContent: (state) => {
            state.userQuestions = [];
            state.userAnswers = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // User Questions
            .addCase(fetchUserQuestions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserQuestions.fulfilled, (state, action) => {
                state.loading = false;
                state.userQuestions = action.payload;
            })
            .addCase(fetchUserQuestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // User Answers
            .addCase(fetchUserAnswers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserAnswers.fulfilled, (state, action) => {
                state.loading = false;
                state.userAnswers = action.payload;
            })
            .addCase(fetchUserAnswers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { resetUserContent } = userContentSlice.actions;
export default userContentSlice.reducer;
