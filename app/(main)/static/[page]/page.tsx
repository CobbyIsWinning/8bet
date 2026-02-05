"use client";

import React from "react";
import { useParams } from "next/navigation";
import { STATIC_PAGES } from "@/data/staticPages";
import Button from "@/components/ui/Button";

export default function StaticPage() {
  const params = useParams();
  const key = params.page as string;
  const page = STATIC_PAGES[key];

  if (!page) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-6 text-sm text-muted">
          Page not found.
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted">Information</div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{page.title}</h1>
      </div>
      <div className="surface-card rounded-2xl p-6 space-y-4">
        {page.content.map((para, idx) => (
          <p key={idx} className="text-sm text-muted">{para}</p>
        ))}
      </div>
    </div>
  );
}
