"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Trash,
  SignOut,
  Sun,
  Moon,
  Desktop,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const settingsSections = [
    {
      id: "profile",
      title: "Profile Settings",
      description: "Manage your account information and preferences",
      icon: User,
      items: [
        {
          label: "Name",
          value: "John Doe",
          type: "text",
        },
        {
          label: "Email",
          value: "john@example.com",
          type: "email",
        },
        {
          label: "Username",
          value: "@johndoe",
          type: "text",
        },
        {
          label: "Bio",
          value: "Full-stack developer and educator",
          type: "textarea",
        },
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Manage how you receive notifications",
      icon: Bell,
      items: [
        {
          label: "Email Notifications",
          value: "enabled",
          type: "toggle",
        },
        {
          label: "Push Notifications",
          value: "enabled",
          type: "toggle",
        },
        {
          label: "Course Updates",
          value: "enabled",
          type: "toggle",
        },
        {
          label: "Student Progress Alerts",
          value: "disabled",
          type: "toggle",
        },
      ],
    },
    {
      id: "security",
      title: "Security",
      description: "Manage your security settings and preferences",
      icon: Shield,
      items: [
        {
          label: "Two-Factor Authentication",
          value: "enabled",
          type: "toggle",
        },
        {
          label: "Change Password",
          value: "••••••••",
          type: "password",
        },
        {
          label: "Active Sessions",
          value: "3 devices",
          type: "info",
        },
        {
          label: "Login History",
          value: "Last 7 days",
          type: "info",
        },
      ],
    },
    {
      id: "appearance",
      title: "Appearance",
      description: "Customize your dashboard appearance",
      icon: Palette,
      items: [
        {
          label: "Theme",
          value: "Light",
          type: "theme",
        },
        {
          label: "Language",
          value: "English",
          type: "select",
          options: ["English", "Spanish", "French", "German"],
        },
        {
          label: "Timezone",
          value: "UTC-5",
          type: "select",
          options: ["UTC-8", "UTC-5", "UTC+0", "UTC+1", "UTC+8"],
        },
        {
          label: "Compact Mode",
          value: "disabled",
          type: "toggle",
        },
      ],
    },
    {
      id: "data",
      title: "Data & Privacy",
      description: "Manage your data and privacy settings",
      icon: Database,
      items: [
        {
          label: "Export Data",
          value: "Download all your data",
          type: "action",
        },
        {
          label: "Delete Account",
          value: "Permanently delete your account",
          type: "danger",
        },
      ],
    },
  ];

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Desktop },
  ] as const;

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1
          className="text-3xl font-normal tracking-tight text-foreground"
          style={{ letterSpacing: "-0.11px" }}
        >
          Settings
        </h1>
        <p className="text-base text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="cursor-card bg-card rounded-lg">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left cursor-btn-hover focus-warm transition-all duration-150 hover:bg-accent text-foreground"
                  >
                    <section.icon className="h-5 w-5 text-foreground" />
                    <span className="font-medium text-foreground">
                      {section.title}
                    </span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="cursor-card mt-6 bg-card rounded-lg">
            <CardContent className="p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start cursor-btn-hover focus-warm transition-all duration-150 text-muted-foreground"
              >
                <SignOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start cursor-btn-hover focus-warm transition-all duration-150 text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {settingsSections.map((section) => (
            <Card
              key={section.id}
              className="cursor-card hover:cursor-card-hover transition-all duration-200 bg-card rounded-lg"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100">
                    <section.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle
                      className="text-xl font-normal text-foreground"
                      style={{ letterSpacing: "-0.11px" }}
                    >
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-border/10"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {item.label}
                        </div>
                        {item.type !== "toggle" && item.type !== "theme" && (
                          <div className="text-sm mt-1 text-muted-foreground">
                            {item.value}
                          </div>
                        )}
                      </div>
                      {item.type === "toggle" && (
                        <button
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-btn-hover focus-warm ${
                            item.value === "enabled"
                              ? "bg-primary"
                              : "bg-surface-100"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              item.value === "enabled"
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      )}
                      {item.type === "theme" && mounted && (
                        <div className="flex items-center gap-1 rounded-lg bg-surface-100 p-1">
                          {themeOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = theme === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => setTheme(opt.value)}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 cursor-btn-hover focus-warm ${
                                  isActive
                                    ? "bg-surface-300 text-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-accent"
                                }`}
                              >
                                <Icon className="h-4 w-4" weight={isActive ? "fill" : "regular"} />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {item.type === "select" && (
                        <select
                          className="px-3 py-2 rounded-md text-sm cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                        >
                          {item.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                      {item.type === "action" && (
                        <Button
                          variant="outline"
                          className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                        >
                          {item.label}
                        </Button>
                      )}
                      {item.type === "danger" && (
                        <Button
                          variant="outline"
                          className="cursor-btn-hover focus-warm transition-all duration-150 bg-destructive border-destructive text-destructive-foreground"
                        >
                          {item.label}
                        </Button>
                      )}
                      {item.type === "info" && (
                        <button className="text-sm cursor-btn-hover focus-warm transition-all duration-150 text-muted-foreground">
                          View →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Save Changes Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
            >
              Cancel
            </Button>
            <Button
              className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
