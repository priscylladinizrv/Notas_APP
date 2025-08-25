
import { Platform } from 'react-native';

export type Task = {
  id: number;
  title: string;
  description: string;
  done: boolean;
};

let DB: any;

const loadDB = async () => {
  try {
    console.log('Loading database implementation for platform:', Platform.OS);
    
    if (Platform.OS === 'web') {
      console.log('Loading web database (AsyncStorage)');
      DB = await import('./database-web');
    } else {
      console.log('Loading mobile database (SQLite)');
      DB = await import('./database-mobile');
    }
    
    console.log('Database implementation loaded successfully');
  } catch (error) {
    console.error('Failed to load database implementation:', error);
    throw new Error(`Failed to load database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

loadDB().catch(error => {
  console.error('Database loading failed:', error);
});

export const init = async () => {
  try {
    if (!DB) {
      console.log('Database not loaded yet, waiting...');
      await loadDB();
    }
    return (await DB).init();
  } catch (error) {
    console.error('Database init failed:', error);
    throw error;
  }
};

export const addTask = async (title: string, description: string = '') => {
  try {
    if (!DB) {
      await loadDB();
    }
    return (await DB).addTask(title, description);
  } catch (error) {
    console.error('Add task failed:', error);
    throw error;
  }
};

export const fetchTasks = async () => {
  try {
    if (!DB) {
      await loadDB();
    }
    return (await DB).fetchTasks();
  } catch (error) {
    console.error('Fetch tasks failed:', error);
    throw error;
  }
};

export const updateTaskStatus = async (id: number, done: boolean) => {
  try {
    if (!DB) {
      await loadDB();
    }
    return (await DB).updateTaskStatus(id, done);
  } catch (error) {
    console.error('Update task status failed:', error);
    throw error;
  }
};

export const updateTask = async (id: number, title: string, description: string) => {
  try {
    if (!DB) {
      await loadDB();
    }
    return (await DB).updateTask(id, title, description);
  } catch (error) {
    console.error('Update task failed:', error);
    throw error;
  }
};

export const deleteTask = async (id: number) => {
  try {
    if (!DB) {
      await loadDB();
    }
    return (await DB).deleteTask(id);
  } catch (error) {
    console.error('Delete task failed:', error);
    throw error;
  }
};
