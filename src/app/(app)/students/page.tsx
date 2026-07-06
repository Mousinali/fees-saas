"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Student {
  _id: string;
  fullName: string;
  phone: string;
  photo?: string;
  courseId: { _id: string; name: string };
  batchId: { _id: string; name: string };
  status: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState("");
  const [courses, setCourses] = useState<{_id: string, name: string}[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }
    fetchCourses();
  }, []);

  async function fetchStudents(pageNum = 1, append = false, currentSearch = "", currentCourseId = "", currentStatus = "") {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "5",
      });
      if (currentSearch) params.append("search", currentSearch);
      if (currentCourseId) params.append("courseId", currentCourseId);
      if (currentStatus) params.append("status", currentStatus);

      const res = await fetch(`/api/students?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        if (append) {
          setStudents((prev) => [...prev, ...data.data]);
        } else {
          setStudents(data.data);
        }
        setHasMore(data.data.length === 5);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchStudents(1, false, debouncedSearch, courseId, status);
  }, [debouncedSearch, courseId, status]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchStudents(nextPage, true, debouncedSearch, courseId, status);
  }, [page, loadingMore, hasMore, debouncedSearch, courseId, status]);

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

  useEffect(() => {
    const handleOpenFilter = () => setIsFilterOpen(true);
    window.addEventListener('open-student-filter', handleOpenFilter);
    return () => window.removeEventListener('open-student-filter', handleOpenFilter);
  }, []);



  return (
    <div className="space-y-4 pb-20 px-4 pt-4">
      {/* Floating Add Student Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <div className="p-1.5 bg-indigo-100/80 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-indigo-100/50">
          <Link
            href="/students/new"
            className="flex whitespace-nowrap items-center gap-2.5 bg-indigo-600 text-white px-4 py-2.5 rounded-full font-semibold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all text-sm"
          >
            <i className="ri-add-line text-xl"></i>
            Add Student
          </Link>
        </div>
      </div>


      {loading ? (
        <p>Loading...</p>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-500">
            No students added yet.
          </p>
        </div>
      ) : (
        students.map((student) => (
          <Link 
            key={student._id} 
            href={`/students/${student._id}`}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 hover:border-blue-300 transition-colors"
          >
            {student.photo ? (
              <img src={student.photo} alt={student.fullName} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <i className="ri-user-line text-2xl"></i>
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="font-semibold text-slate-900 leading-tight">{student.fullName}</h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {student.courseId?.name}
              </p>
            </div>
            
            <i className="ri-arrow-right-s-line text-slate-400 text-xl"></i>
          </Link>
        ))
      )}

      {!loading && hasMore && students.length > 0 && (
        <div ref={lastElementRef} className="pt-2 pb-6 flex justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2 text-slate-500">
               <i className="ri-loader-4-line animate-spin text-xl"></i>
               <span className="text-sm font-medium">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* Filter Bottom Sheet */}
      <>
        <div 
          className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsFilterOpen(false)}
        ></div>
        <div 
          className={`fixed inset-x-0 bottom-0 z-[60] rounded-t-2xl bg-white p-4 shadow-xl transition-transform duration-300 ease-out max-h-[75vh] overflow-y-auto ${
            isFilterOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filter Students</h2>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Course</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setCourseId("");
                setStatus("");
                setIsFilterOpen(false);
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-medium hover:bg-slate-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="flex-1 rounded-xl bg-indigo-600 text-white py-3 font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </>

      {/* Delete Confirmation Sheet */}
    </div>
  );
}