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
  Edit2Icon,
  Trash2Icon,
  Copy,
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PROVIDERS, type Provider, isSupportedProvider, getProviderByName } from "@/lib/providers";

const HARDCODED_DEFAULT_MODEL: ModelItem = {
  id: "hardcoded-gpt-oss-120b",
  provider: "Open AI",
  name: "gpt-oss-120b",
  apiKey: "FREE",
  logo: "/providers/openai.png",
  settingId: "system-default",
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

  const matchedProvider = getProviderByName(model.provider);
  const displayLogo = model.logo || matchedProvider?.logo || "/anthos.svg";

  const actionButtons = isReadOnly ? null : (
    <>
      <CustomButton
        size="xs"
        onClick={(e) => { e.stopPropagation(); onToggleKey?.(model.id); }}
        title={isKeyVisible ? "Hide Key" : "Show Key"}
        color="black"
      >
        {isKeyVisible ? <EyeOff className="h-3 w-3 sm:block hidden" /> : <Eye className="h-3 w-3 sm:block hidden" />}
        <span>{isKeyVisible ? "Hide" : "Show"}</span>
      </CustomButton>
      <CustomButton
        size="xs"
        onClick={(e) => { e.stopPropagation(); onCopy?.(model.apiKey, model.id); }}
        color={copiedId === model.id ? "green" : "black"}
      >
        {copiedId === model.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 sm:block hidden" />}
        <span>{copiedId === model.id ? "Copied!" : "Copy"}</span>
      </CustomButton>
      <CustomButton
        size="xs"
        onClick={(e) => { e.stopPropagation(); onEdit?.(model); }}
        title="Edit model"
        color="blue"
      >
        <Edit2Icon className="h-3 w-3 sm:block hidden" />
        <span>Edit</span>
      </CustomButton>
      <CustomButton
        size="xs"
        onClick={(e) => { e.stopPropagation(); onDelete?.(model); }}
        disabled={isDeleting}
        title="Delete model"
        color="red"
      >
        {isDeleting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2Icon className="h-3 w-3 sm:block hidden" />
        )}
        <span>Delete</span>
      </CustomButton>
    </>
  );

  return (
    <div
      className={`overflow-hidden sm:pb-0 pb-1 ${isReadOnly ? "cursor-not-allowed" : "rounded-3xl bg-white border shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] transition-all duration-200"
        } text-black`}
      onMouseEnter={() => !isReadOnly && setIsModelHovered(true)}
      onMouseLeave={() => !isReadOnly && setIsModelHovered(false)}
      onClick={() => !isReadOnly && setIsExpanded((p) => !p)}
    >
      <div className="flex items-center gap-2 p-1 px-2">
        <div className="flex items-center justify-center shrink-0 w-10 h-10 overflow-hidden">
          <Image
            src={displayLogo}
            alt={model.provider}
            width={48}
            height={48}
            unoptimized
            className={`${isReadOnly ? "h-8 w-8" : "h-7 w-7"} object-contain rounded-4xl`}
          />
        </div>

        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
          <span className="text-xs font-semibold truncate max-w-28 text-black">{model.provider}</span>
          <span className="inline-flex items-center rounded-sm bg-green-600/10 px-1 py-px text-[9px] font-mono text-green-600 truncate">
            {model.name}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 min-w-0 flex-1">
          <div className="w-px h-3.5 bg-black/15 shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {isReadOnly || <Key className="h-3 w-3 shrink-0 text-black/50" />}
            <span className="font-mono text-[10px] text-black/60 truncate">
              {isReadOnly ? model.apiKey : isKeyVisible ? model.apiKey : maskApiKey?.(model.apiKey)}
            </span>
          </div>
          {actionButtons && (
            <div
              className={`flex items-center gap-2 px-1 shrink-0 transition-all duration-200 ${isModelHovered ? "opacity-100 translate-x-0" : "opacity-0 pointer-events-none translate-x-2"
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
            <div className="flex items-center justify-between gap-2 mx-3 mb-2 rounded-xl bg-black/5 px-2.5 py-1.5">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Key className="h-3 w-3 shrink-0 text-black/50" />
                <span className="font-mono text-[10px] text-black/60 truncate">
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
  const [name, setname] = useState("");
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
    setname("");
    setApiKey("");
    setLogo("");
    setShowApiKey(false);
    setIsModalOpen(true);
  };

  const openEditModal = (model: ModelItem) => {
    setEditingModel(model);
    const validProvider = isSupportedProvider(model.provider)
      ? getProviderByName(model.provider)?.name || PROVIDERS[0].name
      : PROVIDERS[0].name;
    setSelectedProviderName(validProvider);
    setProviderDropdownOpen(false);
    setname(model.name);
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
    if (!name.trim() || !apiKey.trim()) {
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
          provider: finalProviderName,
          name: name.trim(),
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
          provider: finalProviderName,
          name: name.trim(),
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
    if (!confirm(`Are you sure you want to remove the model parameter "${model.provider}"?`)) {
      return;
    }

    setDeletingId(model.id);
    try {
      const res = await deleteModelSettingAction(model.id);
      if (res.ok && res.settings) {
        setSettings(res.settings);
        toast.success(`Model "${model.provider}" deleted successfully.`);
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
      <main className="sm:mx-auto mx-2 max-w-4xl sm:mt-0 mt-10 px-3 sm:px-6 py-4 sm:py-10 space-y-4 sm:space-y-6">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 border-b border-dashed pb-4 sm:pb-5">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-black shrink-0">
                <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-black sm:text-2xl truncate">
                Settings
              </h1>
            </div>
            <p className="text-[11px] text-black/50 sm:text-sm truncate">
              Configure your AI processing models and BYOK keys across supported providers.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CustomButton
              onClick={() => setIsProvidersListOpen(true)}
              title="View all supported AI providers"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Providers</span>
            </CustomButton>
            <CustomButton
              onClick={() => openAddModal()}
              title="Add new model parameter"
              color="green"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>Add</span>
            </CustomButton>
          </div>
        </div>

        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-black flex items-center gap-2">
              AI Model Parameters &amp; Keys
            </h2>
            <span className="text-[11px] sm:text-xs text-black/50 font-mono">
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

      <Dialog open={isProvidersListOpen} onOpenChange={setIsProvidersListOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-full sm:max-w-90 max-h-[85vh] flex flex-col rounded-t-4xl sm:rounded-2xl bg-white border text-black shadow-2xl p-0 gap-0 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-black" />
              <DialogTitle className="text-sm font-semibold text-black">
                Supported AI Providers ({PROVIDERS.length})
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => setIsProvidersListOpen(false)}
              title="Close dialog"
              className="rounded cursor-pointer p-1 text-black/50 hover:text-red-600 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
            <DialogDescription className="text-xs text-black/60">
              We natively supports the various AI providers with BYOK architecture
            </DialogDescription>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {PROVIDERS.map((provider: Provider) => (
                <div
                  key={provider.id}
                  onClick={() => {
                    setIsProvidersListOpen(false);
                    openAddModal(provider.name);
                  }}
                  className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-black/5 rounded-xl transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 flex rounded-4xl items-center justify-center shrink-0 overflow-hidden">
                      <Image
                        src={provider.logo}
                        alt={provider.name}
                        width={24}
                        height={24}
                        unoptimized
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-black truncate">
                        {provider.name}
                      </div>
                      <div className="text-[10px] text-black/50 font-mono truncate">
                        {provider.description || ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-full sm:max-w-80 max-h-[90vh] flex flex-col rounded-t-4xl sm:rounded-2xl bg-white border text-black shadow-2xl p-0 gap-0 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 fill-black" />
              <DialogTitle className="text-xs font-semibold text-black">
                {editingModel ? "Edit Model" : "Add Model Parameter"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Configure your AI model identifier, API key and parameters
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              title="Close dialog"
              className="rounded cursor-pointer p-1 text-black/50 hover:text-red-600 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <form onSubmit={handleSaveModel} className="px-4 py-3 space-y-3 overflow-y-auto flex-1">
            <div className="space-y-1.5" ref={providerDropdownRef}>
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-medium text-black/60 uppercase tracking-wide">
                  AI Provider <span className="text-red-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsProvidersListOpen(true);
                  }}
                  className="text-[10px] text-accent hover:underline cursor-pointer"
                >
                  10 Supported
                </button>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProviderDropdownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white border shadow-[inset_0_-2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)] transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-5 h-5 flex rounded-4xl items-center justify-center shrink-0 overflow-hidden">
                      <Image
                        src={getProviderByName(selectedProviderName)?.logo || '/providers/openai.png'}
                        alt={selectedProviderName}
                        width={20}
                        height={20}
                        unoptimized
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-black truncate">
                        {selectedProviderName}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-black/50 transition-transform duration-200 shrink-0 ml-1 ${providerDropdownOpen ? "rotate-180" : ""
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
                      <div className="rounded-2xl border p-2 scrollbar-none bg-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] max-h-48 overflow-y-auto overscroll-contain space-y-1.5">
                        {PROVIDERS.map((provider) => (
                          <motion.button
                            key={provider.id}
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleProviderSelect(provider.name)}
                            className={`w-full flex px-3 py-2 items-center gap-2 transition-all duration-200 cursor-pointer text-left text-black ${selectedProviderName === provider.name ? "rounded-xl bg-white shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)]" : "hover:bg-black/5 rounded-xl"
                              }`}
                          >
                            <div className="w-5 h-5 flex rounded-4xl items-center justify-center shrink-0 overflow-hidden">
                              <Image
                                src={provider.logo}
                                alt={provider.name}
                                width={20}
                                height={20}
                                unoptimized
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-black truncate">
                                {provider.name}
                              </div>
                              <div className="text-[9px] truncate text-black/50 font-normal">
                                {provider.description || provider.name}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-black/60 uppercase tracking-wide">
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
                value={name}
                onChange={(e) => setname(e.target.value)}
                className="w-full rounded-lg bg-black/5 px-2.5 py-1.5 font-mono text-xs text-black placeholder:text-black/30 outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-medium text-black/60 uppercase tracking-wide">
                  API Key <span className="text-red-400">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  required
                  placeholder={"sk-..."}
                  title="Enter your provider API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-lg bg-black/5 pl-2.5 pr-8 py-1.5 font-mono text-xs text-black placeholder:text-black/30 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  title={showApiKey ? "Hide API key" : "Show API key"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-black/50 hover:text-black"
                >
                  {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-black/60 uppercase tracking-wide">
                Logo URL <span className="text-black/40 normal-case font-normal">(optional custom image URL)</span>
              </label>
              <input
                type="url"
                placeholder="https://... (optional)"
                title="Enter a custom logo image URL to store in database (optional)"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full rounded-lg bg-black/5 px-2.5 py-1.5 text-xs text-black placeholder:text-black/30 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <CustomButton
                disabled={isSubmitting}
                size="sm"
                color={isSubmitting ? "black" : "green"}
              >
                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlusIcon className="h-3 w-3" />}
                {editingModel ? "Save Model" : "Add Model"}
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
