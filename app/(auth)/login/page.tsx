"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(identifier, password);
      router.push("/home");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card rounded-3xl p-6 sm:p-8">
      <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>Sign In</h1>
      <p className="mt-2 text-sm text-muted">Enter your email or phone number to continue.</p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm text-muted">Email or Phone</label>
          <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@email.com" />
        </div>
        <div>
          <label className="text-sm text-muted">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-4 text-sm text-muted">
        Don't have an account? <Link href="/register" className="text-[color:var(--accent)]">Register</Link>
      </div>
    </div>
  );
}
