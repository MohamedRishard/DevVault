export interface Resource {
  id: string;
  userId: string;
  title: string;
  url: string;
  category: string;
  description: string;
  mainFunctions: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  userId: string;
  email: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
