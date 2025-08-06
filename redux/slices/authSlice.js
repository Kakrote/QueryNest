import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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

// async trunks for login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (craditionals, { rejectWithValue }) => {
        safeLocalStorage.removeItem('token')
        try {
            console.log("In auth slice ")
            const res = await axios.post('/api/auth/login', craditionals);
            console.log("cradintials: ",craditionals)
            console.log("geeting out from auth slice")

            return res.data;
        }
        catch (error) {
            console.log("check error")
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
            safeLocalStorage.removeItem("token");
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
                safeLocalStorage.setItem('token', action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;


