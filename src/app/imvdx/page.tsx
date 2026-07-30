'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type MediaFile = {
  url: string;
  filename: string;
  uploadedAt: string;
  size: number;
};

export default function ImvdxPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const adminPasswordRef = useRef('');

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/imvdx');
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleLogin = async () => {
    setPasswordError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAdmin(true);
        adminPasswordRef.current = password;
        setShowPasswordModal(false);
        setPassword('');
      } else {
        setPasswordError('Wrong password');
      }
    } catch {
      setPasswordError('Connection error');
    }
  };

  const handleUpload = async (fileList: FileList) => {
    if (!isAdmin) return;
    setIsUploading(true);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadProgress(`Uploading ${i + 1}/${fileList.length}: ${file.name}`);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', adminPasswordRef.current);

      try {
        const res = await fetch('/api/imvdx', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json();
          alert(`Failed to upload ${file.name}: ${err.error}`);
        }
      } catch {
        alert(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    setUploadProgress('');
    fetchFiles();
  };

  const handleDelete = async (url: string) => {
    if (!isAdmin) return;
    if (!confirm('Delete this file?')) return;

    try {
      const res = await fetch('/api/imvdx', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, password: adminPasswordRef.current }),
      });
      if (res.ok) {
        fetchFiles();
      } else {
        alert('Failed to delete');
      }
    } catch {
      alert('Failed to delete');
    }
  };

  const isVideo = (url: string) => /\.(mp4|webm|mov)$/i.test(url) || url.includes('video');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
      </div>
    );
  }

  // Empty state — minimal, almost invisible
  if (files.length === 0 && !isAdmin) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-black">
        <p className="text-white/10 text-xs select-none">.</p>
        {/* Hidden admin trigger */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="fixed bottom-4 right-4 h-8 w-8 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-center justify-center text-white/20 hover:text-white/60 border border-transparent hover:border-white/10"
          aria-label="Admin"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </button>
        {showPasswordModal && <PasswordModal password={password} setPassword={setPassword} error={passwordError} onSubmit={handleLogin} onClose={() => { setShowPasswordModal(false); setPassword(''); setPasswordError(''); }} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin controls */}
      {!isAdmin && (
        <button
          onClick={() => setShowPasswordModal(true)}
          className="fixed bottom-4 right-4 z-50 h-8 w-8 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-center justify-center text-white/20 hover:text-white/60 border border-transparent hover:border-white/10"
          aria-label="Admin"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </button>
      )}

      {/* Upload zone (admin only) */}
      {isAdmin && (
        <div className="sticky top-0 z-50 border-b border-white/5 bg-black/90 backdrop-blur-xl px-6 py-4">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white/50 text-xs font-mono uppercase tracking-widest">Admin Mode</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all disabled:opacity-40"
              >
                {isUploading ? uploadProgress : '+ Upload'}
              </button>
              <button
                onClick={() => { setIsAdmin(false); adminPasswordRef.current = ''; }}
                className="px-3 py-1.5 rounded-full text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Lock
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      )}

      {/* Drag and drop overlay (admin only) */}
      {isAdmin && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`fixed inset-0 z-40 pointer-events-none transition-all duration-300 ${dragActive ? 'bg-white/5 pointer-events-auto' : ''}`}
        >
          {dragActive && (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-2xl border-2 border-dashed border-white/20 px-12 py-8">
                <p className="text-white/40 text-sm">Drop files to upload</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gallery grid */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {files.map((file) => (
            <div key={file.url} className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg bg-white/5">
              {isVideo(file.url) ? (
                <video
                  src={file.url}
                  className="w-full cursor-pointer"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }}
                  onClick={() => setLightboxUrl(file.url)}
                />
              ) : (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="w-full cursor-pointer transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  onClick={() => setLightboxUrl(file.url)}
                />
              )}

              {/* Delete button (admin only) */}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(file.url)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500/80 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
          {isVideo(lightboxUrl) ? (
            <video
              src={lightboxUrl}
              className="max-h-[90vh] max-w-[90vw] rounded-lg"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightboxUrl}
              alt=""
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {/* Password modal */}
      {showPasswordModal && <PasswordModal password={password} setPassword={setPassword} error={passwordError} onSubmit={handleLogin} onClose={() => { setShowPasswordModal(false); setPassword(''); setPasswordError(''); }} />}
    </div>
  );
}

function PasswordModal({
  password,
  setPassword,
  error,
  onSubmit,
  onClose,
}: {
  password: string;
  setPassword: (v: string) => void;
  error: string;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-72 rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          placeholder="Password"
          autoFocus
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors"
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button
          onClick={onSubmit}
          className="mt-3 w-full rounded-lg bg-white/10 py-2 text-xs font-medium text-white/70 hover:bg-white/20 hover:text-white transition-all"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
