import { useState, useEffect, useMemo } from 'react';
import { LinkEntry, Folder } from './types';
import { LinkCard } from './components/LinkCard';
import AddEditLinkModal from './components/AddEditLinkModal';
import { FolderSidebar } from './components/FolderSidebar';
import SearchBar from './components/SearchBar';
import { AuthScreen } from './components/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { Plus, Vault, PlusCircle, Trash2, History, Menu, X as CloseIcon, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from './i18n';
import HistoryModal from './components/HistoryModal';
import { exportVault, importVault } from './utils/backup';
import SettingsDrawer from './components/SettingsDrawer';

const LANG_KEY = 'link_vault_lang';

export default function App() {
  const { user, signOut } = useAuth();
  
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  // We keep local history just for undo if wanted, but standard request says replace localstorage. 
  // Let's remove history or just keep it in memory for now. The user didn't specify keeping history in supabase.
  const [history, setHistory] = useState<LinkEntry[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewingTrash, setIsViewingTrash] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY) as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, language);
  }, [language]);

  const fetchData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [foldersRes, linksRes] = await Promise.all([
        supabase.from('link_vault_folders').select('*').eq('user_id', user.id).order('name'),
        supabase.from('link_vault_links').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (foldersRes.error) throw foldersRes.error;
      if (linksRes.error) throw linksRes.error;

      setFolders(foldersRes.data);
      setLinks(linksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAddFolder = async (name: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('link_vault_folders')
        .insert([{ user_id: user.id, name }])
        .select()
        .single();
      
      if (error) throw error;
      setFolders([...folders, data]);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleRenameFolder = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('link_vault_folders')
        .update({ name })
        .eq('id', id);
      
      if (error) throw error;
      setFolders(folders.map(f => f.id === id ? { ...f, name } : f));
    } catch (error) {
      console.error('Error renaming folder:', error);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Are you sure you want to move this folder to the trash?')) return;
    
    try {
      const now = new Date().toISOString();
      const { error } = await supabase.from('link_vault_folders').update({ deleted_at: now }).eq('id', id);
      if (error) throw error;
      
      setFolders(folders.map(f => f.id === id ? { ...f, deleted_at: now } : f));
      if (selectedFolderId === id) setSelectedFolderId(null);
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const handleAddLink = async (newLink: Omit<LinkEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('link_vault_links')
        .insert([{ ...newLink, user_id: user.id }])
        .select()
        .single();
        
      if (error) throw error;
      setLinks([data, ...links]);
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const handleEditLink = async (updatedLink: Omit<LinkEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!editingLink) return;
    try {
      const { data, error } = await supabase
        .from('link_vault_links')
        .update(updatedLink)
        .eq('id', editingLink.id)
        .select()
        .single();
        
      if (error) throw error;
      setLinks(links.map(l => l.id === editingLink.id ? data : l));
      setEditingLink(null);
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const linkToDelete = links.find(l => l.id === id);
      if (linkToDelete) {
        setHistory([linkToDelete, ...history]);
      }

      if (isViewingTrash) {
        // Permanent delete
        const { error } = await supabase.from('link_vault_links').delete().eq('id', id);
        if (error) throw error;
        setLinks(links.filter(l => l.id !== id));
      } else {
        // Soft delete
        const now = new Date().toISOString();
        const { error } = await supabase.from('link_vault_links').update({ deleted_at: now }).eq('id', id);
        if (error) throw error;
        setLinks(links.map(l => l.id === id ? { ...l, deleted_at: now } : l));
      }
    } catch (error) {
      console.error('Error deleting link:', error);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const handleRestoreLink = async (id: string) => {
    try {
      const { error } = await supabase.from('link_vault_links').update({ deleted_at: null }).eq('id', id);
      if (error) throw error;
      setLinks(links.map(l => l.id === id ? { ...l, deleted_at: null } : l));
    } catch (error) {
      console.error('Error restoring link:', error);
    }
  };

  const handleExport = () => {
    exportVault(folders, links);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Reset input so the same file can be selected again if needed
    e.target.value = '';

    const confirmImport = confirm("Importing will add data to your current vault. Existing matching folders and links will be skipped. Continue?");
    if (!confirmImport) return;

    setIsImporting(true);
    try {
      const result = await importVault(file, user.id, folders, links, supabase);
      alert(`Import complete! \nImported ${result.importedFolders} new folders.\nImported ${result.importedLinks} new links.`);
      await fetchData(); // Refresh data from server
    } catch (error: any) {
      console.error('Import error:', error);
      alert(error.message || 'An error occurred during import.');
    } finally {
      setIsImporting(false);
    }
  };

  const activeFolders = folders.filter(f => !f.deleted_at);
  const activeLinks = links.filter(l => !l.deleted_at);
  const deletedLinks = links.filter(l => l.deleted_at);
  const linksToDisplay = isViewingTrash ? deletedLinks : activeLinks;

  const filteredLinks = useMemo(() => {
    return linksToDisplay.filter(link => {
      const matchesSearch = 
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.tag?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFolder = selectedFolderId === null || link.folder_id === selectedFolderId;
      
      return matchesSearch && matchesFolder;
    });
  }, [linksToDisplay, searchQuery, selectedFolderId]);

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden text-zinc-100 font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-[var(--t-border-subtle)] bg-[var(--t-surface)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            <Menu size={20} />
          </button>
          <img 
            src="/icon-192.png" 
            alt="WeLink Logo" 
            className="w-10 h-10 md:w-11 md:h-11 rounded-lg shadow-lg shadow-indigo-600/20 object-contain" 
          />
          <h1 className="text-xl font-bold tracking-tight text-[var(--t-text)] font-display hidden lg:block">
            Link<span className="text-indigo-400">{t.title}</span>
          </h1>
        </div>
        
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder={t.searchPlaceholder} />
        </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setIsViewingTrash(!isViewingTrash);
                setSelectedFolderId(null);
              }}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all ${
                isViewingTrash 
                  ? 'bg-[var(--t-primary)] text-white shadow-[0_0_15px_var(--t-glow)]'
                  : 'bg-[var(--t-surface)] border border-[var(--t-border)] text-[var(--t-muted)] hover:text-[var(--t-text)] hover:bg-[var(--t-surface-2)]'
              }`}
              title={language === 'en' ? 'History' : '历史记录'}
            >
              <History size={16} />
            </button>

            <div className="flex items-center bg-[var(--t-surface)] border border-[var(--t-border)] rounded-full p-1 h-8 sm:h-9">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 sm:px-3 h-full flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${
                  language === 'en' 
                    ? 'bg-[var(--t-surface-2)] text-[var(--t-text)] shadow-lg'
                    : 'text-[var(--t-faint)] hover:text-[var(--t-muted)]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('zh')}
                className={`px-2 sm:px-3 h-full flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${
                  language === 'zh' 
                    ? 'bg-[var(--t-surface-2)] text-[var(--t-text)] shadow-lg'
                    : 'text-[var(--t-faint)] hover:text-[var(--t-muted)]'
                }`}
              >
                中文
              </button>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[var(--t-primary)] hover:bg-[var(--t-primary-hover)] text-white text-xs sm:text-sm font-bold px-3 sm:px-5 h-8 sm:h-10 rounded-full shadow-[0_0_20px_var(--t-glow)] transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t.newLink}</span>
            </button>
        </div>
      </header>

      {/* Mobile Search Bar (Only visible on small screens) */}
      <div className="p-4 md:hidden border-b border-[var(--t-border-subtle)] bg-[var(--t-surface)]">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder={t.searchPlaceholder} />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Menu Backdrop */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`lg:hidden fixed inset-0 bg-black/80 z-[100] transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        />

        {/* Mobile Sidebar */}
        <aside
          style={{ willChange: 'transform', transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
          className="lg:hidden fixed inset-y-0 left-0 w-72 bg-[var(--t-surface)] border-r border-[var(--t-border)] z-[110] p-6 flex flex-col gap-6 transition-transform duration-200 ease-out"
        >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <img 
                    src="/icon-192.png" 
                    alt="WeLink Logo" 
                    className="w-10 h-10 md:w-11 md:h-11 rounded-lg object-contain" 
                  />
                  <h1 className="text-xl font-bold tracking-tight text-[var(--t-text)] font-display">
                    Link<span className="text-[var(--t-accent)]">{t.title}</span>
                  </h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[var(--t-muted)]">
                  <CloseIcon size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <h3 className="text-[10px] uppercase tracking-widest text-[var(--t-faint)] font-bold mb-4 px-2">{language === 'en' ? 'Folders' : '文件夹'}</h3>
                <FolderSidebar
                  folders={activeFolders}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={(id) => { setSelectedFolderId(id); setIsViewingTrash(false); setIsMobileMenuOpen(false); }}
                  onCreateFolder={handleAddFolder}
                  onRenameFolder={handleRenameFolder}
                  onDeleteFolder={handleDeleteFolder}
                  language={language}
                  isViewingTrash={isViewingTrash}
                />
              </div>

              <div className="mt-auto pt-4 border-t border-[var(--t-border)]">
                <button
                  onClick={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-2.5 py-2.5 rounded-xl text-sm font-medium text-[var(--t-muted)] hover:bg-[var(--t-surface-2)] hover:text-[var(--t-text)] transition-all"
                >
                  <Settings size={16} />
                  {language === 'en' ? 'Settings' : '设置'}
                </button>
              </div>
        </aside>

        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:flex w-64 border-r border-[var(--t-border-subtle)] bg-[var(--t-surface)] p-6 flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-[var(--t-faint)] font-bold mb-4 px-2">{language === 'en' ? 'Folders' : '文件夹'}</h3>
            <FolderSidebar
              folders={activeFolders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={(id) => { setSelectedFolderId(id); setIsViewingTrash(false); }}
              onCreateFolder={handleAddFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              language={language}
              isViewingTrash={isViewingTrash}
            />
          </div>

          <div className="mt-auto pt-4 border-t border-[var(--t-border)]">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-3 w-full px-2.5 py-2.5 rounded-xl text-sm font-medium text-[var(--t-muted)] hover:bg-[var(--t-surface-2)] hover:text-[var(--t-text)] transition-all"
            >
              <Settings size={16} />
              {language === 'en' ? 'Settings' : '设置'}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--t-bg)] relative p-4 sm:p-8 custom-scrollbar">
          {/* Subtle background glow */}
          <div className="glow-primary top-[-100px] right-[-100px]" />
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 relative">
            <div>
              <h2 className="text-2xl font-bold text-[var(--t-text)] mb-1">
                {isViewingTrash 
                  ? (language === 'zh' ? '历史记录' : 'History')
                  : selectedFolderId 
                    ? folders.find(f => f.id === selectedFolderId)?.name || 'Folder'
                    : t.savedResources}
              </h2>
              <p className="text-sm text-[var(--t-muted)]">{t.manageResources}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-[var(--t-surface-2)] text-[var(--t-muted)] py-1.5 px-3 rounded-full border border-[var(--t-border)]">
                {filteredLinks.length} {t.results}
              </span>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="relative">
            {loadingData ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--t-primary)] border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <AnimatePresence>
                {filteredLinks.length > 0 ? (
                  <div 
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {filteredLinks.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        folderName={folders.find(f => f.id === link.folder_id)?.name}
                        onEdit={(l) => {
                          setEditingLink(l);
                          setIsModalOpen(true);
                        }}
                        onDelete={(id) => setDeleteConfirmation(id)}
                        language={language}
                        isTrashMode={isViewingTrash}
                        onRestore={handleRestoreLink}
                      />
                    ))}
                    
                    
                    {/* Quick Add Placeholder */}
                    {!isViewingTrash && (
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="border-2 border-dashed border-[var(--t-border)] rounded-2xl flex flex-col items-center justify-center p-8 bg-transparent hover:bg-[var(--t-surface-2)] hover:border-[var(--t-accent)] transition-all cursor-pointer group min-h-[160px]"
                      >
                        <div className="w-10 h-10 rounded-full bg-[var(--t-surface-2)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-[var(--t-border)]">
                          <PlusCircle className="w-6 h-6 text-[var(--t-muted)]" />
                        </div>
                        <p className="text-[var(--t-muted)] font-medium text-sm group-hover:text-[var(--t-text)] transition-colors">{t.addLink}</p>
                        <p className="text-[10px] text-[var(--t-faint)] mt-1 uppercase tracking-widest">{t.quickSave}</p>
                      </button>
                    )}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-[var(--t-surface-2)] flex items-center justify-center mb-6 border border-[var(--t-border)]">
                      <Vault className="text-[var(--t-faint)]" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--t-muted)] mb-2">{searchQuery ? t.noLinksSearch : t.noLinks}</h3>
                    <p className="text-[var(--t-muted)] text-sm max-w-xs mb-8">
                      {searchQuery ? t.noLinksSearch : t.noLinksSub}
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-2.5 bg-[var(--t-primary)] hover:bg-[var(--t-primary-hover)] text-white rounded-full font-bold text-sm shadow-lg"
                    >
                      {isViewingTrash ? (language === 'zh' ? '返回主页' : 'Go Back') : t.createLink}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        onExport={handleExport}
        onImport={handleImport}
        onSignOut={signOut}
        userEmail={user?.email}
      />

      {/* Modal */}
      <AddEditLinkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLink(null);
        }}
        onSubmit={editingLink ? handleEditLink : handleAddLink}
        editingLink={editingLink}
        folders={folders}
        t={t}
        language={language}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmation(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[210] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[var(--t-modal)] border border-[var(--t-border)] w-full max-w-sm rounded-3xl p-8 pointer-events-auto shadow-2xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <Trash2 className="text-red-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--t-text)] mb-2">{t.confirmDelete}</h3>
                  <div className="flex gap-4 w-full mt-6">
                    <button
                      onClick={() => setDeleteConfirmation(null)}
                      className="flex-1 px-6 py-3 bg-[var(--t-surface-2)] hover:bg-[var(--t-border)] text-[var(--t-text)] rounded-xl font-bold text-sm transition-all"
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      onClick={() => deleteConfirmation && handleDeleteLink(deleteConfirmation)}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 transition-all"
                    >
                      {t.deleteBtn}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Importing Loading State */}
      <AnimatePresence>
        {isImporting && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[310] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[var(--t-modal)] border border-[var(--t-border)] w-full max-w-sm rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full border-4 border-[var(--t-primary-subtle)] border-t-[var(--t-primary)] animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-[var(--t-text)] mb-2">Importing Vault</h3>
                <p className="text-[var(--t-muted)] text-sm">Please wait while your links and folders are securely synced to Supabase...</p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
