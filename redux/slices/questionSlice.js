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
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch questions");
        }
    }
)

// Search questions
export const searchQuestions = createAsyncThunk(
    'question/searchQuestions',
    async (query, { rejectWithValue }) => {
        try {
            const res = await axios.get(`/api/questions/search?query=${encodeURIComponent(query)}`);
            return res.data.data;
        }
        catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to search questions");
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


const questionSlice = createSlice({
    name: "question",
    initialState: {
        questions: [],
        searchResults: [],
        total: 0,
        page: 1,
        totalPages: 1,
        loading: false,
        searchLoading: false,
        error: null,
        searchError: null,
        success: false,
        searchQuery: '',
    },
    reducers: {
        resetQuestionState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchError = null;
            state.searchQuery = '';
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
                state.questions = action.payload.questions || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.totalPages = action.payload.totalPages || 1;
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.questions = []; // Reset to empty array on error
            })
            .addCase(askQuestion.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
            })
            .addCase(askQuestion.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Ensure questions is an array before unshifting
                if (Array.isArray(state.questions)) {
                    state.questions.unshift(action.payload); // optional: optimistic update
                }
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
                // Remove the deleted question from the state, ensure questions is array
                if (Array.isArray(state.questions)) {
                    state.questions = state.questions.filter(q => q.id !== action.payload.questionId);
                }
            })
            .addCase(deleteQuestion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(searchQuestions.pending, (state) => {
                state.searchLoading = true;
                state.searchError = null;
            })
            .addCase(searchQuestions.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload?.data || [];
                state.searchQuery = action.meta.arg;
            })
            .addCase(searchQuestions.rejected, (state, action) => {
                state.searchLoading = false;
                state.searchError = action.payload;
                state.searchResults = [];
            });
    }
})

export const { resetQuestionState, clearSearchResults } = questionSlice.actions;

export default questionSlice.reducer;