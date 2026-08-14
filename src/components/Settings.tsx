"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Cpu,
  Key,
  Eye,
  EyeOff,
  X,
  Loader2,
  SettingsIcon,
  PlusIcon,
} from "lucide-react";
import type { UserSettings, ModelItem } from "@/app/api/_db/settings";
import {
  addModelSettingAction,
  updateModelSettingAction,
  deleteModelSettingAction,
} from "@/app/actions";
import { toast } from "@/lib/toast";
import { CustomButton } from "@/components/ui/button";

type ModelCardProps = {
  model: ModelItem;
  isDeleting: boolean;
  isKeyVisible: boolean;
  copiedId: string | null;
  onEdit: (model: ModelItem) => void;
  onDelete: (model: ModelItem) => void;
  onToggleKey: (id: string) => void;
  onCopy: (key: string, id: string) => void;
  maskApiKey: (key: string) => string;
};

function ModelCard({
  model,
  isDeleting,
  isKeyVisible,
  copiedId,
  onEdit,
  onDelete,
  onToggleKey,
  onCopy,
  maskApiKey,
}: ModelCardProps) {
  const [isModelHovered, setIsModelHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const actionButtons = (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleKey(model.id); }}
        className="rounded-md cursor-pointer px-2 py-1 transition text-[10px] font-medium text-white/70 hover:text-white hover:bg-amber-500"
        title={isKeyVisible ? "Hide Key" : "Show Key"}
      >
        {isKeyVisible ? "Hide" : "Show"}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onCopy(model.apiKey, model.id); }}
        className="rounded-md cursor-pointer px-2 py-1 transition text-[10px] font-medium text-white/70 hover:text-white hover:bg-green-600"
        title="Copy Key"
      >
        {copiedId === model.id ? "Copied!" : "Copy"}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(model); }}
        title="Edit model"
        className="rounded-md cursor-pointer px-2 py-1 transition text-[10px] font-medium text-white/70 hover:text-white hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(model); }}
        disabled={isDeleting}
        title="Delete model"
        className="rounded-md cursor-pointer px-2 py-1 transition text-[10px] font-medium disabled:opacity-50 text-white/70 hover:text-white hover:bg-red-600"
      >
        {isDeleting ? "…" : "Delete"}
      </button>
    </>
  );

  return (
    <div
      className="overflow-hidden rounded-2xl bg-white dark:bg-white/10 border border-white/5 text-white shadow-sm"
      onMouseEnter={() => setIsModelHovered(true)}
      onMouseLeave={() => setIsModelHovered(false)}
      onClick={() => setIsExpanded((p) => !p)}
    >
      <div className="flex items-center gap-2 p-2">
        <div className="rounded-xl bg-white p-1">
          <Image
            src={model.logo || "/ai-model.png"}
            alt={model.name}
            width={24}
            height={24}
            unoptimized
            className={`h-6 w-6 shrink-0 rounded-full object-cover ${!model.logo ? "grayscale invert" : ""}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/ai-model.png";
              target.classList.add("invert");
            }}
          />
        </div>

        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
          <span className="text-xs font-semibold truncate max-w-28">{model.name}</span>
          <span className="inline-flex items-center rounded-sm bg-white/10 px-1 py-px text-[9px] font-mono text-white/60 truncate max-w-24">
            {model.modelName}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 min-w-0 flex-1">
          <div className="w-px h-3.5 bg-white/15 shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Key className="h-3 w-3 shrink-0 text-white/50" />
            <span className="font-mono text-[10px] text-white/60 truncate">
              {isKeyVisible ? model.apiKey : maskApiKey(model.apiKey)}
            </span>
          </div>
          <div
            className={`flex items-center gap-0.5 shrink-0 transition-all duration-200 ${isModelHovered ? "opacity-100 translate-x-0" : "opacity-0 pointer-events-none translate-x-2"
              }`}
          >
            {actionButtons}
          </div>
        </div>
      </div>

      <div className={`sm:hidden grid transition-all duration-250 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}>
        <div className="overflow-hidden">
          <div className="flex items-center justify-between gap-2 mx-3 mb-2 rounded-xl bg-white/5 px-2.5 py-1.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Key className="h-3 w-3 shrink-0 text-white/50" />
              <span className="font-mono text-[10px] text-white/60 truncate">
                {isKeyVisible ? model.apiKey : maskApiKey(model.apiKey)}
              </span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {actionButtons}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings({ settings: initialSettings }: { settings: UserSettings }) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null);

  const [name, setName] = useState("");
  const [modelName, setModelName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [logo, setLogo] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [visibleKeyIds, setVisibleKeyIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingModel(null);
    setName("");
    setModelName("");
    setApiKey("");
    setLogo("");
    setShowApiKey(false);
    setIsModalOpen(true);
  };

  const openEditModal = (model: ModelItem) => {
    setEditingModel(model);
    setName(model.name);
    setModelName(model.modelName);
    setApiKey(model.apiKey);
    setLogo(model.logo || "");
    setShowApiKey(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingModel(null);
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !modelName.trim() || !apiKey.trim()) {
      toast.error("Please fill in all required fields (Name, Model Name, API Key)");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingModel) {
        const res = await updateModelSettingAction(editingModel.id, {
          name: name.trim(),
          modelName: modelName.trim(),
          apiKey: apiKey.trim(),
          logo: logo.trim() || undefined,
        });

        if (res.ok && res.settings) {
          setSettings(res.settings);
          toast.success(`Updated model "${name.trim()}" successfully!`);
          closeModal();
        } else {
          toast.error(res.error || "Failed to update model parameter");
        }
      } else {
        const res = await addModelSettingAction({
          name: name.trim(),
          modelName: modelName.trim(),
          apiKey: apiKey.trim(),
          logo: logo.trim() || undefined,
        });

        if (res.ok && res.settings) {
          setSettings(res.settings);
          toast.success(`Added new model "${name.trim()}" successfully!`);
          closeModal();
        } else {
          toast.error(res.error || "Failed to add model parameter");
        }
      }
    } catch {
      toast.error("An unexpected error occurred while saving model setting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModel = async (model: ModelItem) => {
    if (!confirm(`Are you sure you want to remove the model parameter "${model.name}"?`)) {
      return;
    }

    setDeletingId(model.id);
    try {
      const res = await deleteModelSettingAction(model.id);
      if (res.ok && res.settings) {
        setSettings(res.settings);
        toast.success(`Model "${model.name}" deleted successfully.`);
      } else {
        toast.error(res.error || "Failed to delete model setting");
      }
    } catch {
      toast.error("An error occurred while deleting model setting.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeyIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (textToCopy: string, id: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "••••••••••••";
    return `${key.slice(0, 4)}••••••••••••${key.slice(-4)}`;
  };

  return (
    <div className="min-h-0 text-white">
      <main className="sm:mx-auto mx-2 max-w-4xl sm:mt-0 mt-10 px-3 sm:px-6 py-4 sm:py-10 space-y-4 sm:space-y-6">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 border-b border-dashed border-white/30 pb-4 sm:pb-5">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-white shrink-0">
                <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-white sm:text-2xl truncate">
                Settings
              </h1>
            </div>
            <p className="text-[11px] text-white/50 sm:text-sm truncate">
              Configure your AI processing models, custom parameters, and API keys for Anthos.
            </p>
          </div>
          <CustomButton
            onClick={openAddModal}
            title="Add new model parameter"
          >
            <span>Add</span>
          </CustomButton>
        </div>
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-2">
              AI Model Parameters &amp; Keys
            </h2>
            <span className="text-[11px] sm:text-xs text-white/50 font-mono">
              {settings.models.length} {settings.models.length === 1 ? "model" : "models"} total
            </span>
          </div>

          {settings.models.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 sm:p-12 text-center space-y-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center">
                <Cpu className="h-5 w-5 sm:h-6 sm:w-6 text-white/50" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-white">No AI models configured yet</h3>
                <p className="text-[11px] sm:text-xs text-white/50 leading-relaxed">
                  Add model parameters with your custom display name, AI model identifier, and provider API key to customize email analysis.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {settings.models.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isDeleting={deletingId === model.id}
                  isKeyVisible={!!visibleKeyIds[model.id]}
                  copiedId={copiedId}
                  onEdit={openEditModal}
                  onDelete={handleDeleteModel}
                  onToggleKey={toggleKeyVisibility}
                  onCopy={copyToClipboard}
                  maskApiKey={maskApiKey}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
          onClick={closeModal}
        >
          <div
            className="w-full sm:w-72 rounded-t-4xl mx-2 sm:rounded-2xl bg-[#2c0237] border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10">
              <h2 className="text-xs font-semibold text-white">
                {editingModel ? "Edit Model" : "Add Model"}
              </h2>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                title="Close dialog"
                className="rounded cursor-pointer p-1 text-white/50 hover:text-white transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <form onSubmit={handleSaveModel} className="px-4 py-3 space-y-2.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-white/60 uppercase tracking-wide">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  title="Enter a display name for this model"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white placeholder:text-white/50 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-white/60 uppercase tracking-wide">
                  Model Identifier <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  title="Enter the AI model identifier or provider name"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full rounded-lg bg-white/10 px-2.5 py-1.5 font-mono text-xs text-white placeholder:text-white/50 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-white/60 uppercase tracking-wide">
                  API Key <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    required
                    title="Enter your provider API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded-lg bg-white/10 pl-2.5 pr-8 py-1.5 font-mono text-xs text-white placeholder:text-white/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    title={showApiKey ? "Hide API key" : "Show API key"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-white/50 hover:text-white transition"
                  >
                    {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-white/60 uppercase tracking-wide">
                  Logo URL <span className="text-white/50 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  title="Enter a URL for the model's logo icon (optional)"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white placeholder:text-white/50 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  title={editingModel ? "Save changes to this model" : "Add this model parameter"}
                  className="inline-flex items-center gap-1.5 rounded-lg cursor-pointer bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-600/90 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlusIcon className="h-3 w-3" />}
                  {editingModel ? "Save Model" : "Add Model"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
