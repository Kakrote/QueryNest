import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// creating questions
export const askQuestion = createAsyncThunk(
    'question/askQuestion',
    async (questionData, { rejectWithValue,getState }) => {
        try {
            // const token=localStorage.getItem('token')
            console.log("enter the try block")
            const token=getState().auth.token; // Assuming you have an auth slice with a token
            console.log("get the token: ",token)
            console.log('Question data: ',questionData)
            console.log("hiting ask Question api")
            const res = await axios.post('/api/questions', questionData,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            console.log("response form askqouestion api: ",res)
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data?.message || "faild to Create the Question try again letter")
        }
    }
)


// fetching all the questions
export const fetchQuestions = createAsyncThunk(
    'question/fetchQuestions',
    async ({ filter = "latest", page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/questions?sort=${filter}&page=${page}&limit=${limit}`);
            return res.data.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch questions");
        }
    }
)

// Delete question
export const deleteQuestion = createAsyncThunk(
    'question/deleteQuestion',
    async (questionId, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            const res = await axios.delete('/api/questions', {
                data: { questionId },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return { questionId, message: res.data.message };
        }
        catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete question");
        }
    }
)

// Fetch question by ID
export const fetchQuestionById = createAsyncThunk(
    'question/fetchQuestionById',
    async (questionId, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/questions/by-id?id=${questionId}`);
            return res.data.question;
        }
        catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch question");
        }
    }
)


const questionSlice = createSlice({
    name: "question",
    initialState: {
        questions: [],
        currentQuestion: null,
        total: 0,
        page: 1,
        totalPages: 1,
        loading: false,
        currentQuestionLoading: false,
        error: null,
        currentQuestionError: null,
        success:false,
    },
    reducers: {
        resetQuestionState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
        },
        clearCurrentQuestion: (state) => {
            state.currentQuestion = null;
            state.currentQuestionLoading = false;
            state.currentQuestionError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuestions.pending, (state) => {
                state.loading = true,
                    state.error = null
            })
            .addCase(fetchQuestions.fulfilled, (state, action) => {
                state.loading = false;
                state.questions = action.payload.questions;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(askQuestion.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(askQuestion.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.questions.unshift(action.payload); // optional: optimistic update
            })
            .addCase(askQuestion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteQuestion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteQuestion.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Remove the deleted question from the state
                state.questions = state.questions.filter(q => q.id !== action.payload.questionId);
            })
            .addCase(deleteQuestion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchQuestionById.pending, (state) => {
                state.currentQuestionLoading = true;
                state.currentQuestionError = null;
            })
            .addCase(fetchQuestionById.fulfilled, (state, action) => {
                state.currentQuestionLoading = false;
                state.currentQuestion = action.payload;
            })
            .addCase(fetchQuestionById.rejected, (state, action) => {
                state.currentQuestionLoading = false;
                state.currentQuestionError = action.payload;
            });
    }
})

export const { resetQuestionState, clearCurrentQuestion } = questionSlice.actions;

export default questionSlice.reducer;