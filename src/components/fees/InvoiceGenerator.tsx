"use client";

import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import Link from "next/link";
import toast from "react-hot-toast";

export interface Payment {
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
    profileImage?: string;
    phone?: string;
    invoiceSettings?: {
      themeColor?: string;
      customNote?: string;
      logoUrl?: string;
      address?: string;
      phone?: string;
    };
  };
}

interface InvoiceGeneratorProps {
  payment: Payment;
  showDetailsButton?: boolean;
}

export function InvoiceTemplate({ payment, invoiceRef, isHidden = false }: { payment: Payment, invoiceRef?: React.RefObject<HTMLDivElement | null>, isHidden?: boolean }) {
  const themeColor = payment.ownerId?.invoiceSettings?.themeColor || "#1d4ed8";
  const customNote = payment.ownerId?.invoiceSettings?.customNote || "Thank you for your payment!";
  const coachingName = payment.ownerId?.coachingName || "Fees Management SaaS";
  const logoImage = payment.ownerId?.invoiceSettings?.logoUrl || payment.ownerId?.profileImage;
  const invoiceAddress = payment.ownerId?.invoiceSettings?.address;
  const invoicePhone = payment.ownerId?.invoiceSettings?.phone || payment.ownerId?.phone;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(850);

  useEffect(() => {
    if (isHidden || !wrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width < 850) {
          setScale(width / 850);
        } else {
          setScale(1);
        }
      }
    });
    observer.observe(wrapperRef.current);
    
    // Get actual height for scaled wrapper
    if (contentRef.current) {
      setContentHeight(contentRef.current.clientHeight);
    }
    
    return () => observer.disconnect();
  }, [isHidden]);

  const activeRef = invoiceRef || contentRef;

  const content = (
    <div
      ref={activeRef as any}
      className={`w-[850px] bg-white p-12`}
      style={{ fontFamily: "'Inter', sans-serif", color: "#000" }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          {/* Logo Placeholder */}
          <div className="w-24 h-24 flex items-center justify-center bg-[#f8fafc] text-[#94a3b8] font-bold mb-3 overflow-hidden">
            {logoImage ? (
              <img src={logoImage} alt="Logo" className="w-full h-full object-cover" crossOrigin="anonymous" />
            ) : (
              <span className="text-4xl">{coachingName?.charAt(0) || "C"}</span>
            )}
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wide">
            {coachingName}
          </h1>
        </div>
        
        <div className="text-right mt-2">
          <h2 className="text-[40px] font-bold uppercase tracking-tight mb-4 text-[#1a1a1a]">FEE RECEIPT</h2>
          <div className="text-[15px] space-y-1">
            {invoiceAddress && <p style={{ whiteSpace: "pre-line" }}>{invoiceAddress}</p>}
            {invoicePhone && <p>{invoicePhone}</p>}
          </div>
        </div>
      </div>

      {/* Divider line */}
      <div className="w-full border-t-[3px] border-black my-5"></div>

      {/* Details Section */}
      <div className="flex justify-between mb-8 text-[16px]">
        {/* Left */}
        <div className="w-1/2">
          <div className="grid grid-cols-[140px_1fr] gap-3">
            <span className="font-bold">Student Name</span>
            <span>{payment.studentId?.fullName}</span>
            <span className="font-bold">Payment Mode</span>
            <span className="uppercase">{payment.paymentMethod.replace("_", " ")}</span>
          </div>
        </div>
        
        {/* Right */}
        <div className="w-1/2 pl-12">
          <div className="grid grid-cols-[140px_1fr] gap-3">
            <span className="font-bold">Receipt No</span>
            <span>{payment.receiptNumber?.includes("-") ? `#${payment.receiptNumber.split("-").pop()}` : payment.receiptNumber}</span>
            
            <span className="font-bold">Date</span>
            <span>{dayjs(payment.paymentDate).format("DD-MM-YYYY")}</span>
            
            
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-[#cbd5e1] mb-6 text-[16px]">
        <thead>
          <tr className="border-b border-[#cbd5e1] bg-[#f8fafc]">
            <th className="border-r border-[#cbd5e1] p-3 font-bold w-[10%] text-left">Sl.</th>
            <th className="border-r border-[#cbd5e1] p-3 font-bold w-[40%] text-left">Particulars</th>
            <th className="border-r border-[#cbd5e1] p-3 font-bold w-[30%] text-left">Remarks</th>
            <th className="p-3 font-bold text-right w-[20%]">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-r border-[#cbd5e1] p-3 align-top">1</td>
            <td className="border-r border-[#cbd5e1] p-3 align-top">Coaching</td>
            <td className="border-r border-[#cbd5e1] p-3 align-top">{payment.feeOption}</td>
            <td className="p-3 text-right align-top font-medium">₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      {/* Grand Total */}
      <div className="flex justify-end mb-12">
        <div className="border-t-[3px] border-black pt-3 pb-1 flex items-center justify-end text-[22px] gap-6 pr-2 pl-12">
          <span>Grand Total</span>
          <span className="font-bold">₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-4">
        <div>
          <p className="text-[16px] leading-relaxed">This is a computer generated receipt. No signature<br/>required.</p>
          <p className="text-[16px] mt-1">{customNote}</p>
        </div>
        
        <div className="text-center pb-2">
          <div className="border-t border-black w-56 mx-auto pt-2"></div>
          <p className="text-[16px]">Authorized Signature</p>
        </div>
      </div>
    </div>
  );

  if (isHidden) {
    return (
      <div className="absolute left-[-9999px] top-[-9999px]">
        {content}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full flex justify-center bg-slate-50/50 rounded-xl overflow-hidden" style={{ height: scale < 1 ? contentHeight * scale : 'auto' }}>
      <div className="origin-top" style={{ transform: `scale(${scale})`, width: 850 }}>
        {content}
      </div>
    </div>
  );
}

export default function InvoiceGenerator({ payment, showDetailsButton = false }: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const createPdfBlob = async () => {
    if (!invoiceRef.current) return null;
    const canvas = await html2canvas(invoiceRef.current, { scale: 1.5 });
    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    return pdf.output("blob");
  };

  const generatePDF = async () => {
    setDownloading(true);
    try {
      const blob = await createPdfBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setDownloading(false);
    }
  };

  const shareWhatsApp = async () => {
    try {
      const text = `*FEE RECEIPT*\nReceipt No: ${payment.receiptNumber}\nStudent: ${payment.studentId?.fullName}\nAmount: ₹${payment.amount}\nDate: ${dayjs(payment.paymentDate).format("DD MMM YYYY")}\n\nThank you!`;

      let phone = payment.studentId?.phone?.replace(/\D/g, '') || '';
      if (phone.length === 10) {
        phone = `91${phone}`;
      }
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
      
    } catch (error: any) {
      console.error("Failed to share", error);
      toast.error("Failed to open WhatsApp");
    }
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
      <InvoiceTemplate payment={payment} invoiceRef={invoiceRef} isHidden={true} />
    </>
  );
}
