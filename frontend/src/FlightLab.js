import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Upload, 
  Gauge, 
  TrendingUp, 
  Wind, 
  Battery, 
  Signal,
  AlertTriangle,
  Download,
  Share2,
  ChevronRight,
  Filter,
  Grid3x3,
  List,
  Search,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  MoreVertical,
  X,
  Loader
} from 'lucide-react';
import FlightVideoPlayer from './FlightVideoPlayer';
import FlightAnalytics from './FlightAnalytics';
import FlightComparison from './FlightComparison';
import FlightUploadModal from './FlightUploadModal';
import { flightService } from './services/flightService';

const FlightLab = ({ user }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('grid'); // grid or list
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, my-flights, featured
  const [searchTerm, setSearchTerm] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, performance

  // Fetch flight videos
  useEffect(() => {
    fetchVideos();
  }, [filter, sortBy]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await flightService.getVideos({
        filter,
        sort: sortBy,
        search: searchTerm
      });
      setVideos(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Use mock data for development
      setVideos(getMockVideos());
    } finally {
      setLoading(false);
    }
  };

  const getMockVideos = () => [
    {
      id: 1,
      title: "FPV Racing - Mountain Course",
      description: "High-speed FPV drone racing through challenging mountain terrain.",
      thumbnail: "https://via.placeholder.com/640x360",
      video_url: "https://example.com/video1.mp4",
      duration_seconds: 180,
      views: 1245,
      likes: 89,
      user: { name: "Alex Chen", avatar: "https://ui-avatars.com/api/?name=Alex+Chen" },
      created_at: "2024-01-15T10:30:00Z",
      analysis: {
        max_altitude: 125,
        max_speed: 45.2,
        avg_speed: 32.5,
        total_distance: 2.8,
        performance_score: 85
      }
    },
    {
      id: 2,
      title: "Long Range Exploration",
      description: "Testing the limits with a 5km long range flight over forests.",
      thumbnail: "https://via.placeholder.com/640x360",
      video_url: "https://example.com/video2.mp4",
      duration_seconds: 420,
      views: 892,
      likes: 67,
      user: { name: "Sarah Kim", avatar: "https://ui-avatars.com/api/?name=Sarah+Kim" },
      created_at: "2024-01-14T15:45:00Z",
      analysis: {
        max_altitude: 200,
        max_speed: 38.5,
        avg_speed: 28.0,
        total_distance: 5.2,
        performance_score: 92
      }
    },
    {
      id: 3,
      title: "Urban Freestyle Session",
      description: "Freestyle flying through abandoned buildings and urban obstacles.",
      thumbnail: "https://via.placeholder.com/640x360",
      video_url: "https://example.com/video3.mp4",
      duration_seconds: 240,
      views: 2103,
      likes: 156,
      user: { name: "Mike Wilson", avatar: "https://ui-avatars.com/api/?name=Mike+Wilson" },
      created_at: "2024-01-13T09:20:00Z",
      analysis: {
        max_altitude: 80,
        max_speed: 52.0,
        avg_speed: 35.5,
        total_distance: 1.5,
        performance_score: 78
      }
    }
  ];

  const handleVideoSelect = async (video) => {
    setSelectedVideo(video);
    // Fetch detailed analysis if not already loaded
    if (!video.analysis?.flight_data) {
      try {
        const response = await flightService.getAnalysis(video.id);
        setSelectedVideo({ ...video, analysis: response.data.analysis });
      } catch (error) {
        console.error('Error fetching analysis:', error);
      }
    }
  };

  const handleComparisonToggle = (video) => {
    if (selectedForComparison.find(v => v.id === video.id)) {
      setSelectedForComparison(selectedForComparison.filter(v => v.id !== video.id));
    } else if (selectedForComparison.length < 4) {
      setSelectedForComparison([...selectedForComparison, video]);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffHours < 168) {
      return `${Math.floor(diffHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const VideoCard = ({ video }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Thumbnail with overlay */}
      <div 
        className="aspect-video relative overflow-hidden cursor-pointer"
        onClick={() => handleVideoSelect(video)}
      >
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration_seconds)}
        </div>
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-16 h-16 text-white" />
        </div>
        
        {/* Performance score badge */}
        {video.analysis?.performance_score && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
            {video.analysis.performance_score}/100
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
        
        {/* User info */}
        <div className="flex items-center gap-3 mb-3">
          <img 
            src={video.user.avatar} 
            alt={video.user.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">{video.user.name}</p>
            <p className="text-xs text-gray-500">{formatDate(video.created_at)}</p>
          </div>
        </div>
        
        {/* Quick stats */}
        {video.analysis && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <TrendingUp className="w-3 h-3" />
                Max Altitude
              </div>
              <p className="font-semibold">{video.analysis.max_altitude}m</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Gauge className="w-3 h-3" />
                Max Speed
              </div>
              <p className="font-semibold">{video.analysis.max_speed} km/h</p>
            </div>
          </div>
        )}
        
        {/* Engagement stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {video.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {video.likes}
            </span>
          </div>
          
          {/* Compare checkbox */}
          {compareMode && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedForComparison.find(v => v.id === video.id)}
                onChange={() => handleComparisonToggle(video)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs">Compare</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flight Lab</h1>
              <p className="text-gray-600 mt-1">Analyze and compare drone flight performance</p>
            </div>
            
            {user && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Flight
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* If a video is selected, show detailed view */}
        {selectedVideo ? (
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              Back to videos
            </button>
            
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Video Player */}
              <div className="lg:col-span-2">
                <FlightVideoPlayer 
                  video={selectedVideo}
                  analysis={selectedVideo.analysis}
                  onTimeUpdate={(time) => console.log('Time:', time)}
                />
              </div>
              
              {/* Analytics Panel */}
              <div className="space-y-4">
                <FlightAnalytics 
                  analysis={selectedVideo.analysis}
                  video={selectedVideo}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Filters and controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search flights..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Flights</option>
                  <option value="my-flights">My Flights</option>
                  <option value="featured">Featured</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="performance">Best Performance</option>
                </select>
                
                {/* View toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Compare mode toggle */}
                <button
                  onClick={() => {
                    setCompareMode(!compareMode);
                    setSelectedForComparison([]);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    compareMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Compare
                </button>
              </div>
            </div>
            
            {/* Compare bar */}
            {compareMode && selectedForComparison.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <p className="font-medium text-blue-900">
                      {selectedForComparison.length} flights selected for comparison
                    </p>
                    <div className="flex -space-x-2">
                      {selectedForComparison.map((video, index) => (
                        <img
                          key={video.id}
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-12 h-12 rounded-lg border-2 border-white object-cover"
                          style={{ zIndex: selectedForComparison.length - index }}
                        />
                      ))}
                    </div>
                  </div>
                  {selectedForComparison.length >= 2 && (
                    <button
                      onClick={() => {
                        // Open comparison view
                        console.log('Compare:', selectedForComparison);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Start Comparison
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Video Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <Wind className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flights yet</h3>
                <p className="text-gray-600 mb-6">Upload your first flight video to get started!</p>
                {user && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Upload Flight Video
                  </button>
                )}
              </div>
            ) : (
              <div className={
                view === 'grid' 
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {videos.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <FlightUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={(newVideo) => {
            setVideos([newVideo, ...videos]);
            setShowUploadModal(false);
          }}
        />
      )}
      
      {/* Comparison Modal */}
      {compareMode && selectedForComparison.length >= 2 && (
        <FlightComparison
          videos={selectedForComparison}
          onClose={() => {
            setCompareMode(false);
            setSelectedForComparison([]);
          }}
        />
      )}
    </div>
  );
};

export default FlightLab;