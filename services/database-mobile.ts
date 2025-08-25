import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

export type Task = {
  id: number;
  title: string;
  description: string;
  done: boolean;
};

let db: SQLite.SQLiteDatabase | null = null;
let useAsyncStorage = false;

export const init = async (): Promise<void> => {
  try {
    console.log('Initializing SQLite database...');
    
    if (!SQLite) {
      console.warn('SQLite not available, falling back to AsyncStorage');
      useAsyncStorage = true;
      return;
    }
    
    console.log('Opening database...');
    db = await SQLite.openDatabaseAsync('tasks.db');
    
    if (!db) {
      throw new Error('Failed to open database');
    }
    
    console.log('Database opened successfully, creating table...');
    
    return new Promise<void>((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      db.execAsync(
        'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, done INTEGER NOT NULL);'
      ).then(() => {
        console.log('Table created/verified successfully');
        resolve();
      }).catch((error: any) => {
        console.error('Error creating table:', error);
        console.warn('Falling back to AsyncStorage due to SQLite error');
        useAsyncStorage = true;
        resolve(); 
      });
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    console.warn('Falling back to AsyncStorage due to initialization error');
    useAsyncStorage = true;
    return Promise.resolve(); 
  }
};


const asyncStorageAddTask = async (title: string, description: string = ''): Promise<any> => {
  try {
    const existingTasks = await asyncStorageFetchTasks();
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

const asyncStorageFetchTasks = async (): Promise<Task[]> => {
  try {
    const tasksJson = await AsyncStorage.getItem('tasks');
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error('Error fetching tasks from AsyncStorage:', error);
    return [];
  }
};

const asyncStorageUpdateTaskStatus = async (id: number, done: boolean): Promise<any> => {
  try {
    const tasks = await asyncStorageFetchTasks();
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, done } : task
    );
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return { rowsAffected: 1 };
  } catch (error) {
    throw error;
  }
};

const asyncStorageDeleteTask = async (id: number): Promise<any> => {
  try {
    const tasks = await asyncStorageFetchTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return { rowsAffected: 1 };
  } catch (error) {
    throw error;
  }
};

const asyncStorageUpdateTask = async (id: number, title: string, description: string): Promise<any> => {
  try {
    const tasks = await asyncStorageFetchTasks();
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, title, description } : task
    );
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return { rowsAffected: 1 };
  } catch (error) {
    throw error;
  }
};

export const addTask = async (title: string, description: string = ''): Promise<any> => {
  if (useAsyncStorage) {
    return asyncStorageAddTask(title, description);
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.execAsync(
      `INSERT INTO tasks (title, description, done) VALUES ('${title}', '${description}', 0);`
    ).then((result: any) => {
      resolve(result);
    }).catch((error: any) => {
      reject(error);
    });
  });
};

export const fetchTasks = async (): Promise<Task[]> => {
  if (useAsyncStorage) {
    return asyncStorageFetchTasks();
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.getAllAsync('SELECT * FROM tasks ORDER BY id DESC;').then((rows: any) => {
      const tasks: Task[] = rows.map((item: any) => ({
        ...item,
        done: item.done === 1,
      }));
      resolve(tasks);
    }).catch((error: any) => {
      reject(error);
    });
  });
};

export const updateTaskStatus = async (id: number, done: boolean): Promise<any> => {
  if (useAsyncStorage) {
    return asyncStorageUpdateTaskStatus(id, done);
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.execAsync(
      `UPDATE tasks SET done = ${done ? 1 : 0} WHERE id = ${id};`
    ).then((result: any) => {
      resolve(result);
    }).catch((error: any) => {
      reject(error);
    });
  });
};

export const deleteTask = async (id: number): Promise<any> => {
  if (useAsyncStorage) {
    return asyncStorageDeleteTask(id);
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.execAsync(
      `DELETE FROM tasks WHERE id = ${id};`
    ).then((result: any) => {
      resolve(result);
    }).catch((error: any) => {
      reject(error);
    });
  });
};

export const updateTask = async (id: number, title: string, description: string): Promise<any> => {
  if (useAsyncStorage) {
    return asyncStorageUpdateTask(id, title, description);
  }
  
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.execAsync(
      `UPDATE tasks SET title = '${title}', description = '${description}' WHERE id = ${id};`
    ).then((result: any) => {
      resolve(result);
    }).catch((error: any) => {
      reject(error);
    });
  });
};
