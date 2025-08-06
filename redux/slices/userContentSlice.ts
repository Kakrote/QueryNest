import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Types
interface Question {
    id: string;
    title: string;
    content: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    // Add other question fields as needed
}

interface Answer {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    // Add other answer fields as needed
}

interface UserContentState {
    userQuestions: Question[];
    userAnswers: Answer[];
    loading: boolean;
    error: string | null;
}

// Fetch user's questions
export const fetchUserQuestions = createAsyncThunk<
    Question[],
    string,
    { rejectValue: string }
>(
    'userContent/fetchUserQuestions',
    async (userId: string, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/users/${userId}/questions`);
            return res.data.questions;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user questions");
        }
    }
);

// Fetch user's answers
export const fetchUserAnswers = createAsyncThunk<
    Answer[],
    string,
    { rejectValue: string }
>(
    'userContent/fetchUserAnswers',
    async (userId: string, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/users/${userId}/answers`);
            return res.data.answers;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user answers");
        }
    }
);

const initialState: UserContentState = {
    userQuestions: [],
    userAnswers: [],
    loading: false,
    error: null,
};

const userContentSlice = createSlice({
    name: "userContent",
    initialState,
    reducers: {
        resetUserContent: (state) => {
            state.userQuestions = [];
            state.userAnswers = [];
            state.loading = false;
            state.error = null;
        },
        updateUserAnswer: (state, action) => {
            const { answerId, newContent } = action.payload;
            const answerIndex = state.userAnswers.findIndex(answer => answer.id === answerId);
            if (answerIndex !== -1) {
                state.userAnswers[answerIndex].content = newContent;
            }
        },
        removeUserAnswer: (state, action) => {
            const answerId = action.payload;
            state.userAnswers = state.userAnswers.filter(answer => answer.id !== answerId);
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

export const { resetUserContent, updateUserAnswer, removeUserAnswer } = userContentSlice.actions;
export default userContentSlice.reducer;
