import AsyncStorage from '@react-native-async-storage/async-storage';

export type Task = {
  id: number;
  title: string;
  description: string;
  done: boolean;
};

export const init = async (): Promise<void> => {
  return Promise.resolve();
};

export const addTask = async (title: string, description: string = ''): Promise<any> => {
  try {
    const existingTasks = await fetchTasks();
    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      done: false,
    };
    
    const updatedTasks = [newTask, ...existingTasks];
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return { insertId: newTask.id };
  } catch (error) {
    throw error;
  }
};

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const tasksJson = await AsyncStorage.getItem('tasks');
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error('Error fetching tasks from AsyncStorage:', error);
    return [];
  }
};

export const updateTaskStatus = async (id: number, done: boolean): Promise<any> => {
  try {
    const tasks = await fetchTasks();
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, done } : task
    );
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return { rowsAffected: 1 };
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (id: number): Promise<any> => {
  try {
    const tasks = await fetchTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return { rowsAffected: 1 };
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (id: number, title: string, description: string): Promise<any> => {
  try {
    const tasks = await fetchTasks();
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, title, description } : task
    );
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return { rowsAffected: 1 };
  } catch (error) {
    throw error;
  }
};
