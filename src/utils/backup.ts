import { Folder, LinkEntry } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

export const exportVault = (folders: Folder[], links: LinkEntry[]) => {
  const exportData = {
    version: 1,
    exported_at: new Date().toISOString(),
    folders: folders.map(({ user_id, ...f }) => f), // Omit user_id
    links: links.map(({ user_id, ...l }) => l), // Omit user_id
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `link-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const normalizeStr = (str: string) => (str || '').trim().toLowerCase();
const normalizeUrl = (url: string) => {
  let normalized = (url || '').trim();
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

export const importVault = async (
  file: File,
  userId: string,
  currentFolders: Folder[],
  currentLinks: LinkEntry[],
  supabase: SupabaseClient
) => {
  return new Promise<{ importedFolders: number; importedLinks: number }>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Validation
        if (!data.links || !Array.isArray(data.links)) {
          throw new Error('Invalid backup file format. Missing links array.');
        }

        const isLegacy = !data.folders;
        console.log(`[Backup Import] Detected format: ${isLegacy ? 'legacy' : 'v1'}`);
        console.log(`[Backup Import] Links in file: ${data.links.length}`);
        
        // TODO: History import could be added here in the future.
        // if (data.history && Array.isArray(data.history)) { ... }

        let importedFolderCount = 0;
        let importedLinkCount = 0;
        let skippedDuplicateCount = 0;
        const folderIdMap = new Map<string, string>(); // oldId or categoryName -> newId
        const now = new Date().toISOString();

        // 1. Process Folders
        let foldersToProcess = data.folders || [];
        
        if (isLegacy) {
          // Generate folders from unique categories in legacy links
          const uniqueCategories = Array.from(new Set(data.links.map((l: any) => l.category?.trim() || 'Uncategorized')));
          console.log(`[Backup Import] Folders generated from categories: ${uniqueCategories.length}`);
          
          foldersToProcess = uniqueCategories.map(cat => ({
            id: cat, // Use category name as a temporary ID for mapping later
            name: cat,
            created_at: now
          }));
        }

        for (const importedFolder of foldersToProcess) {
          const folderName = importedFolder.name.trim() || 'Uncategorized';
          const existingFolder = currentFolders.find(
            f => normalizeStr(f.name) === normalizeStr(folderName)
          );

          if (existingFolder) {
            folderIdMap.set(importedFolder.id, existingFolder.id);
          } else {
            // Create new folder
            const { data: newFolder, error } = await supabase
              .from('link_vault_folders')
              .insert([{ 
                user_id: userId, 
                name: folderName,
                created_at: importedFolder.created_at || now,
                updated_at: now
              }])
              .select()
              .single();

            if (error) throw error;
            folderIdMap.set(importedFolder.id, newFolder.id);
            // Also map it to currentFolders array so subsequent duplicate categories don't create new ones
            currentFolders.push(newFolder);
            importedFolderCount++;
          }
        }

        // 2. Process Links
        const linksToInsert = [];
        for (const importedLink of data.links) {
          const isDuplicate = currentLinks.some(
            l => normalizeStr(l.title) === normalizeStr(importedLink.title) && 
                 normalizeUrl(l.url) === normalizeUrl(importedLink.url)
          );

          if (!isDuplicate) {
            let newFolderId = null;
            let tag = importedLink.tag || null;
            let createdAt = importedLink.created_at || now;

            if (isLegacy) {
              const categoryName = importedLink.category?.trim() || 'Uncategorized';
              newFolderId = folderIdMap.get(categoryName) || null;
              tag = categoryName; // Map old category to tag as well
              if (importedLink.createdAt) {
                // Convert number timestamp to ISO string
                createdAt = new Date(importedLink.createdAt).toISOString();
              }
            } else {
              if (importedLink.folder_id && folderIdMap.has(importedLink.folder_id)) {
                newFolderId = folderIdMap.get(importedLink.folder_id);
              }
            }

            linksToInsert.push({
              user_id: userId,
              folder_id: newFolderId,
              title: (importedLink.title || 'Untitled').trim(),
              url: (importedLink.url || '').trim(),
              description: importedLink.description || '',
              tag: tag,
              created_at: createdAt,
              updated_at: now
            });
          } else {
            skippedDuplicateCount++;
          }
        }

        // Bulk insert links
        if (linksToInsert.length > 0) {
          const { error } = await supabase
            .from('link_vault_links')
            .insert(linksToInsert);

          if (error) throw error;
          importedLinkCount += linksToInsert.length;
        }

        console.log(`[Backup Import] Imported links: ${importedLinkCount}`);
        console.log(`[Backup Import] Duplicate links skipped: ${skippedDuplicateCount}`);

        resolve({ importedFolders: importedFolderCount, importedLinks: importedLinkCount });
      } catch (err: any) {
        reject(new Error(err.message || 'Failed to parse or process backup file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
};
