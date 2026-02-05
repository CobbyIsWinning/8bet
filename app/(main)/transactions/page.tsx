"use client";

import React, { useEffect, useState } from "react";
import { fetchTransactions } from "@/lib/api/wallet";
import Button from "@/components/ui/Button";

const formatDate = (date: string) => new Date(date).toLocaleString();

const getTransactionLabel = (type: string) => {
  switch (type) {
    case "deposit":
      return "Deposit";
    case "withdrawal":
      return "Withdrawal";
    case "bet_stake":
      return "Bet Stake";
    case "bet_win":
      return "Bet Win";
    case "bank_transfer":
      return "Bank Transfer";
    default:
      return type;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#4CAF50";
    case "pending":
      return "#FFA726";
    case "failed":
      return "#F44336";
    case "cancelled":
      return "#9E9E9E";
    default:
      return "#FE6B3C";
  }
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchTransactions({ limit: 50, skip: 0 });
      if (response?.success && response?.data) setTransactions(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted">Wallet activity</div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>Transactions</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "deposit", "withdrawal", "bank_transfer", "bet_stake", "bet_win"].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              filter === key
                ? "bg-[color:var(--accent)] text-[#171717]"
                : "border-[color:var(--line)] bg-[color:var(--surface-2)] text-muted"
            }`}
          >
            {key.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6 text-sm text-muted">
          Loading transactions...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6 text-sm text-muted">
          No transactions found.
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((transaction) => (
          <div key={transaction._id} className="surface-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{getTransactionLabel(transaction.type)}</div>
                <div className="text-xs text-muted">{formatDate(transaction.createdAt)}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${transaction.type === "deposit" || transaction.type === "bet_win" ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
                  {transaction.type === "deposit" || transaction.type === "bet_win" ? "+" : "-"}GH₵{Math.abs(transaction.amount).toFixed(2)}
                </div>
                {transaction.status && (
                  <div className="text-xs" style={{ color: getStatusColor(transaction.status) }}>{transaction.status}</div>
                )}
              </div>
            </div>
            {transaction.provider && <div className="mt-2 text-xs text-muted">via {transaction.provider}</div>}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={load}>Refresh</Button>
    </div>
  );
}
