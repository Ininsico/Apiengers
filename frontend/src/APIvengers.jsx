import React, { useState } from 'react';
import {
  DashboardIcon,
  SchemaIcon,
  APIIcon,
  AuthIcon,
  CodeIcon,
  DatabaseIcon,
  DeploymentIcon,
  TestingIcon,
  DocsIcon,
  TemplatesIcon,
  CollabIcon,
  IntegrationIcon,
  AdminIcon,
  AIIcon,
  SecurityIcon,
  MonetizationIcon,
  DeveloperIcon,
  PerformanceIcon,
  InternationalIcon,
  AccessibilityIcon
} from './Svg'
import SchemaDesigner from './SchemaDesginer';

const APIvengers = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dummy navigation handler
  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  // Dummy button handler
  const handleDummyButton = () => {
    alert("This is a dummy button - functionality will be added later");
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'schema', label: 'Schema Designer', icon: SchemaIcon },
    { id: 'api', label: 'API Builder', icon: APIIcon },
    { id: 'auth', label: 'Authentication', icon: AuthIcon },
    { id: 'code', label: 'Code Engine', icon: CodeIcon },
    { id: 'database', label: 'Database', icon: DatabaseIcon },
    { id: 'deployment', label: 'Deployment', icon: DeploymentIcon },
    { id: 'testing', label: 'Testing', icon: TestingIcon },
    { id: 'docs', label: 'Documentation', icon: DocsIcon },
    { id: 'templates', label: 'Templates', icon: TemplatesIcon },
    { id: 'collab', label: 'Collaboration', icon: CollabIcon },
    { id: 'integration', label: 'Integration', icon: IntegrationIcon },
    { id: 'admin', label: 'Administration', icon: AdminIcon },
    { id: 'ai', label: 'AI Features', icon: AIIcon },
    { id: 'security', label: 'Security', icon: SecurityIcon },
    { id: 'monetization', label: 'Monetization', icon: MonetizationIcon },
    { id: 'developer', label: 'Developer', icon: DeveloperIcon },
    { id: 'performance', label: 'Performance', icon: PerformanceIcon },
    { id: 'international', label: 'International', icon: InternationalIcon },
    { id: 'accessibility', label: 'Accessibility', icon: AccessibilityIcon },
  ];

  return (
    <div className="flex h-screen bg-black text-white" style={{ 
      fontFamily: 'Impact, Arial Narrow, Charcoal, sans-serif',
      letterSpacing: '0.3px',
      fontWeight: '500'
    }}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl tracking-wider" style={{ letterSpacing: '1px' }}>APIVENGERS</h1>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-gray-800 transition-colors"
            style={{ letterSpacing: '0.5px' }}
          >
            {sidebarOpen ? '«' : '»'}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center p-3 rounded transition-colors ${
                    activeSection === item.id ? 'bg-white text-black' : 'hover:bg-gray-800'
                  }`}
                  style={{ letterSpacing: '0.3px' }}
                >
                  <item.icon />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl uppercase tracking-wider" style={{ letterSpacing: '1px' }}>
            {navItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
          </h2>
          <div className="flex space-x-4">
            <button 
              onClick={handleDummyButton} 
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
              style={{ letterSpacing: '0.5px' }}
            >
              Save Project
            </button>
            <button 
              onClick={handleDummyButton} 
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              style={{ letterSpacing: '0.5px' }}
            >
              Export Code
            </button>
            <button 
              onClick={handleDummyButton} 
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              style={{ letterSpacing: '0.5px' }}
            >
              Deploy
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className={`flex-1 overflow-auto ${activeSection === 'schema' ? 'bg-gray-800' : 'bg-white text-black'} p-0`} style={{ letterSpacing: '0.2px' }}>
          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                  <h3 className="text-lg mb-4" style={{ letterSpacing: '0.5px' }}>Recent Projects</h3>
                  <div className="space-y-2">
                    <button onClick={handleDummyButton} className="w-full text-left p-3 bg-white rounded border border-gray-300 hover:bg-gray-50">
                      E-commerce API
                    </button>
                    <button onClick={handleDummyButton} className="w-full text-left p-3 bg-white rounded border border-gray-300 hover:bg-gray-50">
                      User Management System
                    </button>
                    <button onClick={handleDummyButton} className="w-full text-left p-3 bg-white rounded border border-gray-300 hover:bg-gray-50">
                      Analytics Dashboard API
                    </button>
                  </div>
                </div>

                <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                  <h3 className="text-lg mb-4" style={{ letterSpacing: '0.5px' }}>Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleDummyButton} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50">
                      New Schema
                    </button>
                    <button onClick={handleDummyButton} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50">
                      Import Data
                    </button>
                    <button onClick={handleDummyButton} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50">
                      Generate Docs
                    </button>
                    <button onClick={handleDummyButton} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50">
                      Run Tests
                    </button>
                  </div>
                </div>

                <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                  <h3 className="text-lg mb-4" style={{ letterSpacing: '0.5px' }}>System Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span>Code Generation</span>
                      <span className="text-green-600">Online</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span>Database Connection</span>
                      <span className="text-green-600">Connected</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      <span>Deployment Service</span>
                      <span className="text-green-600">Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                <h3 className="text-lg mb-4" style={{ letterSpacing: '0.5px' }}>Getting Started</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button onClick={() => handleNavigation('schema')} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50 text-center">
                    Design Schema
                  </button>
                  <button onClick={() => handleNavigation('api')} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50 text-center">
                    Build API
                  </button>
                  <button onClick={() => handleNavigation('auth')} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50 text-center">
                    Configure Auth
                  </button>
                  <button onClick={() => handleNavigation('deployment')} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50 text-center">
                    Deploy Project
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Schema Designer - NOW FULL SCREEN */}
          {activeSection === 'schema' && (
            <div className="w-full h-full">
              <SchemaDesigner />
            </div>
          )}

          {/* API Builder */}
          {activeSection === 'api' && (
            <div className="space-y-6 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl uppercase tracking-wider">API Endpoint Builder</h3>
                <div className="flex space-x-2">
                  <button onClick={handleDummyButton} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
                    Generate CRUD
                  </button>
                  <button onClick={handleDummyButton} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
                    Custom Endpoint
                  </button>
                  <button onClick={handleDummyButton} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
                    Test All Endpoints
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                  <h4 className="font-bold mb-4 uppercase tracking-wider">Generated Endpoints</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono">GET /api/users</span>
                        <button onClick={handleDummyButton} className="text-sm px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">Test</button>
                      </div>
                      <p className="text-sm text-gray-600">List all users</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono">POST /api/users</span>
                        <button onClick={handleDummyButton} className="text-sm px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">Test</button>
                      </div>
                      <p className="text-sm text-gray-600">Create new user</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono">GET /api/users/:id</span>
                        <button onClick={handleDummyButton} className="text-sm px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">Test</button>
                      </div>
                      <p className="text-sm text-gray-600">Get user by ID</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                  <h4 className="font-bold mb-4 uppercase tracking-wider">Custom Endpoints</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded border">
                      <input type="text" placeholder="Endpoint name" className="w-full p-2 border border-gray-300 rounded mb-3" />
                      <select className="w-full p-2 border border-gray-300 rounded mb-3">
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                      </select>
                      <button onClick={handleDummyButton} className="w-full p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
                        Add Custom Endpoint
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other sections */}
          {!['dashboard', 'schema', 'api'].includes(activeSection) && (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <h3 className="text-2xl mb-4 uppercase tracking-wider">
                  {navItems.find(item => item.id === activeSection)?.label} Section
                </h3>
                <p className="text-gray-600 mb-6">This section is under construction. Functionality will be implemented soon.</p>
                <button 
                  onClick={handleDummyButton} 
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  style={{ letterSpacing: '0.5px' }}
                >
                  Explore Features
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default APIvengers;