// Authentication Redux slice
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

const storedUser = JSON.parse(localStorage.getItem("user"));

export const loginUser = createAsyncThunk("auth/login", async (data, thunk) => {
  try {
    const res = await API.post("/auth/login", data);
    localStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    return thunk.rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: storedUser || null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
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
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;