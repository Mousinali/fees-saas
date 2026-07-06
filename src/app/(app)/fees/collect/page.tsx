"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Student {
  _id: string;
  fullName: string;
  customFee?: number;
  batchId: {
    _id: string;
    name: string;
    defaultFee: number;
  };
  balance?: number;
}

export default function CollectFeesPage() {
  const router = useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [accountType, setAccountType] = useState<"teacher" | "coaching_center">("teacher");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<{
    studentId: string;
    feeOption: string;
    amount: number | "";
    expectedFee: number;
    isAdvance: boolean;
    paymentMethod: string;
    message: string;
  }>({
    studentId: "",
    feeOption: "Monthly",
    amount: "",
    expectedFee: 0,
    isAdvance: false,
    paymentMethod: "cash",
    message: "",
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter((s) =>
      s.fullName.toLowerCase().includes(q) ||
      (s.batchId?.name && s.batchId.name.toLowerCase().includes(q))
    );
  }, [students, searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const [meRes, studentsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/students"),
        ]);

        const meData = await meRes.json();
        if (meData.success) setAccountType(meData.data.accountType);

        const studentsData = await studentsRes.json();
        if (studentsData.success) setStudents(studentsData.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Recalculate amount when student or feeOption changes
  useEffect(() => {
    if (!selectedStudent) return;

    const hasCustomFee = selectedStudent.customFee !== undefined && selectedStudent.customFee !== null && selectedStudent.customFee !== ("" as any) && selectedStudent.customFee !== 0;
    const baseFee = hasCustomFee ? Number(selectedStudent.customFee) : (selectedStudent.batchId?.defaultFee || 0);
    
    let multiplier = 1;
    switch (formData.feeOption) {
      case "Quarterly":
        multiplier = 3;
        break;
      case "6 Month":
        multiplier = 6;
        break;
      case "Annually":
        multiplier = 12;
        break;
      case "Monthly":
      case "EMI":
      default:
        multiplier = 1;
        break;
    }

    const expectedFee = baseFee * multiplier;
    const balance = selectedStudent.balance || 0;
    const payableAmount = Math.max(0, expectedFee - balance);

    setFormData((prev) => ({
      ...prev,
      amount: payableAmount,
      expectedFee: expectedFee,
    }));
  }, [selectedStudent, formData.feeOption]);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setFormData({ ...formData, studentId: student._id });
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return toast.error("Please select a student");
    
    setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          batchId: selectedStudent.batchId?._id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Payment collected successfully");
      router.push("/fees");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to collect payment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="mt-4 text-center">Loading...</p>;

  const feeOptions = accountType === "coaching_center" 
    ? ["Monthly", "Quarterly", "Annually", "EMI"]
    : ["Monthly", "Quarterly", "6 Month"];

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Select Student *</label>
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-12 w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 bg-slate-50 text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium cursor-pointer"
            >
              <span className={formData.studentId ? "text-slate-900" : "text-slate-500"}>
                {selectedStudent ? `${selectedStudent.fullName} (${selectedStudent.batchId?.name})` : "Select a student"}
              </span>
              <i className="ri-arrow-down-s-line text-slate-400 text-xl pointer-events-none"></i>
            </div>
            
            {isDropdownOpen && (
              <div className="absolute z-10 mt-2 w-full rounded-xl bg-white shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                      type="text"
                      placeholder="Search by name or batch..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                  {filteredStudents.length === 0 ? (
                    <div className="p-3 text-center text-sm text-slate-500">No students found</div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => handleStudentSelect(student)}
                        className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${formData.studentId === student._id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}
                      >
                        {student.fullName} <span className="text-slate-400 text-xs ml-1">({student.batchId?.name})</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedStudent && (() => {
          const hasCustomFee = selectedStudent.customFee !== undefined && selectedStudent.customFee !== null && selectedStudent.customFee !== ("" as any) && selectedStudent.customFee !== 0;
          const baseFee = hasCustomFee ? Number(selectedStudent.customFee) : (selectedStudent.batchId?.defaultFee || 0);
          const balance = selectedStudent.balance || 0;
          return (
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-2 mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-indigo-900">{selectedStudent.batchId?.name}</span>
                <span className="text-sm font-bold text-indigo-700">₹{baseFee}<span className="text-xs font-medium text-indigo-400">/mo</span></span>
              </div>
              <p className="text-xs text-indigo-500 font-medium mb-3">
                {hasCustomFee ? "Custom fee applied" : "Standard batch fee"}
              </p>
              
              <div className="pt-3 border-t border-indigo-100/60">
                {balance > 0 ? (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                    <i className="ri-checkbox-circle-fill"></i>
                    <span className="text-xs font-bold tracking-wide">ADVANCE: ₹{balance}</span>
                  </div>
                ) : balance < 0 ? (
                  <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg w-fit">
                    <i className="ri-error-warning-fill"></i>
                    <span className="text-xs font-bold tracking-wide">DUE: ₹{Math.abs(balance)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500">
                    <i className="ri-check-line"></i>
                    <span className="text-xs font-medium">No previous dues</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {selectedStudent && (
          <>
            <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Fee Option *</label>
            <div className="relative">
              <select
                required
                value={formData.feeOption}
                onChange={(e) => setFormData({ ...formData, feeOption: e.target.value })}
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 px-4 pr-10 bg-slate-50 text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              >
                {feeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl"></i>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Amount (₹) *</label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                value={formData.amount}
                placeholder="0"
                onChange={(e) => setFormData({ ...formData, amount: e.target.value ? Number(e.target.value) : "" })}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 pl-8 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 py-1 bg-slate-50 px-4 rounded-xl border border-slate-100 h-12">
          <input
            type="checkbox"
            id="isAdvance"
            checked={formData.isAdvance}
            onChange={(e) => setFormData({ ...formData, isAdvance: e.target.checked })}
            className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-600 transition-colors cursor-pointer"
          />
          <label htmlFor="isAdvance" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
            Mark as Advance Payment
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Payment Method *</label>
          <div className="relative">
            <select
              required
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 px-4 pr-10 bg-slate-50 text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="debit_card">Debit Card</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
            <i className="ri-bank-card-line absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl"></i>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Message (Optional)</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Any notes regarding this payment..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
            rows={3}
          />
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/80 backdrop-blur-lg p-4 pb-8 md:pb-4 z-40">
          <div className="max-w-lg mx-auto">
            <button
              type="submit"
              disabled={saving || !selectedStudent}
              className="w-full rounded-2xl bg-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-50 hover:bg-indigo-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              {saving ? (
                <><i className="ri-loader-4-line animate-spin"></i> Processing...</>
              ) : (
                <><i className="ri-check-line text-lg"></i> Collect ₹{formData.amount || 0}</>
              )}
            </button>
          </div>
        </div>
          </>
        )}
      </form>
    </div>
  );
}
