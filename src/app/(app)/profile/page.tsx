"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomSheet from "@/components/ui/BottomSheet";

type Tab = "menu" | "personal" | "security" | "invoice";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
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
      logoUrl: "",
      address: "",
      phone: "",
    },
  });
  const { data: meData, isLoading: queryLoading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => fetch("/api/auth/me").then((res) => res.json()),
  });

  useEffect(() => {
    if (meData?.success) {
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
          logoUrl: meData.data.invoiceSettings?.logoUrl || "",
          address: meData.data.invoiceSettings?.address || "",
          phone: meData.data.invoiceSettings?.phone || "",
        },
      });
      setLoading(false);
    } else if (meData && !meData.success) {
      toast.error("Failed to load profile data");
      setLoading(false);
    }
  }, [meData]);

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

    setPhotoSheetOpen(false);
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
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const loadingToast = toast.loading("Uploading invoice logo...");

    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 400,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile);

      setFormData(prev => ({
        ...prev,
        invoiceSettings: {
          ...prev.invoiceSettings,
          logoUrl: base64
        }
      }));
      
      toast.success("Logo ready to save. Click 'Save Changes' at the bottom.", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while uploading logo", { id: loadingToast });
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoSheetOpen(false);
    setUploadingPhoto(true);
    const loadingToast = toast.loading("Removing image...");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: "" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile image removed!", { id: loadingToast });
        setUser(data.data);
        setFormData(prev => ({ ...prev, profileImage: "" }));
      } else {
        toast.error(data.message || "Failed to remove image", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Something went wrong", { id: loadingToast });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone && formData.phone.length > 10) {
      toast.error("Phone number must not exceed 10 digits");
      return;
    }

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
                    maxLength={10}
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
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Invoice Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                      {formData.invoiceSettings.logoUrl || formData.profileImage ? (
                        <img src={formData.invoiceSettings.logoUrl || formData.profileImage} alt="Invoice Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl text-slate-400 font-bold">{formData.coachingName?.charAt(0) || "C"}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      {uploadingLogo ? "Uploading..." : "Upload Logo"}
                    </button>
                    {(formData.invoiceSettings.logoUrl || formData.profileImage) && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, invoiceSettings: { ...formData.invoiceSettings, logoUrl: "" } })}
                        className="text-red-500 text-sm hover:underline font-medium"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                  <p className="text-xs text-slate-500 mt-2">By default, your profile picture is used as the invoice logo. You can upload a different logo here.</p>
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
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Invoice Address</label>
                  <textarea
                    rows={2}
                    value={formData.invoiceSettings.address}
                    onChange={e => setFormData({ 
                      ...formData, 
                      invoiceSettings: { ...formData.invoiceSettings, address: e.target.value } 
                    })}
                    placeholder="Enter the address to display on the invoice"
                    className="w-full rounded-xl border border-slate-300 p-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Invoice Phone Number</label>
                  <input
                    type="text"
                    value={formData.invoiceSettings.phone}
                    onChange={e => setFormData({ 
                      ...formData, 
                      invoiceSettings: { ...formData.invoiceSettings, phone: e.target.value } 
                    })}
                    placeholder="e.g. +91 9876543210"
                    className="h-11 w-full rounded-xl border border-slate-300 px-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
            onClick={() => !uploadingPhoto && setPhotoSheetOpen(true)}
            disabled={uploadingPhoto}
          >
            <i className="ri-pencil-line text-sm"></i>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
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

      <BottomSheet
        open={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        title="Profile Photo"
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
          
          {formData.profileImage && (
            <>
              <button 
                type="button"
                onClick={() => {
                  setPhotoSheetOpen(false);
                  setFullScreenImage(formData.profileImage);
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <i className="ri-fullscreen-line text-xl"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">View Photo</h4>
                  <p className="text-xs text-slate-500">See current profile photo</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={handleRemovePhoto}
                className="w-full flex items-center justify-center gap-2 p-3 text-red-600 font-medium mt-2 hover:bg-red-50 rounded-xl"
              >
                <i className="ri-delete-bin-line"></i> Remove Photo
              </button>
            </>
          )}
        </div>
      </BottomSheet>

      {/* Full Screen Image Viewer */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm"
          onClick={() => setFullScreenImage(null)}
        >
          <div className="absolute top-4 right-4 flex gap-4">
            <button 
              type="button"
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() => setFullScreenImage(null)}
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          <img 
            src={fullScreenImage} 
            alt="Full screen view" 
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
