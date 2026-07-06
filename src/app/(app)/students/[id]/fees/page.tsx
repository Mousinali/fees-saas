"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import toast from "react-hot-toast";

interface Payment {
  _id: string;
  amount: number;
  paymentMethod: string;
  feeOption: string;
  receiptNumber: string;
  paymentDate: string;
  month: number;
  year: number;
}

interface StudentDetails {
  _id: string;
  fullName: string;
  photo?: string;
  courseId?: { name: string };
  batchId?: { name: string };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function FeesStructurePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const studentId = unwrappedParams.id;

  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // For the grid, we will default to the current year
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch student details
        const studentRes = await fetch(`/api/students/${studentId}`);
        const studentData = await studentRes.json();
        
        if (!studentData.success) {
          toast.error("Failed to load student details");
          router.push("/students");
          return;
        }
        setStudent(studentData.data);

        // Fetch payments for this student
        const paymentsRes = await fetch(`/api/payments?studentId=${studentId}`);
        const paymentsData = await paymentsRes.json();
        
        if (paymentsData.success) {
          setPayments(paymentsData.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [studentId, router]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
        <div className="h-96 bg-slate-200 animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  if (!student) return null;

  // Helper to check if a specific month is paid
  const getPaymentForMonth = (monthIndex: number) => {
    // month is stored as 1-12 in the DB, monthIndex is 0-11
    return payments.find(p => p.month === monthIndex + 1 && p.year === currentYear);
  };

  return (
    <div className="pb-24">
      {/* Sticky Custom Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 -ml-2 text-slate-700"
        >
          <i className="ri-arrow-left-line text-xl"></i>
        </button>
        <div className="flex items-center gap-3 ml-2">
          {student.photo ? (
            <img src={student.photo} alt={student.fullName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
              <i className="ri-user-line text-sm"></i>
            </div>
          )}
          <div>
            <h1 className="text-[15px] font-bold text-slate-900 leading-tight">{student.fullName}</h1>
            <p className="text-[11px] font-medium text-slate-500">Fees Overview</p>
          </div>
        </div>
      </header>
      {/* Header Profile Section */}
      <div className="bg-white px-6 pt-6 pb-6 rounded-b-3xl border-b border-slate-200 shadow-sm flex items-center gap-4">
        {student.photo ? (
          <img src={student.photo} alt={student.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-100">
            <i className="ri-user-line text-2xl"></i>
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{student.fullName}</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Fees Structure</p>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Monthly Tracker ({currentYear})</h2>
        </div>

        {/* 12 Month Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {MONTHS.map((monthName, index) => {
            const payment = getPaymentForMonth(index);
            const isPaid = !!payment;

            return (
              <div 
                key={monthName}
                className={`p-3 rounded-2xl border ${
                  isPaid 
                    ? "bg-emerald-50 border-emerald-200/60 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)]" 
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-semibold text-sm ${isPaid ? "text-emerald-900" : "text-slate-700"}`}>
                    {monthName}
                  </span>
                  {isPaid ? (
                    <i className="ri-checkbox-circle-fill text-emerald-500 text-lg"></i>
                  ) : (
                    <i className="ri-error-warning-line text-amber-500 text-lg"></i>
                  )}
                </div>
                
                {isPaid ? (
                  <div>
                    <p className="font-bold text-emerald-700 text-sm">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-[10px] font-medium text-emerald-600/70 mt-0.5">
                      {dayjs(payment.paymentDate).format("DD MMM, YYYY")}
                    </p>
                  </div>
                ) : (
                  <div className="mt-1">
                    <Link
                      href={`/fees/collect?studentId=${studentId}`}
                      className="inline-block px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Collect Fee
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent Transactions List */}
        <h2 className="text-base font-bold text-slate-800 mb-4">Recent Transactions</h2>
        {payments.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="divide-y divide-slate-100 flex flex-col">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Receipt #{payment.receiptNumber}</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-1">
                      {dayjs(payment.paymentDate).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 text-sm">+₹{payment.amount.toLocaleString()}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 capitalize">
                      {payment.paymentMethod.replace("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">
            <i className="ri-history-line text-3xl text-slate-300 mb-2 block"></i>
            <p className="text-sm font-medium text-slate-500">No payment history found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
