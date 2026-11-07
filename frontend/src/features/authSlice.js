import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";

async function request(url, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;   
}

export const registerUser = createAsyncThunk("auth/register", async (form, {rejectWithValue}) => {
        try{
            return await request("/api/auth/register", {method: "POST", body: JSON.stringify(form)});

        }
        catch(e)
        {
            return rejectWithValue(e.message);
        }
    });

export const loginUser = createAsyncThunk("auth/login", async (form, {rejectWithValue}) => {
    try {
        return await request("/api/auth/login", {method: "POST", body: JSON.stringify(form)});
    }
    catch(e)
    {
        return rejectWithValue(e.message);
    }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, {rejectWithValue}) =>
{
    try
    {
        return await request("/api/auth/me");
    }
    catch(e)
    {
        return rejectWithValue(e.message);
    }
});

const saveSession = (state, {payload}) => {
    console.log("payload:", payload);
    state.loading = false;
    state.error = null;
    state.user = payload.user;
    state.token = payload.token;
    localStorage.setItem("token", payload.token);
}

const authSlice = createSlice({
    name: "auth", 
    initialState: {
        user: null,
        token: localStorage.getItem("token"),
        loading: false,
        initializing: !!localStorage.getItem("token"),
        error: null,
    },
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
        },
    },
    extraReducers: (b) => {
        b.addCase(registerUser.pending, (s) => {s.loading = true; s.error= null;})
        .addCase(registerUser.fulfilled, saveSession)
        .addCase(registerUser.rejected, (s,a ) => {s.loading = false; s.error = a.payload;})
        .addCase(loginUser.pending, (s) => {s.loading = true; s.error = null;})
        .addCase(loginUser.fulfilled, saveSession)
        .addCase(loginUser.rejected, (s, a) => {s.loading = false; s.error = a.payload})
        .addCase(fetchMe.fulfilled, (s, a) => {s.user = a.payload.user})
        .addCase(fetchMe.rejected, (s) => {
            s.user = null;
            s.token = null;
            s.initializing = false;
            localStorage.removeItem("token");
        })
    }
});

export const {logout} = authSlice.actions;
export default authSlice.reducer;