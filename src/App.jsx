import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Image as ImageIcon,
  Video as VideoIcon,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FolderOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';

// ==========================================
// PASTE YOUR DEPLOYED APPS SCRIPT URL HERE
// ==========================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHSa68x5oLGYWjTHUjICny7D6nFd2oDgXfS3NPMgCLat1QVzk8vw6VWrAiShQY5EX5Ig/exec';


export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTypeTab, setActiveTypeTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Custom Lightbox State
  const [activeMedia, setActiveMedia] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    async function loadGallery() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(SCRIPT_URL);
        if (!response.ok) {
          throw new Error(`Failed to load data (Status: ${response.status})`);
        }
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err.message || 'Could not fetch gallery files.');
      } finally {
        setLoading(false);
      }
    }

    if (SCRIPT_URL && !SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL')) {
      loadGallery();
    } else {
      setLoading(false);
      setError('Please add your Google Apps Script URL in SCRIPT_URL.');
    }
  }, []);

  // Reset pagination on filter or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTypeTab, itemsPerPage]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTypeTab !== 'all' && item.type !== activeTypeTab) return false;
      if (searchQuery.trim()) {
        return item.title?.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [items, activeTypeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleOpenLightbox = (item) => {
    setActiveMedia(item);
    setZoomScale(1);
    setRotation(0);
  };

  const handleCloseLightbox = () => {
    setActiveMedia(null);
    setZoomScale(1);
    setRotation(0);
  };

  const handleNextMedia = () => {
    if (!activeMedia) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === activeMedia.id);
    if (currentIndex !== -1 && currentIndex < filteredItems.length - 1) {
      setActiveMedia(filteredItems[currentIndex + 1]);
      setZoomScale(1);
      setRotation(0);
    }
  };

  const handlePrevMedia = () => {
    if (!activeMedia) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === activeMedia.id);
    if (currentIndex > 0) {
      setActiveMedia(filteredItems[currentIndex - 1]);
      setZoomScale(1);
      setRotation(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Media Gallery</h1>
              <p className="text-xs text-slate-400">Photos & Videos</p>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Total Items: <span className="text-indigo-400 font-semibold">{items.length}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTypeTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTypeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setActiveTypeTab('photo')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTypeTab === 'photo'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Photos ({items.filter((i) => i.type === 'photo').length})
            </button>
            <button
              onClick={() => setActiveTypeTab('video')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTypeTab === 'video'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <VideoIcon className="w-3.5 h-3.5" />
              Videos ({items.filter((i) => i.type === 'video').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl pl-9 pr-8 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Loading media items...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && paginatedItems.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
            <Search className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <h3 className="text-base font-semibold text-slate-300">No media found</h3>
            <p className="text-xs text-slate-500 mt-1">Try another search or filter.</p>
          </div>
        )}

        {/* Media Grid */}
        {!loading && !error && paginatedItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenLightbox(item)}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 cursor-pointer shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col transform hover:-translate-y-1"
              >
                <div className="aspect-[16/10] bg-slate-950 overflow-hidden relative flex items-center justify-center">
                  {item.type === 'photo' ? (
                    <img
                      src={item.dataUri || `https://drive.google.com/thumbnail?id=${item.id}&sz=w800`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-indigo-600/90 group-hover:bg-indigo-500 group-hover:scale-110 text-white flex items-center justify-center shadow-lg transition-all z-10">
                        <Play className="w-6 h-6 ml-0.5 fill-current" />
                      </div>
                      <div className="absolute inset-0 bg-slate-900/60" />
                    </div>
                  )}

                  {/* Badge */}
                  <span
                    className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide backdrop-blur-md shadow-sm z-20 ${item.type === 'video'
                      ? 'bg-rose-500/80 text-rose-50 border border-rose-400/40'
                      : 'bg-emerald-500/80 text-emerald-50 border border-emerald-400/40'
                      }`}
                  >
                    {item.type === 'video' ? <VideoIcon className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    <span className="capitalize">{item.type}</span>
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                    {item.title}
                  </h3>
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="capitalize">{item.type}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span>
                Showing <span className="font-medium text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium text-slate-200">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of{' '}
                <span className="font-medium text-slate-200">{filteredItems.length}</span> items
              </span>

              <div className="flex items-center gap-2">
                <label htmlFor="per-page-select" className="text-slate-500 hidden sm:inline">Per page:</label>
                <select
                  id="per-page-select"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value={3}>3</option>
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[28px] h-7 rounded-lg text-xs font-semibold transition-all ${currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-1 text-slate-600">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal (Strict Lockdown: No Popouts / No Drive Navigation) */}
      {activeMedia && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/60 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${activeMedia.type === 'video'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
              >
                {activeMedia.type}
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-md">
                {activeMedia.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {activeMedia.type === 'photo' && (
                <>
                  <button
                    onClick={() => setZoomScale((s) => Math.min(s + 0.25, 3))}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomScale((s) => Math.max(s - 0.25, 0.75))}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Rotate"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={handleCloseLightbox}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 ml-2"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Player & Image Display Area */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            <button
              onClick={handlePrevMedia}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="w-full h-full flex items-center justify-center">
              {activeMedia.type === 'video' ? (
                <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-slate-800">
                  {/*
                    The sandbox attribute restricts the iframe:
                    - allow-scripts: enables video playback
                    - allow-same-origin: allows player resources to load
                    - (No allow-popups or allow-top-navigation): blocks opening drive.google.com in new tabs
                  */}
                  <iframe
                    src={activeMedia.videoSrc}
                    title={activeMedia.title}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />

                  {/*
                    Transparent Click Blocker:
                    Covers the top header bar of the Drive preview player (where the Drive icon and pop-out button live)
                    so clicking those controls cannot trigger any link.
                  */}
                  <div
                    className="absolute top-0 left-0 right-0 h-14 z-10 cursor-default"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
                  <img
                    src={activeMedia.dataUri || `https://drive.google.com/thumbnail?id=${activeMedia.id}&sz=w1600`}
                    alt={activeMedia.title}
                    style={{
                      transform: `scale(${zoomScale}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-out'
                    }}
                    className="max-h-[82vh] max-w-[92vw] object-contain rounded-lg shadow-2xl"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleNextMedia}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-950/80 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
            <span className="text-slate-200 font-medium">{activeMedia.title}</span>
            <span>{activeMedia.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}