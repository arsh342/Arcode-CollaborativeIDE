import type { Timestamp, FieldValue } from 'firebase/firestore';

export interface ProjectType {
  id: string; // Firestore document ID
  name: string;
  description: string;
  imageUrl: string;
  lastModified: Timestamp | FieldValue | string; // Firestore Timestamp on read/write, string for display
  imageAiHint?: string;
}
