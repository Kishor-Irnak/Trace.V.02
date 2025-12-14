import React, { useState, useEffect, useMemo } from "react";
import { GlassCard, GlassButton } from "../components/ui/Glass";
import { UserProfile } from "../types";
import { crmService } from "../services/crmService";
import { ROLE_TEMPLATES } from "../templates";
import { CheckCircle2, User, Building2, Bell } from "lucide-react";

interface SettingsProps {
  user?: UserProfile;
  onUpdateUser?: (user: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    avatar: "",
    plan: "",
  });
  const [currentRole, setCurrentRole] = useState<string>("sales");

  useEffect(() => {
    if (user) setFormData(user);
    const unsubscribe = crmService.subscribeSettings((settings) => {
      if (settings && settings.role) setCurrentRole(settings.role);
    });
    return () => unsubscribe();
  }, [user]);

  // Deep Link Handling
  useEffect(() => {
    const requestedTab = localStorage.getItem("activeSettingsTab");
    if (requestedTab) {
      if (["profile", "workspace", "notifications"].includes(requestedTab))
        setActiveTab(requestedTab);
      localStorage.removeItem("activeSettingsTab");
    }
  }, []);

  const sortedTemplates = useMemo(() => {
    const templates = Object.values(ROLE_TEMPLATES);
    return templates.sort((a: any, b: any) => {
      if (a.id === currentRole) return -1;
      if (b.id === currentRole) return 1;
      return 0;
    });
  }, [currentRole]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "workspace", label: "Workspace", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleSaveProfile = () => {
    if (onUpdateUser) {
      const initials = formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      onUpdateUser({ ...formData, avatar: initials });
      alert("Profile updated successfully!");
    }
  };

  const handleRoleChange = async (roleId: string) => {
    if (
      window.confirm(
        "Changing the workspace template will update your pipeline stages. Continue?"
      )
    ) {
      await crmService.saveUserRole(roleId);
      setCurrentRole(roleId);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage your account and workspace preferences.
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="w-full flex justify-center">
          <div className="flex flex-row gap-1 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md scale-[1.02]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title={tab.label}
                >
                  <Icon size={18} />
                  <span
                    className={`${
                      isActive ? "block" : "hidden md:block"
                    } whitespace-nowrap`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-3xl">
          <GlassCard className="p-6 md:p-10 min-h-[500px] border border-slate-200 shadow-sm bg-white rounded-2xl">
            {activeTab === "profile" && (
              <div className="space-y-8 max-w-md mx-auto">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Personal Information
                  </h3>
                  <p className="text-sm text-slate-500">
                    Update your photo and personal details.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-3xl font-bold text-slate-400 uppercase shadow-inner">
                    {formData.avatar || "JD"}
                  </div>
                  <div className="flex flex-col gap-2 text-center md:text-left">
                    <GlassButton
                      variant="outline"
                      className="text-xs bg-white hover:bg-slate-50 border-slate-300 rounded-lg"
                    >
                      Change Photo
                    </GlassButton>
                    <p className="text-[10px] text-slate-400">
                      JPG, GIF or PNG. Max 1MB.
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="grid gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-center md:justify-start">
                  <GlassButton
                    className="bg-slate-900 text-white hover:bg-slate-800 px-8 rounded-xl"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </GlassButton>
                </div>
              </div>
            )}
            {activeTab === "workspace" && (
              <div>
                <div className="mb-8 text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Workspace Template
                  </h3>
                  <p className="text-sm text-slate-500">
                    Select a preset to customize your pipeline stages. Current
                    active role is highlighted.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedTemplates.map((template: any) => {
                    const Icon = template.icon;
                    const isSelected = currentRole === template.id;
                    return (
                      <div
                        key={template.id}
                        onClick={() =>
                          !isSelected && handleRoleChange(template.id)
                        }
                        className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-spring ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 shadow-xl scale-[1.02] order-first"
                            : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? "bg-white/10 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Icon size={20} />
                          </div>
                          {isSelected && (
                            <div className="bg-white text-slate-900 rounded-full p-1 shadow-sm animate-in fade-in zoom-in duration-300">
                              <CheckCircle2 size={16} />
                            </div>
                          )}
                        </div>
                        <h4
                          className={`font-bold text-sm mb-1 ${
                            isSelected ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {template.label}
                        </h4>
                        <p
                          className={`text-xs ${
                            isSelected ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {template.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeTab === "notifications" && (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <Bell className="text-slate-300" size={32} />
                </div>
                <h3 className="text-slate-900 font-semibold mb-1">
                  Notifications
                </h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Notification preferences will appear here once the feature is
                  available.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;
