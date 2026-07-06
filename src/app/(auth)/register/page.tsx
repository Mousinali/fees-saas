"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    accountType: "",
    fullName: "",
    coachingName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [branches, setBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddBranch = () => {
    setBranches([...branches, ""]);
  };

  const handleBranchChange = (index: number, value: string) => {
    const newBranches = [...branches];
    newBranches[index] = value;
    setBranches(newBranches);
  };

  const handleRemoveBranch = (index: number) => {
    const newBranches = branches.filter((_, i) => i !== index);
    setBranches(newBranches);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        // Only include branches that are not empty
        branches: branches.filter(b => b.trim() !== ""),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Registration successful!");
        router.push("/login");
      } else {
        toast.error(data.message || data.errors?.[0]?.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Register as a Teacher or Coaching Center.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Account Type *
            </label>
            <select 
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              required
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-blue-600"
            >
              <option value="" disabled>Select Account Type</option>
              <option value="teacher">Teacher</option>
              <option value="coaching_center">Coaching Center</option>
            </select>
          </div>

          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
            />
          </div>

          {/* Coaching Name */}
          {formData.accountType === "coaching_center" && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Coaching Center Name
              </label>
              <input
                type="text"
                name="coachingName"
                value={formData.coachingName}
                onChange={handleChange}
                placeholder="Enter coaching center name"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
              />
            </div>
          )}

          {/* Branches */}
          {formData.accountType === "coaching_center" && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">
                  Branches (Optional)
                </label>
                <button 
                  type="button"
                  onClick={handleAddBranch}
                  className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                  <i className="ri-add-line"></i> Add Branch
                </button>
              </div>
              
              {branches.length === 0 && (
                <p className="text-xs text-slate-500">
                  You can add multiple branches for your coaching center.
                </p>
              )}

              {branches.map((branch, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => handleBranchChange(index, e.target.value)}
                    placeholder={`Branch ${index + 1} Name (e.g. Main Branch)`}
                    className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBranch(index)}
                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Password *
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
            />
          </div>

          {/* Confirm Password */}
          <div className="pb-4">
            <label className="mb-2 block text-sm font-medium">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-blue-600"
          >
            Login
          </a>
        </p>
      </div>
    </main>
  );
}