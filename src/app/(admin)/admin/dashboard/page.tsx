"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl mt-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Platform statistics and activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-medium text-slate-500 relative z-10">Total Users</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <h2 className="text-3xl font-bold text-slate-900">{data?.totalUsers || 0}</h2>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-medium text-slate-500 relative z-10">Total Teachers</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <h2 className="text-3xl font-bold text-slate-900">{data?.totalTeachers || 0}</h2>
          </div>
        </div>

        {/* Total Coaching Centers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-medium text-slate-500 relative z-10">Coaching Centers</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <h2 className="text-3xl font-bold text-slate-900">{data?.totalCoachingCenters || 0}</h2>
          </div>
        </div>

        {/* Inactive Teachers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-medium text-slate-500 relative z-10">Inactive Teachers</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <h2 className="text-3xl font-bold text-amber-600">{data?.inactiveTeachers || 0}</h2>
          </div>
        </div>

        {/* Inactive Coaching Centers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-medium text-slate-500 relative z-10">Inactive Centers</p>
          <div className="mt-2 flex items-baseline gap-2 relative z-10">
            <h2 className="text-3xl font-bold text-red-600">{data?.inactiveCoachingCenters || 0}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recently Registered Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentUsers?.map((u: any) => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold overflow-hidden">
                        {u.profileImage ? (
                          <img src={u.profileImage} alt={u.fullName} className="w-full h-full object-cover" />
                        ) : (
                          u.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{u.fullName}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 capitalize">
                    {u.accountType.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {dayjs(u.createdAt).format("DD MMM YYYY")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      u.isBlocked 
                        ? "bg-red-50 text-red-600" 
                        : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {u.isBlocked ? "Inactive" : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
              
              {(!data?.recentUsers || data.recentUsers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
