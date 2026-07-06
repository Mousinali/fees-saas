"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import Link from "next/link";

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

interface InvoiceGeneratorProps {
  payment: Payment;
  showDetailsButton?: boolean;
}

export default function InvoiceGenerator({ payment, showDetailsButton = false }: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const themeColor = payment.ownerId?.invoiceSettings?.themeColor || "#1d4ed8";
  const customNote = payment.ownerId?.invoiceSettings?.customNote || "Thank you for your payment!";
  const coachingName = payment.ownerId?.coachingName || "Fees Management SaaS";

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    try {
      // Lower scale and use JPEG with compression to reduce file size drastically
      const canvas = await html2canvas(invoiceRef.current, { scale: 1.5 });
      const imgData = canvas.toDataURL("image/jpeg", 0.7);
      
      // Enable PDF compression
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add image with FAST compression alias
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setDownloading(false);
    }
  };

  const shareWhatsApp = () => {
    const text = `*FEE RECEIPT*\nReceipt No: ${payment.receiptNumber}\nStudent: ${payment.studentId?.fullName}\nAmount: ₹${payment.amount}\nDate: ${dayjs(payment.paymentDate).format("DD MMM YYYY")}\n\nThank you!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <div className="flex items-center justify-between mt-0 ">
        <button
          onClick={generatePDF}
          disabled={downloading}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition disabled:opacity-50"
        >
          {downloading ? (
            <i className="ri-loader-4-line text-lg animate-spin"></i>
          ) : (
            <i className="ri-file-pdf-line font-normal text-lg"></i>
          )} 
          PDF File
        </button>
        
        <button
          onClick={shareWhatsApp}
          className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 transition"
        >
          <i className="ri-whatsapp-line text-lg font-normal"></i> Whatsapp
        </button>
        
        {showDetailsButton && (
          <Link
            href={`/fees/${payment._id}`}
            className="flex items-center text-blue-500 gap-1.5 text-xs font-semibold hover:text-slate-800 transition"
          >
            <i className="ri-eye-line text-lg font-normal"></i> Details
          </Link>
        )}
      </div>

      {/* Hidden Invoice Template for Rendering */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <div
          ref={invoiceRef}
          className="w-[800px] p-10"
          style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#ffffff", color: "#1e293b" }}
        >
          <div className="flex justify-between items-start border-b-2 pb-6 mb-6" style={{ borderColor: themeColor }}>
            <div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: themeColor }}>FEE RECEIPT</h1>
              <p className="mt-2 font-medium text-lg" style={{ color: "#475569" }}>Receipt No: <span style={{ color: "#0f172a" }}>{payment.receiptNumber}</span></p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold" style={{ color: "#1e293b" }}>{coachingName}</h2>
              <p className="mt-1 font-medium" style={{ color: "#64748b" }}>Date: {dayjs(payment.paymentDate).format("DD MMM YYYY")}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8">
            <div className="rounded-xl border p-5" style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>Student Details</h3>
              <p className="font-medium text-lg" style={{ color: "#1e293b" }}>{payment.studentId?.fullName}</p>
              <p style={{ color: "#475569" }}>Phone: {payment.studentId?.phone}</p>
              <p className="mt-2" style={{ color: "#475569" }}><span className="font-medium">Batch:</span> {payment.batchId?.name}</p>
            </div>
            <div className="rounded-xl border p-5" style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "#64748b" }}>Payment Info</h3>
              <p style={{ color: "#475569" }}><span className="font-medium">Method:</span> <span className="capitalize">{payment.paymentMethod.replace("_", " ")}</span></p>
              <p style={{ color: "#475569" }}><span className="font-medium">Fee Option:</span> {payment.feeOption}</p>
              {payment.isAdvance && <p className="font-medium mt-1" style={{ color: "#f97316" }}>Advance Payment</p>}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border" style={{ borderColor: "#e2e8f0" }}>
            <table className="w-full text-left">
              <thead style={{ backgroundColor: "#f1f5f9" }}>
                <tr>
                  <th className="px-5 py-4 font-semibold" style={{ color: "#334155" }}>Description</th>
                  <th className="px-5 py-4 font-semibold text-right" style={{ color: "#334155" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-5 py-6">
                    <p className="font-medium" style={{ color: "#1e293b" }}>Tuition Fee - {payment.feeOption}</p>
                    {payment.message && <p className="text-sm mt-1 italic" style={{ color: "#64748b" }}>Note: {payment.message}</p>}
                  </td>
                  <td className="px-5 py-6 text-right font-medium" style={{ color: "#1e293b" }}>
                    ₹{payment.amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  <td className="px-5 py-4 font-bold text-right uppercase tracking-wide" style={{ color: "#1e293b" }}>Total Paid</td>
                  <td className="px-5 py-4 text-right font-bold text-xl" style={{ color: "#16a34a" }}>
                    ₹{payment.amount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-12 text-center text-sm pt-6 border-t" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
            <p>This is a computer-generated receipt and does not require a physical signature.</p>
            <p className="mt-2 font-medium" style={{ color: themeColor }}>{customNote}</p>
          </div>
        </div>
      </div>
    </>
  );
}
