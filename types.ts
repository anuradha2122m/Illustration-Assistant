export enum WorkflowState {
  ARTICLE_INPUT,
  PROMPT_SELECTION,
  IMAGE_DISPLAY,
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
  tags?: string[];
}

export interface TaggedPrompt {
  tag: string;
  prompt: string;
}
