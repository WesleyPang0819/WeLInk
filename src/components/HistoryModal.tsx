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

export default function HistoryModal({ isOpen, onClose, history, onRestore, onPermanentDelete, t, language }: HistoryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[160] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--t-modal)] border border-[var(--t-border)] w-full max-w-2xl rounded-3xl overflow-hidden pointer-events-auto shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-[var(--t-border)] flex items-center justify-between bg-[var(--t-surface)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--t-surface-2)] flex items-center justify-center">
                    <HistoryIcon className="text-[var(--t-muted)]" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display text-[var(--t-text)]">{t.historyTitle}</h2>
                    <p className="text-xs text-[var(--t-faint)]">{t.historyDesc}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[var(--t-surface-2)] rounded-lg text-[var(--t-muted)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--t-surface-2)] flex items-center justify-center mb-4 border border-[var(--t-border)]">
                      <Vault className="text-[var(--t-faint)]" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--t-muted)] mb-1">{t.noHistory}</h3>
                    <p className="text-xs text-[var(--t-faint)] max-w-xs">{t.noHistorySub}</p>
                  </div>
                ) : (
                  history.map((link) => (
                    <motion.div
                      layout key={link.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="group p-4 rounded-2xl bg-[var(--t-card)] border border-[var(--t-border)] hover:border-[var(--t-accent)] transition-all flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--t-faint)] px-2 py-0.5 border border-[var(--t-border)] rounded bg-[var(--t-surface-2)]">
                            {getCategoryName(link.category, language)}
                          </span>
                          <h4 className="text-sm font-bold text-[var(--t-text)] truncate">{link.title}</h4>
                        </div>
                        <p className="text-xs text-[var(--t-muted)] truncate italic">{link.url}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onRestore(link.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--t-surface-2)] hover:bg-emerald-600/20 hover:text-emerald-400 text-[var(--t-muted)] rounded-lg text-xs font-bold transition-all"
                          title={t.restoreBtn}
                        >
                          <RotateCcw size={14} />
                          <span className="hidden sm:inline">{t.restoreBtn}</span>
                        </button>
                        <button
                          onClick={() => onPermanentDelete(link.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--t-surface-2)] hover:bg-red-600/20 hover:text-red-400 text-[var(--t-muted)] rounded-lg text-xs font-bold transition-all"
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
