"use client";

import React, { useEffect, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

const STORAGE_KEY = "appSettings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    notificationsEnabled: true,
    matchStartNotifications: true,
    betResultNotifications: true,
    promotionsNotifications: false,
    defaultStake: "10",
    oddsFormat: "decimal",
    quickBetEnabled: false,
    confirmBetPlacement: true,
    language: "english",
    biometricLogin: false,
    shareAnalytics: false,
    personalizedAds: false,
  });

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        setSettings((prev: any) => ({ ...prev, ...JSON.parse(stored) }));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const save = (next: any) => {
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const toggle = (key: string) => {
    save({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted">Preferences</div>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>Settings</h1>
      </div>

      <div className="surface-card rounded-2xl p-6 space-y-4">
        <div className="text-sm font-semibold">Notifications</div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Enable Notifications</span>
          <Toggle checked={settings.notificationsEnabled} onChange={() => toggle("notificationsEnabled")} />
        </div>
        {settings.notificationsEnabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Match Start Alerts</span>
              <Toggle checked={settings.matchStartNotifications} onChange={() => toggle("matchStartNotifications")} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Bet Results</span>
              <Toggle checked={settings.betResultNotifications} onChange={() => toggle("betResultNotifications")} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Promotions</span>
              <Toggle checked={settings.promotionsNotifications} onChange={() => toggle("promotionsNotifications")} />
            </div>
          </div>
        )}
      </div>

      <div className="surface-card rounded-2xl p-6 space-y-4">
        <div className="text-sm font-semibold">Betting Preferences</div>
        <div>
          <label className="text-sm text-muted">Default Stake</label>
          <Input value={settings.defaultStake} onChange={(e) => save({ ...settings, defaultStake: e.target.value })} />
        </div>
        <div>
          <label className="text-sm text-muted">Odds Format</label>
          <Select value={settings.oddsFormat} onChange={(e) => save({ ...settings, oddsFormat: e.target.value })}>
            <option value="decimal">Decimal (2.50)</option>
            <option value="fractional">Fractional (3/2)</option>
            <option value="american">American (+150)</option>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Quick Bet</span>
          <Toggle checked={settings.quickBetEnabled} onChange={() => toggle("quickBetEnabled")} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Confirm Bet Placement</span>
          <Toggle checked={settings.confirmBetPlacement} onChange={() => toggle("confirmBetPlacement")} />
        </div>
      </div>

      <div className="surface-card rounded-2xl p-6 space-y-4">
        <div className="text-sm font-semibold">Privacy</div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Biometric Login</span>
          <Toggle checked={settings.biometricLogin} onChange={() => toggle("biometricLogin")} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Share Analytics</span>
          <Toggle checked={settings.shareAnalytics} onChange={() => toggle("shareAnalytics")} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Personalized Ads</span>
          <Toggle checked={settings.personalizedAds} onChange={() => toggle("personalizedAds")} />
        </div>
      </div>

      <Button variant="outline" onClick={() => localStorage.removeItem(STORAGE_KEY)}>Reset Settings</Button>
    </div>
  );
}
