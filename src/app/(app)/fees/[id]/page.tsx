"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import InvoiceGenerator from "@/components/fees/InvoiceGenerator";

interface Payment {
  _id: string;
  studentId: { _id: string; fullName: string; phone: string };
  batchId: { _id: string; name: string };
  amount: number;
  paymentMethod: string;
  feeOption: string;
  receiptNumber: string;
  paymentDate: string;
  isAdvance: boolean;
  message?: string;
  ownerId?: {
    coachingName?: string;
    invoiceSettings?: {
      themeColor?: string;
      customNote?: string;
    };
  };
}

export default function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayment() {
      try {
        const res = await fetch(`/api/payments/${id}`);
        const data = await res.json();
        if (data.success) {
          setPayment(data.data);
        } else {
          toast.error(data.message || "Failed to load payment details");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    }
    fetchPayment();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-4">Loading receipt details...</p>;
  }

  if (!payment) {
    return (
      <div className="text-center mt-12">
        <p className="text-slate-500 mb-4">Payment receipt not found.</p>
        <Link
          href="/fees"
          className="text-blue-600 font-medium hover:underline"
        >
          &larr; Back to Fees
        </Link>
      </div>
    );
  }

  const themeColor = payment.ownerId?.invoiceSettings?.themeColor || "#1d4ed8";
  const customNote = payment.ownerId?.invoiceSettings?.customNote || "Thank you for your payment!";
  const coachingName = payment.ownerId?.coachingName || "Fees Management SaaS";

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <Link
          href="/fees"
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition"
        >
          <i className="ri-arrow-left-s-line text-lg mr-1"></i> Back to Fees
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 sm:p-12">
          {/* Receipt Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 pb-8 gap-6" style={{ borderColor: themeColor }}>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: themeColor }}>FEE RECEIPT</h1>
              <p className="mt-2 text-slate-500 font-medium">Receipt No: <span className="text-slate-800">{payment.receiptNumber}</span></p>
            </div>
            <div className="sm:text-right">
              <h2 className="text-xl font-bold text-slate-800">{coachingName}</h2>
              <p className="text-slate-500 mt-1">Date: {dayjs(payment.paymentDate).format("DD MMM YYYY")}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="rounded-xl border border-slate-100 p-6 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Student Details</h3>
              <p className="font-semibold text-lg text-slate-800">{payment.studentId?.fullName || "Unknown Student"}</p>
              <p className="text-slate-600 mt-1">Phone: {payment.studentId?.phone}</p>
              <p className="text-slate-600 mt-3"><span className="font-medium">Batch:</span> {payment.batchId?.name}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-6 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Payment Info</h3>
              <p className="text-slate-600"><span className="font-medium">Method:</span> <span className="capitalize">{payment.paymentMethod.replace("_", " ")}</span></p>
              <p className="text-slate-600 mt-1"><span className="font-medium">Fee Option:</span> {payment.feeOption}</p>
              {payment.isAdvance && <p className="text-orange-500 font-medium mt-3 bg-orange-50 px-2 py-1 rounded-md inline-block">Advance Payment</p>}
            </div>
          </div>

          {/* Invoice Table */}
          <div className="mt-10 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Description</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="px-6 py-6">
                    <p className="font-medium text-slate-800">Tuition Fee - {payment.feeOption}</p>
                    {payment.message && <p className="text-sm text-slate-500 mt-2 italic border-l-2 border-slate-300 pl-3">Note: {payment.message}</p>}
                  </td>
                  <td className="px-6 py-6 text-right font-medium text-slate-800">
                    ₹{payment.amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td className="px-6 py-5 font-bold text-slate-800 text-right uppercase tracking-wider text-sm">Total Paid</td>
                  <td className="px-6 py-5 text-right font-bold text-green-600 text-xl">
                    ₹{payment.amount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-16 text-center text-sm text-slate-500 pt-8 border-t border-slate-100">
            <p>This is a computer-generated receipt and does not require a physical signature.</p>
            <p className="mt-2 font-medium" style={{ color: themeColor }}>{customNote}</p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-6 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-medium text-slate-500 mb-3">Receipt Actions</h3>
        <InvoiceGenerator payment={payment as any} />
      </div>
    </div>
  );
}
