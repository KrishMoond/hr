import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Mail, Phone, MapPin, Calendar, Award, TrendingUp, Eye } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  location: string;
  joinDate: string;
  salary: number;
  performance: number;
  status: 'active' | 'inactive' | 'on-leave';
  avatar: string;
  projects: number;
  skills: string[];
}

interface EmployeesSectionProps {
  setActiveTab?: (tab: string) => void;
}

export default function EmployeesSection({ setActiveTab }: EmployeesSectionProps) {
  const [employees] = useState<Employee[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      phone: '+1 (555) 123-4567',
      position: 'Senior Developer',
      department: 'Engineering',
      location: 'New York, NY',
      joinDate: '2022-03-15',
      salary: 95000,
      performance: 92,
      status: 'active',
      avatar: 'SJ',
      projects: 5,
      skills: ['React', 'TypeScript', 'Node.js']
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike.c@company.com',
      phone: '+1 (555) 234-5678',
      position: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      joinDate: '2021-08-20',
      salary: 110000,
      performance: 87,
      status: 'active',
      avatar: 'MC',
      projects: 3,
      skills: ['Strategy', 'Analytics', 'Leadership']
    },
    {
      id: 3,
      name: 'Lisa Rodriguez',
      email: 'lisa.r@company.com',
      phone: '+1 (555) 345-6789',
      position: 'UX Designer',
      department: 'Design',
      location: 'Austin, TX',
      joinDate: '2023-01-10',
      salary: 78000,
      performance: 95,
      status: 'on-leave',
      avatar: 'LR',
      projects: 4,
      skills: ['Figma', 'User Research', 'Prototyping']
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.k@company.com',
      phone: '+1 (555) 456-7890',
      position: 'Data Analyst',
      department: 'Analytics',
      location: 'Seattle, WA',
      joinDate: '2022-11-05',
      salary: 72000,
      performance: 89,
      status: 'active',
      avatar: 'DK',
      projects: 6,
      skills: ['Python', 'SQL', 'Tableau']
    },
    {
      id: 5,
      name: 'Emma Wilson',
      email: 'emma.w@company.com',
      phone: '+1 (555) 567-8901',
      position: 'Marketing Manager',
      department: 'Marketing',
      location: 'Chicago, IL',
      joinDate: '2021-05-12',
      salary: 85000,
      performance: 91,
      status: 'active',
      avatar: 'EW',
      projects: 7,
      skills: ['Digital Marketing', 'SEO', 'Content Strategy']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedEmployeeLeaves, setSelectedEmployeeLeaves] = useState<any[]>([]);

  // Load leaves when an employee is selected (works when employee has a backend user id in _id)
  useEffect(() => {
    const loadLeavesForEmployee = async () => {
      if (!selectedEmployee) return;
      // If selectedEmployee has a backend id field (e.g., _id or id that is an ObjectId), try to fetch
      const empId = (selectedEmployee as any)._id || (selectedEmployee as any).userId || null;
      if (!empId) {
        setSelectedEmployeeLeaves([]);
        return;
      }

      try {
        const api = await import('../services/api');
        const leaves = await api.default.getLeaves({ employee: empId });
        setSelectedEmployeeLeaves(leaves);
      } catch (err) {
        console.error('Failed to load leaves for employee', err);
        setSelectedEmployeeLeaves([]);
      }
    };

    loadLeavesForEmployee();
  }, [selectedEmployee]);

  const departments = ['all', ...Array.from(new Set(employees.map(emp => emp.department)))];
  const statuses = ['all', 'active', 'inactive', 'on-leave'];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'on-leave': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Employee Management</h2>
          <p className="text-gray-600">Manage your team members and their information</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#4169E1] text-white rounded-xl hover:bg-[#3559d1] transition-all transform hover:scale-105 shadow-lg">
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search employees by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent transition-all"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1] focus:border-transparent transition-all"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            
            <div className="flex border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-3 transition-all ${viewMode === 'table' ? 'bg-[#4169E1] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 transition-all ${viewMode === 'grid' ? 'bg-[#4169E1] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-blue-50 transition-all cursor-pointer" onClick={() => setSelectedEmployee(employee)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#4169E1] to-[#3559d1] rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                          {employee.avatar}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`text-sm font-semibold ${getPerformanceColor(employee.performance)}`}>
                          {employee.performance}%
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#4169E1] h-2 rounded-full"
                            style={{ width: `${employee.performance}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedEmployee(employee); }}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer border border-gray-100" onClick={() => setSelectedEmployee(employee)}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#4169E1] to-[#3559d1] rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                    {employee.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(employee.status)}`}></span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span>{employee.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getPerformanceColor(employee.performance)}`}>
                      {employee.performance}%
                    </div>
                    <div className="text-xs text-gray-500">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{employee.projects}</div>
                    <div className="text-xs text-gray-500">Projects</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedEmployee(employee); }}
                    className="px-4 py-2 bg-[#4169E1] text-white text-sm rounded-lg hover:bg-[#3559d1] transition-all transform hover:scale-105 shadow-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => { setSelectedEmployee(null); setSelectedEmployeeLeaves([]); }}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Employee Details</h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#4169E1] rounded-full flex items-center justify-center text-white text-xl font-semibold">
                    {selectedEmployee.avatar}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedEmployee.name}</h4>
                    <p className="text-gray-600">{selectedEmployee.position}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(selectedEmployee.status)}`}>
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-700">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-700">{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-700">{selectedEmployee.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-700">Joined: {selectedEmployee.joinDate}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getPerformanceColor(selectedEmployee.performance)}`}>
                      {selectedEmployee.performance}%
                    </div>
                    <div className="text-sm text-gray-600">Performance</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedEmployee.projects}</div>
                    <div className="text-sm text-gray-600">Active Projects</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Department</h5>
                  <p className="text-gray-700">{selectedEmployee.department}</p>
                </div>
              </div>
              {/* Employee Leaves (if any) */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Leaves</h4>
                {selectedEmployeeLeaves.length === 0 ? (
                  <p className="text-sm text-gray-500">No leaves found for this employee.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedEmployeeLeaves.map((leave: any) => (
                      <div key={leave._id} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div className="font-medium capitalize">{leave.type} leave</div>
                          <div className="text-sm text-gray-500">{leave.status}</div>
                        </div>
                        <div className="text-sm text-gray-500">{leave.days} days • {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</div>
                        <div className="mt-2 text-sm text-gray-700">{leave.reason}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Employee Projects */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Current Projects</h4>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedEmployee.projects}</div>
                  <div className="text-sm text-gray-600">Active Projects</div>
                  {setActiveTab && (
                    <button 
                      onClick={() => setActiveTab('my-projects')}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all"
                    >
                      View All Projects
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}