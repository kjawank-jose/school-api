import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  BarChart3,
  School
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/teachers', icon: Users, label: 'Profesores' },
    { path: '/students', icon: GraduationCap, label: 'Alumnos' },
    { path: '/grades', icon: BookOpen, label: 'Calificaciones' },
    { path: '/attendance', icon: Calendar, label: 'Asistencia' },
    { path: '/reports', icon: BarChart3, label: 'Reportes' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 text-primary-600">
          <School className="w-8 h-8" />
          <span className="text-xl font-bold">Colegio</span>
        </div>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-6 py-3 transition ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;