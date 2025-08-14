import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Grid3x3, 
  List, 
  Search, 
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Heart,
  Share2,
  MoreVertical,
  Calendar,
  Clock,
  Star
} from 'lucide-react';
import { projectService } from './services/api';
import UploadProjectModal from './UploadProjectModal';

const MyProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [filter, setFilter] = useState('all'); // 'all', '3d', 'flight', 'electronics', etc.
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'popular', 'name'
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mock data for development
  const getMockProjects = () => [
    {
      id: 1,
      title: "Hexacopter Drone Frame MK4",
      description: "Ultra-lightweight carbon fiber frame design optimized for competitive FPV racing.",
      category: "3d",
      model_url: "/models/hexacopter.stl",
      thumbnail: "https://via.placeholder.com/400x300",
      votes: 234,
      views: 1520,
      downloads: 89,
      created_at: "2024-01-15",
      status: "published"
    },
    {
      id: 2,
      title: "LED Matrix Controller",
      description: "Arduino-based LED matrix controller with 64x64 RGB support.",
      category: "electronics",
      thumbnail: "https://via.placeholder.com/400x300",
      votes: 156,
      views: 890,
      downloads: 45,
      created_at: "2024-01-10",
      status: "published"
    },
    {
      id: 3,
      title: "Mini Drone Propeller Set",
      description: "High-efficiency propellers for micro drones, optimized for stability.",
      category: "3d",
      thumbnail: "https://via.placeholder.com/400x300",
      votes: 89,
      views: 567,
      downloads: 34,
      created_at: "2024-01-08",
      status: "draft"
    }
  ];

  // Fetch user's projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectService.getAll({
        user_id: user.id,
        category: filter !== 'all' ? filter : undefined,
        sort: sortBy
      });
      setProjects(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Use mock data for now if API fails
      setProjects(getMockProjects());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filter, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (projectId) => {
    try {
      await projectService.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      setShowDeleteConfirm(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleProjectCreated = (newProject) => {
    // Add the new project to the list
    setProjects([newProject, ...projects]);
    // You might also want to show a success message
    console.log('Project created successfully:', newProject);
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProjectCard = ({ project }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        <img 
          src={project.thumbnail} 
          alt={project.title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <Eye className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <Edit className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
            project.status === 'published' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {project.status}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
            {project.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {project.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {project.votes}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {project.downloads}
            </span>
          </div>
          <button 
            onClick={() => {
              setSelectedProject(project);
              setShowDeleteConfirm(true);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );

  const ProjectListItem = ({ project }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4">
      <img 
        src={project.thumbnail} 
        alt={project.title}
        className="w-24 h-24 rounded-lg object-cover"
      />
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{project.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{project.description}</p>
          </div>
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
            project.status === 'published' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {project.status}
          </span>
        </div>
        
        <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {project.views} views
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {project.votes} likes
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            {project.downloads} downloads
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Edit className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={() => {
            setSelectedProject(project);
            setShowDeleteConfirm(true);
          }}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5 text-red-600" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Projects</h2>
          <p className="text-gray-600 mt-1">Manage your 3D models, circuits, and designs</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="3d">3D Models</option>
              <option value="flight">Flight</option>
              <option value="electronics">Electronics</option>
              <option value="robotics">Robotics</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="name">Name</option>
            </select>

            {/* View Toggle */}
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
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-6">Start by creating your first project!</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Create New Project
          </button>
        </div>
      ) : (
        <div className={view === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredProjects.map(project => 
            view === 'grid' 
              ? <ProjectCard key={project.id} project={project} />
              : <ProjectListItem key={project.id} project={project} />
          )}
        </div>
      )}

      {/* Upload Modal */}
      <UploadProjectModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleProjectCreated}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Project?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedProject.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedProject.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;