"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { processMobileMoneyDeposit, detectWalletProvider } from "@/lib/api/payments";

const WALLET_PROVIDERS = ["MTN", "TELECEL", "AIRTELTIGO"];
const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (phoneNumber.length >= 10) {
      const detected = detectWalletProvider(phoneNumber);
      if (detected) setSelectedProvider(detected);
    }
  }, [phoneNumber]);

  const handleDeposit = async () => {
    setMessage(null);
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setMessage("Please enter a valid phone number.");
      return;
    }
    if (!selectedProvider) {
      setMessage("Select a wallet provider.");
      return;
    }

    if (!confirm(`Deposit GH₵${num.toFixed(2)} to ${phoneNumber} (${selectedProvider})?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await processMobileMoneyDeposit({
        amount: num,
        provider: "orange_money",
        phoneNumber,
        walletProvider: selectedProvider,
      });
      if (response?.success) {
        setMessage("Deposit initiated. Check your phone for payment prompt.");
        setAmount("");
        setPhoneNumber("");
        setSelectedProvider(null);
      } else {
        setMessage(response?.message || "Failed to initiate deposit.");
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || err?.message || "Deposit error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted">Wallet</div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>Deposit Funds</h1>
      </div>

      {message && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-4 text-sm text-muted">
          {message}
        </div>
      )}

      <div className="surface-card rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-sm text-muted">Amount (GH₵)</label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                amount === String(q)
                  ? "bg-[color:var(--accent)] text-[#171717]"
                  : "border-[color:var(--line)] bg-[color:var(--surface-2)] text-muted"
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm text-muted">Phone Number</label>
          <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0241234567" />
        </div>

        <div>
          <label className="text-sm text-muted">Wallet Provider</label>
          <div className="flex gap-2">
            {WALLET_PROVIDERS.map((provider) => (
              <button
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${
                  selectedProvider === provider
                    ? "bg-[color:var(--accent)] text-[#171717]"
                    : "border-[color:var(--line)] bg-[color:var(--surface-2)] text-muted"
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleDeposit} disabled={loading}>
          {loading ? "Processing..." : `Deposit ${amount ? `GH₵${parseFloat(amount || "0").toFixed(2)}` : "Funds"}`}
        </Button>
      </div>
    </div>
  );
}
