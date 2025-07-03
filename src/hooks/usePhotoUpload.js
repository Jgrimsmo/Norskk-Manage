import { useState } from 'react';

/**
 * Custom hook for handling photo uploads in daily reports
 * Manages file validation, preview URLs, and cleanup
 */
export const usePhotoUpload = () => {
  const [photoFiles, setPhotoFiles] = useState([]);

  const handlePhotoUpload = (e, form, setForm) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were not added. Please ensure all files are images under 5MB.');
    }

    setPhotoFiles(prev => [...prev, ...validFiles]);
    setForm(f => ({
      ...f,
      photos: [...f.photos, ...validFiles.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        file: file
      }))]
    }));
  };

  const removePhoto = (index, form, setForm) => {
    const photoToRemove = form.photos[index];
    if (photoToRemove?.url) {
      URL.revokeObjectURL(photoToRemove.url);
    }
    
    setForm(f => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index)
    }));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearPhotos = () => {
    setPhotoFiles([]);
  };

  return {
    photoFiles,
    handlePhotoUpload,
    removePhoto,
    clearPhotos
  };
};
