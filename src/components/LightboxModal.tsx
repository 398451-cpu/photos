import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, Tv } from 'lucide-react';
import { GridPhoto } from '../types';

interface LightboxModalProps {
  photo: GridPhoto;
  allPhotos: GridPhoto[];
  onClose: () => void;
  onSelectPhoto: (p: GridPhoto) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photo,
  allPhotos,
  onClose,
  onSelectPhoto,
}) => {
  const currentIndex = allPhotos.findIndex((p) => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allPhotos.length - 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        onSelectPhoto(allPhotos[currentIndex - 1]);
      } else if (e.key === 'ArrowRight' && hasNext) {
        onSelectPhoto(allPhotos[currentIndex + 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasPrev, hasNext, allPhotos, onClose, onSelectPhoto]);

  return (
    <div
      id="lightbox-modal"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 select-none"
      onClick={onClose}
    >
      {/* Top Header */}
      <div 
        className="w-full max-w-4xl flex items-center justify-between py-3 px-2 z-10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight">{photo.title}</h2>
          {photo.caption && (
            <p className="text-xs text-neutral-400">{photo.caption}</p>
          )}
        </div>
        <button
          id="btn-close-lightbox"
          onClick={onClose}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div 
        className="relative flex items-center justify-center max-w-4xl w-full flex-1 min-h-0 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        {hasPrev && (
          <button
            id="btn-prev-lightbox"
            onClick={() => onSelectPhoto(allPhotos[currentIndex - 1])}
            className="absolute left-2 sm:-left-12 z-20 w-10 h-10 rounded-full bg-neutral-900/80 border border-neutral-800 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-lg"
            title="Previous (Left arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <img
          src={photo.url}
          alt={photo.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            if (photo.id === 'g1') {
              e.currentTarget.src = "https://static.wikia.nocookie.net/ippo/images/7/7e/Hajime_no_Ippo_over_100_million_copies_sold_celebration_drawing.png/revision/latest?cb=20230714200329";
            }
          }}
          className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl"
        />

        {hasNext && (
          <button
            id="btn-next-lightbox"
            onClick={() => onSelectPhoto(allPhotos[currentIndex + 1])}
            className="absolute right-2 sm:-right-12 z-20 w-10 h-10 rounded-full bg-neutral-900/80 border border-neutral-800 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-lg"
            title="Next (Right arrow)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Anime Details */}
      <div
        id="photo-description"
        className="w-full max-w-4xl max-h-[20vh] overflow-y-auto mt-3 rounded-2xl border border-neutral-800 bg-neutral-950/95 px-4 py-3 text-left shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
            <Tv className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300">
              From the anime
            </p>
            <h3 className="mt-0.5 text-sm font-semibold text-white">
              {photo.anime || photo.caption || 'Anime information unavailable'}
            </h3>
          </div>
        </div>

        <div className="mt-3 border-t border-neutral-800 pt-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
            <BookOpen className="h-3.5 w-3.5 text-neutral-500" />
            Story
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-300">
            {photo.story || 'No story description is available for this image.'}
          </p>
        </div>
      </div>

      <div className="text-xs font-mono text-neutral-400 pt-2">
        {currentIndex + 1} of {allPhotos.length}
      </div>
    </div>
  );
};
