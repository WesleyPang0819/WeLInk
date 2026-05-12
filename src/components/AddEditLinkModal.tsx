import { useState, useEffect, FormEvent } from 'react';
import { LinkEntry, Folder } from '../types';
import { X, Plus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../i18n';

interface AddEditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (link: Omit<LinkEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  editingLink?: LinkEntry | null;
  folders: Folder[];
  t: any;
  language: Language;
}

export default function AddEditLinkModal({ isOpen, onClose, onSubmit, editingLink, folders, t, language }: AddEditLinkModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    folder_id: null as string | null,
    tag: '',
  });

  useEffect(() => {
    if (editingLink) {
      setFormData({
        title: editingLink.title || '',
        url: editingLink.url || '',
        description: editingLink.description || '',
        folder_id: editingLink.folder_id || null,
        tag: editingLink.tag || '',
      });
    } else {
      setFormData({
        title: '',
        url: '',
        description: '',
        folder_id: null,
        tag: '',
      });
    }
  }, [editingLink, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;
    
    // Ensure URL has protocol
    let finalUrl = formData.url;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    onSubmit({ ...formData, url: finalUrl, tag: formData.tag || null });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[110] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-8 pointer-events-auto relative shadow-2xl overflow-hidden"
            >
              {/* Background accent */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full" />

              <div className="flex justify-between items-center mb-6 relative">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent font-display">
                  {editingLink ? t.edit : t.add}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{t.titleLabel}</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{t.urlLabel}</label>
                  <input
                    required
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="example.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{t.descLabel}</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700 resize-none italic"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Folder</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, folder_id: null })}
                      className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                        formData.folder_id === null
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      None
                    </button>
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, folder_id: folder.id })}
                        className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                          formData.folder_id === folder.id
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {folder.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Tags</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. Design, React, AI"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold shadow-xl shadow-indigo-600/10 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                  {editingLink ? (
                    <>
                      <Save size={18} />
                      {t.updateBtn}
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      {t.saveBtn}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
