import React, { useState } from 'react';
import { Folder } from '../types';
import { Folder as FolderIcon, Plus, Trash2, Edit2 } from 'lucide-react';

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  language: 'en' | 'zh';
  isViewingTrash?: boolean;
}

export const FolderSidebar: React.FC<FolderSidebarProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  language,
  isViewingTrash = false
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const t = {
    allLinks: language === 'en' ? 'All Links' : '所有链接',
    newFolder: language === 'en' ? 'New Folder' : '新建文件夹',
    enterName: language === 'en' ? 'Folder name...' : '文件夹名称...',
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editName.trim()) {
      onRenameFolder(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <button
        onClick={() => onSelectFolder(null)}
        className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all text-sm font-medium ${
          selectedFolderId === null && !isViewingTrash
            ? 'bg-[var(--t-primary-subtle)] text-[var(--t-accent)] font-bold'
            : 'text-[var(--t-muted)] hover:bg-[var(--t-surface-2)] hover:text-[var(--t-text)]'
        }`}
      >
        <FolderIcon size={16} className={selectedFolderId === null && !isViewingTrash ? 'text-[var(--t-accent)]' : ''} />
        {t.allLinks}
      </button>

      {folders.map((folder) => (
        <div key={folder.id} className="group relative">
          {editingId === folder.id ? (
            <form onSubmit={(e) => handleRenameSubmit(e, folder.id)} className="p-2.5">
              <input
                autoFocus
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => setEditingId(null)}
                className="w-full bg-[var(--t-input)] text-[var(--t-text)] text-sm px-2 py-1 rounded border border-[var(--t-accent)] outline-none"
              />
            </form>
          ) : (
            <button
              onClick={() => onSelectFolder(folder.id)}
              className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all text-sm font-medium ${
                selectedFolderId === folder.id && !isViewingTrash
                  ? 'bg-[var(--t-primary-subtle)] text-[var(--t-accent)] font-bold'
                  : 'text-[var(--t-muted)] hover:bg-[var(--t-surface-2)] hover:text-[var(--t-text)]'
              }`}
            >
              <FolderIcon size={16} className={selectedFolderId === folder.id && !isViewingTrash ? 'text-[var(--t-accent)]' : ''} />
              <span className="truncate">{folder.name}</span>
            </button>
          )}

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); setEditName(folder.name); setEditingId(folder.id); }}
              className="p-1.5 text-[var(--t-faint)] hover:text-[var(--t-accent)] hover:bg-[var(--t-surface-2)] rounded-md transition-colors"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
              className="p-1.5 text-[var(--t-faint)] hover:text-red-400 hover:bg-[var(--t-surface-2)] rounded-md transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}

      {isCreating ? (
        <form onSubmit={handleCreateSubmit} className="mt-2 p-2">
          <input
            autoFocus
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={() => setIsCreating(false)}
            placeholder={t.enterName}
            className="w-full bg-[var(--t-input)] text-[var(--t-text)] text-sm px-3 py-2 rounded-lg border border-[var(--t-border)] outline-none focus:border-[var(--t-accent)] transition-colors placeholder:text-[var(--t-faint)]"
          />
        </form>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 mt-2 px-3 py-2 text-sm text-[var(--t-faint)] hover:text-[var(--t-accent)] transition-colors group"
        >
          <div className="w-5 h-5 rounded flex items-center justify-center bg-[var(--t-surface-2)] group-hover:bg-[var(--t-primary-subtle)] transition-colors">
            <Plus size={12} />
          </div>
          {t.newFolder}
        </button>
      )}
    </div>
  );
};
