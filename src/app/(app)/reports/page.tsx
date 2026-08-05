"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import toast from "react-hot-toast";

interface ReportData {
  todaysCollection: number;
  thisMonthsCollection: number;
  totalStudents: number;
  totalBatches: number;
  pendingFees: number;
  collectionPercentage: number;
  chartData: { name: string; value: number }[];
  last30DaysCollection: number;
  percentageChange: number;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState(`Today, ${dayjs().format("DD MMM YYYY")}`);

  const fetchReports = async () => {
    const res = await fetch("/api/reports");
    const result = await res.json();
    if (!result.success) throw new Error("Failed to load reports data");
    return result.data as ReportData;
  };

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load reports data");
    }
  }, [error]);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto bg-[#F8F9FB] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-4 bg-white border-b border-slate-100 sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Overview of your institution
          </h1>
        </div>
        <a 
          href="/api/reports/download"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-100"
        >
          <i className="ri-file-excel-2-line text-lg"></i>
          <span>Download XLS</span>
        </a>
      </div>

      <div className="px-4 space-y-4">
        {/* Date Selector */}
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm cursor-pointer hover:bg-slate-50 transition">
          <span className="text-sm font-semibold text-slate-700">{dateRange}</span>
          <i className="ri-arrow-down-s-line text-indigo-600"></i>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-200 animate-pulse rounded-2xl"></div>
              <div className="h-20 bg-slate-200 animate-pulse rounded-2xl"></div>
              <div className="h-20 bg-slate-200 animate-pulse rounded-2xl"></div>
              <div className="h-20 bg-slate-200 animate-pulse rounded-2xl"></div>
            </div>
            <div className="h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
          </div>
        ) : (
          <>
            {/* Big Purple Card */}
            <div className="bg-[#6B46C1] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-white/20 pb-4 mb-4">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Today's Collection</p>
                  <h2 className="text-2xl font-bold tracking-tight">
                    ₹ {data?.todaysCollection.toLocaleString() || 0}
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <i className="ri-wallet-3-line text-xl"></i>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">This Month's Collection</p>
                  <h2 className="text-2xl font-bold tracking-tight">
                    ₹ {data?.thisMonthsCollection.toLocaleString() || 0}
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <i className="ri-bar-chart-box-line text-xl"></i>
                </div>
              </div>
            </div>

            {/* 4 Grid Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">Total Students</p>
                  <p className="text-xl font-bold text-slate-800">{data?.totalStudents || 0}</p>
                </div>
                <i className="ri-group-line text-2xl text-blue-500"></i>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">Total Batches</p>
                  <p className="text-xl font-bold text-slate-800">{data?.totalBatches || 0}</p>
                </div>
                <i className="ri-layout-grid-line text-2xl text-purple-500"></i>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">Pending Fees</p>
                  <p className="text-xl font-bold text-slate-800">₹ {data?.pendingFees.toLocaleString() || 0}</p>
                </div>
                <i className="ri-time-line text-2xl text-orange-500"></i>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-medium mb-1">Collection %</p>
                  <p className="text-xl font-bold text-slate-800">{data?.collectionPercentage || 0}%</p>
                </div>
                <i className="ri-donut-chart-line text-2xl text-emerald-500"></i>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-slate-800 font-bold text-sm mb-1">Collection Trend (30 Days)</h3>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">₹ {data?.last30DaysCollection.toLocaleString() || 0}</p>
              <p className={`${(data?.percentageChange || 0) >= 0 ? "text-emerald-500" : "text-red-500"} text-xs font-medium mb-6`}>
                {(data?.percentageChange || 0) >= 0 ? "+" : ""}{data?.percentageChange || 0}% from last 30 days
              </p>
              
              <div className="h-48 w-full">
                {data?.chartData && data.chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chartData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6B46C1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6B46C1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        dy={10}
                        interval="preserveStartEnd"
                        minTickGap={20}
                        padding={{ left: 15, right: 15 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`₹ ${Number(value || 0).toLocaleString()}`, "Collection"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6B46C1" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        dot={{ r: 3, fill: "#6B46C1", stroke: "#fff", strokeWidth: 1 }}
                        activeDot={{ r: 6, fill: "#6B46C1", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

