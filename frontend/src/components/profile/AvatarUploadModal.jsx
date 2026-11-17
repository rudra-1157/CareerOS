import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Camera, Check, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { studentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AvatarUploadModal = ({ isOpen, onClose, currentAvatarUrl, onAvatarUpdated }) => {
  const { updateCurrentUser, currentUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setZoom(1);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await studentService.uploadAvatar(selectedFile);
      if (res && res.avatar_url) {
        updateCurrentUser({ avatar_url: res.avatar_url });
        if (onAvatarUpdated) onAvatarUpdated(res.avatar_url);
        addToast({
          type: 'success',
          title: 'Avatar Updated',
          message: 'Your profile picture was successfully updated.'
        });
        handleClose();
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to upload profile photo. Please try again.';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: msg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await studentService.removeAvatar();
      updateCurrentUser({ avatar_url: null });
      if (onAvatarUpdated) onAvatarUpdated(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      addToast({
        type: 'success',
        title: 'Avatar Removed',
        message: 'Your profile picture has been reset to default initials.'
      });
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to remove avatar.';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: msg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setZoom(1);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="rounded-2xl border p-6 w-full max-w-md shadow-2xl relative transition-all"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-card-border)',
          color: 'var(--color-text-main)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-card-border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-secondary-bg)', color: 'var(--color-primary-accent)' }}
            >
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Profile Picture</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>JPG, PNG or WebP, up to 5MB</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-slate-500/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl flex items-center gap-2.5 text-xs bg-red-500/10 text-red-600 border border-red-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Preview Area */}
        <div className="py-6 flex flex-col items-center">
          <div
            className="w-36 h-36 rounded-full border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all shadow-inner"
            style={{
              borderColor: selectedFile ? 'var(--color-primary-accent)' : 'var(--color-card-border)',
              backgroundColor: 'var(--color-secondary-bg)'
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar Preview"
                className="w-full h-full object-cover transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />
            ) : (
              <Avatar
                src={currentAvatarUrl}
                name={currentUser?.name || 'Developer'}
                size="2xl"
              />
            )}
          </div>

          {/* Zoom Control if custom image previewed */}
          {previewUrl && (
            <div className="w-full max-w-xs mt-4 flex items-center gap-3">
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>Zoom</span>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: 'var(--color-primary-accent)' }}
              />
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{Math.round(zoom * 100)}%</span>
            </div>
          )}

          {/* File Picker Hidden */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <div className="flex items-center gap-2 mt-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {previewUrl ? 'Choose Different File' : 'Browse File'}
            </Button>

            {currentAvatarUrl && !previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/30"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Remove
              </Button>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t" style={{ borderColor: 'var(--color-card-border)' }}>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? 'Saving...' : (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Save Picture
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadModal;