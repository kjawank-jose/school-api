import { useState, useEffect } from "react";
import { studentsAPI, teachersAPI, reportsAPI } from "../services/api";
import {
  Plus,
  GraduationCap,
  Search,
  Filter,
  Users,
  AlertCircle,
} from "lucide-react";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({ total: 0, byLevel: {} });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [error, setError] = useState(null);
  const [newStudent, setNewStudent] = useState({
    dni: "", // 🆕 Agregar DNI
    name: "",
    level: "",
    grade_level: "",
    teacher_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      console.log("🔄 Cargando datos...");

      // Cargar profesores primero
      console.log("📋 Cargando profesores...");
      const teachersRes = await teachersAPI.getAll();
      console.log("✅ Profesores cargados:", teachersRes.data);
      setTeachers(teachersRes.data);

      // Cargar alumnos
      console.log("📋 Cargando alumnos...");
      const studentsRes = await studentsAPI.getAll();
      console.log("✅ Alumnos cargados:", studentsRes.data);
      setStudents(studentsRes.data);

      // Cargar estadísticas
      console.log("📋 Cargando estadísticas...");
      const statsRes = await reportsAPI.getStudentsByLevel();
      console.log("✅ Estadísticas cargadas:", statsRes.data);
      setStats({
        total: statsRes.data.total_students,
        byLevel: statsRes.data.by_level,
      });
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      console.error("Detalles del error:", error.response?.data);
      setError(
        "Error al cargar los datos. Verifica la consola para más detalles.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      console.log("📝 Creando alumno:", newStudent);
      await studentsAPI.create({
        ...newStudent,
        teacher_id: parseInt(newStudent.teacher_id),
      });
      console.log("✅ Alumno creado exitosamente");
      setNewStudent({
        dni: "",
        name: "",
        level: "",
        grade_level: "",
        teacher_id: "",
      });
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("❌ Error creando alumno:", error);
      console.error("Detalles:", error.response?.data);
      alert(
        `Error al matricular alumno: ${error.response?.data?.detail || "Error desconocido"}`,
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchSearch = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchLevel = !filterLevel || student.level === filterLevel;
    const matchGrade = !filterGrade || student.grade_level === filterGrade;
    return matchSearch && matchLevel && matchGrade;
  });

  const getGradesByLevel = (level) => {
    const grades = {
      INICIAL: ["3 años", "4 años", "5 años"],
      PRIMARIA: ["1ro", "2do", "3ro", "4to", "5to", "6to"],
      SECUNDARIA: ["1ro", "2do", "3ro", "4to", "5to"],
    };
    return grades[level] || [];
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
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alumnos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la matrícula de alumnos del colegio
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Alumno</span>
        </button>
      </div>

      {/* Estadísticas por nivel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Alumnos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Inicial</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats.byLevel.INICIAL?.count || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Primaria</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats.byLevel.PRIMARIA?.count || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Secundaria</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {stats.byLevel.SECUNDARIA?.count || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">Todos los grados</option>
            {filterLevel &&
              getGradesByLevel(filterLevel).map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            {!filterLevel && (
              <>
                <option value="1ro">1ro</option>
                <option value="2do">2do</option>
                <option value="3ro">3ro</option>
                <option value="4to">4to</option>
                <option value="5to">5to</option>
                <option value="6to">6to</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Lista de alumnos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  DNI
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Nivel
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Grado
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Profesor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No se encontraron alumnos
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {student.dni}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {student.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          student.level === "INICIAL"
                            ? "bg-blue-100 text-blue-800"
                            : student.level === "PRIMARIA"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {student.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.grade_level}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.teacher_name || "Sin asignar"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para matricular alumno */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Matricular Nuevo Alumno
            </h2>

            {teachers.length === 0 && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                ⚠️ No hay profesores registrados. Primero debes crear
                profesores.
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNI
                </label>
                <input
                  type="text"
                  value={newStudent.dni}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, dni: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: 12345678"
                  maxLength={8}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel educativo
                </label>
                <select
                  value={newStudent.level}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      level: e.target.value,
                      grade_level: "",
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="INICIAL">Inicial</option>
                  <option value="PRIMARIA">Primaria</option>
                  <option value="SECUNDARIA">Secundaria</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grado / Sección
                </label>
                <select
                  value={newStudent.grade_level}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      grade_level: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={!newStudent.level}
                >
                  <option value="">Seleccionar grado</option>
                  {newStudent.level &&
                    getGradesByLevel(newStudent.level).map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profesor asignado ({teachers.length} disponibles)
                </label>
                <select
                  value={newStudent.teacher_id}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, teacher_id: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={teachers.length === 0}
                >
                  <option value="">
                    {teachers.length === 0
                      ? "No hay profesores disponibles"
                      : "Seleccionar profesor"}
                  </option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.subject}
                    </option>
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
                  disabled={teachers.length === 0}
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Matricular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
