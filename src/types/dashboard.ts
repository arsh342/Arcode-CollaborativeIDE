import type { Timestamp, FieldValue } from 'firebase/firestore';

export interface ProjectType {
  id: string; // Firestore document ID
  name: string;
  description: string;
  imageUrl: string;
  lastModified: Timestamp | FieldValue | string; // Firestore Timestamp on read/write, string for display
  userId: string; // To associate projects with users
  imageAiHint?: string;
  language: string; // Added language field
}
