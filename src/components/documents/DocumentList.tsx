import React, { useEffect, useState } from 'react';
import { useDocumentStore, Document, EntityType } from '../../stores/documentStore';
import { Download, Trash2, FileText, Image, File } from 'lucide-react';
import apiClient from '../../utils/apiClient';

interface DocumentListProps {
  entityId: string;
  entityType: EntityType;
  onDelete?: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ entityId, entityType, onDelete }) => {
  const { documents, fetchDocuments, deleteDocument, isLoading } = useDocumentStore();
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  useEffect(() => {
    if (entityId && entityType) {
      fetchDocuments(entityId, entityType);
    }
  }, [entityId, entityType, fetchDocuments]);

  const handleDownload = async (documentId: string, documentName: string) => {
    try {
      const response = await apiClient.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        setDeleteInProgress(documentId);
        await deleteDocument(documentId);
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Error deleting document:', error);
      } finally {
        setDeleteInProgress(null);
      }
    }
  };

  const getDocumentIcon = (document: Document) => {
    const isImage = document.name.match(/\.(jpg|jpeg|png|gif)$/i);
    const isPdf = document.name.match(/\.pdf$/i);
    
    if (isImage) {
      return <Image className="w-6 h-6 text-blue-500" />;
    } else if (isPdf) {
      return <FileText className="w-6 h-6 text-red-500" />;
    } else {
      return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <File className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
        <p className="text-gray-500">
          No documents have been uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div key={document.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getDocumentIcon(document)}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
              <p className="text-sm text-gray-500">
                Uploaded on {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDownload(document.id, document.name)}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(document.id)}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete"
                disabled={deleteInProgress === document.id}
              >
                {deleteInProgress === document.id ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;