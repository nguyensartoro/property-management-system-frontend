import { create } from "zustand";
import axios from "axios";
import apiClient from "../utils/apiClient";

// Define document types
export enum DocumentType {
  ID_CARD = "ID_CARD",
  PASSPORT = "PASSPORT",
  CONTRACT = "CONTRACT",
  OTHER = "OTHER",
}

// Define entity types that can have documents
export enum EntityType {
  PROPERTY = "PROPERTY",
  ROOM = "ROOM",
  RENTER = "RENTER",
  CONTRACT = "CONTRACT",
}

// Document interface
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  path: string;
  entityId: string;
  entityType: EntityType;
  createdAt: string;
  updatedAt: string;
}

// Document store state interface
interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  // Actions
  uploadDocument: (
    file: File,
    type: DocumentType,
    entityId: string,
    entityType: EntityType
  ) => Promise<Document>;
  fetchDocuments: (entityId: string, entityType: EntityType) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  clearError: () => void;
}

// Create document store
export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  isLoading: false,
  error: null,

  uploadDocument: async (
    file: File,
    type: DocumentType,
    entityId: string,
    entityType: EntityType
  ) => {
    try {
      set({ isLoading: true, error: null });

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("entityId", entityId);
      formData.append("entityType", entityType);

      // Upload document
      const response = await axios.post(
        `${apiClient.defaults.baseURL}/documents/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      const newDocument = response.data.data;

      // Update state
      set((state) => ({
        documents: [...state.documents, newDocument],
        isLoading: false,
      }));

      return newDocument;
    } catch (error) {
      console.error("Error uploading document:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to upload document",
      });
      throw error;
    }
  },

  fetchDocuments: async (entityId: string, entityType: EntityType) => {
    try {
      set({ isLoading: true, error: null });

      // Fetch documents
      const response = await axios.get(
        `${apiClient.defaults.baseURL}/documents?entityId=${entityId}&entityType=${entityType}`,
        { withCredentials: true }
      );

      // Update state
      set({
        documents: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch documents",
      });
    }
  },

  deleteDocument: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      // Delete document
      await axios.delete(`${apiClient.defaults.baseURL}/documents/${id}`, {
        withCredentials: true,
      });

      // Update state
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error deleting document:", error);
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete document",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
