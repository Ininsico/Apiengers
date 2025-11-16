import React, { useState } from 'react';
import {
    DashboardIcon,
    SchemaIcon,
    APIIcon,
    AuthIcon,
    CodeIcon,
    DocsIcon
} from './Svg'
import SchemaDesigner from './SchemaDesginer';
import APIBuilder from './APIBuilder';
import Authentication from './Authenticator';
import CodeEngine from './CodeEngine';
import Documentation from './Documentation';

const APIvengers = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleNavigation = (section) => {
        setActiveSection(section);
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
        { id: 'schema', label: 'Schema Designer', icon: SchemaIcon },
        { id: 'api', label: 'API Builder', icon: APIIcon },
        { id: 'auth', label: 'Authentication', icon: AuthIcon },
        { id: 'code', label: 'Code Engine', icon: CodeIcon },
        { id: 'docs', label: 'Documentation', icon: DocsIcon },
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
                                    className={`w-full flex items-center p-3 rounded transition-colors ${activeSection === item.id ? 'bg-white text-black' : 'hover:bg-gray-800'
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
                </header>

                {/* Content Area */}
                <main className={`flex-1 overflow-auto ${activeSection === 'schema' ? 'bg-gray-800' : 'bg-white text-black'} p-0`} style={{ letterSpacing: '0.2px' }}>
                    {/* Dashboard */}
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                                    <h3 className="text-lg mb-4" style={{ letterSpacing: '0.5px' }}>Quick Navigation</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button onClick={() => handleNavigation('schema')} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50 text-left">
                                            Schema Designer
                                        </button>
                                        <button onClick={() => handleNavigation('api')} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50 text-left">
                                            API Builder
                                        </button>
                                        <button onClick={() => handleNavigation('auth')} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50 text-left">
                                            Authentication
                                        </button>
                                        <button onClick={() => handleNavigation('code')} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50 text-left">
                                            Code Engine
                                        </button>
                                        <button onClick={() => handleNavigation('docs')} className="p-4 bg-white rounded border border-gray-300 hover:bg-gray-50 text-left">
                                            Documentation
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                                    <h3 className="text-lg mb-4" style={{ letterSpacing: '0.5px' }}>Getting Started</h3>
                                    <div className="space-y-4">
                                        <p className="text-gray-600">Select a section from the sidebar or use the quick links to start building your API.</p>
                                        <div className="bg-white p-4 rounded border border-gray-300">
                                            <h4 className="font-semibold mb-2">Workflow</h4>
                                            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                                <li>Design your data schema</li>
                                                <li>Build API endpoints</li>
                                                <li>Configure authentication</li>
                                                <li>Generate code</li>
                                                <li>Document your API</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Schema Designer */}
                    {activeSection === 'schema' && (
                        <div className="w-full h-full">
                            <SchemaDesigner />
                        </div>
                    )}

                    {/* API Builder */}
                    {activeSection === 'api' && (
                        <div className="w-full h-full">
                            <APIBuilder />
                        </div>
                    )}
                    
                    {/* Authentication */}
                    {activeSection === 'auth' && (
                        <div className="w-full h-full">
                            <Authentication />
                        </div>
                    )}

                    {/* Code Engine */}
                    {activeSection === 'code' && (
                        <div className="w-full h-full">
                            <CodeEngine />
                        </div>
                    )}

                    {/* Documentation */}
                    {activeSection === 'docs' && (
                        <div className="w-full h-full">
                            <Documentation />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default APIvengers;