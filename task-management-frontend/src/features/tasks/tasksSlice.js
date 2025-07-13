import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTasks, addTask, deleteTask as apiDeleteTask } from '../../api/tasks';

// ✅ FETCH TASKS
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId, thunkAPI) => {
    const token = localStorage.getItem("token");
    const data = await getTasks(projectId, token);
    return data;
  }
);

// ✅ CREATE TASK
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ task, projectId }, thunkAPI) => {
    const token = localStorage.getItem("token");
    await addTask({ ...task, projectId }, token);
    return thunkAPI.dispatch(fetchTasks(projectId)); // reload after add
  }
);

// ✅ DELETE TASK
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ taskId, projectId }, thunkAPI) => {
    const token = localStorage.getItem("token");
    await apiDeleteTask(taskId, token);
    return thunkAPI.dispatch(fetchTasks(projectId)); // reload after delete
  }
);

// ✅ Slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    loading: false,
    error: null,
    editingTask: null, // for editing modal or page
  },
  reducers: {
    updateTaskStatus: (state, action) => {
      const { taskId, newStatus } = action.payload;
      const task = state.list.find(t => t.id === taskId);
      if (task) task.status = newStatus;
    },
    startEditingTask: (state, action) => {
      state.editingTask = action.payload;
    },
    clearEditingTask: (state) => {
      state.editingTask = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load tasks";
      });
  },
});

export const {
  updateTaskStatus,
  startEditingTask,
  clearEditingTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;
