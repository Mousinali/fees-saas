"use client";

import StudentForm from "@/components/students/StudentForm";
import Link from "next/link";

export default function AddStudentPage() {
  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-slate-200 bg-slate-50/80 backdrop-blur-md px-4">
        <Link
          href="/students"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-200/50 -ml-2 text-slate-700 transition-colors"
        >
          <i className="ri-arrow-left-line text-xl"></i>
        </Link>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Add New Student</h2>
      </header>
      
      <div className="pt-4 px-4">
        <StudentForm />
      </div>
    </>
  );
}
