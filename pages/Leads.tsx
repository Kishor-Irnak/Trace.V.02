import React, { useEffect, useState, useMemo, useRef } from "react";
import { crmService } from "../services/crmService";
import { Lead, LeadStatus } from "../types";
import { GlassCard, GlassButton } from "../components/ui/Glass";
import {
  ArrowUpDown,
  MoreHorizontal,
  Upload,
  Search,
  Plus,
  X,
  Save,
  Trash2,
  Edit2,
  FileSpreadsheet,
} from "lucide-react";
import { ROLE_TEMPLATES } from "../templates";

// --- Reusable Modal Component ---
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 transform scale-100 transition-all">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Lead;
    direction: "asc" | "desc";
  } | null>(null);

  // Dynamic Stages based on Role
  const [currentStages, setCurrentStages] = useState<any[]>(
    ROLE_TEMPLATES.sales.stages
  );

  // Modal & Editing State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: "",
    company: "",
    email: "",
    value: 0,
    stage: "New",
    tags: [],
  });

  // File Input Ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Data & Role Subscription ---
  useEffect(() => {
    const unsubscribeLeads = crmService.subscribeLeads(setLeads);
    const unsubscribeSettings = crmService.subscribeSettings((settings) => {
      if (settings && settings.role && ROLE_TEMPLATES[settings.role]) {
        setCurrentStages(ROLE_TEMPLATES[settings.role].stages);
      } else {
        setCurrentStages(ROLE_TEMPLATES.sales.stages);
      }
    });

    return () => {
      unsubscribeLeads();
      unsubscribeSettings();
    };
  }, []);

  // --- 2. Filter & Sort Logic ---
  const filteredLeads = useMemo(() => {
    let data = [...leads];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (lead) =>
          lead.name.toLowerCase().includes(lowerQuery) ||
          lead.company.toLowerCase().includes(lowerQuery) ||
          lead.email.toLowerCase().includes(lowerQuery)
      );
    }

    if (sortConfig) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [leads, searchQuery, sortConfig]);

  const handleSort = (key: keyof Lead) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  // --- 3. CRUD Operations ---
  const handleOpenCreate = () => {
    setEditingLeadId(null);
    const firstStageId = currentStages[0]?.id || "New";
    setFormData({
      name: "",
      company: "",
      email: "",
      value: 0,
      stage: firstStageId as LeadStatus,
      tags: [],
      owner: "Me",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setFormData({ ...lead });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = {
      ...formData,
      value: Number(formData.value) || 0,
      lastActivity: new Date().toISOString(),
    } as Lead;

    try {
      if (editingLeadId) {
        await crmService.updateLead(editingLeadId, leadData);
      } else {
        await crmService.addLead(leadData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save", error);
      alert("Error saving lead");
    }
  };

  const handleDelete = async () => {
    if (
      editingLeadId &&
      window.confirm("Are you sure you want to delete this lead?")
    ) {
      await crmService.deleteLead(editingLeadId);
      setIsModalOpen(false);
    }
  };

  // --- 4. Import / Export ---
  const handleExport = () => {
    const headers = ["Name,Company,Email,Stage,Value,Owner,LastActivity"];
    const rows = leads.map(
      (l) =>
        `"${l.name}","${l.company}","${l.email}","${l.stage}","${l.value}","${
          l.owner || ""
        }","${l.lastActivity || ""}"`
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const lines = text.split("\n");

      let importedCount = 0;
      const defaultStage = currentStages[0]?.id || "New"; // Use dynamic stage

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(",");
        if (values.length < 3) continue;

        const lead: any = {
          name: values[0]?.trim() || "Unknown",
          company: values[1]?.trim() || "",
          email: values[2]?.trim() || "",
          value: Number(values[3]?.trim()) || 0,
          stage: (values[4]?.trim() as LeadStatus) || defaultStage,
          owner: "Imported",
          lastActivity: new Date().toISOString(),
        };

        await crmService.addLead(lead);
        importedCount++;
      }

      alert(`Successfully imported ${importedCount} leads!`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6 h-full pb-10">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900">Leads Management</h2>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative group flex-1 sm:flex-initial">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          <GlassButton variant="outline" onClick={handleImportClick}>
            <Upload size={14} className="mr-2" /> Import
          </GlassButton>

          <GlassButton variant="outline" onClick={handleExport}>
            <FileSpreadsheet size={14} className="mr-2" /> Export
          </GlassButton>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-md"
          >
            <Plus size={16} />{" "}
            <span className="hidden sm:inline">New Lead</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 shadow-sm">
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {[
                  { label: "Lead Name", key: "name" },
                  { label: "Company", key: "company" },
                  { label: "Email", key: "email" },
                  { label: "Stage", key: "stage" },
                  { label: "Value", key: "value" },
                  { label: "Owner", key: "owner" },
                ].map((h) => (
                  <th
                    key={h.key}
                    className="px-6 py-4 font-medium cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                    onClick={() => handleSort(h.key as keyof Lead)}
                  >
                    <div className="flex items-center gap-2">
                      {h.label}
                      <ArrowUpDown
                        size={12}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                          sortConfig?.key === h.key
                            ? "opacity-100 text-blue-500"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No leads found matching your search.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => handleOpenEdit(lead)}
                    className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                          {lead.name.charAt(0)}
                        </div>
                        {lead.name}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {lead.company}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{lead.email}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide
                          ${
                            lead.stage.toLowerCase().includes("won")
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : lead.stage.toLowerCase().includes("new")
                              ? "bg-blue-50 border-blue-100 text-blue-700"
                              : lead.stage.toLowerCase().includes("lost")
                              ? "bg-red-50 border-red-100 text-red-700"
                              : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                      >
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      {lead.value.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                        {lead.owner}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {filteredLeads.length} leads</span>
          <span>Sorted by {sortConfig ? sortConfig.key : "default"}</span>
        </div>
      </div>

      {/* --- CRUD MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLeadId ? "Edit Lead" : "Add New Lead"}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Name
              </label>
              <input
                required
                autoFocus
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Company
              </label>
              <input
                required
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Email
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Value (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Stage
              </label>
              {/* Changed: Use dynamic currentStages state */}
              <select
                value={formData.stage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stage: e.target.value as LeadStatus,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              >
                {currentStages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            {editingLeadId && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                {/* RESPONSIVE: Only show text on small screens+ */}
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors ${
                !editingLeadId ? "flex-1" : ""
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2"
            >
              {editingLeadId ? <Save size={16} /> : <Plus size={16} />}
              {/* RESPONSIVE: Short text for mobile, Long for Desktop */}
              <span className="hidden sm:inline">
                {editingLeadId ? "Save Changes" : "Create Lead"}
              </span>
              <span className="inline sm:hidden">
                {editingLeadId ? "Save" : "Create"}
              </span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leads;
