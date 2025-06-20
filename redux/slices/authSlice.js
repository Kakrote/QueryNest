import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// async trunks for login

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (craditionals, { rejectWithValue }) => {
        try {
            const res = await axios.post('/auth/login', craditionals);
            localStorage.setItem("token", res.data.token); // saving the token in the localstorage
            return res.data;
        }
        catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        loading: false,
        error: null
    },
    reducers: {
        logout: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem("token");
        },
        setCredentials: (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;


