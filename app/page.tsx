'use client'

import React, { useState, useEffect } from 'react';

import { PlayCircle, Image as  X, Plus, Youtube, Trash2, Maximize, Minimize } from 'lucide-react';

interface SavedLink {
  url: string;
  videoId: string;
  timestamp: string;
}

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-200 bg-white hover:bg-gray-100 text-gray-900',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Card = ({ children, className = '', onClick }) => (
  <div 
    className={`rounded-lg border bg-white shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  let overlayTimeout: NodeJS.Timeout;

  useEffect(() => {
    const stored = localStorage.getItem('youtube-links');
    if (stored) {
      setSavedLinks(JSON.parse(stored));
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        handleFullScreen();
      } else if (e.key === 'Escape' && isFullScreen) {
        exitFullScreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullScreen]);

  const handleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const exitFullScreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullScreen(false);
      setShowOverlay(false);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleMouseMove = () => {
    setShowOverlay(true);
    clearTimeout(overlayTimeout);
    overlayTimeout = setTimeout(() => {
      setShowOverlay(false);
    }, 3000);
  };

  const getVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSaveLink = () => {
    const videoId = getVideoId(youtubeUrl);
    if (videoId) {
      const newLink = {
        url: youtubeUrl,
        videoId,
        timestamp: new Date().toLocaleString()
      };
      const updatedLinks = [...savedLinks, newLink];
      setSavedLinks(updatedLinks);
      localStorage.setItem('youtube-links', JSON.stringify(updatedLinks));
      setYoutubeUrl('');
      setShowAddForm(false);
    }
  };

  const handlePlayVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
    handleFullScreen();
  };

  const handleDeleteLink = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedLinks = savedLinks.filter((_, i) => i !== index);
    setSavedLinks(updatedLinks);
    localStorage.setItem('youtube-links', JSON.stringify(updatedLinks));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {isFullScreen && selectedVideoId ? (
        <div 
          className="fixed inset-0 bg-black z-50"
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseMove}
        >
          <iframe
            src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          
          <div 
            className={`fixed inset-x-0 top-0 p-4 transition-transform duration-300 ${
              showOverlay ? 'translate-y-0' : '-translate-y-full'
            }`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-w-7xl mx-auto">
              {savedLinks.map((link, index) => (
                <button
                  key={index}
                  className="relative group aspect-video bg-black rounded-lg overflow-hidden hover:ring-2 hover:ring-white/50 transition"
                  onClick={() => {
                    setSelectedVideoId(link.videoId);
                    setShowOverlay(false);
                  }}
                >
                  <img
                    src={`https://img.youtube.com/vi/${link.videoId}/mqdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover group-hover:opacity-75 transition"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="fixed top-4 right-4 z-50 bg-black/50 text-white border-white/20 hover:bg-white/20"
            onClick={exitFullScreen}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Videos</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsGridView(!isGridView)}
              >
                {isGridView ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                size="icon"
                className="rounded-full"
              >
                {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {showAddForm && (
            <Card className="mb-6">
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Youtube className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      className="pl-10"
                      placeholder="Paste YouTube URL"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleSaveLink}
                    disabled={!youtubeUrl}
                  >
                    Save Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isGridView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {savedLinks.map((link, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden hover:shadow-lg transition-shadow"
                  onClick={() => handlePlayVideo(link.videoId)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={`https://img.youtube.com/vi/${link.videoId}/mqdefault.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">{link.timestamp}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => handleDeleteLink(index, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-1 text-sm text-gray-900 truncate">{link.url}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {savedLinks.map((link, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                  onClick={() => handlePlayVideo(link.videoId)}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="relative w-40 flex-shrink-0 aspect-video">
                      <img
                        src={`https://img.youtube.com/vi/${link.videoId}/mqdefault.jpg`}
                        alt=""
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="w-10 h-10 text-white/75" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">{link.timestamp}</p>
                      <p className="mt-1 text-sm text-gray-900 truncate">{link.url}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 text-red-600 hover:text-red-700"
                      onClick={(e) => handleDeleteLink(index, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}