
import type { Timestamp, FieldValue } from 'firebase/firestore';

export interface ProjectType {
  id: string; // Firestore document ID
  name: string;
  description: string;
  imageUrl: string;
  lastModified: Timestamp | FieldValue | string; // Firestore Timestamp on read/write, string for display
  ownerId: string; // UID of the user who created/owns the project
  collaborators: Record<string, 'owner' | 'developer'>; // Map of user UIDs to their roles
  memberUids: string[]; // Array of UIDs of all members (owner + developers)
  imageAiHint?: string;
  language: string;
}

