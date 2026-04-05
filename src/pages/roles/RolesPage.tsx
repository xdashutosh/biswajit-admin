import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { rolesApi, Role, RolePermission } from '../../api/roles';
import { toast } from 'react-hot-toast';
import {
  HiOutlineIdentification,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineCheck,
} from 'react-icons/hi2';

export default function RolesPage() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Permission Matrix State
  const [permissions, setPermissions] = useState<Record<string, RolePermission>>({});

  const MODULES = [
    'dashboard', 'news', 'jobs', 'currents', 'letters', 'podcasts',
    'polls', 'projects', 'complaints', 'fake_news', 'green_challenges',
    'ideas', 'master_data', 'rewards', 'youth_events', 'youth_internships',
    'users', 'employees', 'roles', 'settings'
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const { data } = await rolesApi.getAll();
      setRoles(data);
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  const openForm = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
      });

      // Populate permissions
      const initialPerms = {} as Record<string, RolePermission>;
      MODULES.forEach(mod => {
        const existing = role.permissions?.find(p => p.module === mod);
        initialPerms[mod] = existing || {
          module: mod,
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false,
        };
      });
      setPermissions(initialPerms);
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '' });

      // Initialize empty permissions
      const initialPerms = {} as Record<string, RolePermission>;
      MODULES.forEach(mod => {
        initialPerms[mod] = {
          module: mod,
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false,
        };
      });
      setPermissions(initialPerms);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRole(null);
  };

  const handlePermissionChange = (module: string, action: keyof Omit<RolePermission, 'module'>, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: checked
      }
    }));
  };

  const toggleModulePermissions = (module: string, checkAll: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        module,
        can_create: checkAll,
        can_read: checkAll,
        can_update: checkAll,
        can_delete: checkAll,
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payloadPermissions = Object.values(permissions).filter(
        p => p.can_create || p.can_read || p.can_update || p.can_delete
      );

      const payload = {
        name: formData.name,
        description: formData.description,
        permissions: payloadPermissions,
      };

      if (editingRole) {
        await rolesApi.update(editingRole.id, payload);
        toast.success('Role updated successfully');
      } else {
        await rolesApi.create(payload);
        toast.success('Role created successfully');
      }
      closeForm();
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone if no employees are assigned.')) {
      try {
        await rolesApi.delete(id);
        toast.success('Role deleted successfully');
        fetchRoles();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  if (!hasPermission('roles', 'can_read')) {
    return <div className="p-8"><p className="text-red-500">You do not have permission to view this page.</p></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineIdentification className="w-6 h-6 text-brand-500" />
            Roles & Permissions
          </h1>
          <p className="text-slate-500 mt-1">Manage system roles and their access levels across modules.</p>
        </div>
        {hasPermission('roles', 'can_create') && (
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            New Role
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading roles...</div>
        ) : (
          <table className="w-full text-left bg-white">
            <thead className="bg-slate-50 text-slate-600 text-sm font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Role Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Total Capabilities</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map(role => {
                const totalPerms = role.permissions?.length || 0;
                return (
                  <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">{role.name}</span>
                      {role.name === 'Super Admin' && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-md font-bold uppercase">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 line-clamp-1">{role.description || 'No description'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {totalPerms} modules
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {role.name !== 'Super Admin' && (
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission('roles', 'can_update') && (
                            <button
                              onClick={() => openForm(role)}
                              className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                              title="Edit Role"
                            >
                              <HiOutlinePencilSquare className="w-5 h-5" />
                            </button>
                          )}
                          {hasPermission('roles', 'can_delete') && (
                            <button
                              onClick={() => handleDelete(role.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Role"
                            >
                              <HiOutlineTrash className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex py-10 px-4 sm:px-6 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative mx-auto w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col my-auto max-h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h3>
              <button
                onClick={closeForm}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden min-h-0">
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      placeholder="e.g. Editor, Moderator"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      placeholder="Role responsibilities..."
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Module Permissions</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Module</th>
                          <th className="px-4 py-3 font-semibold text-center w-24">Read</th>
                          <th className="px-4 py-3 font-semibold text-center w-24">Create</th>
                          <th className="px-4 py-3 font-semibold text-center w-24">Update</th>
                          <th className="px-4 py-3 font-semibold text-center w-24">Delete</th>
                          <th className="px-4 py-3 font-semibold text-center w-24 border-l border-slate-200">All</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MODULES.map(mod => {
                          const p = permissions[mod] || {};
                          const allChecked = p.can_read && p.can_create && p.can_update && p.can_delete;
                          return (
                            <tr key={mod} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-medium text-slate-700 capitalize">{mod.replace('_', ' ')}</td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 focus:ring-offset-0 border-slate-300"
                                  checked={p.can_read}
                                  onChange={(e) => handlePermissionChange(mod, 'can_read', e.target.checked)}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 focus:ring-offset-0 border-slate-300"
                                  checked={p.can_create}
                                  onChange={(e) => handlePermissionChange(mod, 'can_create', e.target.checked)}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 focus:ring-offset-0 border-slate-300"
                                  checked={p.can_update}
                                  onChange={(e) => handlePermissionChange(mod, 'can_update', e.target.checked)}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 focus:ring-offset-0 border-slate-300"
                                  checked={p.can_delete}
                                  onChange={(e) => handlePermissionChange(mod, 'can_delete', e.target.checked)}
                                />
                              </td>
                              <td className="px-4 py-3 text-center border-l border-slate-200 bg-slate-50/50">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 focus:ring-offset-0 border-slate-300"
                                  checked={allChecked}
                                  onChange={(e) => toggleModulePermissions(mod, e.target.checked)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50">
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
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
