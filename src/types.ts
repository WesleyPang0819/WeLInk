export interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LinkEntry {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  url: string;
  description: string;
  tag: string | null;
  created_at: string;
  updated_at: string;
}

// Keep a Category type alias for backwards compatibility in UI if needed, 
// though we will migrate to use Folder IDs.
export type Category = string; 

