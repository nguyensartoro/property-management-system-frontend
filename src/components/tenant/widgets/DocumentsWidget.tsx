import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Button
} from '@mui/material';
import {
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  category: string;
}

interface DocumentsData {
  documents: Document[];
}

interface DocumentsWidgetProps {
  data: DocumentsData;
  settings: Record<string, any>;
}

export const DocumentsWidget: React.FC<DocumentsWidgetProps> = ({ data, settings }) => {
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <PdfIcon />;
    if (type.includes('image')) return <ImageIcon />;
    return <FileIcon />;
  };

  const getFileColor = (type: string) => {
    if (type.includes('pdf')) return 'error';
    if (type.includes('image')) return 'success';
    return 'primary';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const limit = settings.limit || 5;
  const displayDocuments = data.documents?.slice(0, limit) || [];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Documents
      </Typography>

      {displayDocuments.length > 0 ? (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <List>
              {displayDocuments.map((document, index) => (
                <ListItem key={document.id} divider={index < displayDocuments.length - 1}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: `${getFileColor(document.type)}.main`, width: 32, height: 32 }}>
                      {getFileIcon(document.type)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={document.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {document.category} • {formatFileSize(document.size)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded {formatDate(document.uploadedAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => {
                        // View document
                        console.log('View document:', document.id);
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        // Download document
                        console.log('Download document:', document.id);
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No documents available
            </Typography>
          </CardContent>
        </Card>
      )}

      {data.documents && data.documents.length > limit && (
        <Box mt={2} textAlign="center">
          <Button
            variant="text"
            size="small"
            onClick={() => {
              // Navigate to full documents page
              console.log('Navigate to documents page');
            }}
          >
            View All ({data.documents.length})
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DocumentsWidget;