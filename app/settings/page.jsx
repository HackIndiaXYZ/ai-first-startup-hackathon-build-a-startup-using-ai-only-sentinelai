"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

import { useSettings } from "@/component/SettingsProvider";
import Sidebar from "@/component/layout/Sidebar";
import Topbar from "@/component/layout/Topbar";
import Background from "@/component/Background";

/* ─────────────────────────────────────────────
   UI primitives
───────────────────────────────────────────── */

function SettingsCard({ eyebrow, title, description, children, danger = false }) {
  return (
    <section
      className={[
        "overflow-hidden rounded-2xl border backdrop-blur-sm",
        danger
          ? "border-red-400/15 bg-red-400/[0.025]"
          : "border-white/[0.08] bg-white/[0.025]",
      ].join(" ")}
    >
      <div
        className={[
          "border-b px-5 py-4 sm:px-6",
          danger
            ? "border-red-400/10"
            : "border-white/[0.07]",
        ].join(" ")}
      >
        {eyebrow && (
          <p
            className={[
              "text-[10px] font-semibold uppercase tracking-[0.22em]",
              danger
                ? "text-red-300/60"
                : "text-cyan-300/55",
            ].join(" ")}
          >
            {eyebrow}
          </p>
        )}

        <h2 className="mt-1 text-base font-semibold tracking-tight text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/35">
            {description}
          </p>
        )}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function SettingRow({
  title,
  description,
  children,
  last = false,
}) {
  return (
    <div
      className={[
        "flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        !last ? "border-b border-white/[0.06]" : "",
      ].join(" ")}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/85">
          {title}
        </p>

        {description && (
          <p className="mt-1 max-w-xl text-xs leading-5 text-white/35">
            {description}
          </p>
        )}
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-white/[0.09]",
        "bg-black/30 px-3.5 py-2.5 text-sm text-white",
        "outline-none transition",
        "placeholder:text-white/20",
        "focus:border-cyan-400/30 focus:bg-white/[0.025]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ].join(" ")}
    />
  );
}

function Select({ value, onChange, options, disabled = false }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="min-w-[150px] rounded-xl border border-white/[0.09] bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-[#09090b] text-white"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={[
        "relative h-6 w-11 rounded-full border transition-all",
        checked
          ? "border-cyan-400/30 bg-cyan-400/20"
          : "border-white/10 bg-white/[0.06]",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all",
          checked
            ? "left-[22px] bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.45)]"
            : "left-[2px] bg-white/30",
        ].join(" ")}
      />
    </button>
  );
}

function ActionButton({
  children,
  danger = false,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-xl border px-4 py-2.5 text-sm font-medium transition",
        danger
          ? "border-red-400/20 bg-red-400/[0.06] text-red-200 hover:bg-red-400/[0.12]"
          : "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-200 hover:bg-cyan-400/[0.13]",
        "disabled:cursor-not-allowed disabled:opacity-40",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Settings navigation
───────────────────────────────────────────── */

function SettingsNav({ active, onChange }) {
  const items = [
    ["account", "Account"],
    ["appearance", "Appearance"],
    ["ai", "AI behavior"],
    ["password", "Password"],
    ["security", "Security"],
  ];

  return (
    <nav className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
          Settings
        </p>

        <div className="flex gap-1 overflow-x-auto lg:block">
          {items.map(([id, label]) => {
            const selected = active === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                className={[
                  "whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm transition lg:w-full",
                  selected
                    ? "bg-cyan-400/[0.08] text-cyan-200"
                    : "text-white/45 hover:bg-white/[0.04] hover:text-white/80",
                ].join(" ")}
              >
                <span
                  className={[
                    "mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle",
                    selected
                      ? "bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.6)]"
                      : "bg-white/15",
                  ].join(" ")}
                />

                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   Account
───────────────────────────────────────────── */

function AccountSettings({ showToast }) {
  const [account, setAccount] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        const response = await fetch("/api/settings/account", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load account settings"
          );
        }

        if (!cancelled) {
          setAccount(data.user);
          setName(data.user?.name || "");
        }
      } catch (error) {
        console.error("Account settings load error:", error);

        if (!cancelled) {
          showToast(
            error.message || "Failed to load account settings"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  async function saveAccount() {
    if (saving) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      showToast("Name cannot be empty");
      return;
    }

    if (trimmedName.length > 100) {
      showToast("Name must be 100 characters or less");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/settings/account", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update account"
        );
      }

      setAccount(data.user);
      setName(data.user?.name || trimmedName);

      showToast("Account updated");
    } catch (error) {
      console.error("Account settings save error:", error);

      showToast(
        error.message || "Failed to update account"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard
      eyebrow="Identity"
      title="Account"
      description="Manage the identity information associated with your Sentinel workspace."
    >
      <div className="grid gap-5">
        <div>
          <label className="text-xs font-medium text-white/55">
            Display name
          </label>

          <p className="mb-2 mt-1 text-xs text-white/25">
            Shown throughout your Sentinel workspace.
          </p>

          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={loading || saving}
            maxLength={100}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/55">
            Email address
          </label>

          <p className="mb-2 mt-1 text-xs text-white/25">
            Your account identity cannot be changed here.
          </p>

          <Input
            value={account?.email || ""}
            disabled
            readOnly
          />
        </div>

        <div className="flex justify-end pt-1">
          <ActionButton
            onClick={saveAccount}
            disabled={loading || saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </ActionButton>
        </div>
      </div>
    </SettingsCard>
  );
}

/* ─────────────────────────────────────────────
   Appearance
───────────────────────────────────────────── */

function AppearanceSettings({ showToast }) {
  const {
    settings,
    loading,
    saving,
    setTheme,
    setCompactMode,
    setAnimations,
    resetSettings,
  } = useSettings();

  async function handleReset() {
    try {
      await resetSettings();
      showToast("Appearance reset");
    } catch (error) {
      console.error(error);
      showToast("Failed to reset appearance");
    }
  }

  return (
    <SettingsCard
      eyebrow="Interface"
      title="Appearance"
      description="Control the visual behavior of the Sentinel interface."
    >
      <div className="divide-y divide-white/[0.06]">
        <SettingRow
          title="Theme"
          description="Choose the Sentinel dark interface or follow your system preference."
        >
          <Select
            value={settings.theme}
            onChange={setTheme}
            disabled={loading || saving}
            options={[
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
        </SettingRow>

        <SettingRow
          title="Compact mode"
          description="Reduce spacing to display more information at once."
        >
          <Toggle
            checked={settings.compactMode}
            onChange={setCompactMode}
            disabled={loading || saving}
          />
        </SettingRow>

        <SettingRow
          title="Animations"
          description="Enable interface transitions and visual motion."
          last
        >
          <Toggle
            checked={settings.animations}
            onChange={setAnimations}
            disabled={loading || saving}
          />
        </SettingRow>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleReset}
          disabled={loading || saving}
          className="text-xs text-white/35 transition hover:text-white/70 disabled:opacity-40"
        >
          Reset appearance
        </button>
      </div>
    </SettingsCard>
  );
}

/* ─────────────────────────────────────────────
   AI
───────────────────────────────────────────── */

function AISettings() {
  const {
    settings,
    loading,
    saving,
    setResponseStyle,
    setSecurityMode,
    setWorkspaceContext,
    setCodeExamples,
  } = useSettings();

  return (
    <SettingsCard
      eyebrow="Intelligence"
      title="AI behavior"
      description="Configure how Sentinel responds to security and development requests."
    >
      <div className="divide-y divide-white/[0.06]">
        <SettingRow
          title="Response style"
          description="Control the level of detail in Sentinel's responses."
        >
          <Select
            value={settings.responseStyle}
            onChange={setResponseStyle}
            disabled={loading || saving}
            options={[
              { value: "concise", label: "Concise" },
              { value: "balanced", label: "Balanced" },
              { value: "detailed", label: "Detailed" },
            ]}
          />
        </SettingRow>

        <SettingRow
          title="Security mode"
          description="Keep Sentinel focused on security analysis, defensive practices, and authorized testing."
        >
          <Toggle
            checked={settings.securityMode}
            onChange={setSecurityMode}
            disabled={loading || saving}
          />
        </SettingRow>

        <SettingRow
          title="Workspace context"
          description="Allow Sentinel to use relevant project and finding context during conversations."
        >
          <Toggle
            checked={settings.workspaceContext}
            onChange={setWorkspaceContext}
            disabled={loading || saving}
          />
        </SettingRow>

        <SettingRow
          title="Code examples"
          description="Allow Sentinel to include code examples when they are useful."
          last
        >
          <Toggle
            checked={settings.codeExamples}
            onChange={setCodeExamples}
            disabled={loading || saving}
          />
        </SettingRow>
      </div>
    </SettingsCard>
  );
}

/* ─────────────────────────────────────────────
   Password
───────────────────────────────────────────── */

function PasswordSettings({ showToast }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function changePassword() {
    if (saving) return;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      showToast("Complete all password fields");
      return;
    }

    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      showToast("New password must be different");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to change password"
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showToast("Password changed successfully");
    } catch (error) {
      console.error("Password change error:", error);

      showToast(
        error.message || "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard
      eyebrow="Credentials"
      title="Password"
      description="Update the password used to access your Sentinel account."
    >
      <div className="grid gap-5">
        <div>
          <label className="text-xs font-medium text-white/55">
            Current password
          </label>

          <Input
            className="mt-2"
            type="password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(event.target.value)
            }
            disabled={saving}
            autoComplete="current-password"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-white/55">
              New password
            </label>

            <Input
              className="mt-2"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              disabled={saving}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/55">
              Confirm password
            </label>

            <Input
              className="mt-2"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              disabled={saving}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <ActionButton
            onClick={changePassword}
            disabled={saving}
          >
            {saving ? "Updating..." : "Update password"}
          </ActionButton>
        </div>
      </div>
    </SettingsCard>
  );
}

/* ─────────────────────────────────────────────
   Security
───────────────────────────────────────────── */

function SecuritySettings({ showToast }) {
  const [signingOut, setSigningOut] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleSignOut() {
    if (signingOut || deleting) return;

    setSigningOut(true);

    try {
      await signOut({
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setSigningOut(false);
      showToast("Failed to sign out");
    }
  }

  async function handleDeleteAccount() {
    if (
      deleting ||
      signingOut ||
      deleteConfirmation !== "DELETE"
    ) {
      return;
    }

    if (!deletePassword) {
      showToast("Enter your current password");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(
        "/api/settings/account/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: deletePassword,
            confirmation: "DELETE",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete account"
        );
      }

      await signOut({
        callbackUrl: "/login?deleted=true",
      });
    } catch (error) {
      console.error("Delete account error:", error);

      setDeleting(false);

      showToast(
        error.message || "Failed to delete account"
      );
    }
  }

  function cancelDelete() {
    if (deleting) return;

    setDeleteOpen(false);
    setDeleteConfirmation("");
    setDeletePassword("");
  }

  return (
    <SettingsCard
      eyebrow="Security"
      title="Security & sessions"
      description="Manage your current session and permanently destructive account actions."
    >
      <div className="divide-y divide-white/[0.06]">
        <SettingRow
          title="Current session"
          description="Sign out of the Sentinel session currently active on this device."
        >
          <ActionButton
            onClick={handleSignOut}
            disabled={signingOut || deleting}
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </ActionButton>
        </SettingRow>

        <SettingRow
          title="Sign out everywhere"
          description="Global session management is not available yet."
        >
          <button
            type="button"
            disabled
            className="rounded-xl border border-white/[0.07] px-4 py-2.5 text-sm text-white/25"
          >
            Coming soon
          </button>
        </SettingRow>

        <div className="pt-5">
          {!deleteOpen ? (
            <div className="rounded-2xl border border-red-400/15 bg-red-400/[0.025] p-4 sm:p-5">
              <p className="text-sm font-medium text-red-200">
                Delete account
              </p>

              <p className="mt-1 max-w-xl text-xs leading-5 text-white/35">
                Permanently delete your Sentinel account and all
                data owned by it. This cannot be undone.
              </p>

              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={deleting || signingOut}
                className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-400/[0.12] disabled:opacity-40"
              >
                Delete account
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.035] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-300">
                  !
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-200">
                    Confirm account deletion
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/40">
                    Your account, projects, findings, conversations,
                    messages, settings, and other owned data will be
                    permanently deleted.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-5">
                <div>
                  <label className="text-xs font-medium text-white/55">
                    Current password
                  </label>

                  <p className="mb-2 mt-1 text-xs text-white/25">
                    Required to authorize account deletion.
                  </p>

                  <Input
                    type="password"
                    value={deletePassword}
                    onChange={(event) =>
                      setDeletePassword(event.target.value)
                    }
                    disabled={deleting}
                    autoComplete="current-password"
                    placeholder="Current password"
                    className="focus:border-red-400/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-white/55">
                    Confirmation
                  </label>

                  <p className="mb-2 mt-1 text-xs text-white/25">
                    Type <span className="text-red-200">DELETE</span>{" "}
                    to continue.
                  </p>

                  <Input
                    value={deleteConfirmation}
                    onChange={(event) =>
                      setDeleteConfirmation(
                        event.target.value
                      )
                    }
                    disabled={deleting}
                    placeholder="DELETE"
                    autoComplete="off"
                    className="focus:border-red-400/30"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/55 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteConfirmation !== "DELETE" ||
                    !deletePassword ||
                    deleting ||
                    signingOut
                  }
                  className="rounded-xl border border-red-400/20 bg-red-500/[0.75] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {deleting
                    ? "Deleting account..."
                    : "Permanently delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */

export default function SettingsPage() {
  const [toast, setToast] = useState("");
  const [activeSection, setActiveSection] =
    useState("account");

  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [toast]);

  function showToast(message) {
    setToast(message);
  }

  function handleSectionChange(section) {
    setActiveSection(section);

    const element = document.getElementById(
      `settings-${section}`
    );

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Background />

      <Sidebar />

      <Topbar />

      {/* IMPORTANT:
          lg:ml-64 prevents the content from sitting
          underneath the desktop sidebar.
      */}
      <main className="relative z-10 min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:ml-64 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <header className="mb-8 border-b border-white/[0.07] pb-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7)]" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/55">
                    Control center
                  </p>
                </div>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Settings
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/35">
                  Configure your Sentinel environment, AI behavior,
                  account, and security controls.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/35 sm:self-auto">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                Sentinel online
              </div>
            </div>
          </header>

          {/* Settings layout */}
          <div className="grid gap-6 lg:grid-cols-[190px_minmax(0,1fr)]">
            <SettingsNav
              active={activeSection}
              onChange={handleSectionChange}
            />

            <div className="space-y-5">
              <div id="settings-account" className="scroll-mt-24">
                <AccountSettings
                  showToast={showToast}
                />
              </div>

              <div id="settings-appearance" className="scroll-mt-24">
                <AppearanceSettings
                  showToast={showToast}
                />
              </div>

              <div id="settings-ai" className="scroll-mt-24">
                <AISettings />
              </div>

              <div id="settings-password" className="scroll-mt-24">
                <PasswordSettings
                  showToast={showToast}
                />
              </div>

              <div id="settings-security" className="scroll-mt-24">
                <SecuritySettings
                  showToast={showToast}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm rounded-xl border border-cyan-400/15 bg-[#09090b]/95 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}