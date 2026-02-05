"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { processMobileMoneyWithdrawal, processBankTransfer, getSupportedBanks, detectWalletProvider } from "@/lib/api/payments";

const WALLET_PROVIDERS = ["MTN", "TELECEL", "AIRTELTIGO"];

export default function WithdrawalPage() {
  const [tab, setTab] = useState<"mobile" | "bank">("mobile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [walletProvider, setWalletProvider] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");

  const [bankAmount, setBankAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [bankCustomerName, setBankCustomerName] = useState("");
  const [banks, setBanks] = useState<any[]>([]);

  useEffect(() => {
    if (phoneNumber.length >= 10) {
      const detected = detectWalletProvider(phoneNumber);
      if (detected) setWalletProvider(detected);
    }
  }, [phoneNumber]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getSupportedBanks();
        if (response?.success && response?.data) {
          setBanks(response.data);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleMobileWithdraw = async () => {
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
    if (!walletProvider) {
      setMessage("Select a wallet provider.");
      return;
    }

    if (!confirm(`Withdraw GH₵${num.toFixed(2)} to ${phoneNumber} (${walletProvider})?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await processMobileMoneyWithdrawal({
        amount: num,
        provider: "orange_money",
        phoneNumber,
        walletProvider,
        customerName: customerName || undefined,
      });
      if (response?.success) {
        setMessage("Withdrawal initiated. Check your phone for confirmation.");
      } else {
        setMessage(response?.message || "Withdrawal failed.");
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || err?.message || "Withdrawal error");
    } finally {
      setLoading(false);
    }
  };

  const handleBankWithdraw = async () => {
    setMessage(null);
    const num = parseFloat(bankAmount);
    if (!bankAmount || isNaN(num) || num <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }
    if (!accountNumber || !sortCode) {
      setMessage("Please enter account number and bank.");
      return;
    }

    if (!confirm(`Withdraw GH₵${num.toFixed(2)} to account ${accountNumber}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await processBankTransfer({
        amount: num,
        accountNumber,
        sortCode,
        customerName: bankCustomerName || "",
      });
      if (response?.success) {
        setMessage("Bank transfer initiated.");
      } else {
        setMessage(response?.message || "Bank transfer failed.");
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || err?.message || "Withdrawal error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted">Wallet</div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>Withdraw Funds</h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("mobile")}
          className={`rounded-full border px-4 py-2 text-xs font-semibold ${
            tab === "mobile"
              ? "bg-[color:var(--accent)] text-[#171717]"
              : "border-[color:var(--line)] bg-[color:var(--surface-2)] text-muted"
          }`}
        >
          Mobile Money
        </button>
        <button
          onClick={() => setTab("bank")}
          className={`rounded-full border px-4 py-2 text-xs font-semibold ${
            tab === "bank"
              ? "bg-[color:var(--accent)] text-[#171717]"
              : "border-[color:var(--line)] bg-[color:var(--surface-2)] text-muted"
          }`}
        >
          Bank Transfer
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-4 text-sm text-muted">
          {message}
        </div>
      )}

      {tab === "mobile" ? (
        <div className="surface-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-muted">Amount (GH₵)</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
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
                  onClick={() => setWalletProvider(provider)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${
                    walletProvider === provider
                      ? "bg-[color:var(--accent)] text-[#171717]"
                      : "border-[color:var(--line)] bg-[color:var(--surface-2)] text-muted"
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted">Customer Name (optional)</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" />
          </div>
          <Button onClick={handleMobileWithdraw} disabled={loading}>
            {loading ? "Processing..." : "Withdraw"}
          </Button>
        </div>
      ) : (
        <div className="surface-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-muted">Amount (GH₵)</label>
            <Input value={bankAmount} onChange={(e) => setBankAmount(e.target.value)} placeholder="Enter amount" />
          </div>
          <div>
            <label className="text-sm text-muted">Account Number</label>
            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number" />
          </div>
          <div>
            <label className="text-sm text-muted">Bank</label>
            <Select value={sortCode} onChange={(e) => setSortCode(e.target.value)}>
              <option value="">Select bank</option>
              {banks.map((bank) => (
                <option key={bank.code || bank.id} value={bank.code || bank.id}>
                  {bank.name || bank.bankName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted">Account Name</label>
            <Input value={bankCustomerName} onChange={(e) => setBankCustomerName(e.target.value)} placeholder="Account name" />
          </div>
          <Button onClick={handleBankWithdraw} disabled={loading}>
            {loading ? "Processing..." : "Withdraw"}
          </Button>
        </div>
      )}
    </div>
  );
}
