import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Mail, Phone, MapPin, Calendar, Eye } from 'lucide-react';
import apiService from '../services/api';

interface Employee {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position?: string;
    department?: string;
    location?: string;
    avatar?: string;
    createdAt: string;
  };
  employeeId: string;
  joinDate: string;
  salary: number;
  performance: number;
  status: 'active' | 'inactive' | 'on-leave';
  skills: string[];
}

interface EmployeesSectionProps {
  setActiveTab?: (tab: string) => void;
}

export default function EmployeesSection({ setActiveTab }: EmployeesSectionProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    location: ''
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEmployees();
      setEmployees(response.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const deleteEmployee = async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await apiService.deleteEmployee(employeeId);
      fetchEmployees();
      setSelectedEmployee(null);
      alert('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error deleting employee');
    }
  };

  const updateEmployee = async (employee: Employee, updates: any) => {
    try {
      await apiService.updateEmployee(employee._id, updates);
      fetchEmployees();
      setEditingEmployee(null);
      alert('Employee updated successfully');
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Error updating employee');
    }
  };

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.register({
        ...newEmployee,
        password: 'temp123'
      });
      fetchEmployees();
      setShowAddForm(false);
      setNewEmployee({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        location: ''
      });
      alert('Employee added successfully');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Error adding employee');
    }
  };

  const isAdmin = true; // Check current user role

  const departments = ['all', ...Array.from(new Set(employees.map(emp => emp.user.department).filter(Boolean)))];
  const statuses = ['all', 'active', 'inactive', 'on-leave'];

  const filteredEmployees = employees.filter(emp => {
    const name = `${emp.user.firstName} ${emp.user.lastName}`;
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (emp.user.position || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || emp.user.department === filterDepartment;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Employee Management</h2>
          <p className="text-gray-600">Manage your team members and their information</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#4169E1] text-white rounded-xl hover:bg-[#3559d1] transition-all transform hover:scale-105 shadow-lg"
        >
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
                {filteredEmployees.map((employee) => {
                  const name = `${employee.user.firstName} ${employee.user.lastName}`;
                  const avatar = `${employee.user.firstName[0]}${employee.user.lastName[0]}`;
                  return (
                    <tr key={employee._id} className="hover:bg-blue-50 transition-all cursor-pointer" onClick={() => setSelectedEmployee(employee)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#4169E1] to-[#3559d1] rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                            {avatar}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{name}</div>
                            <div className="text-sm text-gray-500">{employee.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.user.position || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.user.department || 'N/A'}</td>
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
                            onClick={(e) => { e.stopPropagation(); deleteEmployee(employee._id); }}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredEmployees.map((employee) => {
              const name = `${employee.user.firstName} ${employee.user.lastName}`;
              const avatar = `${employee.user.firstName[0]}${employee.user.lastName[0]}`;
              return (
                <div key={employee._id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer border border-gray-100" onClick={() => setSelectedEmployee(employee)}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#4169E1] to-[#3559d1] rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                      {avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{name}</h3>
                      <p className="text-sm text-gray-600">{employee.user.position || 'N/A'}</p>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(employee.status)}`}></span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span>{employee.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span>{employee.user.location || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getPerformanceColor(employee.performance)}`}>
                        {employee.performance}%
                      </div>
                      <div className="text-xs text-gray-500">Performance</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedEmployee(employee); }}
                      className="px-4 py-2 bg-[#4169E1] text-white text-sm rounded-lg hover:bg-[#3559d1] transition-all transform hover:scale-105 shadow-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedEmployee(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Employee Details</h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#4169E1] rounded-full flex items-center justify-center text-white text-xl font-semibold">
                    {`${selectedEmployee.user.firstName[0]}${selectedEmployee.user.lastName[0]}`}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{`${selectedEmployee.user.firstName} ${selectedEmployee.user.lastName}`}</h4>
                    <p className="text-gray-600">{selectedEmployee.user.position || 'N/A'}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(selectedEmployee.status)}`}>
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-gray-700">{selectedEmployee.user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-700">{selectedEmployee.user.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-700">{selectedEmployee.user.location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-700">Joined: {new Date(selectedEmployee.joinDate).toLocaleDateString()}</span>
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
                    <div className="text-2xl font-bold text-blue-600">${selectedEmployee.salary.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Salary</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills && selectedEmployee.skills.length > 0 ? (
                      selectedEmployee.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No skills listed</span>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Department</h5>
                  <p className="text-gray-700">{selectedEmployee.user.department || 'N/A'}</p>
                </div>

                {isAdmin && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => deleteEmployee(selectedEmployee._id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                    >
                      Delete Employee
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Employee</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={addEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newEmployee.firstName}
                  onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newEmployee.lastName}
                  onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              />
              <input
                type="text"
                placeholder="Position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              />
              <input
                type="text"
                placeholder="Department"
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              />
              <input
                type="text"
                placeholder="Location"
                value={newEmployee.location}
                onChange={(e) => setNewEmployee({...newEmployee, location: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4169E1]"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#4169E1] text-white rounded-xl hover:bg-[#3559d1] transition-all"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}