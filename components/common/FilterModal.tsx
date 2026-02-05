"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

export interface Filters {
  dateRange: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
}

export default function FilterModal({
  open,
  onClose,
  onApply,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  initial: Filters;
}) {
  const [filters, setFilters] = useState<Filters>(initial);

  const apply = () => {
    onApply(filters);
    onClose();
  };

  const clear = () => {
    const cleared: Filters = { dateRange: "all", status: "all", startDate: null, endDate: null };
    setFilters(cleared);
  };

  return (
    <Modal open={open} onClose={onClose} title="Filter Matches">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted">Date Range</label>
          <Select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </Select>
        </div>

        {filters.dateRange === "custom" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted">Start</label>
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted">End</label>
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-muted">Status</label>
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Matches</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_play">Live</option>
            <option value="finished">Finished</option>
            <option value="postponed">Postponed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={clear}>
            Clear All
          </Button>
          <Button onClick={apply}>Apply Filters</Button>
        </div>
      </div>
    </Modal>
  );
}
