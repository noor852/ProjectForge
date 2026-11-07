import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { request } from "./authSlice";

export const fetchMyProfile = createAsyncThunk("profile/me", async (_, { rejectWithValue }) => {
  try { return (await request("/api/users/me")).user; }
  catch (e) { return rejectWithValue(e.message); }
});

export const saveProfile = createAsyncThunk("profile/save", async (form, { rejectWithValue }) => {
  try { return (await request("/api/users/me", { method: "PUT", body: JSON.stringify(form) })).user; }
  catch (e) { return rejectWithValue(e.message); }
});

export const fetchStudent = createAsyncThunk("profile/student", async (id, { rejectWithValue }) => {
  try { return (await request(`/api/users/${id}`)).user; }
  catch (e) { return rejectWithValue(e.message); }
});

const profileSlice = createSlice({
  name: "profile",
  initialState: { me: null, viewed: null, loading: false, saving: false, error: null, saved: false },
  reducers: { clearSaved(s) { s.saved = false; } },
  extraReducers: (b) => {
    b.addCase(fetchMyProfile.pending, (s) => { s.loading = true; })
     .addCase(fetchMyProfile.fulfilled, (s, a) => { s.loading = false; s.me = a.payload; })
     .addCase(fetchMyProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

     .addCase(saveProfile.pending, (s) => { s.saving = true; s.error = null; s.saved = false; })
     .addCase(saveProfile.fulfilled, (s, a) => { s.saving = false; s.me = a.payload; s.saved = true; })
     .addCase(saveProfile.rejected, (s, a) => { s.saving = false; s.error = a.payload; })

     .addCase(fetchStudent.pending, (s) => { s.loading = true; s.viewed = null; s.error = null; })
     .addCase(fetchStudent.fulfilled, (s, a) => { s.loading = false; s.viewed = a.payload; })
     .addCase(fetchStudent.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearSaved } = profileSlice.actions;
export default profileSlice.reducer;