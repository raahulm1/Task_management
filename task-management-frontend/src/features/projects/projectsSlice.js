import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProjects } from '../../api/projects';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (token) => {
    const data = await getProjects(token);
    return data;
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProjects.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load projects";
      });
  },
});

export default projectsSlice.reducer;
