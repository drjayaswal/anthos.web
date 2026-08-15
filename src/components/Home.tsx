'use client';

import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  fetchMailsAction,
  syncEncryptedMailsToDb,
  loadMailsFromDatabaseAction,
  getCategoriesAction,
  performGroqMailAnalysisAction,
} from '@/app/actions';
import { FetchOptions, LoadOptions, Mail } from '@/types';
import { authClient } from '@/lib/auth-client';
import { mergeAnalyzedMails } from '@/lib/analyze-payload';
import Header from './Header';
import MailTable from './MailTable';
import MailSheet from './MailSheet';
import MailInboxTabs, { type MailInboxTab } from './MailInboxTabs';
import FetchDialog from './FetchDialog';
import AnalyzeDialog from './AnalyzeDialog';
import AnalyzedMailsPriorityGraph from './AnalyzedMailsPriorityGraph';
import { toast } from '@/lib/toast';
import Loader from './Loader';
import LoadDialog from './LoadDialog';
import AccountDialog from './AccountDialog';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useDemoMode } from '@/lib/demo-context';
import {
  DEMO_CATEGORIES,
  DEMO_GMAIL_MAILS,
  DEMO_DB_MAILS,
  getDemoAnalyzedMail,
  getDemoSettings,
} from '@/lib/demo-data';

export function toggleInSet(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export default function Home({
  sessionUserEmail,
  sessionUserId,
}: {
  sessionUserEmail?: string | null;
  sessionUserId?: string | null;
}) {
  const { isDemo, exitDemo } = useDemoMode();
  const [appLoading, setAppLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<MailInboxTab>('fetched');
  const [fetchedMails, setFetchedMails] = useState<Mail[]>([]);
  const [analyzedMails, setAnalyzedMails] = useState<Mail[]>([]);
  const [categories, setCategories] = useState<{ name: string }[]>([]);
  const [selectedFetchedIds, setSelectedFetchedIds] = useState<Set<string>>(new Set());
  const [selectedAnalyzedIds, setSelectedAnalyzedIds] = useState<Set<string>>(new Set());
  const [selectedEncryptedIds, setSelectedEncryptedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingText, setLoadingText] = useState<string>('');
  const [detailMail, setDetailMail] = useState<Mail | null>(null);
  const [encryptedMails, setEncryptedMails] = useState<Mail[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (isDemo) {
      setCategories(DEMO_CATEGORIES);
      return;
    }
    (async () => {
      const res = await getCategoriesAction();
      if (res.ok && res.categories) {
        setCategories(res.categories);
      }
    })();
  }, [isDemo]);

  const hasCategories = categories.length > 0;

  const handleFetchFromCloud = (opts: FetchOptions) => {
    void (async () => {
      setLoading(true);
      setLoadingText('Fetching latest emails from Gmail...');
      setActiveTab('fetched');
      try {
        if (isDemo) {
          await new Promise((r) => setTimeout(r, 600));
          const count = opts.count ? Math.min(Math.max(opts.count, 1), DEMO_GMAIL_MAILS.length) : DEMO_GMAIL_MAILS.length;
          const fetched = DEMO_GMAIL_MAILS.slice(0, count);
          setFetchedMails(fetched);
          toast.success(`${fetched.length} Message${fetched.length > 1 ? 's' : ''} Fetched (Demo)`);
          return;
        }
        const result = await fetchMailsAction(opts);
        if (!result.ok || !result.mails) {
          toast.error(result.error ?? 'Fetch failed');
          return;
        }
        setFetchedMails(result.mails);
        toast.success(`${result.mails.length > 0 ? result.mails.length : 'No'} Messages Fetched`);
      } finally {
        setLoading(false);
        setLoadingText('');
      }
    })();
  };

  const handleSignOut = async () => {
    setLoading(true);
    setLoadingText('Signing out...');
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 400));
    if (isDemo) {
      exitDemo();
      return;
    }
    await authClient.signOut();
    setLoading(false);
    setLoadingText('');
    setAccountDialogOpen(false);
    setAnalyzing(false);
    router.push("/thank-you");
  };

  const selectedFetchedMails = useMemo(
    () => fetchedMails.filter((m) => selectedFetchedIds.has(m.id)),
    [fetchedMails, selectedFetchedIds],
  );

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
    if (selectedFetchedIds.size > 2) {
      toast.error('You can analyze at most 2 mails at a time');
      return;
    }
    setAnalyzeDialogOpen(true);
  };

  const handleLoadFromDatabase = (opts: LoadOptions) => {
    void (async () => {
      setLoading(true);
      setLoadingText('Loading saved mails from Database...');
      setActiveTab('encrypted');
      try {
        if (isDemo) {
          await new Promise((r) => setTimeout(r, 600));
          const count = opts.count ? Math.min(Math.max(opts.count, 1), DEMO_DB_MAILS.length) : DEMO_DB_MAILS.length;
          const loaded = DEMO_DB_MAILS.slice(0, count);
          setEncryptedMails(loaded);
          toast.success(`${loaded.length} Message${loaded.length > 1 ? 's' : ''} Loaded (Demo)`);
          return;
        }
        const result = await loadMailsFromDatabaseAction(opts);
        if (!result.ok || !result.mails) {
          toast.error(result.error ?? 'Load failed');
          return;
        }
        setEncryptedMails(result.mails);
        toast.success(`${result.mails.length > 0 ? result.mails.length : 'No'} Messages Loaded`);
      } finally {
        setLoading(false);
        setLoadingText('');
      }
    })();
  };

  const handleAnalyzeSelected = (store: boolean) => {
    void (async () => {
      const selection = selectedFetchedMails;
      if (selection.length === 0) {
        toast.error('Select fetched mails to analyze');
        return;
      }
      if (selection.length > 2) {
        toast.error('You can analyze at most 2 mails at a time');
        return;
      }
      setAnalyzing(true);
      setLoadingText('Analyzing selected mails with Groq AI...');
      try {
        if (isDemo) {
          const demoSettings = getDemoSettings();
          const activeModelNames = ['Anthos Default', ...demoSettings.models.map((m) => m.name)];
          setLoadingText(`Analyzing with ${activeModelNames.join(', ')}...`);
          await new Promise((r) => setTimeout(r, 800));
          const demoAnalyzed = selection.map((m) => getDemoAnalyzedMail(m, activeModelNames));
          const merged = mergeAnalyzedMails(analyzedMails, demoAnalyzed);
          setAnalyzedMails(merged);
          setSelectedFetchedIds(new Set());
          setActiveTab('analyzed');
          toast.success(
            `${demoAnalyzed.length} mail(s) analyzed with ${activeModelNames.length} AI model(s) (Demo)`
          );
          if (store) {
            toast.success(`${demoAnalyzed.length} stored encrypted in DB (Demo)`);
          }
          return;
        }
        const result = await performGroqMailAnalysisAction(selection);
        if (!result.ok || !result.analyzedMails) {
          toast.error(result.error ?? 'Groq analysis failed');
          return;
        }
        const merged = mergeAnalyzedMails(analyzedMails, result.analyzedMails);
        setAnalyzedMails(merged);
        setSelectedFetchedIds(new Set());
        setActiveTab('analyzed');
        toast.success(`${result.analyzedMails.length} mail(s) analyzed with Groq AI`);

        if (store) {
          const syncResult = await syncEncryptedMailsToDb(result.analyzedMails);
          if (syncResult.ok) toast.success(`${result.analyzedMails.length} stored encrypted in DB`);
          else toast.error(syncResult.error ?? 'Store failed');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Analysis failed';
        toast.error(msg);
      } finally {
        setAnalyzing(false);
        setLoadingText('');
      }
    })();
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
    if (filteredMails.length > 2) {
      toast.error('You can select at most 2 mails for analysis');
      setSelectedFetchedIds(new Set(filteredMails.slice(0, 2).map((m) => m.id)));
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
    if (isDemo) {
      toast.success('Mail stored encrypted in database (Demo)');
      return;
    }
    void (async () => {
      setLoading(true);
      setLoadingText('Encrypting & storing mail in database...');
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
        setLoadingText('');
      }
    })();
  };

  if (appLoading) {
    return <Loader onComplete={() => setAppLoading(false)} />;
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
          analyzeDisabled={selectedFetchedIds.size === 0 || selectedFetchedIds.size > 2}
          onFetch={() => setFetchDialogOpen(true)}
          onLoadDataFromDatabase={() => setLoadDialogOpen(true)}
          sessionUserEmail={sessionUserEmail}
          hasCategories={hasCategories}
        />
        <AnimatePresence>
          {(loading || analyzing) && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-2.5 [html.light_&]:text-black dark:text-white text-xs sm:text-sm font-medium mt-4 mb-2 sm:mt-6 sm:mb-3 py-2"
            >
              <RefreshCw className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-spin [html.light_&]:text-black dark:text-white shrink-0" />
              <span className="[html.light_&]:text-black dark:text-white font-semibold">{loadingText || 'Processing request...'}</span>
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
              selectedIds={activeTab === 'fetched' ? selectedFetchedIds : activeTab === 'encrypted' ? selectedEncryptedIds : selectedAnalyzedIds}
              onToggleSelect={(id) => {
                if (activeTab === 'fetched') {
                  if (!selectedFetchedIds.has(id) && selectedFetchedIds.size >= 2) {
                    toast.error('You can analyze at most 2 mails at a time');
                    return;
                  }
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
                  if (!selectedFetchedIds.has(mail.id) && selectedFetchedIds.size >= 2) {
                    toast.error('You can analyze at most 2 mails at a time');
                    return;
                  }
                  setSelectedFetchedIds((p) => toggleInSet(p, mail.id));
                } else if (activeTab === 'encrypted') {
                  setSelectedEncryptedIds((p) => toggleInSet(p, mail.id));
                } else {
                  setSelectedAnalyzedIds((p) => toggleInSet(p, mail.id));
                }
              }}
              onStoreEncryptedMail={handleStoreSingleEncrypted}
              hasCategories={hasCategories}
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
        demoMode={isDemo}
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
    </div>
  );
}
