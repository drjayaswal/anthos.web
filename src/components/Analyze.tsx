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
import { FetchOptions, LoadOptions, Mail, AnalysisModel } from '@/types';
import { authClient } from '@/lib/auth-client';
import Header from './Header';
import MailTable from './MailTable';
import MailSheet from './MailSheet';
import MailInboxTabs, { type MailInboxTab } from './MailInboxTabs';
import FetchDialog from './FetchDialog';
import AnalyzeDialog from './AnalyzeDialog';
import InsightDialog from './InsightDialog';
import AnalyzedMailsPriorityGraph from './AnalyzedMailsPriorityGraph';
import { toast } from '@/lib/toast';
import LoadDialog from './LoadDialog';
import AccountDialog from './AccountDialog';
import { useRouter } from 'next/navigation';
import Loader from './Loader';

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
  const [analyzedMails] = useState<Mail[]>([]);
  const [categories, setCategories] = useState<{ name: string }[]>([]);
  const [selectedFetchedIds, setSelectedFetchedIds] = useState<Set<string>>(new Set());
  const [selectedAnalyzedIds, setSelectedAnalyzedIds] = useState<Set<string>>(new Set());
  const [selectedEncryptedIds, setSelectedEncryptedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [generatingDescriptions, setGeneratingDescriptions] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
  const [insightDialogOpen, setInsightDialogOpen] = useState(false);
  const [insightTargetMail, setInsightTargetMail] = useState<Mail | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailMail, setDetailMail] = useState<Mail | null>(null);
  const [encryptedMails, setEncryptedMails] = useState<Mail[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await getCategoriesAction();
      if (res.ok && res.categories) {
        setCategories(res.categories);
      }
    })();
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


  const handleOpenInsightDialog = () => {
    if (activeTab !== 'fetched') {
      setActiveTab('fetched');
    }
    if (selectedFetchedIds.size === 0) {
      toast.error('Select 1 mail to get insight');
      return;
    }
    if (selectedFetchedIds.size > 1) {
      toast.error('Insight is only available for 1 mail at a time. Please select only 1 mail.');
      return;
    }
    const mail = fetchedMails.find((m) => selectedFetchedIds.has(m.id));
    if (!mail) {
      toast.error('Selected mail not found');
      return;
    }
    setInsightTargetMail(mail);
    setInsightDialogOpen(true);
  };

  const handleInsightSingleMail = (mail: Mail) => {
    setInsightTargetMail(mail);
    setInsightDialogOpen(true);
  };

  const handleGetInsight = async (mail: Mail) => {
    setInsightLoading(true);
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
      setInsightDialogOpen(false);
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
    const isDefault = !selectedModel || selectedModel.default === true || selectedModel.id.startsWith('hardcoded-');
    if (isDefault && selection.length > 2) {
      toast.error('Default model is limited to 2 mails at a time. Select your own AI model to analyze more.');
      return;
    }

    const modelObject: AnalysisModel = selectedModel
      ? {
          id: selectedModel.id,
          provider: selectedModel.provider,
          name: selectedModel.name,
          default: selectedModel.default,
          ...(selectedModel.settingId ? { settingId: selectedModel.settingId } : {}),
        }
      : {
          id: 'hardcoded-gpt-oss-120b',
          provider: 'Open AI',
          name: 'gpt-oss-120b',
          default: true,
        };

    const sanitizedEmails = selection.map((mail) => {
      const emailWithoutRecipient = { ...mail };
      delete (emailWithoutRecipient as { recipient?: string }).recipient;
      return emailWithoutRecipient;
    });

    const payload = {
      emails: sanitizedEmails,
      model: modelObject,
    };

    console.log(payload);
    const modelLabel = modelObject.provider;
    toast.success(`${selection.length} mail(s) selected with ${modelLabel} (Analysis call disabled for now)`);
  };

  const tabMails = useMemo(() => {
    if (activeTab === 'fetched') return fetchedMails;
    if (activeTab === 'encrypted') return encryptedMails;
    return analyzedMails;
  }, [activeTab, fetchedMails, encryptedMails, analyzedMails]);

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
    if (filteredMails.every((m) => selectedFetchedIds.has(m.id))) {
      setSelectedFetchedIds(new Set());
      return;
    }
    setSelectedFetchedIds(new Set(filteredMails.map((m) => m.id)));
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
          onInsight={handleOpenInsightDialog}
          selectedCount={selectedFetchedIds.size}
          analyzeDisabled={selectedFetchedIds.size === 0}
          insightDisabled={selectedFetchedIds.size === 0 || selectedFetchedIds.size > 1}
          onFetch={() => setFetchDialogOpen(true)}
          onLoadDataFromDatabase={() => setLoadDialogOpen(true)}
          sessionUserEmail={sessionUserEmail}
          hasCategories={hasCategories}
        />
        <AnimatePresence>
          {(loading || analyzing) && (
            <motion.div
              key="loading-blur-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full h-full fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-wait pointer-events-auto"
            >
            </motion.div>
          )}
        </AnimatePresence>
        <Card className="w-full bg-transparent border-0 min-w-0 m-0! overflow-hidden">
          <CardContent className="min-w-0 px-2 sm:px-4 py-3 border-none">
            <MailTable
              mails={filteredMails}
              loading={loading || analyzing}
              onMailClick={setDetailMail}
              selectable
              activeTab={activeTab}
              onFetch={() => setFetchDialogOpen(true)}
              onLoadDataFromDatabase={() => setLoadDialogOpen(true)}
              onGoToFetched={() => setActiveTab('fetched')}
              onAnalyzeMail={handleAnalyzeSingleMail}
              onInsightMail={handleInsightSingleMail}
              selectedIds={activeTab === 'fetched' ? selectedFetchedIds : activeTab === 'encrypted' ? selectedEncryptedIds : selectedAnalyzedIds}
              onToggleSelect={(id) => {
                if (activeTab === 'fetched') {
                  setSelectedFetchedIds((p) => toggleInSet(p, id));
                } else if (activeTab === 'encrypted') {
                  setSelectedEncryptedIds((p) => toggleInSet(p, id));
                } else {
                  setSelectedAnalyzedIds((p) => toggleInSet(p, id));
                }
              }}
              onToggleAll={activeTab === 'fetched' ? toggleAllFetched : activeTab === 'encrypted' ? toggleAllEncrypted : toggleAllAnalyzed}
              onRowHoldSelect={(mail) => {
                if (activeTab === 'fetched') {
                  setSelectedFetchedIds((p) => toggleInSet(p, mail.id));
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
      <InsightDialog
        open={insightDialogOpen}
        onOpenChange={setInsightDialogOpen}
        mail={insightTargetMail}
        onGetInsight={handleGetInsight}
        loading={insightLoading}
      />
    </div>
  );
}
