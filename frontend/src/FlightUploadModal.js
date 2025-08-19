import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Film,
  FileText,
  Loader,
  Check,
  AlertCircle,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Gauge,
  TrendingUp,
  Info
} from 'lucide-react';
import { flightService } from './services/flightService';

const FlightUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errors, setErrors] = useState({});
  
  const videoFileRef = useRef(null);
  const telemetryFileRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_file: null,
    telemetry_file: null,
    thumbnail: null,
    aircraft_type: 'drone',
    max_altitude: '',
    max_speed: '',
    flight_distance: '',
    duration_seconds: '',
    location: '',
    flight_date: new Date().toISOString().split('T')[0],
    tags: [],
    visibility: 'public'
  });

  const [tagInput, setTagInput] = useState('');
  const [videoPreview, setVideoPreview] = useState(null);

  const aircraftTypes = [
    { value: 'drone', label: 'Drone/Quadcopter' },
    { value: 'fpv', label: 'FPV Racing Drone' },
    { value: 'plane', label: 'RC Plane' },
    { value: 'helicopter', label: 'RC Helicopter' },
    { value: 'wing', label: 'Fixed Wing' },
    { value: 'other', label: 'Other' }
  ];

  const steps = [
    { number: 1, title: 'Upload Video', icon: Film },
    { number: 2, title: 'Flight Details', icon: FileText },
    { number: 3, title: 'Analysis', icon: TrendingUp }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setErrors(prev => ({ ...prev, video_file: 'Please upload a valid video file' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, video_file: file }));
      setErrors(prev => ({ ...prev, video_file: '' }));
      
      // Create video preview
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      
      // Get video duration
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        setFormData(prev => ({
          ...prev,
          duration_seconds: Math.floor(video.duration)
        }));
      };
    }
  };

  const handleTelemetryChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Accept CSV, JSON, or SRT files for telemetry
      const validTypes = ['.csv', '.json', '.srt'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        setErrors(prev => ({ ...prev, telemetry_file: 'Please upload a CSV, JSON, or SRT file' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, telemetry_file: file }));
      setErrors(prev => ({ ...prev, telemetry_file: '' }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.video_file) newErrors.video_file = 'Please upload a video file';
    } else if (step === 2) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.aircraft_type) newErrors.aircraft_type = 'Aircraft type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        // Start analysis when moving to step 3
        analyzeVideo();
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const analyzeVideo = async () => {
    setAnalyzing(true);
    
    // Simulate video analysis
    setTimeout(() => {
      // Extract mock telemetry data
      setFormData(prev => ({
        ...prev,
        max_altitude: Math.floor(Math.random() * 200 + 50),
        max_speed: Math.floor(Math.random() * 60 + 20),
        flight_distance: (Math.random() * 5 + 1).toFixed(2)
      }));
      setAnalyzing(false);
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const response = await flightService.uploadVideo(formDataToSend);
      
      // If telemetry file was provided, analyze the video
      if (formData.telemetry_file) {
        await flightService.analyzeVideo(response.data.id);
      }
      
      onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error('Failed to upload video:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to upload video' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Upload Flight Video</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center ${index !== 0 ? 'flex-1' : ''}`}>
                    {index !== 0 && (
                      <div className={`h-1 w-full mr-2 ${
                        currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                      <span className="font-medium">{step.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
            {/* Step 1: Upload Video */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flight Video *
                  </label>
                  <div
                    onClick={() => videoFileRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      errors.video_file 
                        ? 'border-red-500 bg-red-50' 
                        : formData.video_file
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      ref={videoFileRef}
                      type="file"
                      onChange={handleVideoChange}
                      accept="video/*"
                      className="hidden"
                    />
                    {formData.video_file ? (
                      <div>
                        {videoPreview && (
                          <video 
                            src={videoPreview} 
                            className="w-full max-w-md mx-auto mb-4 rounded-lg"
                            controls
                          />
                        )}
                        <p className="text-sm font-medium text-gray-900">{formData.video_file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(formData.video_file.size / 1024 / 1024).toFixed(2)} MB • 
                          {formData.duration_seconds && ` ${Math.floor(formData.duration_seconds / 60)}:${(formData.duration_seconds % 60).toString().padStart(2, '0')}`}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Film className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Click to upload flight video</p>
                        <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI (Max 500MB)</p>
                      </div>
                    )}
                  </div>
                  {errors.video_file && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.video_file}
                    </p>
                  )}
                </div>

                {/* Telemetry Upload (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telemetry Data (Optional)
                  </label>
                  <div
                    onClick={() => telemetryFileRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      formData.telemetry_file
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      ref={telemetryFileRef}
                      type="file"
                      onChange={handleTelemetryChange}
                      accept=".csv,.json,.srt"
                      className="hidden"
                    />
                    {formData.telemetry_file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-green-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{formData.telemetry_file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(formData.telemetry_file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Upload telemetry data</p>
                        <p className="text-xs text-gray-500 mt-1">CSV, JSON, or SRT files</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    Upload telemetry data from your flight controller for detailed analytics
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Flight Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., FPV Racing at Mountain Trail"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aircraft Type *
                    </label>
                    <select
                      name="aircraft_type"
                      value={formData.aircraft_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {aircraftTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your flight, location, weather conditions, and any interesting moments..."
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Rocky Mountains, Colorado"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Flight Date
                    </label>
                    <input
                      type="date"
                      name="flight_date"
                      value={formData.flight_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tags..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public - Anyone can view</option>
                    <option value="unlisted">Unlisted - Only with link</option>
                    <option value="private">Private - Only you</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Analysis */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {analyzing ? (
                  <div className="text-center py-12">
                    <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analyzing Flight Video</h3>
                    <p className="text-gray-600">Extracting telemetry and performance data...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-green-900">Analysis Complete</h3>
                          <p className="text-sm text-green-700 mt-1">
                            We've extracted flight data from your video. You can edit these values if needed.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Extracted metrics */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TrendingUp className="w-4 h-4 inline mr-1" />
                          Max Altitude (m)
                        </label>
                        <input
                          type="number"
                          name="max_altitude"
                          value={formData.max_altitude}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Gauge className="w-4 h-4 inline mr-1" />
                          Max Speed (km/h)
                        </label>
                        <input
                          type="number"
                          name="max_speed"
                          value={formData.max_speed}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Distance (km)
                        </label>
                        <input
                          type="number"
                          name="flight_distance"
                          value={formData.flight_distance}
                          onChange={handleInputChange}
                          step="0.1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Preview summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-semibold mb-4">Flight Summary</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Title:</p>
                          <p className="font-medium">{formData.title}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Aircraft:</p>
                          <p className="font-medium">
                            {aircraftTypes.find(t => t.value === formData.aircraft_type)?.label}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration:</p>
                          <p className="font-medium">
                            {Math.floor(formData.duration_seconds / 60)}:{(formData.duration_seconds % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Location:</p>
                          <p className="font-medium">{formData.location || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {errors.submit && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.submit}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || analyzing}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Upload Flight
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightUploadModal;