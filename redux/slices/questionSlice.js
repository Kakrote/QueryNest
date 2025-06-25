import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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


const questionSlice = createSlice({
    name: "question",
    initialState: {
        questions: [],
        total: 0,
        page: 1,
        totalPages: 1,
        loading: false,
        error: null,
    },
    reducers: {},
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
            });
    }
})

export default questionSlice.reducer;