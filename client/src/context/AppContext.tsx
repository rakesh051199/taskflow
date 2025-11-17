import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, User, AuthState } from '../types';
import { api } from '../lib/apiClient';
import { taskFromBackend, taskToBackend, tasksFromBackend } from '../lib/mappers';

interface AppContextType {
  auth: AuthState;
  projectId: string | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  setProjectId: (id: string) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Task | undefined;
}

const AppContext = createContext(undefined as AppContextType | undefined);

export const AppProvider = ({ children }: { children?: any }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null as User | null,
    token: null as string | null,
  });
  const [projectId, setProjectIdState] = useState(
    (localStorage.getItem('taskflow_project_id') || sessionStorage.getItem('taskflow_project_id')) as string | null
  );
  const [tasks, setTasks] = useState([] as Task[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('taskflow_user');
    const storedToken = sessionStorage.getItem('taskflow_token');
    if (storedUser && storedToken) {
      try {
        setAuth({
          isAuthenticated: true,
          user: JSON.parse(storedUser),
          token: storedToken,
        });
      } catch (e) {
        console.error('Error parsing stored user:', e);
        sessionStorage.removeItem('taskflow_user');
        sessionStorage.removeItem('taskflow_token');
      }
    }
  }, []);

  // Fetch tasks when projectId changes and user is authenticated
  useEffect(() => {
    if (auth.isAuthenticated && projectId) {
      fetchTasks();
    }
  }, [auth.isAuthenticated, projectId]);

  const setProjectId = (id: string) => {
    setProjectIdState(id);
    localStorage.setItem('taskflow_project_id', id);
    sessionStorage.setItem('taskflow_project_id', id);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.login(email, password);
      const result: any = (response as any).data || response;
      const user = result.user || (result as any).data?.user;
      const token = result.token || (result as any).data?.token;
      const refreshToken = result.refreshToken || (result as any).data?.refreshToken;

      if (!user || !token) {
        throw new Error('Invalid response from server');
      }

      // Transform user ID if needed
      const frontendUser: User = {
        id: user._id || user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      sessionStorage.setItem('taskflow_token', token);
      if (refreshToken) {
        localStorage.setItem('taskflow_refresh_token', refreshToken);
      }
      sessionStorage.setItem('taskflow_user', JSON.stringify(frontendUser));

      setAuth({
        isAuthenticated: true,
        user: frontendUser,
        token,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.signup({
        email,
        password,
        firstName,
        lastName,
      });

      const result: any = (response as any).data || response;
      const user = result.user || (result as any).data?.user;
      const token = result.token || (result as any).data?.token;
      const refreshToken = result.refreshToken || (result as any).data?.refreshToken;

      if (!user || !token) {
        throw new Error('Invalid response from server');
      }

      const frontendUser: User = {
        id: user._id || user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      sessionStorage.setItem('taskflow_token', token);
      if (refreshToken) {
        localStorage.setItem('taskflow_refresh_token', refreshToken);
      }
      sessionStorage.setItem('taskflow_user', JSON.stringify(frontendUser));

      setAuth({
        isAuthenticated: true,
        user: frontendUser,
        token,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      sessionStorage.removeItem('taskflow_token');
      sessionStorage.removeItem('taskflow_user');
      localStorage.removeItem('taskflow_refresh_token');
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
      });
      setTasks([]);
    }
  };

  const fetchTasks = async () => {
    if (!projectId) {
      setError('Project ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.listTasks(projectId, {
        page: 1,
        limit: 100,
      });

      const tasksData = response.data || response.items || response || [];
      const transformedTasks = tasksFromBackend(Array.isArray(tasksData) ? tasksData : []);
      setTasks(transformedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    setLoading(true);
    setError(null);
    try {
      const backendTask = taskToBackend(task);
      const response = await api.createTask(projectId, backendTask);
      
      const newBackendTask = response.data || response;
      const newTask = taskFromBackend(newBackendTask);
      
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    setLoading(true);
    setError(null);
    try {
      const backendUpdates = taskToBackend(updates);
      const response = await api.updateTask(projectId, id, backendUpdates);
      
      const updatedBackendTask = response.data || response;
      const updatedTask = taskFromBackend(updatedBackendTask);
      
      setTasks(prev =>
        prev.map(task => task.id === id ? updatedTask : task)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    setLoading(true);
    setError(null);
    try {
      await api.deleteTask(projectId, id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTask = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  return (
    <AppContext.Provider
      value={{
        auth,
        projectId,
        tasks,
        loading,
        error,
        setProjectId,
        login,
        signup,
        logout,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        getTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
