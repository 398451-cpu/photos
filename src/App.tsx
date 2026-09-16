import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_GRID_PHOTOS } from './data/samplePhotos';
import { GridPhoto } from './types';
import { LightboxModal } from './components/LightboxModal';
import { Maximize2, Upload, RotateCcw, Shuffle, Sparkles, Image as ImageIcon } from 'lucide-react';

const STORAGE_KEY = 'photos_3x3_grid_v13';
const TITLE_STORAGE_KEY = 'photos_3x3_title_v1';

export default function App() {
  const [photos, setPhotos] = useState<GridPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 9) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_GRID_PHOTOS;
  });

  const [title, setTitle] = useState<string>(() => {
    try {
      return localStorage.getItem(TITLE_STORAGE_KEY) || 'Photo Gallery';
    } catch {
      return 'Photo Gallery';
    }
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activePhoto, setActivePhoto] = useState<GridPhoto | null>(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    } catch {
      // ignore
    }
  }, [photos]);

  useEffect(() => {
    try {
      localStorage.setItem(TITLE_STORAGE_KEY, title);
    } catch {
      // ignore
    }
  }, [title]);

  // Keep active photo in sync if edited
  useEffect(() => {
    if (activePhoto) {
      const updated = photos.find((p) => p.id === activePhoto.id);
      if (updated) setActivePhoto(updated);
    }
  }, [photos, activePhoto]);

  const handleReset = () => {
    setPhotos(DEFAULT_GRID_PHOTOS);
    setTitle('Photo Gallery');
  };

  const handleShuffle = () => {
    setPhotos((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  const handleReplaceClick = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReplacingPhotoId(photoId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingPhotoId) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === replacingPhotoId
            ? {
                ...p,
                url: result,
                title: formattedTitle || 'Uploaded Photo',
                caption: 'Custom upload',
              }
            : p
        )
      );
      setReplacingPhotoId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div id="photos-3x3-root" className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Hidden File Input for Image Replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Header Section: Title & Controls */}
        <header id="photos-header" className="w-full text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                autoFocus
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl sm:text-3xl font-bold tracking-tight text-white bg-neutral-900 border border-blue-500 rounded-xl px-3 py-0.5 text-center focus:outline-none"
              />
            ) : (
              <h1
                id="gallery-title"
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename gallery"
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white hover:text-blue-300 transition-colors cursor-pointer select-none"
              >
                {title}
              </h1>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium">
            3 × 3 equal dimension photo grid
          </p>

          {/* Quick Toolbar */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              id="btn-shuffle"
              onClick={handleShuffle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all text-xs font-medium"
              title="Shuffle photo order"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            <button
              id="btn-reset"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all text-xs font-medium"
              title="Reset photos to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </header>

        {/* 3 by 3 Photo Grid - All Equal Dimension */}
        <main
          id="photo-grid-3x3"
          className="grid grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-4.5 w-full aspect-square max-w-4xl"
        >
          {photos.slice(0, 9).map((photo, index) => (
            <div
              key={photo.id}
              id={`grid-photo-${index}`}
              onClick={() => setActivePhoto(photo)}
              className="group relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/90 cursor-pointer select-none transition-all duration-300 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/50"
            >
              {/* Photo Image with Equal Dimension */}
              <img
                src={photo.url}
                alt={photo.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (photo.id === 'g1') {
                    e.currentTarget.src = "https://static.wikia.nocookie.net/ippo/images/7/7e/Hajime_no_Ippo_over_100_million_copies_sold_celebration_drawing.png/revision/latest?cb=20230714200329";
                  }
                }}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Hover Dark Vignette & Info Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5 sm:p-3.5">
                {/* Top Quick Actions */}
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={(e) => handleReplaceClick(photo.id, e)}
                    title="Replace with your own image"
                    className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-neutral-300 hover:text-white hover:bg-black/90 border border-white/10 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActivePhoto(photo)}
                    title="View fullscreen"
                    className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-neutral-300 hover:text-white hover:bg-black/90 border border-white/10 transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Title & Caption */}
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-semibold text-white truncate drop-shadow-md">
                    {photo.title}
                  </h3>
                  {photo.caption && (
                    <p className="text-[10px] sm:text-xs text-neutral-300 truncate mt-0.5">
                      {photo.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {activePhoto && (
        <LightboxModal
          photo={activePhoto}
          allPhotos={photos}
          onClose={() => setActivePhoto(null)}
          onSelectPhoto={(p) => setActivePhoto(p)}
        />
      )}
    </div>
  );
}
