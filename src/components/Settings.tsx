"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Cpu,
  Key,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Loader2,
  SettingsIcon,
} from "lucide-react";
import type { UserSettings, ModelItem } from "@/app/api/_db/settings";
import {
  addModelSettingAction,
  updateModelSettingAction,
  deleteModelSettingAction,
} from "@/app/actions";
import { toast } from "@/lib/toast";

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
    <div className="min-h-0 text-black">
      <main className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-10 space-y-4 sm:space-y-6">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 border-b border-dashed border-black/15 pb-4 sm:pb-5">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-black shrink-0">
                <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-black sm:text-2xl truncate">
                User Settings
              </h1>
            </div>
            <p className="text-[11px] text-gray-500 sm:text-sm truncate">
              Configure your AI processing models, custom parameters, and API keys for Firemail.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl cursor-pointer bg-[#ff3131] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#ff3131]/90 active:scale-95 sm:text-sm shrink-0"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Add</span>
          </button>
        </div>
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-black flex items-center gap-2">
              AI Model Parameters &amp; Keys
            </h2>
            <span className="text-[11px] sm:text-xs text-gray-400 font-mono">
              {settings.models.length} {settings.models.length === 1 ? "model" : "models"} total
            </span>
          </div>

          {settings.models.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-gray-50/50 p-6 sm:p-12 text-center space-y-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center">
                <Cpu className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-black">No AI models configured yet</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
                  Add model parameters with your custom display name, AI model identifier, and provider API key to customize email analysis.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {settings.models.map((model) => {
                const isKeyVisible = !!visibleKeyIds[model.id];
                const isDeleting = deletingId === model.id;

                return (
                  <div
                    key={model.id}
                    className="overflow-hidden rounded-4xl border border-black/10 bg-white p-3 sm:p-4 shadow-sm transition space-y-2.5 sm:space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Image
                          src={model.logo || "/ai-model.png"}
                          alt={model.name}
                          width={32}
                          height={32}
                          unoptimized
                          className={`h-8 w-8 shrink-0 rounded-full object-cover ${!model.logo ? "grayscale" : ""}`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/ai-model.png";
                            target.classList.add("invert");
                          }}
                        />
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h3 className="text-xs sm:text-sm font-semibold text-black truncate max-w-50 sm:max-w-none">
                              {model.name}
                            </h3>
                            <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono font-medium text-gray-700 max-w-35 sm:max-w-none truncate">
                              {model.modelName}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono truncate">
                            ID: {model.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(model)}
                          title="Edit model"
                          className="rounded-lg cursor-pointer p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black transition"
                        >
                          <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteModel(model)}
                          disabled={isDeleting}
                          title="Delete model"
                          className="rounded-lg cursor-pointer p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-lg p-2 bg-gray-50/60 sm:p-2.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Key className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="font-mono text-[11px] sm:text-xs text-black break-all">
                          {isKeyVisible ? model.apiKey : maskApiKey(model.apiKey)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleKeyVisibility(model.id)}
                          className="rounded cursor-pointer p-1 text-gray-400 hover:text-black transition"
                          title={isKeyVisible ? "Hide Key" : "Show Key"}
                        >
                          {isKeyVisible ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(model.apiKey, model.id)}
                          className="rounded cursor-pointer p-1 text-gray-400 hover:text-black transition"
                          title="Copy Key"
                        >
                          {copiedId === model.id ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="w-xs rounded-2xl bg-white p-4 sm:p-6 shadow-2xl border border-black/10 space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/10 pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-black">
                  {editingModel ? "Edit Model Parameter" : "Add Model Parameter"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-lg cursor-pointer p-1 text-gray-400 hover:bg-gray-100 hover:text-black transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveModel} className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-black">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Groq Llama 3.3 Versatile"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-gray-100/70 px-3 py-2 text-xs text-black placeholder:text-gray-400 outline-none border-0 focus:bg-gray-100 sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-black">
                  Model Identifier / Provider Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. llama-3.3-70b-versatile or gpt-4o"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full rounded-xl bg-gray-100/70 px-3 py-2 font-mono text-xs text-black placeholder:text-gray-400 outline-none border-0 focus:bg-gray-100 sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-black">
                  API Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    required
                    placeholder="e.g. gsk_... or sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded-xl bg-gray-100/70 pl-3 pr-9 py-2 font-mono text-xs text-black placeholder:text-gray-400 outline-none border-0 focus:bg-gray-100 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-black transition"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-black">
                  Logo Icon URL <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. /model.png or https://..."
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full rounded-xl bg-gray-100/70 px-3 py-2 text-xs text-black placeholder:text-gray-400 outline-none border-0 focus:bg-gray-100 sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-black/10 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-xl cursor-pointer bg-gray-100/70 hover:bg-gray-100 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-gray-700 transition sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl cursor-pointer bg-[#ff3131] px-4 py-1.5 sm:px-5 sm:py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#ff3131]/90 active:scale-95 disabled:opacity-50 sm:text-sm"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingModel ? "Save Changes" : "Add Model"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
