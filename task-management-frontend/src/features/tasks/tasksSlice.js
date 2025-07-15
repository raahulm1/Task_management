import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTasks, addTask, deleteTask as apiDeleteTask, updateTask } from '../../api/tasks';

// ✅ FETCH TASKS
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ projectId, token }, thunkAPI) => {
    const data = await getTasks(projectId, token);
    return data;
  }
);

// ✅ CREATE TASK
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ task, projectId, token }, thunkAPI) => {
    await addTask({ ...task, projectId }, token);
    return thunkAPI.dispatch(fetchTasks({ projectId, token })); // reload after add
  }
);

// ✅ DELETE TASK
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ taskId, projectId, token }, thunkAPI) => {
    await apiDeleteTask(taskId, token);
    return thunkAPI.dispatch(fetchTasks({ projectId, token })); // reload after delete
  }
);

// ✅ UPDATE TASK STATUS
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, newStatus, projectId, token }, thunkAPI) => {
    await updateTask(taskId, { status: newStatus }, token);
    return thunkAPI.dispatch(fetchTasks({ projectId, token })); // reload after update
  }
);

// ✅ UPDATE TASK
export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTaskAsync',
  async ({ taskId, taskData, projectId, token }, thunkAPI) => {
    await updateTask(taskId, taskData, token);
    return thunkAPI.dispatch(fetchTasks({ projectId, token })); // reload after update
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
