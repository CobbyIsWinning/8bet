"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    phone: "",
    email: "",
    dob: "",
    idType: "",
    idNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({
        phone: form.phone || undefined,
        email: form.email || undefined,
        dob: form.dob || undefined,
        idType: form.idType || undefined,
        idNumber: form.idNumber || undefined,
        password: form.password,
      });
      router.push("/home");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card rounded-3xl p-6 sm:p-8">
      <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>Create Account</h1>
      <p className="mt-2 text-sm text-muted">Sign up to start betting.</p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm text-muted">Phone Number</label>
          <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="0241234567" />
        </div>
        <div>
          <label className="text-sm text-muted">Email</label>
          <Input value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="you@email.com" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-muted">Date of Birth</label>
            <Input type="date" value={form.dob} onChange={(e) => handleChange("dob", e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted">ID Type</label>
            <Input value={form.idType} onChange={(e) => handleChange("idType", e.target.value)} placeholder="Ghana Card" />
          </div>
        </div>
        <div>
          <label className="text-sm text-muted">ID Number</label>
          <Input value={form.idNumber} onChange={(e) => handleChange("idNumber", e.target.value)} placeholder="ID123456" />
        </div>
        <div>
          <label className="text-sm text-muted">Password</label>
          <Input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="••••••••" />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating..." : "Register"}
        </Button>
      </form>

      <div className="mt-4 text-sm text-muted">
        Already have an account? <Link href="/login" className="text-[color:var(--accent)]">Sign In</Link>
      </div>
    </div>
  );
}
