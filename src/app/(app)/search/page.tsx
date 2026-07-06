"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Student {
  _id: string;
  fullName: string;
  phone: string;
  photo?: string;
  courseId: { _id: string; name: string };
  batchId: { _id: string; name: string };
}

export default function SearchPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    async function fetchStudents() {
      if (!debouncedSearch.trim()) {
        setStudents([]);
        return;
      }
      try {
        setLoading(true);
        const params = new URLSearchParams({ search: debouncedSearch, limit: "20" });
        const res = await fetch(`/api/students?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setStudents(data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 -ml-2 transition-colors">
            <i className="ri-arrow-left-line text-xl"></i>
          </button>
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              autoFocus
              type="text"
              placeholder="Search students by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-100 py-2.5 pl-10 pr-4  focus:bg-white focus:outline-none focus:ring-0.5 focus:ring-indigo-500 transition-all border border-transparent focus:border-indigo-500"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <i className="ri-close-circle-fill"></i>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {!debouncedSearch.trim() ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
               <i className="ri-search-line text-3xl"></i>
            </div>
            <p className="text-sm font-medium">Type a name to search students</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center pt-10 text-indigo-500">
            <i className="ri-loader-4-line text-3xl animate-spin"></i>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center pt-10 text-slate-500">
            No students found matching "{debouncedSearch}"
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Results</h3>
            {students.map((student) => (
              <Link 
                key={student._id} 
                href={`/students/${student._id}`}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 transition-all shadow-sm active:scale-[0.98]"
              >
                {student.photo ? (
                  <img src={student.photo} alt={student.fullName} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                    <i className="ri-user-line text-xl"></i>
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="font-semibold text-[16px] text-slate-900 leading-tight">{student.fullName}</h2>
                  <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                     <i className="ri-book-read-line"></i> {student.courseId?.name}
                  </p>
                </div>
                
                <i className="ri-arrow-right-s-line text-slate-400 text-xl"></i>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
