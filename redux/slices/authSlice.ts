import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Types
interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  user: User;
  token: string;
}

// async thunks for login
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>(
    'auth/loginUser',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        localStorage.removeItem('token')
        try {
            console.log("In auth slice ")
            const res = await axios.post('/api/auth/login', credentials);
            // localStorage.setItem("token", res.data.token); // saving the token in the localstorage
            console.log("credentials: ", credentials)
            console.log("getting out from auth slice")

            return res.data;
        }
        catch (error: any) {
            console.log("check error")
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
)

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem("token");
        },
        setCredentials: (state, action: PayloadAction<LoginResponse>) => {
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


