import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    
    return api.post('/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  register: (userData) => api.post('/register', userData),
  me: () => api.get('/me'),
};

export const teachersAPI = {
  getAll: () => api.get('/teachers/'),
  create: (data) => api.post('/teachers/', data),
  createBulk: (data) => api.post('/teachers/bulk', data),
};

export const studentsAPI = {
  getAll: () => api.get('/students/'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students/', data),
  createBulk: (data) => api.post('/students/bulk', data),
};

export const gradesAPI = {
  create: (studentId, data) => api.post(`/grades/?student_id=${studentId}`, data),
  createBulk: (data) => api.post('/grades/bulk', data),
};

export const attendanceAPI = {
  create: (data) => api.post('/attendance/', data),
  createBulk: (data) => api.post('/attendance/bulk', data),
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  getByDate: (date) => api.get(`/attendance/date/${date}`),
};

export const reportsAPI = {
  getStudentAverage: (studentId) => api.get(`/reports/student/${studentId}/average`),
  getLowPerforming: (threshold = 11) => api.get(`/reports/low-performing-students?threshold=${threshold}`),
  getTopStudents: (limit = 10) => api.get(`/reports/top-students?limit=${limit}`),
  getAttendanceSummary: (startDate, endDate) => 
    api.get(`/reports/attendance-summary?start_date=${startDate}&end_date=${endDate}`),
  getStudentsByLevel: () => api.get('/reports/students-by-level'),
};

export default api;