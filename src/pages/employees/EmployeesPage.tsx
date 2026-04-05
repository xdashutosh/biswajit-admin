import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeesApi, Employee } from '../../api/employees';
import { rolesApi, Role } from '../../api/roles';
import { toast } from 'react-hot-toast';
import {
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineEnvelope,
  HiOutlineShieldCheck
} from 'react-icons/hi2';

export default function EmployeesPage() {
  const { hasPermission } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, rolesRes] = await Promise.all([
        employeesApi.getAll({ limit: 100 }),
        rolesApi.getAll()
      ]);
      setEmployees(empRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const openForm = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        name: emp.name,
        email: emp.email,
        password: '', // Blank password unless changing
        role_id: emp.role_id,
        is_active: emp.is_active,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role_id: '',
        is_active: true,
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      
      if (editingEmployee) {
        // Only trigger password update if something was typed 
        if (!payload.password) {
          delete payload.password;
        }
        await employeesApi.update(editingEmployee.id, payload);
        toast.success('Employee updated successfully');
      } else {
        await employeesApi.create(payload);
        toast.success('Employee created successfully');
      }
      closeForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to absolute delete this employee?')) {
      try {
        await employeesApi.delete(id);
        toast.success('Employee deleted successfully');
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete employee');
      }
    }
  };

  if (!hasPermission('employees', 'can_read')) {
    return <div className="p-8"><p className="text-red-500">You do not have permission to view this page.</p></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineUserGroup className="w-6 h-6 text-brand-500" />
            Employees
          </h1>
          <p className="text-slate-500 mt-1">Manage admin panel users and roles.</p>
        </div>
        {hasPermission('employees', 'can_create') && (
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Employee
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading employees...</div>
        ) : (
          <table className="w-full text-left bg-white text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => (
                <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${!emp.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800">{emp.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <HiOutlineEnvelope className="w-4 h-4 shrink-0" />
                      {emp.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <HiOutlineShieldCheck className={`w-4 h-4 shrink-0 ${emp.role_name === 'Super Admin' ? 'text-red-500' : 'text-brand-500'}`} />
                      <span className="font-medium">{emp.role_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {emp.is_active ? (
                      <span className="px-2.5 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full lowercase tracking-wider">Active</span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full lowercase tracking-wider">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {emp.last_login_at ? new Date(emp.last_login_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {emp.role_name !== 'Super Admin' && (
                      <div className="flex items-center justify-end gap-2">
                        {hasPermission('employees', 'can_update') && (
                          <button
                            onClick={() => openForm(emp)}
                            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit Employee"
                          >
                            <HiOutlinePencilSquare className="w-5 h-5" />
                          </button>
                        )}
                        {hasPermission('employees', 'can_delete') && (
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Employee"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center py-10 px-4 sm:px-6 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative mx-auto w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col shrink-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h3>
              <button
                onClick={closeForm}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                  required
                >
                  <option value="" disabled>Select a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password {!editingEmployee && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  placeholder={editingEmployee ? "Leave blank to keep current password" : ""}
                  required={!editingEmployee}
                  minLength={6}
                />
              </div>

              {editingEmployee && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 focus:ring-offset-0 border-slate-300"
                  />
                  <div>
                    <label htmlFor="is_active" className="text-sm font-bold text-slate-800 block cursor-pointer">
                      Account Active
                    </label>
                    <p className="text-xs text-slate-500">Inactive users cannot log in to the admin panel.</p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-500 text-white font-medium hover:bg-brand-600 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <HiOutlineCheck className="w-5 h-5" />
                  {editingEmployee ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
