import React from 'react';
import { X, RotateCcw, Trash2, History as HistoryIcon, Vault } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LinkEntry } from '../types';
import { Language, getCategoryName } from '../i18n';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: LinkEntry[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  t: any;
  language: Language;
}

export default function HistoryModal({ 
  isOpen, 
  onClose, 
  history, 
  onRestore, 
  onPermanentDelete, 
  t, 
  language 
}: HistoryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[160] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden pointer-events-auto shadow-2xl flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <HistoryIcon className="text-zinc-400" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display text-white">{t.historyTitle}</h2>
                    <p className="text-xs text-zinc-500">{t.historyDesc}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4 border border-zinc-800">
                      <Vault className="text-zinc-700" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-400 mb-1">{t.noHistory}</h3>
                    <p className="text-xs text-zinc-600 max-w-xs">{t.noHistorySub}</p>
                  </div>
                ) : (
                  history.map((link) => (
                    <motion.div
                      layout
                      key={link.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group p-4 rounded-2xl bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-2 py-0.5 border border-zinc-800 rounded bg-zinc-900">
                            {getCategoryName(link.category, language)}
                          </span>
                          <h4 className="text-sm font-bold text-zinc-100 truncate">{link.title}</h4>
                        </div>
                        <p className="text-xs text-zinc-500 truncate italic">{link.url}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onRestore(link.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-zinc-400 rounded-lg text-xs font-bold transition-all"
                          title={t.restoreBtn}
                        >
                          <RotateCcw size={14} />
                          <span className="hidden sm:inline">{t.restoreBtn}</span>
                        </button>
                        <button
                          onClick={() => onPermanentDelete(link.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-red-600/20 hover:text-red-400 text-zinc-400 rounded-lg text-xs font-bold transition-all"
                          title={t.permanentDeleteBtn}
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">{t.deleteBtn}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
