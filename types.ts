
export interface StoryPage {
  text: string;
  visualPrompt: string;
  imageUrl?: string;
}

export interface Story {
  title: string;
  pages: StoryPage[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  WRITING = 'WRITING',
  ILLUSTRATING = 'ILLUSTRATING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

export interface StoryParams {
  keywords: string;
  moral: string;
  style: string;
}
