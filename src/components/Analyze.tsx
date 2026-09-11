'use client';

import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  fetchMailsAction,
  syncEncryptedMailsToDb,
  loadMailsFromDatabaseAction,
  getCategoriesAction,
  getSingleMailInsightAction,
  generateMailDescriptionsAction,
} from '@/app/actions';
import { FetchOptions, LoadOptions, Mail, AnalysisModel, EmailAnalysisResult } from '@/types';
import { authClient } from '@/lib/auth-client';
import Header from './Header';
import MailTable from './MailTable';
import MailSheet from './MailSheet';
import MailInboxTabs, { type MailInboxTab } from './MailInboxTabs';
import FetchDialog from './FetchDialog';
import AnalyzeDialog from './AnalyzeDialog';
import AnalyzedMailsPriorityGraph, {
  getPriorityPercent,
  getConfidencePercent,
  matchesRange,
} from './AnalyzedMailsPriorityGraph';
import { toast } from '@/lib/toast';
import LoadDialog from './LoadDialog';
import AccountDialog from './AccountDialog';
import { useRouter } from 'next/navigation';
import Loader from './Loader';
import AnalysisProgressDrawer, { LiveLogItem } from './AnalysisProgressDrawer';

export function toggleInSet(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export default function Analyze({
  sessionUserEmail,
  sessionUserId,
}: {
  sessionUserEmail?: string | null;
  sessionUserId?: string | null;
}) {
  const [appLoading, setAppLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<MailInboxTab>('fetched');
  const [fetchedMails, setFetchedMails] = useState<Mail[]>([]);
  const [analyzedMails, setAnalyzedMails] = useState<Mail[]>([]);
  const [categories, setCategories] = useState<{ name: string }[]>([]);
  const [selectedFetchedIds, setSelectedFetchedIds] = useState<Set<string>>(new Set());
  const [selectedAnalyzedIds, setSelectedAnalyzedIds] = useState<Set<string>>(new Set());
  const [selectedEncryptedIds, setSelectedEncryptedIds] = useState<Set<string>>(new Set());
  const [analyzedCategory, setAnalyzedCategory] = useState<string>('ALL');
  const [analyzedPriorityRange, setAnalyzedPriorityRange] = useState<string>('ALL');
  const [analyzedConfidenceRange, setAnalyzedConfidenceRange] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [generatingDescriptions, setGeneratingDescriptions] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisActive, setAnalysisActive] = useState(false);
  const [progressDrawerOpen, setProgressDrawerOpen] = useState(false);
  const [isAnalysisStreaming, setIsAnalysisStreaming] = useState(false);
  const [isAnalysisDone, setIsAnalysisDone] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<LiveLogItem[]>([]);
  const [analysisTargetMails, setAnalysisTargetMails] = useState<Mail[]>([]);
  const [analysisTargetModel, setAnalysisTargetModel] = useState<AnalysisModel | null>(null);
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailMail, setDetailMail] = useState<Mail | null>(null);
  const [encryptedMails, setEncryptedMails] = useState<Mail[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await getCategoriesAction();
      if (res.ok && res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
    })();
    try {
      const saved = localStorage.getItem('anthos_analysis_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAnalysisLogs(parsed);
          setIsAnalysisDone(true);
        }
      }
    } catch {}
  }, []);

  const hasCategories = categories.length > 0;

  const handleFetchFromCloud = (opts: FetchOptions) => {
    void (async () => {
      setLoading(true);
      setActiveTab('fetched');
      try {
        const result = await fetchMailsAction(opts);
        if (!result.ok || !result.mails) {
          toast.error(result.error ?? 'Fetch failed');
          return;
        }
        setFetchedMails(result.mails);
        toast.success(`${result.mails.length > 0 ? result.mails.length : 'No'} Messages Fetched`);

        if (result.mails.length > 0) {
          const mailsForDescription = result.mails.map((m) => ({
            id: m.id,
            sender: m.sender,
            subject: m.subject,
          }));
          setGeneratingDescriptions(true);
          void (async () => {
            try {
              const descRes = await generateMailDescriptionsAction(mailsForDescription);
              if (descRes.ok && descRes.descriptions) {
                setFetchedMails((prev) =>
                  prev.map((mail) => ({
                    ...mail,
                    description: descRes.descriptions?.[mail.id] ?? mail.description,
                  }))
                );
              }
            } catch (err) {
              console.error('Failed to generate mail descriptions:', err);
            } finally {
              setGeneratingDescriptions(false);
            }
          })();
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleSignOut = async () => {
    setLoading(true);
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 400));
    await authClient.signOut();
    setLoading(false);
    setAccountDialogOpen(false);
    setAnalyzing(false);
    router.push("/thank-you");
  };

  const selectedFetchedMails = useMemo(
    () => fetchedMails.filter((m) => selectedFetchedIds.has(m.id)),
    [fetchedMails, selectedFetchedIds],
  );

  const handleGetInsight = async (mail: Mail) => {
    setInsightLoading(true);
    toast.info('Generating insight...');
    try {
      const res = await getSingleMailInsightAction(mail);
      if (!res.ok || !res.mail) {
        toast.error(res.error ?? 'Failed to get mail insight');
        return;
      }
      const updatedMail = res.mail;
      setFetchedMails((prev) =>
        prev.map((m) => (m.id === updatedMail.id ? updatedMail : m))
      );
      setEncryptedMails((prev) =>
        prev.map((m) => (m.id === updatedMail.id ? updatedMail : m))
      );
      setDetailMail(updatedMail);
      toast.success('Insight generated successfully');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Insight generation failed';
      toast.error(errorMsg);
    } finally {
      setInsightLoading(false);
    }
  };

  const openAnalyzeDialog = () => {
    if (!hasCategories) {
      toast.error('No categories found in database. Please add categories first.');
      return;
    }
    if (activeTab !== 'fetched') {
      setActiveTab('fetched');
    }
    if (selectedFetchedIds.size === 0) {
      toast.error('Select fetched mails to analyze');
      return;
    }
    if (selectedFetchedIds.size > 10) {
      toast.error('Maximum 10 emails can be analyzed at a time');
      return;
    }
    setAnalyzeDialogOpen(true);
  };

  const handleAnalyzeSingleMail = (mail: Mail) => {
    if (!hasCategories) {
      toast.error('No categories found in database. Please add categories first.');
      return;
    }
    if (activeTab !== 'fetched') {
      setActiveTab('fetched');
    }
    setSelectedFetchedIds(new Set([mail.id]));
    setAnalyzeDialogOpen(true);
  };

  const handleLoadFromDatabase = (opts: LoadOptions) => {
    void (async () => {
      setLoading(true);
      setActiveTab('encrypted');
      try {
        const result = await loadMailsFromDatabaseAction(opts);
        if (!result.ok || !result.mails) {
          toast.error(result.error ?? 'Load failed');
          return;
        }
        setEncryptedMails(result.mails);
        toast.success(`${result.mails.length > 0 ? result.mails.length : 'No'} Messages Loaded`);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleAnalyzeSelected = (selectedModel?: AnalysisModel | null) => {
    const selection = selectedFetchedMails;
    if (selection.length === 0) {
      toast.error('Select fetched mails to analyze');
      return;
    }
    if (selection.length > 10) {
      toast.error('Maximum 10 emails can be analyzed at a time');
      return;
    }

    const modelObject: AnalysisModel = {
      id: selectedModel?.id || '6b73ef82-7a41-451e-ac2b-a0107475cb38',
      provider: selectedModel?.provider || 'Google',
      name: selectedModel?.name || 'gemma-4-26b-a4b-it',
      default: true,
      settingId: selectedModel?.settingId || '42821d65-9f24-4b44-b88b-6d3b1c85a12f',
    };

    setAnalyzeDialogOpen(false);
    setAnalysisLogs([]);
    try {
      localStorage.removeItem('anthos_analysis_logs');
    } catch {}
    setAnalysisTargetMails(selection);
    setAnalysisTargetModel(modelObject);
    setAnalysisActive(true);
    setIsAnalysisStreaming(true);
    setIsAnalysisDone(false);
    setProgressDrawerOpen(true);
    toast.success('Analysis started!');
  };

  const handleAnalysisComplete = (results: EmailAnalysisResult[]) => {
    const resultsMap = new Map<string, EmailAnalysisResult>();
    for (const r of results) {
      resultsMap.set(r.id, r);
    }

    const mapAnalyzedMail = (mail: Mail): Mail => {
      const r = resultsMap.get(mail.id);
      if (!r) return mail;
      return {
        ...mail,
        category: r.category ?? mail.category,
        categories: r.category ? [r.category] : (mail.categories || []),
        priority: [String(r.priority_score)],
        priority_score: r.priority_score,
        confidence_score: r.confidence_score,
        versions: r.versions,
        retry_count: r.retry_count,
        summary: r.summary ?? mail.summary,
      };
    };

    setFetchedMails((prev) => prev.map(mapAnalyzedMail));

    const analyzedSelection = analysisTargetMails.map(mapAnalyzedMail);
    setAnalyzedMails((prev) => {
      const existingMap = new Map(prev.map((m) => [m.id, m]));
      for (const mail of analyzedSelection) {
        existingMap.set(mail.id, mail);
      }
      return Array.from(existingMap.values());
    });

    setSelectedFetchedIds(new Set());
    setActiveTab('analyzed');
    setProgressDrawerOpen(false);
    setAnalysisActive(false);
    setIsAnalysisStreaming(false);
    setIsAnalysisDone(true);
    toast.success(`Successfully analyzed ${results.length} email(s)`);
  };

  const handleDismissAnalysis = () => {
    setAnalysisActive(false);
    setProgressDrawerOpen(false);
    setIsAnalysisStreaming(false);
    setIsAnalysisDone(false);
  };

  const tabMails = useMemo(() => {
    if (activeTab === 'fetched') return fetchedMails;
    if (activeTab === 'encrypted') return encryptedMails;
    return analyzedMails.filter((mail) => {
      if (analyzedCategory !== 'ALL') {
        const cat = mail.category || (Array.isArray(mail.categories) && mail.categories[0]) || 'Others';
        if (cat.toLowerCase() !== analyzedCategory.toLowerCase()) return false;
      }
      if (analyzedPriorityRange !== 'ALL') {
        const pct = getPriorityPercent(mail);
        if (!matchesRange(pct, analyzedPriorityRange)) return false;
      }
      if (analyzedConfidenceRange !== 'ALL') {
        const conf = getConfidencePercent(mail);
        if (!matchesRange(conf, analyzedConfidenceRange)) return false;
      }
      return true;
    });
  }, [activeTab, fetchedMails, encryptedMails, analyzedMails, analyzedCategory, analyzedPriorityRange, analyzedConfidenceRange]);

  const filteredMails = useMemo(
    () =>
      tabMails.filter(
        (m) =>
          m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.body.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [tabMails, searchTerm],
  );

  const toggleAllFetched = () => {
    if (activeTab !== 'fetched') return;
    if (filteredMails.length === 0) return;
    const maxSelect = Math.min(filteredMails.length, 10);
    const firstN = filteredMails.slice(0, maxSelect);
    const areAllFirstNSelected = firstN.every((m) => selectedFetchedIds.has(m.id));
    if (areAllFirstNSelected) {
      setSelectedFetchedIds(new Set());
      return;
    }
    setSelectedFetchedIds(new Set(firstN.map((m) => m.id)));
    if (filteredMails.length > 10) {
      toast.info('Selected first 10 emails (maximum 10 allowed for analysis)');
    }
  };

  const toggleAllEncrypted = () => {
    setSelectedEncryptedIds((prev) => {
      if (filteredMails.every((m) => prev.has(m.id))) return new Set();
      return new Set(filteredMails.map((m) => m.id));
    });
  };

  const toggleAllAnalyzed = () => {
    if (activeTab !== 'analyzed') return;
    setSelectedAnalyzedIds((prev) => {
      if (filteredMails.every((m) => prev.has(m.id))) return new Set();
      return new Set(filteredMails.map((m) => m.id));
    });
  };

  const handleStoreSingleEncrypted = (mail: Mail) => {
    void (async () => {
      setLoading(true);
      try {
        const res = await syncEncryptedMailsToDb([mail]);
        if (res.ok) {
          toast.success('Mail stored encrypted in database');
        } else {
          toast.error(res.error ?? 'Failed to store encrypted mail');
        }
      } catch {
        toast.error('Failed to store encrypted mail');
      } finally {
        setLoading(false);
      }
    })();
  };

  if (appLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] w-full flex flex-col justify-start items-center py-4 sm:py-6 px-2 sm:px-6 md:px-8">
      <MailInboxTabs
        active={activeTab}
        fetchedCount={fetchedMails.length}
        analyzedCount={analyzedMails.length}
        encryptedCount={encryptedMails.length}
        onChange={setActiveTab}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-6xl mx-auto space-y-4 text-black mt-4 sm:mt-6"
      >
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          analyzing={analyzing}
          loading={loading}
          onAccount={() => setAccountDialogOpen(true)}
          onAnalyze={openAnalyzeDialog}
          selectedCount={selectedFetchedIds.size}
          analyzeDisabled={selectedFetchedIds.size === 0 || selectedFetchedIds.size > 10}
          onFetch={() => setFetchDialogOpen(true)}
          onLoadDataFromDatabase={() => setLoadDialogOpen(true)}
          hasAnalysisProgress={analysisActive || isAnalysisStreaming || isAnalysisDone || analysisLogs.length > 0}
          isAnalysisStreaming={isAnalysisStreaming}
          isAnalysisDone={isAnalysisDone}
          onToggleProgressDrawer={() => setProgressDrawerOpen((prev) => !prev)}
          progressDrawerOpen={progressDrawerOpen}
          sessionUserEmail={sessionUserEmail}
          hasCategories={hasCategories}
        />
        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading-blur-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full h-full fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm cursor-wait pointer-events-auto"
            >
            </motion.div>
          )}
        </AnimatePresence>
        <Card className="w-full bg-transparent border-0 min-w-0 m-0! overflow-hidden">
          <CardContent className="min-w-0 px-2 sm:px-4 py-3 border-none">
            <MailTable
              mails={filteredMails}
              loading={loading}
              onMailClick={setDetailMail}
              selectable
              activeTab={activeTab}
              onFetch={() => setFetchDialogOpen(true)}
              onLoadDataFromDatabase={() => setLoadDialogOpen(true)}
              onGoToFetched={() => setActiveTab('fetched')}
              onAnalyzeMail={handleAnalyzeSingleMail}
              onInsightMail={handleGetInsight}
              selectedIds={activeTab === 'fetched' ? selectedFetchedIds : activeTab === 'encrypted' ? selectedEncryptedIds : selectedAnalyzedIds}
              onToggleSelect={(id) => {
                if (activeTab === 'fetched') {
                  setSelectedFetchedIds((prev) => {
                    if (!prev.has(id) && prev.size >= 10) {
                      toast.error('Maximum 10 emails can be selected for analysis');
                      return prev;
                    }
                    return toggleInSet(prev, id);
                  });
                } else if (activeTab === 'encrypted') {
                  setSelectedEncryptedIds((p) => toggleInSet(p, id));
                } else {
                  setSelectedAnalyzedIds((p) => toggleInSet(p, id));
                }
              }}
              onToggleAll={activeTab === 'fetched' ? toggleAllFetched : activeTab === 'encrypted' ? toggleAllEncrypted : toggleAllAnalyzed}
              onRowHoldSelect={(mail) => {
                if (activeTab === 'fetched') {
                  setSelectedFetchedIds((prev) => {
                    if (!prev.has(mail.id) && prev.size >= 10) {
                      toast.error('Maximum 10 emails can be selected for analysis');
                      return prev;
                    }
                    return toggleInSet(prev, mail.id);
                  });
                } else if (activeTab === 'encrypted') {
                  setSelectedEncryptedIds((p) => toggleInSet(p, mail.id));
                } else {
                  setSelectedAnalyzedIds((p) => toggleInSet(p, mail.id));
                }
              }}
              onStoreEncryptedMail={handleStoreSingleEncrypted}
              hasCategories={hasCategories}
              generatingDescriptions={generatingDescriptions}
            />
          </CardContent>
        </Card>
        {(activeTab === 'analyzed' && analyzedMails.length > 0) || (activeTab === 'encrypted' && encryptedMails.length > 0) ? (
          <AnalyzedMailsPriorityGraph
            mails={activeTab === 'analyzed' ? analyzedMails : encryptedMails}
            categories={categories}
            onOpenDetail={setDetailMail}
            selectedCategory={analyzedCategory}
            onCategoryChange={setAnalyzedCategory}
            selectedPriorityRange={analyzedPriorityRange}
            onPriorityRangeChange={setAnalyzedPriorityRange}
            selectedConfidenceRange={analyzedConfidenceRange}
            onConfidenceRangeChange={setAnalyzedConfidenceRange}
          />
        ) : null}
      </motion.div>
      <MailSheet mail={detailMail} onClose={() => setDetailMail(null)} />
      <FetchDialog
        open={fetchDialogOpen}
        onOpenChange={setFetchDialogOpen}
        onFetchFromCloud={handleFetchFromCloud}
      />
      <AccountDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        onSignOut={handleSignOut}
      />
      <LoadDialog
        sessionUserId={sessionUserId}
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
        onLoadFromDatabase={handleLoadFromDatabase}
      />
      <AnalyzeDialog
        open={analyzeDialogOpen}
        onOpenChange={setAnalyzeDialogOpen}
        selectedCount={selectedFetchedIds.size}
        onAnalyze={handleAnalyzeSelected}
      />
      {(analysisTargetModel || analysisLogs.length > 0) && (
        <AnalysisProgressDrawer
          open={progressDrawerOpen}
          onOpenChange={setProgressDrawerOpen}
          active={analysisActive}
          emails={analysisTargetMails}
          model={analysisTargetModel || {
            id: '6b73ef82-7a41-451e-ac2b-a0107475cb38',
            provider: 'Google',
            name: 'gemma-4-26b-a4b-it',
            default: true,
            settingId: '42821d65-9f24-4b44-b88b-6d3b1c85a12f',
          }}
          savedLogs={analysisLogs}
          onLogsChange={(newLogs) => {
            setAnalysisLogs(newLogs);
            try {
              localStorage.setItem('anthos_analysis_logs', JSON.stringify(newLogs));
            } catch {}
          }}
          onComplete={handleAnalysisComplete}
          onStreamStateChange={(streaming, done) => {
            setIsAnalysisStreaming(streaming);
            setIsAnalysisDone(done);
          }}
          onDismiss={handleDismissAnalysis}
        />
      )}
    </div>
  );
}
