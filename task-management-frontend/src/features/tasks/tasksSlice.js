import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTasks, addTask, deleteTask as apiDeleteTask, updateTask } from '../../api/tasks';
import { deleteTask as deleteTaskApi } from '../../api/tasks';

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
    await deleteTaskApi(taskId, token);
    return thunkAPI.dispatch(fetchTasks(projectId)); // reload after delete
  }
);

// ✅ UPDATE TASK STATUS
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, newStatus, projectId }, thunkAPI) => {
    const token = localStorage.getItem("token");
    await updateTask(taskId, { status: newStatus }, token);
    return thunkAPI.dispatch(fetchTasks(projectId)); // reload after update
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
  startEditingTask,
  clearEditingTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;
