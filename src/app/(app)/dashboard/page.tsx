"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import toast from "react-hot-toast";

interface DashboardData {
  totalStudents: number;
  totalBatches: number;
  monthlyRevenue: number;
  recentPayments: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  async function loadDashboardAndUser() {
    try {
      const [dashRes, userRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/auth/me"),
      ]);

      const dashResult = await dashRes.json();
      const userResult = await userRes.json();

      if (dashResult.success) {
        setData(dashResult.data);
      } else {
        toast.error("Failed to load dashboard data");
      }

      if (userResult.success) {
        setUser(userResult.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardAndUser();
  }, []);

  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return "Good Morning!";
    if (hour < 17) return "Good Afternoon!";
    return "Good Evening!";
  };

  const getFirstName = (fullName?: string) => {
    if (!fullName) return "User";
    return fullName.split(" ")[0];
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Dynamic Mobile Header */}
      <div className="flex items-center z-50 justify-between py-2 px-4 bg-slate-50 border-b border-slate-200 sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/profile">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-lg cursor-pointer hover:opacity-90 transition">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.fullName?.charAt(0).toUpperCase() || "U"
              )}
            </div>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              Hi, {getFirstName(user?.fullName)}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {getGreeting()}
            </p>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button className="flex h-12 w-12 items-center justify-center rounded-full  text-slate-700 transition relative">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-28 bg-slate-200 animate-pulse rounded-2xl"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-14 bg-slate-200 animate-pulse rounded-full"></div>
            <div className="h-14 bg-slate-200 animate-pulse rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-slate-200 animate-pulse rounded-2xl"></div>
            <div className="h-24 bg-slate-200 animate-pulse rounded-2xl"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Balance Section */}
          <div className="mx-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F7F5FE] to-[#F2EFFF] border border-indigo-100 p-5 ">
            {/* Background Illustration */}
            <div className="absolute right-0 bottom-0 w-[55%] h-full pointer-events-none">
              <img
                src="/images/dash-bg.webp"
                alt="School"
                className="w-full h-full object-cover mix-blend-multiply opacity-35"
              />
            </div>
            
            <div className="relative z-10 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 text-slate-500 font-medium text-[15px]">
                <span>Total Collection</span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <i
                    className={
                      showBalance
                        ? "ri-eye-line text-[17px]"
                        : "ri-eye-off-line text-[17px]"
                    }
                  ></i>
                </button>
              </div>
              <div className="mt-2">
                <h2 className="text-2xl leading-none font-bold text-slate-900 tracking-tight">
                  ₹{' '}
                  {showBalance
                    ? data?.monthlyRevenue.toLocaleString() || "0"
                    : "••••••"}
                </h2>
              </div>
            </div>
          </div>

          {/* Educational Style Pill Actions */}
          <div className="grid grid-cols-2 gap-2 px-4">
            <Link
              href="/students/new"
              className="flex items-center gap-3 bg-indigo-600 text-white pl-2 pr-5 py-2 rounded-full font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md w-full select-none"
            >
              <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-sm">
                <i className="ri-user-line text-lg"></i>
              </span>
              <span className="text-sm font-semibold tracking-wide">
                Add Student
              </span>
            </Link>

            <Link
              href="/fees/collect"
              className="flex items-center gap-3 bg-emerald-600 text-white pl-2 pr-5 py-2 rounded-full font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-md w-full select-none"
            >
              <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm">
                <i className="ri-wallet-3-line text-lg"></i>
              </span>
              <span className="text-sm font-semibold tracking-wide">
                Collect Fees
              </span>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 px-4">
            <div className="bg-amber-50 p-3 px-4 rounded-2xl border border-orange-200 shadow-[0_2px_10px_-3px_rgba(99,102,241,0.1)] flex items-center gap-3 relative overflow-hidden group hover:border-amber-300 transition-colors">
              <div>
                <p className="text-[13px] font-medium text-slate-500 mb-1">
                  Students
                </p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">
                  {data?.totalStudents || 0}
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 p-3 px-4 rounded-2xl border border-indigo-200/60 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] flex items-center gap-3 relative overflow-hidden group hover:border-indigo-300 transition-colors">
              <div>
                <p className="text-[13px] font-medium text-slate-500 mb-1">
                  Batches
                </p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">
                  {data?.totalBatches || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="mt-4 px-4">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-bold text-slate-800 text-base">
                Recent Transactions
              </h3>
              <Link
                href="/fees"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
              >
                View All
              </Link>
            </div>

            {data?.recentPayments && data.recentPayments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {data.recentPayments.map((payment) => {
                  const d = dayjs(payment.paymentDate);
                  let dateText = d.format("DD MMM, hh:mm A");
                  if (d.isSame(dayjs(), "day"))
                    dateText = `Today, ${d.format("hh:mm A")}`;
                  else if (d.isSame(dayjs().subtract(1, "day"), "day"))
                    dateText = `Yesterday, ${d.format("hh:mm A")}`;

                  return (
                    <div
                      key={payment._id}
                      className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 font-bold text-indigo-600 text-lg overflow-hidden">
                          {payment.studentId?.photo ? (
                            <img
                              src={payment.studentId.photo}
                              alt="Student"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            payment.studentId?.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[15px]">
                            {payment.studentId?.fullName}
                          </p>
                          <p className="text-[13px] text-slate-500 mt-0.5">
                            {dateText}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 text-sm">
                          ₹{payment.amount.toLocaleString()}
                        </p>
                        <p className="text-[13px] text-slate-500 mt-0.5 capitalize">
                          {payment.paymentMethod.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <i className="ri-wallet-3-line text-4xl text-slate-300 mb-2 block"></i>
                <p className="text-slate-500 font-medium text-sm">
                  No recent transactions.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
