import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, BookOpen, Award, AlertCircle, GraduationCap } from 'lucide-react';

const StudentPortal = () => {
  const [student, setStudent] = useState(null);
  const [reportCard, setReportCard] = useState(null);
  const [selectedBimester, setSelectedBimester] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const studentData = localStorage.getItem('student_data');
    if (studentData) {
      setStudent(JSON.parse(studentData));
      loadReportCard(1);
    } else {
      navigate('/student-login');
    }
  }, []);

  const loadReportCard = async (bimester) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('student_token');
      const response = await axios.get(
        `http://127.0.0.1:8000/reports/student/${student.id}/report-card?bimester=${bimester}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setReportCard(response.data);
    } catch (error) {
      console.error('Error cargando libreta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBimesterChange = (bimester) => {
    setSelectedBimester(bimester);
    loadReportCard(bimester);
  };

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_data');
    navigate('/student-login');
  };

  const getLiteralColor = (literal) => {
    switch (literal) {
      case 'AD': return 'bg-green-100 text-green-800 border-green-200';
      case 'A': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portal del Estudiante</h1>
                <p className="text-sm text-gray-600">{student.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del estudiante */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">DNI</p>
              <p className="text-lg font-bold text-gray-900">{student.dni}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nivel</p>
              <p className="text-lg font-bold text-gray-900">{student.level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Grado</p>
              <p className="text-lg font-bold text-gray-900">{student.grade}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bimestre Actual</p>
              <p className="text-lg font-bold text-blue-600">{selectedBimester}</p>
            </div>
          </div>
        </div>

        {/* Selector de bimestre */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
            Seleccionar Bimestre
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((bimester) => (
              <button
                key={bimester}
                onClick={() => handleBimesterChange(bimester)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedBimester === bimester
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <p className="text-sm text-gray-600">Bimestre</p>
                <p className="text-2xl font-bold">{bimester}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Libreta de notas */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reportCard ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <h2 className="text-2xl font-bold flex items-center">
                <Award className="w-7 h-7 mr-2" />
                Libreta de Notas - Bimestre {selectedBimester}
              </h2>
              <p className="text-sm mt-1 opacity-90">
                Períodos incluidos: {reportCard.periods_included.join(', ')}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Materia</th>
                    {reportCard.periods_included.map(period => (
                      <th key={period} className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        {period}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Promedio</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Literal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportCard.subjects.map((subject, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{subject.subject}</td>
                      {reportCard.periods_included.map(period => {
                        const grade = subject.grades.find(g => g.period === period);
                        return (
                          <td key={period} className="px-6 py-4 text-center">
                            {grade ? (
                              <span className="text-lg font-bold text-gray-900">{grade.score}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-center">
                        <span className="text-xl font-bold text-blue-600">{subject.average}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg border ${getLiteralColor(subject.literal.literal)}`}>
                          {subject.literal.literal}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr>
                    <td className="px-6 py-4 font-bold text-gray-900">PROMEDIO GENERAL</td>
                    {reportCard.periods_included.map(period => (
                      <td key={period} className="px-6 py-4"></td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-blue-600">{reportCard.general_average}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg font-bold text-xl border ${getLiteralColor(reportCard.general_literal.literal)}`}>
                        {reportCard.general_literal.literal}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Leyenda */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Escala de Calificaciones (MINEDU)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold">AD</div>
                  <div>
                    <p className="text-xs font-medium">Logro Destacado</p>
                    <p className="text-xs text-gray-600">18-20</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold">A</div>
                  <div>
                    <p className="text-xs font-medium">Logro Esperado</p>
                    <p className="text-xs text-gray-600">14-17</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-500 text-white rounded-lg flex items-center justify-center font-bold">B</div>
                  <div>
                    <p className="text-xs font-medium">En Proceso</p>
                    <p className="text-xs text-gray-600">11-13</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold">C</div>
                  <div>
                    <p className="text-xs font-medium">En Inicio</p>
                    <p className="text-xs text-gray-600">0-10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay calificaciones registradas</h3>
            <p className="text-gray-600">Aún no se han registrado notas para este bimestre</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPortal;