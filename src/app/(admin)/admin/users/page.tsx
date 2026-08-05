"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    accountType: "teacher",
    coachingName: "",
  });
  const [branches, setBranches] = useState<string[]>([]);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setUsers(result.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, isBlocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !isBlocked } : u));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddBranch = () => {
    setBranches([...branches, ""]);
  };

  const handleBranchChange = (index: number, value: string) => {
    const newBranches = [...branches];
    newBranches[index] = value;
    setBranches(newBranches);
  };

  const handleRemoveBranch = (index: number) => {
    const newBranches = branches.filter((_, i) => i !== index);
    setBranches(newBranches);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone && formData.phone.length > 10) {
      toast.error("Phone number must not exceed 10 digits");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        ...formData,
        branches: branches.filter(b => b.trim() !== ""),
      };
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User created successfully");
        setShowModal(false);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          accountType: "teacher",
          coachingName: "",
        });
        setBranches([]);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Users</h1>
          <p className="text-sm text-slate-500 mt-1">Add, update and monitor platform users</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-600/20 flex items-center gap-2"
        >
          <i className="ri-user-add-line"></i>
          Register User
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">User Details</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold text-center">Stats</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <i className="ri-loader-4-line text-3xl text-indigo-600 animate-spin"></i>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 overflow-hidden">
                          {u.profileImage ? (
                            <img src={u.profileImage} alt={u.fullName} className="w-full h-full object-cover" />
                          ) : (
                            u.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.fullName}</div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5 uppercase tracking-wider">
                            {u.accountType.replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{u.email}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{u.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-medium text-slate-600">
                          {u.totalStudents} Students
                        </span>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-medium text-slate-600">
                          {u.totalBatches} Batches
                        </span>
                        {u.accountType === "coaching_center" && (
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded-md font-medium text-slate-600">
                            {u.totalBranches} Branches
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        u.isBlocked 
                          ? "bg-red-50 text-red-600 border border-red-200" 
                          : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? "bg-red-600" : "bg-emerald-600"}`}></span>
                        {u.isBlocked ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/users/${u._id}`}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-colors bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1"
                        >
                          <i className="ri-bar-chart-box-line"></i> View
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(u._id, u.isBlocked)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                            u.isBlocked
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {u.isBlocked ? "Activate" : "Deactivate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Register New User</h2>
              <p className="text-sm text-slate-500 mt-1">Create a teacher or coaching center account</p>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Type</label>
                <select 
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                >
                  <option value="teacher">Teacher</option>
                  <option value="coaching_center">Coaching Center</option>
                </select>
              </div>

              {formData.accountType === "coaching_center" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Coaching Center Name</label>
                  <input
                    required
                    type="text"
                    name="coachingName"
                    value={formData.coachingName}
                    onChange={handleChange}
                    placeholder="e.g. Excellence Academy"
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  required
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                />
              </div>

              {formData.accountType === "coaching_center" && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">
                      Branches (Optional)
                    </label>
                    <button 
                      type="button"
                      onClick={handleAddBranch}
                      className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1"
                    >
                      <i className="ri-add-line"></i> Add Branch
                    </button>
                  </div>
                  
                  {branches.length === 0 && (
                    <p className="text-xs text-slate-500">
                      You can add multiple branches for your coaching center.
                    </p>
                  )}

                  {branches.map((branch, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => handleBranchChange(index, e.target.value)}
                        placeholder={`Branch ${index + 1} Name (e.g. Main Branch)`}
                        className="h-10 flex-1 bg-slate-50 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBranch(index)}
                        className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  required
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 disabled:opacity-70 flex items-center gap-2"
                >
                  {creating && <i className="ri-loader-4-line animate-spin"></i>}
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
