import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Image, 
  Layers, 
  Tag, 
  Package,
  Settings,
  ChevronRight,
  AlertCircle,
  Check,
  File,
  Loader
} from 'lucide-react';
import { projectService } from './services/api';

const UploadProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '3d',
    model_file: null,
    thumbnail: null,
    tags: [],
    materials: [],
    specifications: {
      dimensions: '',
      weight: '',
      print_time: '',
      difficulty: 'beginner'
    },
    status: 'draft'
  });

  // File refs
  const modelFileRef = useRef(null);
  const thumbnailRef = useRef(null);

  // Tag input
  const [tagInput, setTagInput] = useState('');
  const [materialInput, setMaterialInput] = useState('');

  const steps = [
    { number: 1, title: 'Basic Info', icon: FileText },
    { number: 2, title: 'Upload Files', icon: Upload },
    { number: 3, title: 'Details', icon: Settings }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSpecificationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value
      }
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'model') {
        // Validate file type
        const validTypes = ['.stl', '.obj', '.3mf', '.gcode'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!validTypes.includes(fileExt)) {
          setErrors(prev => ({ ...prev, model_file: 'Please upload a valid 3D model file (STL, OBJ, 3MF, or GCODE)' }));
          return;
        }
        setFormData(prev => ({ ...prev, model_file: file }));
        setErrors(prev => ({ ...prev, model_file: '' }));
      } else if (type === 'thumbnail') {
        // Validate image type
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({ ...prev, thumbnail: 'Please upload a valid image file' }));
          return;
        }
        setFormData(prev => ({ ...prev, thumbnail: file }));
        setErrors(prev => ({ ...prev, thumbnail: '' }));
        
        // Preview thumbnail
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({ ...prev, thumbnailPreview: e.target.result }));
        };
        reader.readAsDataURL(file);
      }
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

  const addMaterial = () => {
    if (materialInput.trim() && !formData.materials.includes(materialInput.trim())) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, materialInput.trim()]
      }));
      setMaterialInput('');
    }
  };

  const removeMaterial = (materialToRemove) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(material => material !== materialToRemove)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.category) newErrors.category = 'Category is required';
    } else if (step === 2) {
      if (!formData.model_file) newErrors.model_file = 'Please upload a 3D model file';
      if (!formData.thumbnail) newErrors.thumbnail = 'Please upload a thumbnail image';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.status);
      
      if (formData.model_file) {
        formDataToSend.append('model_file', formData.model_file);
      }
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }
      
      // Convert arrays and objects to JSON strings
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('materials', JSON.stringify(formData.materials));
      formDataToSend.append('specifications', JSON.stringify(formData.specifications));
      
      const response = await projectService.create(formDataToSend);
      
      onSuccess(response.data);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '3d',
        model_file: null,
        thumbnail: null,
        tags: [],
        materials: [],
        specifications: {
          dimensions: '',
          weight: '',
          print_time: '',
          difficulty: 'beginner'
        },
        status: 'draft'
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Failed to create project:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create project' });
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
              <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
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
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter your project title"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your project..."
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="3d">3D Model</option>
                    <option value="flight">Flight/Drone</option>
                    <option value="electronics">Electronics</option>
                    <option value="robotics">Robotics</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Upload Files */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Model File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3D Model File *
                  </label>
                  <div
                    onClick={() => modelFileRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      errors.model_file 
                        ? 'border-red-500 bg-red-50' 
                        : formData.model_file
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      ref={modelFileRef}
                      type="file"
                      onChange={(e) => handleFileChange(e, 'model')}
                      accept=".stl,.obj,.3mf,.gcode"
                      className="hidden"
                    />
                    {formData.model_file ? (
                      <div className="flex flex-col items-center">
                        <File className="w-12 h-12 text-green-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">{formData.model_file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(formData.model_file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Layers className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Click to upload 3D model</p>
                        <p className="text-xs text-gray-500 mt-1">STL, OBJ, 3MF, or GCODE (Max 50MB)</p>
                      </div>
                    )}
                  </div>
                  {errors.model_file && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.model_file}
                    </p>
                  )}
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Image *
                  </label>
                  <div
                    onClick={() => thumbnailRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      errors.thumbnail 
                        ? 'border-red-500 bg-red-50' 
                        : formData.thumbnail
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      ref={thumbnailRef}
                      type="file"
                      onChange={(e) => handleFileChange(e, 'thumbnail')}
                      accept="image/*"
                      className="hidden"
                    />
                    {formData.thumbnailPreview ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={formData.thumbnailPreview} 
                          alt="Thumbnail preview" 
                          className="w-32 h-32 object-cover rounded-lg mb-2"
                        />
                        <p className="text-sm font-medium text-gray-900">{formData.thumbnail.name}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Image className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Click to upload thumbnail</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, or GIF (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                  {errors.thumbnail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.thumbnail}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
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
                        <Tag className="w-3 h-3" />
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

                {/* Materials */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materials Used
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={materialInput}
                      onChange={(e) => setMaterialInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                      placeholder="Add material..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addMaterial}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.materials.map((material, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
                      >
                        <Package className="w-3 h-3" />
                        {material}
                        <button
                          onClick={() => removeMaterial(material)}
                          className="ml-1 hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      name="dimensions"
                      value={formData.specifications.dimensions}
                      onChange={handleSpecificationChange}
                      placeholder="e.g., 100x50x30mm"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <input
                      type="text"
                      name="weight"
                      value={formData.specifications.weight}
                      onChange={handleSpecificationChange}
                      placeholder="e.g., 250g"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Print Time
                    </label>
                    <input
                      type="text"
                      name="print_time"
                      value={formData.specifications.print_time}
                      onChange={handleSpecificationChange}
                      placeholder="e.g., 4 hours"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={formData.specifications.difficulty}
                      onChange={handleSpecificationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Now</option>
                  </select>
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.submit}
                    </p>
                  </div>
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
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Project
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

export default UploadProjectModal;