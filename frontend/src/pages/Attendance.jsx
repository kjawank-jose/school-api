import { useState, useEffect } from 'react';
import { studentsAPI, attendanceAPI } from '../services/api';
import { Calendar, CheckCircle2, XCircle, Clock, FileCheck, Search, Filter, Save, Users } from 'lucide-react';

const ATTENDANCE_STATES = [
  { value: 'PRESENTE', label: 'Presente', color: 'green', icon: CheckCircle2 },
  { value: 'TARDANZA', label: 'Tardanza', color: 'yellow', icon: Clock },
  { value: 'FALTA', label: 'Falta', color: 'red', icon: XCircle },
  { value: 'JUSTIFICADO', label: 'Justificado', color: 'blue', icon: FileCheck }
];

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [observations, setObservations] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [stats, setStats] = useState({ presente: 0, tardanza: 0, falta: 0, justificado: 0 });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAttendanceForDate();
  }, [selectedDate]);

  useEffect(() => {
    calculateStats();
  }, [attendanceRecords]);

  const loadData = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      console.error('Error cargando alumnos:', error);
      showMessage('Error al cargar los alumnos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceForDate = async () => {
    try {
      const response = await attendanceAPI.getByDate(selectedDate);
      const records = {};
      const obs = {};
      
      response.data.records.forEach(record => {
        records[record.student_id] = record.status;
        if (record.observations) {
          obs[record.student_id] = record.observations;
        }
      });
      
      setAttendanceRecords(records);
      setObservations(obs);
    } catch (error) {
      console.error('Error cargando asistencia:', error);
      setAttendanceRecords({});
      setObservations({});
    }
  };

  const calculateStats = () => {
    const newStats = { presente: 0, tardanza: 0, falta: 0, justificado: 0 };
    Object.values(attendanceRecords).forEach(status => {
      if (status === 'PRESENTE') newStats.presente++;
      else if (status === 'TARDANZA') newStats.tardanza++;
      else if (status === 'FALTA') newStats.falta++;
      else if (status === 'JUSTIFICADO') newStats.justificado++;
    });
    setStats(newStats);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleObservationChange = (studentId, value) => {
    setObservations(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const markAllAs = (status) => {
    const newRecords = { ...attendanceRecords };
    filteredStudents.forEach(student => {
      newRecords[student.id] = status;
    });
    setAttendanceRecords(newRecords);
  };

  const handleSave = async () => {
    const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      student_id: parseInt(studentId),
      status: status,
      observations: observations[studentId] || null
    }));

    if (records.length === 0) {
      showMessage('No hay asistencia para registrar', 'warning');
      return;
    }

    setSaving(true);
    try {
      await attendanceAPI.createBulk({
        date: selectedDate,
        records: records
      });
      showMessage(`✅ Asistencia guardada para ${records.length} alumnos`, 'success');
    } catch (error) {
      console.error('Error guardando asistencia:', error);
      showMessage(`Error: ${error.response?.data?.detail || 'Error al guardar'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const getGradesByLevel = (level) => {
    const grades = {
      'INICIAL': ['3 años', '4 años', '5 años'],
      'PRIMARIA': ['1ro', '2do', '3ro', '4to', '5to', '6to'],
      'SECUNDARIA': ['1ro', '2do', '3ro', '4to', '5to']
    };
    return grades[level] || [];
  };

  const filteredStudents = students.filter(student => {
    const matchSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = !filterLevel || student.level === filterLevel;
    const matchGrade = !filterGrade || student.grade_level === filterGrade;
    return matchSearch && matchLevel && matchGrade;
  });

  const getStatusColor = (status) => {
    const state = ATTENDANCE_STATES.find(s => s.value === status);
    return state ? state.color : 'gray';
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
      {/* Mensaje de notificación */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all ${
          message.type === 'success' ? 'bg-green-500 text-white' :
          message.type === 'error' ? 'bg-red-500 text-white' :
          'bg-yellow-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control de Asistencia</h1>
          <p className="text-gray-600 mt-1">Registra la asistencia diaria de los alumnos</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || Object.keys(attendanceRecords).length === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Guardando...' : 'Guardar Asistencia'}</span>
        </button>
      </div>

      {/* Selector de fecha */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="w-6 h-6 text-primary-600" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Alumnos marcados</p>
            <p className="text-2xl font-bold text-primary-600">
              {Object.keys(attendanceRecords).length} / {students.length}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {ATTENDANCE_STATES.map(state => {
          const Icon = state.icon;
          const count = stats[state.value.toLowerCase()];
          return (
            <div key={state.value} className={`bg-white p-4 rounded-xl shadow border-l-4 border-${state.color}-500`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{state.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <Icon className={`w-8 h-8 text-${state.color}-500`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Acciones rápidas (aplicar a alumnos filtrados):</p>
        <div className="flex flex-wrap gap-2">
          {ATTENDANCE_STATES.map(state => (
            <button
              key={state.value}
              onClick={() => markAllAs(state.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition bg-${state.color}-100 text-${state.color}-800 hover:bg-${state.color}-200`}
            >
              Marcar todos como {state.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar alumno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterLevel}
            onChange={(e) => { setFilterLevel(e.target.value); setFilterGrade(''); }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
          >
            <option value="">Todos los niveles</option>
            <option value="INICIAL">Inicial</option>
            <option value="PRIMARIA">Primaria</option>
            <option value="SECUNDARIA">Secundaria</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
          >
            <option value="">Todos los grados</option>
            {filterLevel && getGradesByLevel(filterLevel).map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de alumnos con checkboxes de asistencia */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Alumno</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron alumnos
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const currentStatus = attendanceRecords[student.id];
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-${
                            currentStatus ? getStatusColor(currentStatus) : 'gray'
                          }-500`}>
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.level}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.grade_level}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {ATTENDANCE_STATES.map(state => {
                            const Icon = state.icon;
                            const isSelected = currentStatus === state.value;
                            return (
                              <button
                                key={state.value}
                                onClick={() => handleStatusChange(student.id, state.value)}
                                className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-full transition ${
                                  isSelected
                                    ? `bg-${state.color}-500 text-white shadow-md`
                                    : `bg-${state.color}-100 text-${state.color}-800 hover:bg-${state.color}-200`
                                }`}
                                title={state.label}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{state.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={observations[student.id] || ''}
                          onChange={(e) => handleObservationChange(student.id, e.target.value)}
                          placeholder="Agregar observación..."
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
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
  );
};

export default Attendance;