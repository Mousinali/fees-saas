"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import BottomSheet from "@/components/ui/BottomSheet";

interface StudentDetails {
  _id: string;
  fullName: string;
  phone: string;
  photo?: string;
  gender?: string;
  admissionDate: string;
  balance: number;
  courseId?: { _id: string; name: string };
  batchId?: { _id: string; name: string };
  status: string;
}

export default function StudentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const studentId = unwrappedParams.id;

  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  async function fetchStudent() {
    try {
      setLoading(true);
      const res = await fetch(`/api/students/${studentId}`);
      const data = await res.json();

      if (data.success) {
        setStudent(data.data);
      } else {
        toast.error(data.message || "Failed to load student");
        router.push("/students");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function deleteStudent() {
    if (!student) return;

    try {
      const res = await fetch(`/api/students/${student._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Student deleted successfully");
      setShowDeleteSheet(false);
      router.push("/students");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-40 bg-slate-200 animate-pulse rounded-2xl"></div>
        <div className="h-20 bg-slate-200 animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-slate-200 bg-slate-50/80 backdrop-blur-md px-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 -ml-2 text-slate-700"
        >
          <i className="ri-arrow-left-line text-xl"></i>
        </button>
        <h2 className="text-lg font-semibold">Student details</h2>
      </header>
      <div className="pb-20 pt-3 px-4">
        {/* Sticky Custom Header */}

        {/* Header Profile Section */}
        <div className="bg-white gap-4 px-3 py-3 border border-slate-200/75 rounded-2xl flex items-center text-center">
          {student.photo ? (
            <img
              src={student.photo}
              alt={student.fullName}
              className="w-15 h-15 rounded-full object-cover border-4 border-slate-50 flex-shrink-0"
            />
          ) : (
            <div className="w-15 h-15 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-slate-50 shadow-md">
              <i className="ri-user-line text-2xl"></i>
            </div>
          )}
          <div className="flex items-start justify-between w-full">
            <div className="text-start">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {student.fullName}
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                {student.phone}
              </p>
            </div>

            <div className="flex items-end flex-col gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  student.status === "active"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {student.status.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-6">
          {/* Info Cards */}
          <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-100/50">
            <div className="divide-y divide-slate-200/60 flex flex-col">
              <div className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                <span className="text-[13px] font-medium text-slate-500">
                  Course
                </span>
                <span className="text-[13px] font-semibold text-slate-700">
                  {student.courseId?.name || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                <span className="text-[13px] font-medium text-slate-500">
                  Batch
                </span>
                <span className="text-[13px] font-semibold text-slate-700">
                  {student.batchId?.name || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                <span className="text-[13px] font-medium text-slate-500">
                  Admission Date
                </span>
                <span className="text-[13px] font-medium text-slate-700">
                  {dayjs(student.admissionDate).format("MMM DD, YYYY")}
                </span>
              </div>

              <div className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                <span className="text-[13px] font-medium text-slate-500">
                  Due Balance
                </span>
                <span
                  className={`text-[13px] font-semibold ${student.balance > 0 ? "text-red-600" : "text-emerald-600"}`}
                >
                  ₹{student.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={`/students/${student._id}/fees`}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-sm hover:bg-emerald-700 transition"
            >
              <i className="ri-money-rupee-circle-line text-lg"></i>
              View Fees Structure
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/students/${student._id}/edit`}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm shadow-sm hover:bg-slate-50 transition"
              >
                <i className="ri-edit-line text-base"></i>
                Edit
              </Link>
              
              <button
                onClick={() => setShowDeleteSheet(true)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-semibold text-sm shadow-sm hover:bg-red-50 transition"
              >
                <i className="ri-delete-bin-line text-base"></i>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Sheet */}
        <BottomSheet
          open={showDeleteSheet}
          onClose={() => setShowDeleteSheet(false)}
          title="Delete Student"
        >
          <div className="pb-4">
            <p className="text-slate-600 mb-6 text-center">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                {student.fullName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDeleteSheet(false)}
                className="py-3 font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteStudent}
                className="py-3 font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        </BottomSheet>
      </div>
    </>
  );
}
