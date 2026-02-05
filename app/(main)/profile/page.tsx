"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
    dateOfBirth: user?.dateOfBirth || "",
  });

  const handleSave = async () => {
    await updateUser(form);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Account</div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>My Profile</h1>
        </div>
        <Button variant="outline" onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit"}</Button>
      </div>

      <div className="surface-card rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm text-muted">Phone Number</label>
          {editing ? (
            <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          ) : (
            <div className="text-sm font-semibold">{user?.phoneNumber || "Not set"}</div>
          )}
        </div>
        <div>
          <label className="text-sm text-muted">Email</label>
          {editing ? (
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          ) : (
            <div className="text-sm font-semibold">{user?.email || "Not set"}</div>
          )}
        </div>
        <div>
          <label className="text-sm text-muted">Date of Birth</label>
          {editing ? (
            <Input value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          ) : (
            <div className="text-sm font-semibold">{user?.dateOfBirth || "Not set"}</div>
          )}
        </div>
        {editing && <Button onClick={handleSave}>Save Changes</Button>}
      </div>

      <div className="surface-card rounded-2xl p-6 space-y-2">
        <div className="text-sm text-muted">Account Stats</div>
        <div className="text-sm font-semibold">Wallet Balance: GH₵{user?.wallet?.balance?.toFixed?.(2) || "0.00"}</div>
        <div className="text-sm font-semibold">Total Bets: {user?.totalBets || 0}</div>
        <div className="text-sm font-semibold">Wins: {user?.wonBets || 0}</div>
      </div>

      <Button variant="outline" onClick={logout}>Log Out</Button>
    </div>
  );
}
