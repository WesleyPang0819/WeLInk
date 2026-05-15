import { LinkEntry } from '../types';
import { ExternalLink, Edit2, Trash2, RotateCcw } from 'lucide-react';
import React from 'react';
import { Language } from '../i18n';
import { translateDescription } from '../utils/translateDescription';

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

  const t = {
    uncategorized: language === 'en' ? 'Uncategorized' : '未分类',
    restore: language === 'en' ? 'Restore' : '恢复',
    permanentDelete: language === 'en' ? 'Permanent Delete' : '永久删除',
    edit: language === 'en' ? 'Edit' : '编辑',
    delete: language === 'en' ? 'Delete' : '删除',
  };

  return (
    <div
      className="group bg-[var(--t-card)] border border-[var(--t-border)] rounded-2xl p-5 hover:border-[var(--t-accent)] hover:bg-[var(--t-card-hover)] transition-all shadow-xl flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border text-[var(--t-muted)] bg-[var(--t-surface-2)] border-[var(--t-border)]">
          {folderName || t.uncategorized}
        </span>
        {link.tag && (
           <span className="ml-2 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[var(--t-primary-subtle)] text-[var(--t-accent)] border border-[var(--t-border)]">
             {link.tag}
           </span>
        )}
        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-auto">
          {isTrashMode ? (
            <>
              <button
                onClick={() => onRestore && onRestore(link.id)}
                className="p-1.5 hover:bg-[var(--t-surface-2)] rounded-md text-emerald-500 hover:text-emerald-400 transition-colors"
                title={t.restore}
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => onDelete(link.id)}
                className="p-1.5 hover:bg-[var(--t-surface-2)] rounded-md text-red-500 hover:text-red-400 transition-colors"
                title={t.permanentDelete}
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(link)}
                className="p-1.5 hover:bg-[var(--t-surface-2)] rounded-md text-[var(--t-muted)] hover:text-[var(--t-accent)] transition-colors"
                title={t.edit}
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(link.id)}
                className="p-1.5 hover:bg-[var(--t-surface-2)] rounded-md text-[var(--t-muted)] hover:text-red-400 transition-colors"
                title={t.delete}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-[var(--t-text)] mb-2 truncate group-hover:text-[var(--t-text)] transition-colors">
        {link.title}
      </h3>
      <p className="text-sm text-[var(--t-muted)] line-clamp-2 mb-4 leading-relaxed italic">
        {translateDescription(link.description, language)}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--t-border)]">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--t-accent)] font-medium hover:underline flex items-center gap-1 group/link"
        >
          {hostname}
          <ExternalLink size={10} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
        <span className="text-[10px] text-[var(--t-faint)] font-mono">
          {formattedDate}
        </span>
      </div>
    </div>
  );
};
