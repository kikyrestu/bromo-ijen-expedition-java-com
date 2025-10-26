'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Grid3x3, 
  List, 
  Upload, 
  Trash2, 
  Copy, 
  Check,
  Filter,
  Calendar,
  Image as ImageIcon,
  FileText,
  Download,
  Edit
} from 'lucide-react';

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  seoOptimized: boolean;
  context?: string;
  altText?: string;
}

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
  mode?: 'select' | 'selectMultiple' | 'manage'; // select = single, selectMultiple = gallery, manage = full management
}

const MediaManager = ({ isOpen, onClose, onSelect, onSelectMultiple, mode = 'select' }: MediaManagerProps) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'package' | 'blog' | 'gallery' | 'testimonial'>('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [editForm, setEditForm] = useState({ filename: '', altText: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Upload feedback state
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState<string>('');

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Helper function to show notifications
  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setNotification({
      show: true,
      type,
      title,
      message
    });
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Reset selection when mode changes
  useEffect(() => {
    if (mode === 'selectMultiple') {
      setSelectedFiles([]);
    }
  }, [mode]);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      console.log('📁 Fetching files...');
      const response = await fetch('/api/media');
      const data = await response.json();
      if (data.success) {
        console.log('📁 Files fetched:', data.files.length, 'files');
        console.log('📁 Files data:', data.files);
        
        // Convert uploadedAt strings to Date objects and update URLs to use API route
        const filesWithDates = data.files.map((file: any) => ({
          ...file,
          uploadedAt: new Date(file.uploadedAt),
          // Use API route for serving files instead of direct static serving
          url: `/api/media?file=${encodeURIComponent(file.filename)}`
        }));
        
        console.log('🔗 MediaManager: Updated file URLs:', filesWithDates.map((f: any) => ({ filename: f.filename, url: f.url })));
        setFiles(filesWithDates);
      } else {
        console.error('❌ Failed to fetch files:', data.error);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = Array.from(e.target.files || []);
    if (uploadFiles.length === 0) return;

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadFileName(uploadFiles.length === 1 ? uploadFiles[0].name : `${uploadFiles.length} files`);

    try {
      const uploadPromises = uploadFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('context', 'media-library');

        // Simulate progress for each file
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const increment = 90 / uploadFiles.length; // Spread 90% across all files
            const newProgress = prev + (increment / 10); // Update every 100ms
            return Math.min(newProgress, 90 + (index * increment));
          });
        }, 100);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();

        clearInterval(progressInterval);
        return result;
      });

      const results = await Promise.all(uploadPromises);

      // Check if all uploads were successful
      const allSuccessful = results.every(result => result.success);

      if (allSuccessful) {
        setUploadStatus('success');
        setUploadProgress(100);
        await fetchFiles(); // Refresh list
        showNotification('success', 'Upload Successful!', `${uploadFiles.length} file(s) uploaded successfully.`);

        // Auto reset after success
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadProgress(0);
          setUploadFileName('');
        }, 3000);
      } else {
        setUploadStatus('error');
        const failedUploads = results.filter(result => !result.success).length;
        showNotification('error', 'Upload Failed', `${failedUploads} file(s) failed to upload. Please try again.`);
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadProgress(0);
          setUploadFileName('');
        }, 4000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      showNotification('error', 'Upload Error', 'An error occurred during upload. Please try again.');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
        setUploadFileName('');
      }, 4000);
      // Error already shown in UI, no need for alert
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return;

    try {
      const response = await fetch(`/api/media?filename=${filename}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchFiles();
        alert('File deleted!');
      } else {
        alert('[ERROR] Delete failed: ' + data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('[ERROR] Delete failed!');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    if (!confirm(`Delete ${selectedFiles.length} files?`)) return;

    try {
      const deletePromises = selectedFiles.map(filename =>
        fetch(`/api/media?filename=${filename}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      await fetchFiles();
      setSelectedFiles([]);
      alert('Files deleted!');
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('[ERROR] Bulk delete failed!');
    }
  };

  const openEditModal = (file: MediaFile) => {
    setEditingFile(file);
    // Extract base filename without extension and timestamp
    const nameParts = file.filename.split('-');
    const ext = file.filename.split('.').pop();
    const baseWithoutTimestamp = nameParts.slice(0, -1).join('-'); // Remove timestamp
    
    setEditForm({
      filename: baseWithoutTimestamp,
      altText: file.altText || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;

    setEditLoading(true);
    try {
      console.log('🔄 Editing file:', editingFile.filename);
      
      const response = await fetch('/api/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldFilename: editingFile.filename,
          newFilename: editForm.filename,
          altText: editForm.altText
        })
      });

      const data = await response.json();
      console.log('📝 Edit response:', data);
      
      if (data.success) {
        console.log('✅ File edit successful, refreshing file list...');
        // Refresh the file list to show the updated file
        await fetchFiles();
        setEditingFile(null);
        setEditForm({ filename: '', altText: '' });
        showNotification('success', 'File Updated Successfully!', `Old: ${data.oldFilename}\nNew: ${data.newFilename}`);
      } else {
        console.error('❌ Edit failed:', data.error);
        showNotification('error', 'Update Failed', data.error);
      }
    } catch (error) {
      console.error('Edit error:', error);
      showNotification('error', 'Update Failed', 'Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Show all files if no context, or if context matches filter
    const matchesFilter = filterType === 'all' || 
      !file.context || // Show files without context
      file.context.includes(filterType);
    
    const result = matchesSearch && matchesFilter;
    
    // Debug logging for filtered files
    if (!result) {
      console.log('🚫 File filtered out:', {
        filename: file.filename,
        context: file.context,
        filterType,
        matchesSearch,
        matchesFilter,
        searchQuery
      });
    }
    
    return result;
  });

  // Toggle selection
  const toggleSelect = (filename: string) => {
    setSelectedFiles(prev =>
      prev.includes(filename)
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-[60] max-w-sm w-full transform transition-all duration-300 ${
          notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`rounded-lg shadow-lg border-l-4 p-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : notification.type === 'error'
              ? 'bg-red-50 border-red-500 text-red-800'
              : 'bg-blue-50 border-blue-500 text-blue-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">{notification.title}</h3>
                <p className="mt-1 text-sm whitespace-pre-line">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">[FOLDER] Media Manager</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredFiles.length} files - {selectedFiles.length} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Search & View Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Files</option>
                <option value="package">Packages</option>
                <option value="blog">Blogs</option>
                <option value="gallery">Gallery</option>
                <option value="testimonial">Testimonials</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {selectedFiles.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedFiles.length})
                </button>
              )}

              <label className={`px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Upload Progress & Status */}
        {(uploadStatus === 'uploading' || uploadStatus === 'success' || uploadStatus === 'error') && (
          <div className="px-6 pb-4">
            <div className={`p-4 rounded-lg border ${
              uploadStatus === 'success'
                ? 'bg-green-50 border-green-200'
                : uploadStatus === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                {uploadStatus === 'uploading' && (
                  <>
                    <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">Uploading {uploadFileName}</span>
                        <span className="text-sm text-gray-600">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
                {uploadStatus === 'success' && (
                  <>
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-800">Upload completed successfully!</span>
                  </>
                )}
                {uploadStatus === 'error' && (
                  <>
                    <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-red-800">Upload failed! Please try again.</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading files...</p>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No files found</p>
                <p className="text-gray-500 text-sm mt-2">Upload images to get started</p>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFiles.map((file, index) => (
                <div
                  key={`${file.filename}-${file.uploadedAt}`}
                  className={`group relative bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                    selectedFiles.includes(file.filename)
                      ? 'border-orange-500 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => toggleSelect(file.filename)}
                >
                  {/* Image/Video Preview */}
                  <div className="aspect-square bg-gray-100">
                    {file.type.startsWith('video/') ? (
                      <video
                        src={file.url}
                        className="w-full h-full object-cover"
                        muted
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    ) : (
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {mode === 'select' && onSelect && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(file.url);
                          onClose();
                        }}
                        className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        title="Select"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {mode === 'selectMultiple' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(file.filename);
                        }}
                        className={`p-2 rounded-lg ${selectedFiles.includes(file.filename) ? 'bg-orange-600 text-white' : 'bg-white/80 text-gray-900 hover:bg-white'}`}
                        title={selectedFiles.includes(file.filename) ? "Deselect" : "Select"}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(file);
                      }}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      title="Edit (Rename & Alt Text)"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(file.url);
                      }}
                      className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
                      title="Copy URL"
                    >
                      {copiedUrl === file.url ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.filename);
                      }}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-2 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-900 truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                      {file.seoOptimized && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">SEO</span>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedFiles.includes(file.filename) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-2">
              {filteredFiles.map((file, index) => (
                <div
                  key={`${file.filename}-${file.uploadedAt}`}
                  className={`flex items-center gap-4 p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all ${
                    selectedFiles.includes(file.filename)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => toggleSelect(file.filename)}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.filename)}
                    onChange={() => toggleSelect(file.filename)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {file.type.startsWith('video/') ? (
                      <video
                        src={file.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>-</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                      {file.seoOptimized && (
                        <>
                          <span>-</span>
                          <span className="text-green-600 font-medium">SEO Optimized</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {mode === 'select' && onSelect && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(file.url);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                      >
                        Select
                      </button>
                    )}
                    {mode === 'selectMultiple' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(file.filename);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm ${selectedFiles.includes(file.filename) ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        {selectedFiles.includes(file.filename) ? 'Selected' : 'Select'}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(file);
                      }}
                      className="p-2 hover:bg-blue-100 rounded-lg"
                      title="Edit (Rename & Alt Text)"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(file.url);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Copy URL"
                    >
                      {copiedUrl === file.url ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.filename);
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {mode === 'selectMultiple'
              ? `[TIP] Tip: Click images to select multiple for gallery, then use "Add to Gallery"`
              : `[TIP] Tip: Click images to select, use bulk actions for multiple files`
            }
          </div>
          {mode === 'select' && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
          {mode === 'selectMultiple' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onSelectMultiple && selectedFiles.length > 0) {
                    const selectedUrls = selectedFiles.map(filename =>
                      files.find(f => f.filename === filename)?.url
                    ).filter(url => url !== undefined) as string[];
                    onSelectMultiple(selectedUrls);
                    onClose();
                  }
                }}
                disabled={selectedFiles.length === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Add to Gallery ({selectedFiles.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black/70 z-10 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">[EDIT] Edit Image SEO</h3>
                <p className="text-sm text-gray-600 mt-1">Optimize filename and alt text for better SEO</p>
              </div>
              <button
                onClick={() => {
                  setEditingFile(null);
                  setEditForm({ filename: '', altText: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image/Video Preview */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {editingFile.type.startsWith('video/') ? (
                  <video
                    src={editingFile.url}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    controls
                  />
                ) : (
                  <img
                    src={editingFile.url}
                    alt={editingFile.filename}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Current File:</p>
                  <p className="text-xs text-gray-600 font-mono break-all">{editingFile.filename}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">{formatFileSize(editingFile.size)}</span>
                    {editingFile.seoOptimized && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">SEO Optimized</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Filename Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  📝 SEO-Friendly Filename
                </label>
                <input
                  type="text"
                  value={editForm.filename}
                  onChange={(e) => setEditForm({ ...editForm, filename: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="bromo-ijen-tour-package-sunset-view"
                />
                <p className="text-xs text-gray-500 mt-2">
                  [TIP] Use hyphens to separate words. Example: <code className="bg-gray-100 px-1 rounded">bromo-sunrise-adventure</code>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Preview: <span className="font-mono text-blue-600">{editForm.filename}-{Date.now()}.{editingFile.filename.split('.').pop()}</span>
                </p>
              </div>

              {/* Alt Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  [TARGET] Alt Text (for SEO & Accessibility)
                </label>
                <textarea
                  value={editForm.altText}
                  onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Describe the image for SEO and screen readers"
                />
                <p className="text-xs text-gray-500 mt-2">
                  [TIP] Describe what's in the image. Example: <code className="bg-gray-100 px-1 rounded">Stunning sunrise view over Mount Bromo crater with orange sky</code>
                </p>
                <div className="mt-2 text-xs">
                  <span className={editForm.altText.length > 125 ? 'text-red-600' : 'text-gray-600'}>
                    {editForm.altText.length} / 125 characters
                  </span>
                  {editForm.altText.length > 125 && (
                    <span className="text-red-600 ml-2">[WARNING] Keep under 125 for best SEO</span>
                  )}
                </div>
              </div>

              {/* SEO Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">[TIP] SEO Best Practices:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>- Use descriptive, keyword-rich filenames</li>
                  <li>- Replace spaces with hyphens (-)</li>
                  <li>- Keep alt text under 125 characters</li>
                  <li>- Include location/context (e.g., "bromo", "ijen")</li>
                  <li>- Avoid generic names like "image1" or "photo"</li>
                </ul>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setEditingFile(null);
                  setEditForm({ filename: '', altText: '' });
                }}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editForm.filename.trim() || editLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {editLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManager;

