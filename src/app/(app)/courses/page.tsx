"use client";

import { useEffect, useState } from "react";
import BottomSheet from "@/components/ui/BottomSheet";
import toast from "react-hot-toast";

interface Course {
  _id: string;
  name: string;
  description?: string;
  status: string;
}

export default function CoursesPage() {
  const [openSheet, setOpenSheet] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const [saving, setSaving] = useState(false);
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
    } finally {
      setLoading(false);
    }
  }

  async function saveCourse() {
    try {
      setSaving(true);

      const res = await fetch("/api/courses", {
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

      toast.success("Course added successfully.");

      setFormData({
        name: "",
        description: "",
        status: "active",
      });

      setOpenSheet(false);

      fetchCourses();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function updateCourse() {
    try {
      if (!editingCourse) return;
      
      setSaving(true);

      const res = await fetch(`/api/courses/${editingCourse._id}`, {
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

      toast.success("Course updated successfully.");

      setFormData({
        name: "",
        description: "",
        status: "active",
      });

      setOpenSheet(false);
      setEditingCourse(null);

      fetchCourses();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-4 px-4 pt-4 pb-24">
      <button
        onClick={() => {
          setEditingCourse(null);
          setFormData({
            name: "",
            description: "",
            status: "active",
          });
          setOpenSheet(true);
        }}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-[15px] font-medium text-white shadow-sm active:bg-blue-700 transition"
      >
        <i className="ri-add-line mr-1 text-lg align-middle"></i>
        Add Course
      </button>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-slate-500">No courses found.</p>
        </div>
      ) : (
        courses.map((course) => (
          <div
            key={course._id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-[16px] font-semibold text-slate-800 truncate">{course.name}</h2>
                <p className="mt-1 text-[13px] text-slate-500 line-clamp-2">
                  {course.description || "No description"}
                </p>
                <div className="mt-3">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[13px] font-medium capitalize ${
                      course.status === "active"
                        ? "bg-green-50 text-green-700 border border-green-200/50"
                        : "bg-red-50 text-red-700 border border-red-200/50"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingCourse(course);
                  setFormData({
                    name: course.name,
                    description: course.description || "",
                    status: course.status,
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
        title={editingCourse ? "Edit Course" : "Add Course"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Course Name
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
              placeholder="Enter course name"
              className="h-12 w-full rounded-xl border border-slate-300 px-4"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Enter description"
              className="w-full rounded-xl border border-slate-300 p-4"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
  <div>
    <h4 className="font-medium">Course Status</h4>
    <p className="text-sm text-slate-500">
      {formData.status === "active"
        ? "Course is active"
        : "Course is inactive"}
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
                if (editingCourse) {
                  updateCourse();
                } else {
                  saveCourse();
                }
              }}
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-[15px] font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingCourse
                  ? "Update Course"
                  : "Save Course"}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
