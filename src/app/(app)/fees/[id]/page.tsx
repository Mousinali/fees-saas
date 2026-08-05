"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import InvoiceGenerator, { InvoiceTemplate } from "@/components/fees/InvoiceGenerator";

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
    phone?: string;
    coachingName?: string;
    profileImage?: string;
    invoiceSettings?: {
      themeColor?: string;
      customNote?: string;
      logoUrl?: string;
      address?: string;
      phone?: string;
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
  const invoiceAddress = payment.ownerId?.invoiceSettings?.address;
  const invoicePhone = payment.ownerId?.invoiceSettings?.phone || payment.ownerId?.phone;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">

      <InvoiceTemplate payment={payment as any} isHidden={false} />
      
      {/* Actions */}
      <div className="mt-6 border-t border-slate-200 pt-6 px-4">
        <h3 className="text-sm font-medium text-slate-500 mb-3">Receipt Actions</h3>
        <InvoiceGenerator payment={payment as any} />
      </div>
    </div>
  );
}
