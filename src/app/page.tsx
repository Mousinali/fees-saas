import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-dvh bg-slate-50 flex flex-col justify-between p-6">
      {/* Logo */}
      <div className="flex justify-center pt-10">
        <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">FM</span>
        </div>
      </div>

      {/* Content */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Fees Management</h1>

        <p className="text-slate-500 mt-3">
          Manage students, fees and payments effortlessly.
        </p>
      </div>

      {/* Buttons */}
      <div className="space-y-3 mb-6">
        <Button href="/login">Login</Button>

        <Button href="/register" variant="secondary" className="mt-3">
          Create Account
        </Button>
      </div>
    </main>
  );
}
