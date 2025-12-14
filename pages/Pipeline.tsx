import React, { useState, useEffect, useRef, useCallback } from "react";
import { crmService } from "../services/crmService";
import { authService } from "../services/authService";
import { Lead, LeadStatus } from "../types";
import { ROLE_TEMPLATES } from "../templates"; // Import the templates
import { GlassCard, Badge } from "../components/ui/Glass";
import {
  MoreHorizontal,
  Plus,
  MousePointer,
  X,
  Save,
  Trash2,
  Edit2,
} from "lucide-react";

// --- Simple Modal Component ---
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

const Pipeline: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  // Use default sales stages initially, will update after auth
  const [currentStages, setCurrentStages] = useState<any[]>(
    ROLE_TEMPLATES.sales.stages
  );
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Modal & Form State
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, left: 0 });

  /* ================= AUTH & SETTINGS SUBSCRIBE ================= */
  useEffect(() => {
    let unsubscribeLeads: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;

    const unsubAuth = authService.onChange((user) => {
      if (!user) {
        setLeads([]);
        unsubscribeLeads?.();
        unsubscribeSettings?.();
        return;
      }

      // 1. Subscribe to Role Settings
      unsubscribeSettings = crmService.subscribeSettings((settings) => {
        if (settings && settings.role && ROLE_TEMPLATES[settings.role]) {
          setCurrentStages(ROLE_TEMPLATES[settings.role].stages);
        } else {
          setCurrentStages(ROLE_TEMPLATES.sales.stages);
        }
      });

      // 2. Subscribe to Leads
      unsubscribeLeads = crmService.subscribeLeads(setLeads);
    });

    return () => {
      unsubAuth();
      unsubscribeLeads?.();
      unsubscribeSettings?.();
    };
  }, []);

  // ... Helpers ...
  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumSignificantDigits: 3,
    }).format(val);

  // ... Handlers ...
  const handleOpenCreate = (stage: string) => {
    setEditingLeadId(null);
    setFormData({
      name: "",
      company: "",
      email: "",
      value: 0,
      stage: stage as LeadStatus,
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
      console.error("Failed to save lead", error);
    }
  };
  const handleDelete = async () => {
    if (editingLeadId && window.confirm("Delete this lead?")) {
      await crmService.deleteLead(editingLeadId);
      setIsModalOpen(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      const el = document.getElementById(`card-${leadId}`);
      if (el) el.style.opacity = "0.4";
    }, 0);
  };
  const handleDragEnd = (_e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(null);
    const el = document.getElementById(`card-${leadId}`);
    if (el) el.style.opacity = "1";
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!draggedLeadId) return;
    await crmService.updateLead(draggedLeadId, {
      stage: stageId as LeadStatus,
      lastActivity: new Date().toISOString(),
    });
    setDraggedLeadId(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2 && containerRef.current) {
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.pageX, left: containerRef.current.scrollLeft };
    }
  };
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = (x - dragStart.current.x) * 1.5;
      containerRef.current.scrollLeft = dragStart.current.left - walk;
    },
    [isDragging]
  );
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <>
      <div className="flex flex-col h-full relative overflow-hidden -mx-4 md:-mx-6">
        <div
          ref={containerRef}
          className={`flex-1 overflow-x-auto overflow-y-hidden pb-2 px-4 md:px-6 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-default"
          }`}
          onMouseDown={handleMouseDown}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex h-full min-w-[1000px] divide-x divide-slate-200/60">
            {currentStages.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage.id);
              const stageTotal = stageLeads.reduce(
                (acc, curr) => acc + curr.value,
                0
              );

              return (
                <div
                  key={stage.id}
                  className="flex-1 min-w-[260px] md:min-w-[280px] flex flex-col h-full px-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="mb-4 px-1 flex items-center justify-between group pt-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${stage.color}`}
                      ></div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide">
                        {stage.title}
                      </h3>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {stageLeads.length}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenCreate(stage.id)}
                      className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-slate-900"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-1 pb-10 space-y-3 custom-scrollbar">
                    {stageLeads.length > 0 && (
                      <div className="text-[10px] pb-2 border-b border-slate-100 mb-2 text-slate-400 font-medium tracking-tight">
                        {formatCurrency(stageTotal)} potential
                      </div>
                    )}
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        id={`card-${lead.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={(e) => handleDragEnd(e, lead.id)}
                        onClick={() => handleOpenEdit(lead)}
                        className="cursor-grab active:cursor-grabbing"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <GlassCard className="p-3 flex flex-col gap-3 border border-transparent hover:border-slate-300 hover:shadow-md transition-all group bg-white">
                          <div className="flex justify-between">
                            <div className="overflow-hidden">
                              <p className="font-semibold text-sm truncate text-slate-800 group-hover:text-blue-600 transition-colors">
                                {lead.name}
                              </p>
                              <p className="text-xs truncate text-slate-500 font-medium">
                                {lead.company}
                              </p>
                            </div>
                            <button className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit2 size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                              {getInitials(lead.name)}
                            </div>
                            <span className="truncate">{lead.email}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                            <span className="text-xs font-bold text-slate-700">
                              {formatCurrency(lead.value)}
                            </span>
                            <div className="flex gap-1">
                              {(Array.isArray(lead.tags) ? lead.tags : [])
                                .slice(0, 2)
                                .map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-[9px] px-1.5 py-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div
                        onClick={() => handleOpenCreate(stage.id)}
                        className="h-24 border-2 border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center text-xs text-slate-400 gap-1 cursor-pointer hover:border-slate-300 hover:text-slate-500 transition-colors bg-slate-50/50"
                      >
                        <Plus size={16} />
                        <span className="text-[10px] opacity-70 font-medium">
                          Add Lead
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-none p-2 border-t border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-center text-xs text-slate-500 font-medium z-10 mx-4 md:mx-6 rounded-t-lg">
          <MousePointer size={14} className="mr-2 text-slate-400" />
          Tip: Hold{" "}
          <kbd className="mx-1 px-1 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px]">
            Right Click
          </kbd>{" "}
          to drag board
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLeadId ? "Edit Lead" : "Add New Lead"}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Lead Name
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
              Email Address
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
              {editingLeadId ? "Save Changes" : "Create Lead"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Pipeline;
