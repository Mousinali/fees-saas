"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import InvoiceGenerator from "@/components/fees/InvoiceGenerator";

interface Payment {
  _id: string;
  studentId: { _id: string; fullName: string; phone: string; photo?: string };
  batchId: { _id: string; name: string };
  amount: number;
  paymentMethod: string;
  feeOption: string;
  receiptNumber: string;
  paymentDate: string;
  isAdvance: boolean;
}

export default function FeesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const formatPaymentMethod = (method: string) => {
    if (!method) return "";
    if (method.toLowerCase() === "upi") return "UPI";
    return method
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const fetchPayments = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      
      const res = await fetch(`/api/payments?page=${pageNum}&limit=5`);
      const data = await res.json();
      if (data.success) {
        if (append) {
          setPayments(prev => [...prev, ...data.data]);
        } else {
          setPayments(data.data);
        }
        setHasMore(data.data.length === 5);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(1, false);
  }, [fetchPayments]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPayments(nextPage, true);
  }, [page, loadingMore, hasMore, fetchPayments]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, loadMore]);

  if (loading) {
    return (
      <div className="flex justify-center pt-10 text-indigo-500">
         <i className="ri-loader-4-line text-3xl animate-spin"></i>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 px-4 pt-4">
      {/* Floating Collect Fees Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <div className="p-1.5 bg-indigo-100/80 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-indigo-100/50">
          <Link
            href="/fees/collect"
            className="flex whitespace-nowrap items-center gap-2.5 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all text-sm"
          >
            <i className="ri-bank-card-line text-xl"></i>
            Collect Fees
          </Link>
        </div>
      </div>
      
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3 border border-dashed border-slate-300 rounded-2xl bg-white">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
             <i className="ri-wallet-3-line text-3xl text-slate-300"></i>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">No fees collected yet.</p>
            <p className="text-xs text-slate-400 mt-1">Tap collect fees to record a payment.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:border-indigo-200 transition-colors relative overflow-hidden group"
            >
              <div 
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setExpandedId(expandedId === payment._id ? null : payment._id)}
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {payment.studentId?.photo ? (
                      <img src={payment.studentId.photo} alt={payment.studentId?.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <i className="ri-user-smile-line text-indigo-500 text-lg"></i>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px] text-slate-800 leading-tight">
                      {payment.studentId?.fullName || "Unknown Student"}
                    </h3>
                    <p className="mt-1 text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                      {dayjs(payment.paymentDate).format("DD MMM YYYY • hh:mm A")}
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-between items-end h-full">
                  <p className="font-bold text-slate-800 text-base">
                    ₹{payment.amount}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-600 border border-slate-200 bg-slate-50 rounded px-1.5 py-0.5">
                    {formatPaymentMethod(payment.paymentMethod)}
                  </div>
                </div>
              </div>
              
              <div 
                className={`grid transition-[grid-template-rows,opacity,margin,padding] duration-300 ease-in-out ${
                  expandedId === payment._id 
                    ? "grid-rows-[1fr] opacity-100 mt-3 pt-2 border-t border-slate-100" 
                    : "grid-rows-[0fr] opacity-0 mt-0 pt-0 border-transparent"
                }`}
              >
                 <div className="overflow-hidden">
                   <InvoiceGenerator payment={payment as any} showDetailsButton={true} />
                 </div>
              </div>
            </div>
          ))}
          
          {!loading && hasMore && payments.length > 0 && (
            <div ref={lastElementRef} className="pt-2 pb-6 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-slate-500">
                   <i className="ri-loader-4-line animate-spin text-xl"></i>
                   <span className="text-sm font-medium">Loading more...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
