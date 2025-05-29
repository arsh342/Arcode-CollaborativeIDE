export interface ProjectType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  lastModified: string;
  imageAiHint?: string; // For placeholder images, e.g., "website wireframe"
}
