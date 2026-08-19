"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Eye,
  EyeOff,
  X,
  Loader2,
  SettingsIcon,
  PlusIcon,
  Layers,
  ChevronDown,
  Sparkles,
  Check,
} from "lucide-react";
import type { UserSettings, ModelItem } from "@/app/api/_db/settings";
import {
  addModelSettingAction,
  updateModelSettingAction,
  deleteModelSettingAction,
} from "@/app/actions";
import { toast } from "@/lib/toast";
import { CustomButton } from "@/components/ui/button";
import { PROVIDERS, type Provider, isSupportedProvider, getProviderByName } from "@/lib/providers";

const HARDCODED_DEFAULT_MODEL: ModelItem = {
  id: "hardcoded-llama-70b",
  name: "Llama 70B",
  modelName: "llama-3.3-70b-versatile",
  apiKey: "FREE",
  logo: "/ai-default.png",
  settingId: "system-default",
};

const PROVIDER_MODEL_HINTS: Record<string, string> = {
  Anthropic: "e.g. claude-3-7-sonnet-20250219, claude-3-5-haiku-20241022",
  OpenAI: "e.g. gpt-4o, gpt-4o-mini, o3-mini, o1",
  Google: "e.g. gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash",
  "Amazon Bedrock": "e.g. anthropic.claude-3-5-sonnet-20241022-v2:0",
  OpenRouter: "e.g. anthropic/claude-3.7-sonnet, openai/gpt-4o",
  Perplexity: "e.g. sonar-pro, sonar",
  NVIDIA: "e.g. meta/llama-3.3-70b-instruct, deepseek-ai/deepseek-r1",
  Groq: "e.g. llama-3.3-70b-versatile, mixtral-8x7b-32768",
  Ollama: "e.g. llama3.3, deepseek-r1:8b, mistral",
  DeepSeek: "e.g. deepseek-chat, deepseek-reasoner",
};

type ModelCardProps = {
  model: ModelItem;
  isDeleting?: boolean;
  isKeyVisible?: boolean;
  copiedId?: string | null;
  isReadOnly?: boolean;
  onEdit?: (model: ModelItem) => void;
  onDelete?: (model: ModelItem) => void;
  onToggleKey?: (id: string) => void;
  onCopy?: (key: string, id: string) => void;
  maskApiKey?: (key: string) => string;
};

function ModelCard({
  model,
  isDeleting = false,
  isKeyVisible = true,
  copiedId = null,
  isReadOnly = false,
  onEdit,
  onDelete,
  onToggleKey,
  onCopy,
  maskApiKey,
}: ModelCardProps) {
  const [isModelHovered, setIsModelHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const matchedProvider = getProviderByName(model.name);
  const displayLogo = model.logo || matchedProvider?.logo || "/anthos.svg";

  const actionButtons = isReadOnly ? null : (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleKey?.(model.id); }}
        className="rounded-md cursor-pointer px-2 py-1 transition text-[10px] font-medium text-white/70 hover:text-white hover:bg-amber-500"
        title={isKeyVisible ? "Hide Key" : "Show Key"}
      >
        {isKeyVisible ? "Hide" : "Show"}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onCopy?.(model.apiKey, model.id); }}
        className="rounded-md cursor-pointer px-2 py-1 transition text-[10px] font-medium text-white/70 hover:text-white hover:bg-green-600"
        title="Copy Key"
      >
        {copiedId === model.id ? "Copied!" : "Copy"}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onEdit?.(model); }}
        title="Edit model"
        className="rounded-md cursor-pointer px-2 py-1 transition text-[10px] font-medium text-white/70 hover:text-white hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete?.(model); }}
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
      className={`overflow-hidden ${!isReadOnly ? "rounded-4xl bg-white dark:bg-white/10 border border-white/5 shadow-sm" : "grayscale cursor-not-allowed"
        } text-white`}
      onMouseEnter={() => !isReadOnly && setIsModelHovered(true)}
      onMouseLeave={() => !isReadOnly && setIsModelHovered(false)}
      onClick={() => !isReadOnly && setIsExpanded((p) => !p)}
    >
      <div className="flex items-center gap-2 p-3">
        <div className="rounded-xl bg-white p-1 flex items-center justify-center shrink-0 w-10 h-10 overflow-hidden">
          <Image
            src={displayLogo}
            alt={model.name}
            width={48}
            height={48}
            unoptimized
            className={`${isReadOnly ? "h-8 w-8" : "h-7 w-7"} object-contain`}
          />
        </div>

        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
          <span className="text-xs font-semibold truncate max-w-28">{model.name}</span>
          <span className="inline-flex items-center rounded-sm bg-white/10 px-1 py-px text-[9px] font-mono text-white/60 truncate">
            {model.modelName}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 min-w-0 flex-1">
          <div className="w-px h-3.5 bg-white/15 shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {isReadOnly || <Key className="h-3 w-3 shrink-0 text-white/50" />}
            <span className="font-mono text-[10px] text-white/60 truncate">
              {isReadOnly ? model.apiKey : isKeyVisible ? model.apiKey : maskApiKey?.(model.apiKey)}
            </span>
          </div>
          {actionButtons && (
            <div
              className={`flex items-center gap-0.5 shrink-0 transition-all duration-200 ${isModelHovered ? "opacity-100 translate-x-0" : "opacity-0 pointer-events-none translate-x-2"
                }`}
            >
              {actionButtons}
            </div>
          )}
        </div>
      </div>

      {!isReadOnly && actionButtons && (
        <div className={`sm:hidden grid transition-all duration-250 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}>
          <div className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 mx-3 mb-2 rounded-xl bg-white/5 px-2.5 py-1.5">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Key className="h-3 w-3 shrink-0 text-white/50" />
                <span className="font-mono text-[10px] text-white/60 truncate">
                  {isKeyVisible ? model.apiKey : maskApiKey?.(model.apiKey)}
                </span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {actionButtons}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings({ settings: initialSettings }: { settings: UserSettings }) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProvidersListOpen, setIsProvidersListOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null);

  const [selectedProviderName, setSelectedProviderName] = useState<string>(PROVIDERS[0].name);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [modelName, setModelName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [logo, setLogo] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [visibleKeyIds, setVisibleKeyIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const providerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target as Node)) {
        setProviderDropdownOpen(false);
      }
    };
    if (providerDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [providerDropdownOpen]);

  const openAddModal = (presetProviderName?: string) => {
    setEditingModel(null);
    const targetProvider = presetProviderName && isSupportedProvider(presetProviderName)
      ? presetProviderName
      : PROVIDERS[0].name;
    setSelectedProviderName(targetProvider);
    setProviderDropdownOpen(false);
    setModelName("");
    setApiKey("");
    setLogo("");
    setShowApiKey(false);
    setIsModalOpen(true);
  };

  const openEditModal = (model: ModelItem) => {
    setEditingModel(model);
    const validProvider = isSupportedProvider(model.name)
      ? getProviderByName(model.name)?.name || PROVIDERS[0].name
      : PROVIDERS[0].name;
    setSelectedProviderName(validProvider);
    setProviderDropdownOpen(false);
    setModelName(model.modelName);
    setApiKey(model.apiKey);
    setLogo(model.logo || "");
    setShowApiKey(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setProviderDropdownOpen(false);
    setEditingModel(null);
  };

  const handleProviderSelect = (providerName: string) => {
    setSelectedProviderName(providerName);
    setProviderDropdownOpen(false);
    const matched = getProviderByName(providerName);
    if (matched) {
      setLogo(matched.logo);
    }
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderName || !isSupportedProvider(selectedProviderName)) {
      toast.error("Please select a valid supported provider.");
      return;
    }
    if (!modelName.trim() || !apiKey.trim()) {
      toast.error("Please fill in all required fields (Model Identifier, API Key)");
      return;
    }

    const matchedProvider = getProviderByName(selectedProviderName);
    const finalProviderName = matchedProvider?.name || selectedProviderName.trim();
    const finalLogo = logo.trim() || matchedProvider?.logo || undefined;

    setIsSubmitting(true);
    try {
      if (editingModel) {
        const res = await updateModelSettingAction(editingModel.id, {
          name: finalProviderName,
          modelName: modelName.trim(),
          apiKey: apiKey.trim(),
          logo: finalLogo,
        });

        if (res.ok && res.settings) {
          setSettings(res.settings);
          toast.success(`Updated model "${finalProviderName}" successfully!`);
          closeModal();
        } else {
          toast.error(res.error || "Failed to update model parameter");
        }
      } else {
        const res = await addModelSettingAction({
          name: finalProviderName,
          modelName: modelName.trim(),
          apiKey: apiKey.trim(),
          logo: finalLogo,
        });

        if (res.ok && res.settings) {
          setSettings(res.settings);
          toast.success(`Added new model "${finalProviderName}" successfully!`);
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
              Configure your AI processing models and BYOK keys across supported providers.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsProvidersListOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium [html.light_&]:text-black dark:text-white cursor-pointer"
              title="View all supported AI providers"
            >
              <Layers className="h-3.5 w-3.5" />
              Providers
            </button>
            <CustomButton
              onClick={() => openAddModal()}
              title="Add new model parameter"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>Add</span>
            </CustomButton>
          </div>
        </div>

        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-2">
              AI Model Parameters &amp; Keys
            </h2>
            <span className="text-[11px] sm:text-xs text-white/50 font-mono">
              {settings.models.length} + 1 {settings.models.length === 0 ? "Model" : "Models"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <ModelCard
              key={HARDCODED_DEFAULT_MODEL.id}
              model={HARDCODED_DEFAULT_MODEL}
              isReadOnly
              isDeleting={false}
              isKeyVisible={true}
              copiedId={null}
            />
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
        </section>
      </main>

      <AnimatePresence>
        {isProvidersListOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsProvidersListOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.7 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 80 || info.velocity.y > 200) {
                    setIsProvidersListOpen(false);
                  }
                }}
                className="w-full sm:w-120 max-h-[85vh] flex flex-col rounded-t-4xl sm:rounded-2xl bg-[#2c0237] border border-white/10 [html.light_&]:bg-white [html.light_&]:border-black/10 text-white [html.light_&]:text-black shadow-2xl overflow-hidden pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sm:hidden flex shrink-0 justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none touch-none">
                  <div className="h-1.5 w-12 rounded-full bg-white/25 [html.light_&]:bg-black/25" />
                </div>
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10 [html.light_&]:border-black/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 dark:text-white [html.light_&]:text-black" />
                    <h2 className="text-sm font-semibold text-white [html.light_&]:text-black">
                      Supported AI Providers ({PROVIDERS.length})
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProvidersListOpen(false)}
                    title="Close dialog"
                    className="rounded cursor-pointer p-1 text-white/50 hover:text-red-500 [html.light_&]:text-black/50 [html.light_&]:hover:text-red-600 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
                  <p className="text-xs text-white/60 [html.light_&]:text-black/60">
                    We natively supports the various AI providers with BYOK architecture
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {PROVIDERS.map((provider: Provider) => (
                      <div
                        key={provider.id}
                        className="flex items-center justify-between p-2.5 "
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white [html.light_&]:text-black truncate">
                              {provider.name}
                            </div>
                            <div className="text-[10px] text-white/50 [html.light_&]:text-black/50 font-mono truncate">
                              {provider.description || ""}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProvidersListOpen(false);
                            openAddModal(provider.name);
                          }}
                          className="shrink-0 ml-2 rounded-lg dark:bg-white/10 [html.light_&]:bg-black/10 px-2 py-1 text-[10px] font-medium hover:bg-green-600! text-white transition cursor-pointer"
                          title={`Add model for ${provider.name}`}
                        >
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.7 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 80 || info.velocity.y > 200) {
                    closeModal();
                  }
                }}
                className="w-full sm:w-96 max-h-[90vh] flex flex-col rounded-t-4xl sm:rounded-2xl bg-[#2c0237] border border-white/10 [html.light_&]:bg-white [html.light_&]:border-black/10 text-white [html.light_&]:text-black shadow-2xl overflow-hidden pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sm:hidden flex shrink-0 justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none touch-none">
                  <div className="h-1.5 w-12 rounded-full bg-white/25 [html.light_&]:bg-black/25" />
                </div>
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10 [html.light_&]:border-black/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 dark:fill-white [html.light_&]:fill-black" />
                    <h2 className="text-xs font-semibold text-white [html.light_&]:text-black">
                      {editingModel ? "Edit Model" : "Add Model Parameter"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    title="Close dialog"
                    className="rounded cursor-pointer p-1 text-white/50 hover:text-red-500 [html.light_&]:text-black/50 [html.light_&]:hover:text-red-600 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <form onSubmit={handleSaveModel} className="px-4 py-3 space-y-3 overflow-y-auto flex-1">
                  {/* Custom Smooth Provider Dropdown */}
                  <div className="space-y-1.5" ref={providerDropdownRef}>
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-medium text-white/60 [html.light_&]:text-black/60 uppercase tracking-wide">
                        AI Provider <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsProvidersListOpen(true)}
                        className="text-[10px] text-accent hover:underline cursor-pointer"
                      >
                        10 Supported
                      </button>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setProviderDropdownOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-white/10 [html.light_&]:bg-black/5 border border-white/10 [html.light_&]:border-black/10 hover:border-white/20 transition cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white [html.light_&]:text-black truncate">
                              {selectedProviderName}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-white/50 [html.light_&]:text-black/50 transition-transform duration-200 shrink-0 ml-1 ${
                            providerDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {providerDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -4 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -4 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden mt-1.5"
                          >
                            <div className="rounded-2xl bg-[#23022c]/95 [html.light_&]:bg-gray-50 border border-white/10 [html.light_&]:border-black/10 shadow-xl p-1.5 max-h-48 overflow-y-auto overscroll-contain space-y-1">
                              {PROVIDERS.map((provider) => {
                                const isSelected = provider.name === selectedProviderName;
                                return (
                                  <motion.button
                                    key={provider.id}
                                    type="button"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleProviderSelect(provider.name)}
                                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                                      isSelected
                                        ? "bg-white/15 [html.light_&]:bg-black/10 text-white [html.light_&]:text-black font-semibold"
                                        : "hover:bg-white/10 [html.light_&]:hover:bg-black/5 text-white/80 [html.light_&]:text-black/80"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="min-w-0">
                                        <div className="text-xs truncate">
                                          {provider.name}
                                        </div>
                                        <div className="text-[9px] text-white/50 [html.light_&]:text-black/50 truncate font-normal">
                                          {provider.description || provider.name}
                                        </div>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-green-400 [html.light_&]:text-green-600 shrink-0 ml-2" />
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-white/60 [html.light_&]:text-black/60 uppercase tracking-wide">
                      Model Identifier <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        selectedProviderName === "Anthropic"
                          ? "claude-3-7-sonnet-20250219"
                          : selectedProviderName === "OpenAI"
                          ? "gpt-4o"
                          : selectedProviderName === "Google"
                          ? "gemini-2.0-flash"
                          : selectedProviderName === "DeepSeek"
                          ? "deepseek-chat"
                          : selectedProviderName === "Ollama"
                          ? "llama3.3"
                          : "model-identifier"
                      }
                      title="Enter the exact model identifier name"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="w-full rounded-lg bg-white/10 [html.light_&]:bg-black/5 px-2.5 py-1.5 font-mono text-xs text-white [html.light_&]:text-black placeholder:text-white/30 [html.light_&]:placeholder:text-black/30 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-medium text-white/60 [html.light_&]:text-black/60 uppercase tracking-wide">
                        API Key <span className="text-red-400">*</span>
                      </label>
                      {selectedProviderName === "Ollama" && (
                        <span className="text-[9px] text-green-400 font-mono">
                          (Set to FREE or host URL)
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        required
                        placeholder={selectedProviderName === "Ollama" ? "FREE" : "sk-..."}
                        title="Enter your provider API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full rounded-lg bg-white/10 [html.light_&]:bg-black/5 pl-2.5 pr-8 py-1.5 font-mono text-xs text-white [html.light_&]:text-black placeholder:text-white/30 [html.light_&]:placeholder:text-black/30 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        title={showApiKey ? "Hide API key" : "Show API key"}
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-white/50 hover:text-white [html.light_&]:text-black/50 [html.light_&]:hover:text-black"
                      >
                        {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-white/60 [html.light_&]:text-black/60 uppercase tracking-wide">
                      Logo URL <span className="text-white/40 [html.light_&]:text-black/40 normal-case font-normal">(optional custom image URL)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://... (optional)"
                      title="Enter a custom logo image URL to store in database (optional)"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      className="w-full rounded-lg bg-white/10 [html.light_&]:bg-black/5 px-2.5 py-1.5 text-xs text-white [html.light_&]:text-black placeholder:text-white/30 [html.light_&]:placeholder:text-black/30 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 [html.light_&]:border-black/10">
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
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
