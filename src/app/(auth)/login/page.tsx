"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import BottomSheet from "@/components/ui/BottomSheet";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("kicked") === "desktop") {
        toast.error("Logged out: Please login from a mobile phone.");
        window.history.replaceState({}, "", "/login");
      }
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [openBranchSheet, setOpenBranchSheet] = useState(false);
  const [branches, setBranches] = useState<{ _id: string; name: string }[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.user.role === "super_admin") {
          window.location.href = "/admin/dashboard";
        } else if (
          data.user.accountType === "coaching_center" &&
          data.user.branches?.length > 0
        ) {
          setBranches(data.user.branches);
          setOpenBranchSheet(true);
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelection = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/set-branch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ branchId: selectedBranchId }),
      });
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Failed to select branch");
      setLoading(false);
    }
  };

  const skipBranchSelection = () => {
    window.location.href = "/dashboard";
  };

  return (
    <>
      <main className="min-h-dvh bg-slate-50 px-5 py-8">
        <div className="mx-auto max-w-md">
          <h1 className="mb-2 text-3xl font-bold">Welcome Back</h1>

          <p className="mb-8 text-slate-500">Login to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-600"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-blue-600">
              Register
            </a>
          </p>
        </div>
      </main>

      <BottomSheet
        open={openBranchSheet}
        onClose={() => setOpenBranchSheet(false)}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-1">Select Branch</h2>
          <p className="text-sm text-slate-500 mb-6">
            Choose a branch to view its dashboard
          </p>

          <div className="space-y-3 mb-8 max-h-60 overflow-y-auto">
            {branches.map((branch) => (
              <label
                key={branch._id}
                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${selectedBranchId === branch._id ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"}`}
              >
                <input
                  type="radio"
                  name="branch"
                  value={branch._id}
                  checked={selectedBranchId === branch._id}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="font-medium text-slate-900">
                  {branch.name}
                </span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleBranchSelection}
              disabled={loading || !selectedBranchId}
            >
              {loading ? "Continuing..." : "Continue"}
            </Button>
            <button
              onClick={skipBranchSelection}
              className="text-slate-500 font-medium py-3 hover:text-slate-700 transition"
            >
              Skip (View All)
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
