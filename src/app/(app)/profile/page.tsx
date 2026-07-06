"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tab = "menu" | "personal" | "security" | "invoice";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coachingName: "",
    profileImage: "",
    password: "",
    invoiceSettings: {
      themeColor: "#1d4ed8",
      customNote: "Thank you for your payment!",
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();

        if (meData.success) {
          setUser(meData.data);
          setFormData({
            fullName: meData.data.fullName || "",
            email: meData.data.email || "",
            phone: meData.data.phone || "",
            coachingName: meData.data.coachingName || "",
            profileImage: meData.data.profileImage || "",
            password: "",
            invoiceSettings: meData.data.invoiceSettings || {
              themeColor: "#1d4ed8",
              customNote: "Thank you for your payment!",
            },
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Logged out successfully");
        window.location.href = "/login";
      } else {
        toast.error(data.message || "Logout failed");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const loadingToast = toast.loading("Uploading profile image...");

    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 400,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile);

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: base64 }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success("Profile image updated successfully!", { id: loadingToast });
        setUser(data.data);
        setFormData(prev => ({ ...prev, profileImage: data.data.profileImage }));
      } else {
        toast.error(data.message || "Failed to update profile image", { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while uploading", { id: loadingToast });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = { ...formData };
    if (!payload.password) {
      delete (payload as any).password;
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        toast.error("Server error. The image might be too large.");
        setSaving(false);
        return;
      }
      
      if (data.success) {
        toast.success("Profile updated successfully");
        setUser(data.data);
        setFormData(prev => ({ ...prev, password: "" })); 
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20 text-indigo-500">
         <i className="ri-loader-4-line text-3xl animate-spin"></i>
      </div>
    );
  }

  if (activeTab !== "menu") {
    return (
      <div className="pb-20 px-4 pt-4 max-w-xl mx-auto">
        <button 
          onClick={() => setActiveTab("menu")} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-medium"
        >
          <i className="ri-arrow-left-line text-xl"></i>
          Back to Menu
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            
            {activeTab === "personal" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="col-span-full">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-2">Personal Information</h3>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Coaching / Business Name</label>
                  <input
                    type="text"
                    value={formData.coachingName}
                    onChange={e => setFormData({ ...formData, coachingName: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="grid grid-cols-1 gap-5">
                <div className="col-span-full">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-2">Security</h3>
                  <p className="text-sm text-slate-500 mb-2">Leave blank if you don't want to change your password.</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    placeholder="Enter new password"
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "invoice" && (
              <div className="grid grid-cols-1 gap-5">
                <div className="col-span-full">
                  <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-2">Invoice Settings</h3>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Invoice Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.invoiceSettings.themeColor}
                      onChange={e => setFormData({ 
                        ...formData, 
                        invoiceSettings: { ...formData.invoiceSettings, themeColor: e.target.value } 
                      })}
                      className="h-11 w-16 p-1 rounded border border-slate-300 cursor-pointer"
                    />
                    <span className="text-slate-600 font-mono text-sm">{formData.invoiceSettings.themeColor}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Custom Invoice Note</label>
                  <textarea
                    rows={3}
                    value={formData.invoiceSettings.customNote}
                    onChange={e => setFormData({ 
                      ...formData, 
                      invoiceSettings: { ...formData.invoiceSettings, customNote: e.target.value } 
                    })}
                    className="w-full rounded-xl border border-slate-300 p-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-8 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 max-w-4xl mx-auto">
      {/* Top Section - Avatar and Info */}
      <div className="flex border-b border-slate-300 pb-4 items-center gap-4 mb-2">
        <div className="relative ">
          <div className="w-18 h-18 rounded-full border border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center relative group">
            {formData.profileImage ? (
              <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <i className="ri-user-line text-4xl text-slate-400"></i>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                <i className="ri-loader-4-line animate-spin text-2xl"></i>
              </div>
            )}
          </div>
          <button 
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-slate-600 flex items-center justify-center shadow-md border border-slate-100 hover:bg-slate-50 transition"
            onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
            disabled={uploadingPhoto}
          >
            <i className="ri-pencil-line text-sm"></i>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>
        
        <div className="flex flex-col items-start">
          <h1 className="text-xl truncate font-bold text-slate-800 mb-0.5">{user?.fullName || "My Profile"}</h1>
        <p className="text-[15px] text-slate-500">
          {user?.accountType === "coaching_center" ? "Coaching Center" : "Teacher Account"}
        </p>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex flex-col divide-y divide-slate-100/80">
        <button 
          onClick={() => setActiveTab("personal")}
          className="w-full flex items-center py-4 bg-transparent hover:bg-slate-50/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mr-4">
            <i className="ri-user-line text-lg text-slate-700"></i>
          </div>
          <span className="font-medium text-[15px] text-slate-800">Personal Details</span>
        </button>

        <button 
          onClick={() => setActiveTab("security")}
          className="w-full flex items-center py-4 bg-transparent hover:bg-slate-50/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mr-4">
            <i className="ri-shield-check-line text-lg text-slate-700"></i>
          </div>
          <span className="font-medium text-[15px] text-slate-800">Privacy & Security</span>
        </button>

        <button 
          onClick={() => setActiveTab("invoice")}
          className="w-full flex items-center py-4 bg-transparent hover:bg-slate-50/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mr-4">
            <i className="ri-file-list-3-line text-lg text-slate-700"></i>
          </div>
          <span className="font-medium text-[15px] text-slate-800">Invoice Settings</span>
        </button>

        <Link 
          href="/courses"
          className="w-full flex items-center py-4 bg-transparent hover:bg-slate-50/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mr-4">
            <i className="ri-book-read-line text-lg text-slate-700"></i>
          </div>
          <span className="font-medium text-[15px] text-slate-800">Manage Courses</span>
        </Link>

        <Link 
          href="/batches"
          className="w-full flex items-center py-4 bg-transparent hover:bg-slate-50/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mr-4">
            <i className="ri-group-line text-lg text-slate-700"></i>
          </div>
          <span className="font-medium text-[15px] text-slate-800">Manage Batches</span>
        </Link>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center py-4 bg-transparent hover:bg-red-50/30 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFF0F0] flex items-center justify-center mr-4">
            <i className="ri-logout-box-r-line text-lg text-[#F43F5E]"></i>
          </div>
          <span className="font-medium text-[15px] text-[#F43F5E]">Log Out</span>
        </button>
      </div>
    </div>
  );
}
