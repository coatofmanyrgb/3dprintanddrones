import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  Share2,
  Gauge,
  TrendingUp,
  Wind,
  Battery,
  Signal,
  Navigation,
  AlertTriangle,
  Crosshair
} from 'lucide-react';

const FlightVideoPlayer = ({ video, analysis, onTimeUpdate }) => {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTelemetry, setCurrentTelemetry] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      updateTelemetry(video.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [analysis, onTimeUpdate]);

  const updateTelemetry = (time) => {
    if (!analysis?.flight_data) return;

    // Find the telemetry data point closest to current time
    const dataPoint = analysis.flight_data.find(point => 
      Math.abs(point.timestamp - time) < 1
    );

    if (dataPoint) {
      setCurrentTelemetry(dataPoint);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const downloadVideo = () => {
    const link = document.createElement('a');
    link.href = video.video_url;
    link.download = `${video.title}.mp4`;
    link.click();
  };

  return (
    <div className="bg-black rounded-xl overflow-hidden relative group">
      {/* Video element */}
      <video
        ref={videoRef}
        src={video.video_url}
        className="w-full h-full"
        poster={video.thumbnail}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      />

      {/* Telemetry Overlay */}
      {showTelemetry && currentTelemetry && (
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
          {/* Left side metrics */}
          <div className="space-y-2">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-mono text-sm">
                ALT: {currentTelemetry.altitude?.toFixed(1) || 0}m
              </span>
            </div>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-mono text-sm">
                SPD: {currentTelemetry.speed?.toFixed(1) || 0} km/h
              </span>
            </div>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-mono text-sm">
                WIND: {currentTelemetry.wind_speed || 0} km/h
              </span>
            </div>
          </div>

          {/* Right side metrics */}
          <div className="space-y-2">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <Battery className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-mono text-sm">
                BAT: {currentTelemetry.battery?.toFixed(0) || 0}%
              </span>
            </div>
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <Signal className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-mono text-sm">
                SIG: {currentTelemetry.signal_strength || 0}%
              </span>
            </div>
            {currentTelemetry.warnings && (
              <div className="bg-red-900/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-mono text-sm">
                  WARNING
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compass/Heading indicator */}
      {showTelemetry && currentTelemetry?.yaw !== undefined && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm rounded-full p-3">
            <Navigation 
              className="w-8 h-8 text-white" 
              style={{ transform: `rotate(${currentTelemetry.yaw}deg)` }}
            />
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Progress bar */}
        <div className="mb-4">
          <div 
            ref={progressRef}
            className="w-full h-1 bg-gray-600 rounded-full cursor-pointer relative"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Skip buttons */}
            <button
              onClick={() => skipTime(-10)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => skipTime(10)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Time display */}
            <span className="text-white text-sm ml-4">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Telemetry toggle */}
            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className={`p-2 rounded-lg transition-colors ${
                showTelemetry ? 'bg-white/20 text-white' : 'hover:bg-white/20 text-gray-400'
              }`}
              title="Toggle telemetry"
            >
              <Crosshair className="w-5 h-5" />
            </button>

            {/* Playback speed */}
            <button
              onClick={changePlaybackSpeed}
              className="px-3 py-1 hover:bg-white/20 rounded-lg transition-colors text-white text-sm"
            >
              {playbackSpeed}x
            </button>

            {/* Download */}
            <button
              onClick={downloadVideo}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Download video"
            >
              <Download className="w-5 h-5 text-white" />
            </button>

            {/* Share */}
            <button
              onClick={() => console.log('Share')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Video info overlay */}
      <div className="absolute top-4 right-4 text-right pointer-events-none">
        <h3 className="text-white text-lg font-semibold drop-shadow-lg">{video.title}</h3>
        <p className="text-gray-300 text-sm">by {video.user.name}</p>
      </div>
    </div>
  );
};

export default FlightVideoPlayer;