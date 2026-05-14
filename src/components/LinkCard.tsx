import { LinkEntry } from '../types';
import { ExternalLink, Edit2, Trash2, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { Language } from '../i18n';

export interface LinkCardProps {
  link: LinkEntry;
  folderName?: string;
  onEdit: (link: LinkEntry) => void;
  onDelete: (id: string) => void;
  language: Language;
  isTrashMode?: boolean;
  onRestore?: (id: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link, folderName, onEdit, onDelete, language, isTrashMode, onRestore }) => {
  const formattedDate = new Date(link.created_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const hostname = new URL(link.url).hostname;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-zinc-900/60 transition-all shadow-xl flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border text-zinc-400 bg-zinc-800/50 border-zinc-700`}>
          {folderName || 'Uncategorized'}
        </span>
        {link.tag && (
           <span className="ml-2 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
             {link.tag}
           </span>
        )}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
          {isTrashMode ? (
            <>
              <button
                onClick={() => onRestore && onRestore(link.id)}
                className="p-1.5 hover:bg-zinc-800 rounded-md text-emerald-400 hover:text-emerald-300 transition-colors"
                title="Restore"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => onDelete(link.id)}
                className="p-1.5 hover:bg-zinc-800 rounded-md text-red-500 hover:text-red-400 transition-colors"
                title="Permanent Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(link)}
                className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-indigo-400 transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(link.id)}
                className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-zinc-100 mb-2 truncate group-hover:text-white transition-colors">
        {link.title}
      </h3>
      <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed italic">
        {link.description}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-400 font-medium hover:underline flex items-center gap-1 group/link"
        >
          {hostname}
          <ExternalLink size={10} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
        <span className="text-[10px] text-zinc-600 font-mono">
          {formattedDate}
        </span>
      </div>
    </motion.div>
  );
};
