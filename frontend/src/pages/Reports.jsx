import { useState, useEffect } from 'react';
import { reportsAPI, studentsAPI } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Award, AlertTriangle, Users, Calendar, BookOpen, Info } from 'lucide-react';

// 📊 Función para convertir nota numérica a literal (sistema peruano MINEDU)
const getLiteralGrade = (score) => {
  if (score >= 18) return { literal: 'AD', label: 'Logro Destacado', color: 'green' };
  if (score >= 14) return { literal: 'A', label: 'Logro Esperado', color: 'blue' };
  if (score >= 11) return { literal: 'B', label: 'En Proceso', color: 'yellow' };
  return { literal: 'C', label: 'En Inicio', color: 'red' };
};

const getLiteralColorClasses = (color) => {
  const classes = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  };
  return classes[color] || classes.blue;
};

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [topStudents, setTopStudents] = useState([]);
  const [lowPerforming, setLowPerforming] = useState([]);
  const [studentsByLevel, setStudentsByLevel] = useState({});
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [topRes, lowRes, levelRes, studentsRes] = await Promise.all([
        reportsAPI.getTopStudents(10),
        reportsAPI.getLowPerforming(11),
        reportsAPI.getStudentsByLevel(),
        studentsAPI.getAll()
      ]);

      setTopStudents(topRes.data.students || []);
      setLowPerforming(lowRes.data.students || []);
      setStudentsByLevel(levelRes.data.by_level || {});
      setTotalStudents(studentsRes.data.length || 0);

      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      try {
        const attendanceRes = await reportsAPI.getAttendanceSummary(startDate, endDate);
        setAttendanceSummary(attendanceRes.data.summary);
      } catch (error) {
        console.log('No hay datos de asistencia para este mes');
      }

    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelChartData = () => {
    return Object.entries(studentsByLevel).map(([level, data]) => ({
      name: level,
      value: data.count || 0,
      fill: level === 'INICIAL' ? '#3b82f6' : level === 'PRIMARIA' ? '#10b981' : '#8b5cf6'
    }));
  };

  const getAttendanceChartData = () => {
    if (!attendanceSummary) return [];
    
    return [
      { name: 'Presentes', value: attendanceSummary.presentes?.count || 0, color: '#10b981' },
      { name: 'Tardanzas', value: attendanceSummary.tardanzas?.count || 0, color: '#f59e0b' },
      { name: 'Faltas', value: attendanceSummary.faltas?.count || 0, color: '#ef4444' },
      { name: 'Justificados', value: attendanceSummary.justificados?.count || 0, color: '#3b82f6' }
    ];
  };

  const getTopStudentsChartData = () => {
    return topStudents.slice(0, 5).map(student => ({
      name: student.student_name.split(' ')[0],
      promedio: student.average
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Vista General', icon: TrendingUp },
    { id: 'students', label: 'Alumnos', icon: Users },
    { id: 'attendance', label: 'Asistencia', icon: Calendar },
    { id: 'grades', label: 'Calificaciones', icon: BookOpen }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
        <p className="text-gray-600 mt-1">Análisis visual del rendimiento y asistencia del colegio</p>
      </div>

      {/* 📊 Leyenda de calificaciones literales (visible en todas las pestañas) */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Info className="w-5 h-5 text-primary-600" />
          <h3 className="text-sm font-semibold text-gray-700">Escala de Calificaciones (MINEDU - Perú)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
            <div className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold">
              AD
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">Logro Destacado</p>
              <p className="text-xs text-gray-600">18 - 20</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">Logro Esperado</p>
              <p className="text-xs text-gray-600">14 - 17</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
            <div className="w-10 h-10 bg-yellow-500 text-white rounded-lg flex items-center justify-center font-bold">
              B
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">En Proceso</p>
              <p className="text-xs text-gray-600">11 - 13</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
            <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold">
              C
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">En Inicio</p>
              <p className="text-xs text-gray-600">0 - 10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="flex space-x-2 mb-8 border-b border-gray-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Vista General */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Alumnos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalStudents}</p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Mejores Promedios</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{topStudents.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Bajo Rendimiento</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{lowPerforming.length}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Promedio General</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {topStudents.length > 0 
                      ? (topStudents.reduce((sum, s) => sum + s.average, 0) / topStudents.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Distribución por Nivel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getLevelChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getLevelChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top 5 Mejores Alumnos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getTopStudentsChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 20]} />
                  <Tooltip />
                  <Bar dataKey="promedio" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Alumnos */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Mejores alumnos */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Award className="w-6 h-6 text-green-600" />
                <span>Mejores Alumnos del Colegio</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ranking</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Alumno</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grado</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Promedio</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Literal</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topStudents.map((student, index) => {
                    const literal = getLiteralGrade(student.average);
                    return (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-400 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-400 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{student.student_name}</td>
                        <td className="px-6 py-4 text-gray-600">{student.grade}</td>
                        <td className="px-6 py-4">
                          <span className="text-2xl font-bold text-primary-600">{student.average}</span>
                        </td>
                        {/* 🆕 Columna Literal */}
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg border ${getLiteralColorClasses(literal.color)}`}>
                            {literal.literal}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${getLiteralColorClasses(literal.color)}`}>
                            {literal.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alumnos con bajo rendimiento */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <span>Alumnos con Bajo Rendimiento (Promedio &lt; 11)</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Alumno</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grado</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Profesor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Promedio</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Literal</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lowPerforming.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No hay alumnos con bajo rendimiento
                      </td>
                    </tr>
                  ) : (
                    lowPerforming.map((student) => {
                      const literal = getLiteralGrade(student.average);
                      return (
                        <tr key={student.student_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{student.student_name}</td>
                          <td className="px-6 py-4 text-gray-600">{student.grade}</td>
                          <td className="px-6 py-4 text-gray-600">{student.teacher}</td>
                          <td className="px-6 py-4">
                            <span className="text-2xl font-bold text-red-600">{student.average}</span>
                          </td>
                          {/* 🆕 Columna Literal */}
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg border ${getLiteralColorClasses(literal.color)}`}>
                              {literal.literal}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Asistencia */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {attendanceSummary ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Distribución de Asistencia del Mes</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={getAttendanceChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getAttendanceChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {getAttendanceChartData().map((item, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">{item.name}</p>
                        <p className="text-3xl font-bold mt-1" style={{ color: item.color }}>
                          {item.value}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                        <Calendar className="w-6 h-6" style={{ color: item.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-lg border border-gray-200 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay datos de asistencia</h3>
              <p className="text-gray-600">Registra asistencia en el módulo correspondiente para ver estadísticas</p>
            </div>
          )}
        </div>
      )}

      {/* Vista de Calificaciones */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Promedios de los Mejores Alumnos</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getTopStudentsChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="promedio" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🆕 Tabla con literales */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Detalle de Calificaciones con Literales</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Alumno</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grado</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Promedio</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Literal</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topStudents.map((student) => {
                    const literal = getLiteralGrade(student.average);
                    return (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{student.student_name}</td>
                        <td className="px-6 py-4 text-gray-600">{student.grade}</td>
                        <td className="px-6 py-4">
                          <span className="text-xl font-bold text-primary-600">{student.average}</span>
                        </td>
                        {/* 🆕 Columna Literal */}
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg border ${getLiteralColorClasses(literal.color)}`}>
                            {literal.literal}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${getLiteralColorClasses(literal.color)}`}>
                            {literal.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 🆕 Distribución de literales */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Distribución de Literales en el Colegio</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['AD', 'A', 'B', 'C'].map(literal => {
                const count = topStudents.filter(s => getLiteralGrade(s.average).literal === literal).length;
                const info = getLiteralGrade(literal === 'AD' ? 19 : literal === 'A' ? 15 : literal === 'B' ? 12 : 8);
                return (
                  <div key={literal} className={`p-4 rounded-lg border ${getLiteralColorClasses(info.color)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{info.label}</p>
                        <p className="text-3xl font-bold mt-1">{count}</p>
                        <p className="text-xs mt-1">alumnos</p>
                      </div>
                      <div className="text-5xl font-bold opacity-30">{literal}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;