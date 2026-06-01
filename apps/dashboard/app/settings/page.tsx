"use client";

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
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";

export default function SettingsPage() {
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
          type: "select",
          options: ["Light", "Dark", "System"],
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

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1
          className="text-3xl font-normal tracking-tight"
          style={{ color: "#26251e", letterSpacing: "-0.11px" }}
        >
          Settings
        </h1>
        <p className="text-base" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card
            className="cursor-card"
            style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
          >
            <CardContent className="p-4">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left cursor-btn-hover focus-warm transition-all duration-150 hover:bg-[#ebeae5]"
                    style={{ color: "#26251e" }}
                  >
                    <section.icon className="h-5 w-5" style={{ color: "#26251e" }} />
                    <span className="font-medium" style={{ color: "#26251e" }}>
                      {section.title}
                    </span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card
            className="cursor-card mt-6"
            style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
          >
            <CardContent className="p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start cursor-btn-hover focus-warm transition-all duration-150"
                style={{ color: "rgba(38, 37, 30, 0.55)" }}
              >
                <SignOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start cursor-btn-hover focus-warm transition-all duration-150"
                style={{ color: "#cf2d56" }}
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
              className="cursor-card hover:cursor-card-hover transition-all duration-200"
              style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "#f7f7f4" }}
                  >
                    <section.icon
                      className="h-5 w-5"
                      style={{ color: "#26251e" }}
                    />
                  </div>
                  <div>
                    <CardTitle
                      className="text-xl font-normal"
                      style={{ color: "#26251e", letterSpacing: "-0.11px" }}
                    >
                      {section.title}
                    </CardTitle>
                    <CardDescription
                      style={{ color: "rgba(38, 37, 30, 0.55)" }}
                    >
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
                      className="flex items-center justify-between py-3 border-b"
                      style={{ borderColor: "rgba(38, 37, 30, 0.1)" }}
                    >
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: "#26251e" }}
                        >
                          {item.label}
                        </div>
                        {item.type !== "toggle" && (
                          <div
                            className="text-sm mt-1"
                            style={{ color: "rgba(38, 37, 30, 0.55)" }}
                          >
                            {item.value}
                          </div>
                        )}
                      </div>
                      {item.type === "toggle" && (
                        <button
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-btn-hover focus-warm`}
                          style={{
                            backgroundColor:
                              item.value === "enabled"
                                ? "#26251e"
                                : "#f7f7f4",
                          }}
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
                      {item.type === "select" && (
                        <select
                          className="px-3 py-2 rounded-md text-sm cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#f7f7f4",
                            borderColor: "rgba(38, 37, 30, 0.1)",
                            color: "#26251e",
                          }}
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
                          className="cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#f7f7f4",
                            borderColor: "rgba(38, 37, 30, 0.1)",
                            color: "#26251e",
                          }}
                        >
                          {item.label}
                        </Button>
                      )}
                      {item.type === "danger" && (
                        <Button
                          variant="outline"
                          className="cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#cf2d56",
                            borderColor: "#cf2d56",
                            color: "#f2f1ed",
                          }}
                        >
                          {item.label}
                        </Button>
                      )}
                      {item.type === "info" && (
                        <button className="text-sm cursor-btn-hover focus-warm transition-all duration-150"
                          style={{ color: "rgba(38, 37, 30, 0.55)" }}>
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
              className="cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#f7f7f4",
                borderColor: "rgba(38, 37, 30, 0.1)",
                color: "#26251e",
              }}
            >
              Cancel
            </Button>
            <Button
              className="cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#ebeae5",
                color: "#26251e",
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
