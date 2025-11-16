// CodeEngine.jsx
import React, { useState, useRef } from 'react';

const CodeEngine = () => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [activeTab, setActiveTab] = useState('explore');
    const [projectConfig, setProjectConfig] = useState({
        name: 'my-project',
        database: 'mongodb',
    });
    const [customFiles, setCustomFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fileTypeFilter, setFileTypeFilter] = useState('all');
    const fileInputRef = useRef();

    // GitHub Template Repositories
    const githubTemplates = [
        {
            id: 'auth-system',
            name: 'Authentication System',
            description: 'Complete login/signup with JWT & protected routes',
            category: 'Authentication',
            githubUrl: 'https://github.com/your-username/react-node-auth-template',
            features: ['User Registration', 'JWT Auth', 'Protected Routes'],
            stars: '1.2k',
            lastUpdated: '2024-01-15'
        },
        {
            id: 'ecommerce-api',
            name: 'E-commerce API',
            description: 'Full e-commerce with products, cart, and orders',
            category: 'E-commerce',
            githubUrl: 'https://github.com/your-username/fullstack-ecommerce',
            features: ['Product Management', 'Shopping Cart', 'Order System'],
            stars: '2.4k',
            lastUpdated: '2024-01-10'
        },
        {
            id: 'blog-cms',
            name: 'Blog CMS',
            description: 'Content management system with posts and comments',
            category: 'CMS',
            githubUrl: 'https://github.com/your-username/blog-cms-template',
            features: ['Post Management', 'Comments', 'User Roles'],
            stars: '890',
            lastUpdated: '2024-01-08'
        },
        {
            id: 'task-manager',
            name: 'Task Manager',
            description: 'Advanced task management with teams',
            category: 'Productivity',
            githubUrl: 'https://github.com/your-username/task-manager-app',
            features: ['Task CRUD', 'Team Collaboration', 'Deadlines'],
            stars: '1.5k',
            lastUpdated: '2024-01-12'
        }
    ];

    // File type categories for exploration
    const fileCategories = [
        { id: 'all', name: 'All Files', icon: '📁' },
        { id: 'component', name: 'Components', icon: '⚛️' },
        { id: 'util', name: 'Utilities', icon: '🔧' },
        { id: 'hook', name: 'Custom Hooks', icon: '🎣' },
        { id: 'style', name: 'Styles', icon: '🎨' },
        { id: 'config', name: 'Configuration', icon: '⚙️' },
        { id: 'test', name: 'Tests', icon: '🧪' }
    ];

    // Sample files for exploration
    const explorableFiles = [
        {
            id: 1,
            name: 'useAuth.js',
            type: 'hook',
            description: 'Authentication hook with JWT support',
            githubUrl: 'https://github.com/your-username/hooks/blob/main/useAuth.js',
            downloads: '15k',
            rating: '4.8'
        },
        {
            id: 2,
            name: 'ProtectedRoute.jsx',
            type: 'component',
            description: 'Route protection component for React Router',
            githubUrl: 'https://github.com/your-username/components/blob/main/ProtectedRoute.jsx',
            downloads: '12k',
            rating: '4.7'
        },
        {
            id: 3,
            name: 'apiClient.js',
            type: 'util',
            description: 'Axios-based API client with interceptors',
            githubUrl: 'https://github.com/your-username/utils/blob/main/apiClient.js',
            downloads: '8k',
            rating: '4.6'
        },
        {
            id: 4,
            name: 'formValidation.js',
            type: 'util',
            description: 'Comprehensive form validation utilities',
            githubUrl: 'https://github.com/your-username/utils/blob/main/formValidation.js',
            downloads: '10k',
            rating: '4.9'
        }
    ];

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        setCustomFiles(prev => [...prev, ...files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type.split('/')[1] || 'file',
            size: (file.size / 1024).toFixed(2) + ' KB',
            content: file,
            uploadDate: new Date().toLocaleDateString()
        }))]);
    };

    const removeFile = (fileId) => {
        setCustomFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const openGithubTemplate = (url) => {
        window.open(url, '_blank');
    };

    // Filter files based on search and type
    const filteredFiles = explorableFiles.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            file.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = fileTypeFilter === 'all' || file.type === fileTypeFilter;
        return matchesSearch && matchesType;
    });

    const filteredTemplates = githubTemplates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 overflow-auto font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                        Code Engine
                    </h1>
                    <p className="text-slate-400 text-lg font-light">
                        Discover templates and manage your development assets
                    </p>
                </div>
                
                {/* Main Navigation Tabs */}
                <div className="flex border-b border-slate-700 mb-8">
                    {['explore', 'my-files', 'templates'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-4 font-semibold text-base capitalize border-b-2 transition-all duration-200 ${
                                activeTab === tab 
                                ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                        >
                            {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Left Sidebar - Filters & Actions */}
                    <div className="xl:col-span-1 space-y-6">
                        {/* Search Box */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Search</h2>
                            <input
                                type="text"
                                placeholder="Search templates, files, components..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 rounded-lg bg-slate-900 border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-100 placeholder-slate-500"
                            />
                        </div>

                        {/* File Type Filters */}
                        {activeTab === 'explore' && (
                            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                <h2 className="text-xl font-semibold mb-4 text-slate-200">File Types</h2>
                                <div className="space-y-3">
                                    {fileCategories.map(category => (
                                        <button
                                            key={category.id}
                                            onClick={() => setFileTypeFilter(category.id)}
                                            className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                                                fileTypeFilter === category.id 
                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' 
                                                : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 border border-transparent'
                                            }`}
                                        >
                                            <span className="text-lg">{category.icon}</span>
                                            <span className="font-medium">{category.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* File Upload */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Upload Files</h2>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                multiple
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full p-6 border-2 border-dashed border-slate-600 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200 text-center group"
                            >
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📁</div>
                                <div className="text-slate-300 font-medium">Upload Components & Utilities</div>
                                <div className="text-slate-500 text-sm mt-1">.js, .jsx, .ts, .css</div>
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Overview</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                    <span className="text-slate-300 font-medium">Templates</span>
                                    <span className="text-blue-400 font-bold">{githubTemplates.length}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                    <span className="text-slate-300 font-medium">Files Available</span>
                                    <span className="text-green-400 font-bold">{explorableFiles.length}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                    <span className="text-slate-300 font-medium">Your Files</span>
                                    <span className="text-purple-400 font-bold">{customFiles.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="xl:col-span-3">
                        {/* Explore Files */}
                        {activeTab === 'explore' && (
                            <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-100 mb-2">Explore Components & Utilities</h2>
                                        <p className="text-slate-400">Ready-to-use code snippets and components</p>
                                    </div>
                                    <div className="text-sm text-slate-500 font-medium">
                                        {filteredFiles.length} of {explorableFiles.length} files
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredFiles.map(file => (
                                        <div key={file.id} className="bg-slate-700/30 rounded-xl p-6 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-100 mb-1 group-hover:text-white transition-colors">
                                                        {file.name}
                                                    </h3>
                                                    <span className="text-sm font-medium text-slate-400 capitalize bg-slate-600/30 px-2 py-1 rounded">
                                                        {file.type}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => window.open(file.githubUrl, '_blank')}
                                                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium text-white transition-colors text-sm"
                                                >
                                                    View Source
                                                </button>
                                            </div>
                                            <p className="text-slate-300 mb-4 leading-relaxed">{file.description}</p>
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex space-x-4 text-slate-500 font-medium">
                                                    <span>⬇️ {file.downloads}</span>
                                                    <span>⭐ {file.rating}/5</span>
                                                </div>
                                                <button 
                                                    onClick={() => window.open(file.githubUrl, '_blank')}
                                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                                >
                                                    GitHub →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* My Files */}
                        {activeTab === 'my-files' && (
                            <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50">
                                <h2 className="text-2xl font-bold text-slate-100 mb-6">My Uploaded Files</h2>
                                
                                {customFiles.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="text-6xl mb-6 text-slate-600">📁</div>
                                        <p className="text-slate-400 text-xl font-medium mb-2">No files uploaded yet</p>
                                        <p className="text-slate-500">Upload some files to get started with your project</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {customFiles.map(file => (
                                            <div key={file.id} className="bg-slate-700/30 rounded-xl p-6 flex justify-between items-center border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-2xl text-slate-400">
                                                        {file.type === 'js' ? '📄' : 
                                                         file.type === 'jsx' ? '⚛️' : 
                                                         file.type === 'css' ? '🎨' : '📁'}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-100">{file.name}</h3>
                                                        <p className="text-sm text-slate-400 font-medium">
                                                            {file.type.toUpperCase()} • {file.size} • Uploaded {file.uploadDate}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFile(file.id)}
                                                    className="text-red-400 hover:text-red-300 p-3 rounded-lg hover:bg-red-500/10 transition-colors"
                                                    title="Remove file"
                                                >
                                                    <span className="text-lg">×</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Templates */}
                        {activeTab === 'templates' && (
                            <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-100 mb-2">Project Templates</h2>
                                        <p className="text-slate-400">Complete starter templates for your next project</p>
                                    </div>
                                    <div className="text-sm text-slate-500 font-medium">
                                        {filteredTemplates.length} templates available
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {filteredTemplates.map(template => (
                                        <div key={template.id} className="bg-slate-700/30 rounded-xl p-6 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-xl text-slate-100 mb-2 group-hover:text-white transition-colors">
                                                        {template.name}
                                                    </h3>
                                                    <span className="inline-block bg-slate-600/50 text-slate-300 px-3 py-1 rounded-full text-sm font-medium">
                                                        {template.category}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => openGithubTemplate(template.githubUrl)}
                                                    className="bg-slate-600 hover:bg-slate-500 px-6 py-3 rounded-xl font-semibold text-white transition-colors group-hover:scale-105 transform"
                                                >
                                                    Use Template
                                                </button>
                                            </div>
                                            
                                            <p className="text-slate-300 mb-4 text-lg leading-relaxed">{template.description}</p>
                                            
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {template.features.map(feature => (
                                                    <span key={feature} className="text-sm bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg font-medium">
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                            
                                            <div className="flex justify-between items-center pt-4 border-t border-slate-600/50">
                                                <div className="flex space-x-6 text-slate-400 font-medium">
                                                    <span className="flex items-center space-x-2">
                                                        <span>⭐</span>
                                                        <span>{template.stars} stars</span>
                                                    </span>
                                                    <span className="flex items-center space-x-2">
                                                        <span>🔄</span>
                                                        <span>Updated {template.lastUpdated}</span>
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={() => openGithubTemplate(template.githubUrl)}
                                                    className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center space-x-2"
                                                >
                                                    <span>View Repository</span>
                                                    <span>→</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEngine;