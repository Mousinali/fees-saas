"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AccountSettingsPage() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [profileData, setProfileData] = useState({
    fullName: "",
  });

  const [loadingPwd, setLoadingPwd] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfileData({ fullName: data.data.fullName });
        }
      });
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/admin/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        // Reload page to reflect name in sidebar
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setLoadingPwd(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setLoadingPwd(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      
      {/* Update Profile Section */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Update your admin profile information.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                required
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleProfileChange}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loadingProfile}
                className="px-6 py-3 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loadingProfile && <i className="ri-loader-4-line animate-spin"></i>}
                Update Name
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Change Password</h2>
          <p className="text-sm text-slate-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <form onSubmit={handleUpdatePassword} className="p-6 sm:p-8 space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
              <input
                required
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input
                required
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                minLength={6}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
              />
              <p className="text-xs text-slate-500 mt-2">Must be at least 6 characters long.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                required
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                minLength={6}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loadingPwd}
                className="px-6 py-3 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loadingPwd && <i className="ri-loader-4-line animate-spin"></i>}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
