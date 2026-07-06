"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import BottomSheet from "@/components/ui/BottomSheet";

interface Course {
  _id: string;
  name: string;
}

interface Batch {
  _id: string;
  name: string;
  courseId: string;
  defaultFee?: number;
}

interface StudentFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function StudentForm({ initialData, isEdit }: StudentFormProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  
  const [formData, setFormData] = useState({
    photo: initialData?.photo || "",
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    courseId: initialData?.courseId?._id || initialData?.courseId || "",
    batchId: initialData?.batchId?._id || initialData?.batchId || "",
    aadhaarNumber: initialData?.aadhaarNumber || "",
    guardianPhone: initialData?.guardianPhone || "",
    customFee: initialData?.customFee || "",
    status: initialData?.status || "active",
  });

  const [saving, setSaving] = useState(false);
  
  // Photo upload state
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      fetchBatchesForCourse(formData.courseId);
    } else {
      setBatches([]);
    }
  }, [formData.courseId]);

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

  async function fetchBatchesForCourse(courseId: string) {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      if (data.success) {
        // Filter batches by selected course
        const filtered = data.data.filter((b: any) => b.courseId._id === courseId);
        setBatches(filtered);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoSheetOpen(false);

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Failed to process image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const url = isEdit ? `/api/students/${initialData._id}` : "/api/students";
      const method = isEdit ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save student");
        setSaving(false);
        return;
      }

      toast.success(isEdit ? "Student updated!" : "Student added!");
      router.push("/students");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24" suppressHydrationWarning>
      {/* Photo Upload Area */}
      <div className="flex flex-col items-center justify-center py-6">
        <div 
          className="relative w-28 h-28 rounded-full border-[3px] border-dashed border-indigo-200 bg-indigo-50/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-indigo-400 hover:bg-indigo-50 transition-all"
          onClick={() => setPhotoSheetOpen(true)}
        >
          {formData.photo ? (
            <img src={formData.photo} alt="Student photo" className="w-full h-full object-cover" />
          ) : (
            <>
              <i className="ri-camera-add-line text-3xl text-indigo-400 group-hover:scale-110 transition-transform"></i>
              <span className="text-[11px] text-indigo-500 mt-1 font-semibold tracking-wide uppercase">Add Photo</span>
            </>
          )}
          
          {formData.photo && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
              <i className="ri-pencil-line text-white text-2xl"></i>
            </div>
          )}
        </div>
      </div>

      {/* Hidden inputs for file upload */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handlePhotoSelect} 
      />
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        ref={cameraInputRef} 
        onChange={handlePhotoSelect} 
      />

      <BottomSheet
        open={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        title="Upload Photo"
      >
        <div className="space-y-3">
          <button 
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <i className="ri-camera-line text-xl"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Take Photo</h4>
              <p className="text-xs text-slate-500">Use your camera</p>
            </div>
          </button>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <i className="ri-image-add-line text-xl"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Upload from Gallery</h4>
              <p className="text-xs text-slate-500">Choose an existing photo</p>
            </div>
          </button>
          
          {formData.photo && (
            <button 
              type="button"
              onClick={() => {
                setFormData({ ...formData, photo: "" });
                setPhotoSheetOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-3 text-red-600 font-medium"
            >
              <i className="ri-delete-bin-line"></i> Remove Photo
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
            Student Name *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter full name"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
            Student Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter student phone number"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
              Course *
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => {
                setFormData({ ...formData, courseId: e.target.value, batchId: "" });
              }}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            >
              <option value="" disabled>Select course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
              Batch *
            </label>
            <select
              required
              disabled={!formData.courseId || batches.length === 0}
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="" disabled>Select batch</option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>{batch.name}</option>
              ))}
            </select>
          </div>
        </div>

        {formData.batchId && (
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
              Batch Fee
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={`₹${batches.find(b => b._id === formData.batchId)?.defaultFee || 0}`}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
            Custom Fee (Optional)
          </label>
          <input
            type="number"
            min="0"
            value={formData.customFee ?? ""}
            onChange={(e) => setFormData({ ...formData, customFee: e.target.value ? Number(e.target.value) : "" })}
            placeholder="Enter custom fee for student"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
            Aadhaar Number
          </label>
          <input
            type="text"
            value={formData.aadhaarNumber}
            onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
            placeholder="Enter Aadhaar number (optional)"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
            Guardian Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.guardianPhone}
            onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
            placeholder="Enter guardian phone number"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        {isEdit && (
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
              Student Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-4xl -translate-x-1/2 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl p-4 pb-8 md:pb-4 z-40">
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] py-3.5 font-bold text-white shadow-sm shadow-indigo-200 disabled:opacity-50 transition-all"
        >
          {saving ? "Saving..." : isEdit ? "Update Student" : "Save Student"}
        </button>
      </div>
    </form>
  );
}
