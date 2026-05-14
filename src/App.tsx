import { useState, useEffect, useMemo } from 'react';
import { LinkEntry, Folder } from './types';
import { LinkCard } from './components/LinkCard';
import AddEditLinkModal from './components/AddEditLinkModal';
import { FolderSidebar } from './components/FolderSidebar';
import SearchBar from './components/SearchBar';
import { AuthScreen } from './components/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { Plus, Vault, Info, Shield, PlusCircle, Trash2, History, Menu, X as CloseIcon, LogOut, Download, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from './i18n';
import HistoryModal from './components/HistoryModal';
import { exportVault, importVault } from './utils/backup';

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
      <header className="h-16 border-b border-zinc-800/50 bg-zinc-950 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Vault className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-display hidden xs:block">
            Link<span className="text-indigo-400">{t.title}</span>
          </h1>
        </div>
        
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder={t.searchPlaceholder} />
        </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                setIsViewingTrash(!isViewingTrash);
                setSelectedFolderId(null);
              }}
              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all ${
                isViewingTrash 
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' 
                  : 'bg-zinc-950/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
              title={language === 'en' ? 'History' : '历史记录'}
            >
              <History size={16} />
            </button>
            
            <div className="flex items-center bg-zinc-950/50 border border-zinc-800 rounded-full p-1 h-8 sm:h-9">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 sm:px-3 h-full flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${
                language === 'en' 
                  ? 'bg-zinc-800 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={`px-2 sm:px-3 h-full flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${
                language === 'zh' 
                  ? 'bg-zinc-800 text-white shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              中文
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 mr-2">
            <button
              onClick={handleExport}
              className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
              title="Export Vault Backup"
            >
              <Download size={18} />
            </button>
            <label 
              className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors cursor-pointer"
              title="Import Vault Backup"
            >
              <Upload size={18} />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-5 h-8 sm:h-10 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">{t.newLink}</span>
          </button>

          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Search Bar (Only visible on small screens) */}
      <div className="p-4 md:hidden border-b border-zinc-800/30 bg-zinc-950/50">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder={t.searchPlaceholder} />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Menu Backdrop */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-zinc-950 border-r border-zinc-800 z-[110] p-6 flex flex-col gap-8"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Vault className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white font-display">
                    Link<span className="text-indigo-400">{t.title}</span>
                  </h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-500">
                  <CloseIcon size={20} />
                </button>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4 px-2">Folders</h3>
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
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:flex w-64 border-r border-zinc-800/50 bg-zinc-950 p-6 flex-col gap-8 shrink-0 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4 px-2">Folders</h3>
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

          <div className="mt-auto">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 ring-1 ring-zinc-800/50">
              <div className="flex items-center gap-2 text-indigo-300 font-medium text-xs mb-1">
                <Shield size={12} />
                {t.proTip}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {t.proTipDesc}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#09090b] relative p-4 sm:p-8 custom-scrollbar">
          {/* Subtle background glow */}
          <div className="glow-indigo top-[-100px] right-[-100px]" />
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 relative">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {isViewingTrash 
                  ? (language === 'zh' ? '历史记录' : 'History')
                  : selectedFolderId 
                    ? folders.find(f => f.id === selectedFolderId)?.name || 'Folder'
                    : t.savedResources}
              </h2>
              <p className="text-sm text-zinc-500">{t.manageResources}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold bg-zinc-800 text-zinc-400 py-1.5 px-3 rounded-full border border-zinc-700">
                {filteredLinks.length} {t.results}
              </span>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="relative">
            {loadingData ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredLinks.length > 0 ? (
                  <motion.div 
                    layout
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
                      <motion.button
                        layout
                        onClick={() => setIsModalOpen(true)}
                        className="border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-8 bg-zinc-900/10 hover:bg-zinc-900/20 hover:border-zinc-700 transition-all cursor-pointer group min-h-[160px]"
                      >
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-zinc-700">
                          <PlusCircle className="w-6 h-6 text-zinc-500" />
                        </div>
                        <p className="text-zinc-500 font-medium text-sm group-hover:text-zinc-300 transition-colors">{t.addLink}</p>
                        <p className="text-[10px] text-zinc-700 mt-1 uppercase tracking-widest">{t.quickSave}</p>
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6 border border-zinc-800">
                      <Vault className="text-zinc-700" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-300 mb-2">{searchQuery ? t.noLinksSearch : t.noLinks}</h3>
                    <p className="text-zinc-500 text-sm max-w-xs mb-8">
                      {searchQuery ? t.noLinksSearch : t.noLinksSub}
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-sm shadow-lg shadow-indigo-600/20"
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

      {/* Bottom Status Bar */}
      <footer className="h-8 border-t border-zinc-800/50 bg-zinc-950 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            Synced to Supabase
          </span>
          <div className="h-3 w-px bg-zinc-800 hidden sm:block"></div>
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            <Info size={10} />
            RLS Secured
          </span>
        </div>
        <p className="text-[10px] text-zinc-600 tracking-wider font-mono">v1.2.0 - Link Vault</p>
      </footer>

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
                className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-8 pointer-events-auto shadow-2xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <Trash2 className="text-red-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t.confirmDelete}</h3>
                  <div className="flex gap-4 w-full mt-6">
                    <button
                      onClick={() => setDeleteConfirmation(null)}
                      className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-all"
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
                className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-white mb-2">Importing Vault</h3>
                <p className="text-zinc-400 text-sm">Please wait while your links and folders are securely synced to Supabase...</p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
