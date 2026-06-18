import { useState, useEffect } from 'react';
import { studentsAPI, gradesAPI } from '../services/api';
import { Plus, BookOpen, Search, AlertCircle, Info } from 'lucide-react';

// 📚 Lista de materias del colegio
const SUBJECTS = [
  'Matemáticas',
  'Comunicación',
  'Ciencias Sociales',
  'Ciencias y Tecnología',
  'Inglés',
  'Educación Física',
  'Arte y Cultura',
  'Educación Religiosa',
  'Tutoría',
  'Física',
  'Química',
  'Biología',
  'Historia del Perú',
  'Geografía',
  'Formación Ciudadana',
  'Computación',
  'Psicomotricidad',
  'Razonamiento Matemático',
  'Razonamiento Verbal'
];

const PERIODS = ['Bimestre 1', 'Bimestre 2', 'Bimestre 3', 'Bimestre 4'];

// 📊 Función para convertir nota numérica a literal (sistema peruano MINEDU)
const getLiteralGrade = (score) => {
  if (score >= 18) return { literal: 'AD', label: 'Logro Destacado', color: 'green' };
  if (score >= 14) return { literal: 'A', label: 'Logro Esperado', color: 'blue' };
  if (score >= 11) return { literal: 'B', label: 'En Proceso', color: 'yellow' };
  return { literal: 'C', label: 'En Inicio', color: 'red' };
};

const Grades = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [newGrade, setNewGrade] = useState({
    student_id: '',
    subject: '',
    score: '',
    period: ''
  });
  const [bulkGrades, setBulkGrades] = useState([
    { student_id: '', subject: '', score: '', period: '' }
  ]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setError(null);
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      console.error('❌ Error cargando alumnos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await gradesAPI.create(parseInt(newGrade.student_id), {
        subject: newGrade.subject,
        score: parseFloat(newGrade.score),
        period: newGrade.period
      });
      setNewGrade({ student_id: '', subject: '', score: '', period: '' });
      setShowModal(false);
      alert('✅ Calificación registrada correctamente');
    } catch (error) {
      alert(`Error: ${error.response?.data?.detail || 'Error desconocido'}`);
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    try {
      const validGrades = bulkGrades.filter(g => g.student_id && g.subject && g.score && g.period);
      
      if (validGrades.length === 0) {
        alert('No hay calificaciones válidas para registrar');
        return;
      }

      const gradesData = {
        grades: validGrades.map(g => ({
          student_id: parseInt(g.student_id),
          subject: g.subject,
          score: parseFloat(g.score),
          period: g.period
        }))
      };

      await gradesAPI.createBulk(gradesData);
      setBulkGrades([{ student_id: '', subject: '', score: '', period: '' }]);
      setShowBulkModal(false);
      alert(`✅ ${validGrades.length} calificaciones registradas correctamente`);
    } catch (error) {
      alert(`Error: ${error.response?.data?.detail || 'Error desconocido'}`);
    }
  };

  const addBulkRow = () => {
    setBulkGrades([...bulkGrades, { student_id: '', subject: '', score: '', period: '' }]);
  };

  const removeBulkRow = (index) => {
    setBulkGrades(bulkGrades.filter((_, i) => i !== index));
  };

  const updateBulkRow = (index, field, value) => {
    const updated = [...bulkGrades];
    updated[index][field] = value;
    setBulkGrades(updated);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calificaciones</h1>
          <p className="text-gray-600 mt-1">Registra y gestiona las notas de los alumnos</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Carga Masiva</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Calificación</span>
          </button>
        </div>
      </div>

      {/* 📊 Leyenda de calificaciones literales */}
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

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar alumno por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Lista de alumnos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Alumno</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nivel</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Grado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron alumnos
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">#{student.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        student.level === 'INICIAL' ? 'bg-blue-100 text-blue-800' :
                        student.level === 'PRIMARIA' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {student.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{student.grade_level}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setNewGrade({...newGrade, student_id: student.id.toString()});
                          setShowModal(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Registrar Nota</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Calificación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Registrar Calificación</h2>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alumno</label>
                <select
                  value={newGrade.student_id}
                  onChange={(e) => setNewGrade({...newGrade, student_id: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Seleccionar alumno</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.grade_level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materia</label>
                <select
                  value={newGrade.subject}
                  onChange={(e) => setNewGrade({...newGrade, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Seleccionar materia</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* 🆕 Campo de nota con literal automático */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nota (0-20)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={newGrade.score}
                    onChange={(e) => setNewGrade({...newGrade, score: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: 15.5"
                    required
                  />
                  {newGrade.score && (
                    <div className={`px-4 py-3 rounded-lg font-bold text-lg min-w-[80px] text-center ${
                      getLiteralGrade(parseFloat(newGrade.score)).color === 'green' ? 'bg-green-100 text-green-800' :
                      getLiteralGrade(parseFloat(newGrade.score)).color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      getLiteralGrade(parseFloat(newGrade.score)).color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getLiteralGrade(parseFloat(newGrade.score)).literal}
                    </div>
                  )}
                </div>
                {newGrade.score && (
                  <p className={`text-xs mt-1 ${
                    getLiteralGrade(parseFloat(newGrade.score)).color === 'green' ? 'text-green-600' :
                    getLiteralGrade(parseFloat(newGrade.score)).color === 'blue' ? 'text-blue-600' :
                    getLiteralGrade(parseFloat(newGrade.score)).color === 'yellow' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {getLiteralGrade(parseFloat(newGrade.score)).label}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                <select
                  value={newGrade.period}
                  onChange={(e) => setNewGrade({...newGrade, period: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Seleccionar período</option>
                  {PERIODS.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Carga Masiva */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Carga Masiva de Calificaciones</h2>
            
            <form onSubmit={handleBulkCreate} className="space-y-6">
              <div className="space-y-4">
                {bulkGrades.map((grade, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg">
                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Alumno</label>
                      <select
                        value={grade.student_id}
                        onChange={(e) => updateBulkRow(index, 'student_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        required
                      >
                        <option value="">Seleccionar</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Materia</label>
                      <select
                        value={grade.subject}
                        onChange={(e) => updateBulkRow(index, 'subject', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        required
                      >
                        <option value="">Seleccionar</option>
                        {SUBJECTS.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nota</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={grade.score}
                        onChange={(e) => updateBulkRow(index, 'score', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder="15.5"
                        required
                      />
                    </div>

                    {/* 🆕 Columna Literal calculada automáticamente */}
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Literal</label>
                      {grade.score ? (
                        <div className={`px-3 py-2 rounded-lg text-center font-bold text-sm ${
                          getLiteralGrade(parseFloat(grade.score)).color === 'green' ? 'bg-green-100 text-green-800' :
                          getLiteralGrade(parseFloat(grade.score)).color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          getLiteralGrade(parseFloat(grade.score)).color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getLiteralGrade(parseFloat(grade.score)).literal}
                        </div>
                      ) : (
                        <div className="px-3 py-2 rounded-lg text-center text-gray-400 text-sm bg-gray-100">
                          -
                        </div>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Período</label>
                      <select
                        value={grade.period}
                        onChange={(e) => updateBulkRow(index, 'period', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        required
                      >
                        <option value="">Seleccionar</option>
                        {PERIODS.map(period => (
                          <option key={period} value={period}>{period}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1">
                      {bulkGrades.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBulkRow(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addBulkRow}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                + Agregar otra calificación
              </button>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Registrar Todas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;