"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import Link from "next/link";

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${params.id}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result.data);
        } else {
          router.push("/admin/users");
        }
      })
      .catch(() => router.push("/admin/users"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
        <div className="h-48 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl mt-8"></div>
      </div>
    );
  }

  const { user, totalStudents, totalEarnings, branchStats } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/users"
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
        >
          <i className="ri-arrow-left-line text-lg"></i>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Detailed statistics for {user.fullName}</p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:items-center">
        <div className="w-24 h-24 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-3xl overflow-hidden shrink-0 border border-indigo-100">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
          ) : (
            user.fullName.charAt(0).toUpperCase()
          )}
        </div>
        
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-slate-500 font-medium">Name</p>
            <p className="font-bold text-slate-900 mt-1 text-lg">{user.fullName}</p>
            {user.accountType === "coaching_center" && user.coachingName && (
              <span className="inline-flex mt-1 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {user.coachingName}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Contact</p>
            <p className="font-medium text-slate-900 mt-1">{user.email}</p>
            <p className="text-sm text-slate-600">{user.phone}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Account Type</p>
            <p className="font-medium text-slate-900 mt-1 capitalize">{user.accountType.replace("_", " ")}</p>
            <span className={`inline-flex mt-1 items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              user.isBlocked ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? "bg-red-600" : "bg-emerald-600"}`}></span>
              {user.isBlocked ? "Inactive" : "Active"}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Joined On</p>
            <p className="font-medium text-slate-900 mt-1">{dayjs(user.createdAt).format("DD MMM YYYY")}</p>
          </div>
          {user.referredBy && (
            <div>
              <p className="text-sm text-slate-500 font-medium">Referred By</p>
              <p className="font-medium text-slate-900 mt-1">{user.referredBy}</p>
            </div>
          )}
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <i className="ri-team-line text-2xl"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Registered Students</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <i className="ri-money-rupee-circle-line text-2xl"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Earnings Collected</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">₹ {totalEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Branch Breakdown for Coaching Centers */}
      {user.accountType === "coaching_center" && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Branch Performance</h3>
              <p className="text-sm text-slate-500">Breakdown of students and earnings across {branchStats.length} branches</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
              <i className="ri-git-branch-line text-xl"></i>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Branch Name</th>
                  <th className="px-6 py-4 font-semibold text-center">Students</th>
                  <th className="px-6 py-4 font-semibold text-right">Total Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchStats.map((branch: any) => (
                  <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900">{branch.name}</div>
                      {branch.id === "unassigned" && (
                        <div className="text-xs text-amber-600 mt-0.5">Students not linked to any branch</div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg">
                        {branch.students}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-emerald-600 text-base">
                      ₹ {branch.earnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
                
                {branchStats.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-500">
                      No branches found for this coaching center.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
