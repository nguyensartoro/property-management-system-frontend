import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Autocomplete,
  CircularProgress,
  Alert,
  Pagination,
  Divider,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  Label as TagIcon,
  Person as PersonIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash';

// Types
interface SearchFilters {
  category: string[];
  tags: string[];
  mimeType: string[];
  uploadedBy: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
}

interface SearchResult {
  document: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    category: string;
    tags: string[];
    description?: string;
    uploadedBy: string;
    createdAt: string;
    updatedAt: string;
  };
  score: number;
  highlights?: {
    field: string;
    fragments: string[];
  }[];
  snippet?: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  facets?: Record<string, { value: string; count: number }[]>;
  suggestions?: string[];
  searchTime: number;
}

const DocumentSearchInterface: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Filters state
  const [filters, setFilters] = useState<SearchFilters>({
    category: [],
    tags: [],
    mimeType: [],
    uploadedBy: [],
  });

  // Sort state
  const [sortField, setSortField] = useState<'relevance' | 'name' | 'size' | 'uploadDate'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Available filter options (would typically come from API)
  const categoryOptions = ['lease', 'maintenance', 'payment', 'property', 'tenant', 'legal', 'other'];
  const mimeTypeOptions = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword'];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, page: number = 1) => {
      if (!query.trim() && Object.values(filters).every(f => Array.isArray(f) ? f.length === 0 : !f)) {
        setSearchResults(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchPayload = {
          query: query.trim() || undefined,
          filters: {
            ...filters,
            dateRange: filters.dateRange ? {
              start: filters.dateRange.start.toISOString(),
              end: filters.dateRange.end.toISOString(),
            } : undefined,
          },
          sort: {
            field: sortField,
            order: sortOrder,
          },
          pagination: {
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage,
          },
          facets: ['category', 'tags', 'mimeType'],
        };

        const response = await fetch('/api/v1/search/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(searchPayload),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setSearchResults(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 300),
    [filters, sortField, sortOrder, itemsPerPage]
  );

  // Debounced suggestions function
  const debouncedGetSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/v1/search/suggestions?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.data.suggestions);
        }
      } catch (err) {
        // Silently fail for suggestions
        setSuggestions([]);
      }
    }, 200),
    []
  );

  // Effects
  useEffect(() => {
    debouncedSearch(searchQuery, currentPage);
  }, [searchQuery, filters, sortField, sortOrder, currentPage, debouncedSearch]);

  useEffect(() => {
    debouncedGetSuggestions(searchQuery);
  }, [searchQuery, debouncedGetSuggestions]);

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      category: [],
      tags: [],
      mimeType: [],
      uploadedBy: [],
    });
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📁';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Document Search
      </Typography>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: searchQuery && (
                <IconButton onClick={() => setSearchQuery('')} size="small">
                  <ClearIcon />
                </IconButton>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ minWidth: 120 }}
          >
            Filters
            {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : !!f) && (
              <Badge color="primary" variant="dot" sx={{ ml: 1 }} />
            )}
          </Button>
        </Box>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Suggestions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
              {suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Advanced Filters */}
      {showFilters && (
        <Accordion expanded sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Advanced Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Categories</InputLabel>
                  <Select
                    multiple
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {categoryOptions.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>File Types</InputLabel>
                  <Select
                    multiple
                    value={filters.mimeType}
                    onChange={(e) => handleFilterChange('mimeType', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value.split('/')[1]} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {mimeTypeOptions.map((mimeType) => (
                      <MenuItem key={mimeType} value={mimeType}>
                        {mimeType}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as any)}
                  >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="size">Size</MenuItem>
                    <MenuItem value="uploadDate">Upload Date</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sort Order</InputLabel>
                  <Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                  >
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Search Results */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {searchResults && !loading && (
        <>
          {/* Results Summary */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1">
              Found {searchResults.total} documents
              {searchResults.searchTime && (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({searchResults.searchTime}ms)
                </Typography>
              )}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Search Results */}
            <Grid item xs={12} md={searchResults.facets ? 8 : 12}>
              {searchResults.results.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No documents found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search terms or filters
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {searchResults.results.map((result) => (
                    <Card key={result.document.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Typography variant="h2" sx={{ fontSize: '2rem' }}>
                            {getFileIcon(result.document.mimeType)}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {result.document.originalName}
                            </Typography>
                            
                            {result.document.description && (
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {result.document.description}
                              </Typography>
                            )}

                            {result.highlights && (
                              <Box sx={{ mb: 1 }}>
                                {result.highlights.map((highlight, index) => (
                                  <Typography key={index} variant="caption" sx={{ display: 'block' }}>
                                    <strong>{highlight.field}:</strong> ...{highlight.fragments.join('...')}...
                                  </Typography>
                                ))}
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                              <Chip
                                icon={<CategoryIcon />}
                                label={result.document.category}
                                size="small"
                                variant="outlined"
                              />
                              {result.document.tags.map((tag) => (
                                <Chip
                                  key={tag}
                                  icon={<TagIcon />}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                <PersonIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                {result.document.uploadedBy}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <TimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                {formatDate(result.document.createdAt)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                <FileIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                {formatFileSize(result.document.size)}
                              </Typography>
                              {result.score > 0 && (
                                <Typography variant="caption" color="primary">
                                  Score: {result.score.toFixed(2)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Tooltip title="View Document">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share">
                          <IconButton size="small">
                            <ShareIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              )}

              {/* Pagination */}
              {searchResults.total > itemsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={Math.ceil(searchResults.total / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </Grid>

            {/* Facets Sidebar */}
            {searchResults.facets && (
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Refine Results
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {Object.entries(searchResults.facets).map(([facetName, facetValues]) => (
                    <Box key={facetName} sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                        {facetName}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {facetValues.slice(0, 5).map((facet) => (
                          <Box
                            key={facet.value}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              p: 0.5,
                              borderRadius: 1,
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                            onClick={() => {
                              const currentValues = filters[facetName as keyof SearchFilters] as string[];
                              if (!currentValues.includes(facet.value)) {
                                handleFilterChange(facetName as keyof SearchFilters, [...currentValues, facet.value]);
                              }
                            }}
                          >
                            <Typography variant="body2">{facet.value}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {facet.count}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DocumentSearchInterface;