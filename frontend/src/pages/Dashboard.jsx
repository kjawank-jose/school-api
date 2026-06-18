import { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import { Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    lowPerforming: 0,
    attendanceRate: 0,
    topStudents: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [studentsByLevel, lowPerforming, topStudents] = await Promise.all([
        reportsAPI.getStudentsByLevel(),
        reportsAPI.getLowPerforming(11),
        reportsAPI.getTopStudents(5)
      ]);

      setStats({
        totalStudents: studentsByLevel.data.total_students,
        lowPerforming: lowPerforming.data.total_students,
        attendanceRate: 95, // Esto vendría de la API
        topStudents: topStudents.data.students
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Alumnos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Bajo Rendimiento</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.lowPerforming}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Asistencia Promedio</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.attendanceRate}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Promedio General</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">14.5</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mejores Alumnos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Promedio</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.topStudents.map((student, index) => (
                <tr key={student.student_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {index + 1}. {student.student_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.grade}</td>
                  <td className="px-4 py-3 text-sm font-bold text-primary-600">{student.average}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Excelente
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;