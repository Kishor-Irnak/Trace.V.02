import React, { useState, useEffect } from "react";
import { crmService } from "../services/crmService";
import { Lead, LeadStatus } from "../types";
import { PIPELINE_STAGES } from "../constants";
import { GlassCard, Badge } from "../components/ui/Glass";
import { MoreHorizontal, Plus } from "lucide-react";

const Pipeline: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // ✅ Generate initials from FULL NAME (fix)
  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    const unsubscribe = crmService.subscribe(setLeads);
    return () => unsubscribe();
  }, []);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      const el = document.getElementById(`card-${leadId}`);
      if (el) el.style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(null);
    const el = document.getElementById(`card-${leadId}`);
    if (el) el.style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stageId: LeadStatus) => {
    e.preventDefault();
    if (draggedLeadId) {
      await crmService.updateLeadStage(draggedLeadId, stageId);
    }
    setDraggedLeadId(null);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumSignificantDigits: 3,
    }).format(val);

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden pb-2 -mx-4 md:-mx-6 px-4 md:px-6">
      <div className="flex h-full gap-4 md:gap-5 min-w-[1000px]">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id);
          const stageTotal = stageLeads.reduce(
            (acc, curr) => acc + curr.value,
            0
          );

          return (
            <div
              key={stage.id}
              className="flex-1 min-w-[260px] md:min-w-[280px] flex flex-col h-full"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className="mb-4 px-1 flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    {stage.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto pr-1 pb-10 space-y-3">
                {stageLeads.length > 0 && (
                  <div className="text-[10px] text-slate-400 font-medium pb-2 border-b border-slate-200 mb-2">
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
                    className="cursor-grab active:cursor-grabbing perspective-1000"
                  >
                    <GlassCard
                      hoverEffect={true}
                      className="p-3 flex flex-col gap-3 group relative border hover:border-slate-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">
                            {lead.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {lead.company}
                          </p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity ml-2 shrink-0">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>

                      {/* Avatar + Email */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {/* ✅ Avatar shows INITIALS from lead.name */}
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                          {getInitials(lead.name)}
                        </div>

                        <span className="truncate text-slate-400 text-[11px]">
                          {lead.email}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="text-xs font-medium text-slate-600">
                          {formatCurrency(lead.value)}
                        </span>
                        <div className="flex gap-1">
                          {lead.tags?.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              color="bg-slate-50 border-slate-100 text-slate-500"
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
                  <div className="h-24 border border-dashed border-slate-200 rounded-md flex items-center justify-center text-slate-300 text-xs">
                    Drop lead here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
