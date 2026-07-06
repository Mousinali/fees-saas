"use client";

import { useEffect, useState } from "react";
import BottomSheet from "@/components/ui/BottomSheet";
import toast from "react-hot-toast";

interface Course {
  _id: string;
  name: string;
}

interface Batch {
  _id: string;
  courseId: Course;
  name: string;
  defaultFee: number;
  status: string;
}

export default function BatchesPage() {
  const [openSheet, setOpenSheet] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState({
    courseId: "",
    name: "",
    defaultFee: 0,
    status: "active",
  });

  const [saving, setSaving] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchBatches() {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      if (data.success) {
        setBatches(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function saveBatch() {
    if (!formData.courseId) {
      toast.error("Please select a course.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Batch added successfully.");
      setFormData({
        courseId: "",
        name: "",
        defaultFee: 0,
        status: "active",
      });
      setOpenSheet(false);
      fetchBatches();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function updateBatch() {
    if (!editingBatch) return;

    if (!formData.courseId) {
      toast.error("Please select a course.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/batches/${editingBatch._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Batch updated successfully.");
      setFormData({
        courseId: "",
        name: "",
        defaultFee: 0,
        status: "active",
      });
      setOpenSheet(false);
      setEditingBatch(null);
      fetchBatches();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchCourses();
    fetchBatches();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-4 px-4 pt-4 pb-24">
      <button
        onClick={() => {
          setEditingBatch(null);
          setFormData({
            courseId: courses.length > 0 ? courses[0]._id : "",
            name: "",
            defaultFee: 0,
            status: "active",
          });
          setOpenSheet(true);
        }}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-[15px] font-medium text-white shadow-sm active:bg-blue-700 transition"
      >
        <i className="ri-add-line mr-1 text-lg align-middle"></i>
        Add Batch
      </button>

      {batches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-slate-500">No batches found.</p>
        </div>
      ) : (
        batches.map((batch) => (
          <div
            key={batch._id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-[16px] font-semibold text-slate-800 truncate">{batch.name}</h2>
                <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500">
                  <span className="truncate max-w-[120px]">{batch.courseId?.name || "Unknown"}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-medium">₹{batch.defaultFee}</span>
                </div>
                <div className="mt-3">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[13px] font-medium capitalize ${
                      batch.status === "active"
                        ? "bg-green-50 text-green-700 border border-green-200/50"
                        : "bg-red-50 text-red-700 border border-red-200/50"
                    }`}
                  >
                    {batch.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingBatch(batch);
                  setFormData({
                    courseId: batch.courseId?._id || "",
                    name: batch.name,
                    defaultFee: batch.defaultFee,
                    status: batch.status,
                  });
                  setOpenSheet(true);
                }}
                className="w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <i className="ri-edit-line text-[17px]"></i>
              </button>
            </div>
          </div>
        ))
      )}
      <BottomSheet
        open={openSheet}
        onClose={() => setOpenSheet(false)}
        title={editingBatch ? "Edit Batch" : "Add Batch"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Course
            </label>
            <select
              value={formData.courseId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  courseId: e.target.value,
                })
              }
              className="h-12 w-full rounded-xl border border-slate-300 px-4 bg-white"
            >
              <option value="" disabled>Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Batch Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="Enter batch name"
              className="h-12 w-full rounded-xl border border-slate-300 px-4"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Batch Fee
            </label>
            <input
              type="number"
              min="0"
              value={formData.defaultFee ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultFee: e.target.value ? Number(e.target.value) : 0,
                })
              }
              placeholder="Enter batch fee"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div>
              <h4 className="font-medium">Batch Status</h4>
              <p className="text-sm text-slate-500">
                {formData.status === "active"
                  ? "Batch is active"
                  : "Batch is inactive"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  status:
                    formData.status === "active"
                      ? "inactive"
                      : "active",
                })
              }
              className={`relative h-7 w-12 rounded-full transition-all duration-300 ${
                formData.status === "active"
                  ? "bg-green-500"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                  formData.status === "active"
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setOpenSheet(false)}
              className="flex-1 rounded-xl border border-slate-300 py-3"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                if (editingBatch) {
                  updateBatch();
                } else {
                  saveBatch();
                }
              }}
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-[15px] font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingBatch
                  ? "Update Batch"
                  : "Save Batch"}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
