import React, { useState, useRef } from 'react';

const Documentation = () => {
    const [activeDocTab, setActiveDocTab] = useState('api-reference');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState({
        'getting-started': true,
        'authentication': true,
        'endpoints': false
    });

    const codeSnippets = {
        javascript: `// JavaScript example
fetch('https://api.example.com/users', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer your-token-here',
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`,

        python: `# Python example
import requests

headers = {
    'Authorization': 'Bearer your-token-here',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.example.com/users', headers=headers)
print(response.json())`,

        curl: `# cURL example
curl -X GET \\
  'https://api.example.com/users' \\
  -H 'Authorization: Bearer your-token-here' \\
  -H 'Content-Type: application/json'`
    };

    const [activeLanguage, setActiveLanguage] = useState('javascript');

    const apiEndpoints = [
        {
            method: 'GET',
            path: '/users',
            description: 'Retrieve all users',
            parameters: [
                { name: 'limit', type: 'number', required: false, description: 'Number of users to return' },
                { name: 'offset', type: 'number', required: false, description: 'Number of users to skip' }
            ],
            response: {
                status: 200,
                example: `{
    "users": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "createdAt": "2023-01-15T10:30:00Z"
        }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
}`
            }
        },
        {
            method: 'POST',
            path: '/users',
            description: 'Create a new user',
            parameters: [
                { name: 'name', type: 'string', required: true, description: 'User full name' },
                { name: 'email', type: 'string', required: true, description: 'User email address' },
                { name: 'password', type: 'string', required: true, description: 'User password' }
            ],
            response: {
                status: 201,
                example: `{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2023-01-15T10:30:00Z"
    },
    "message": "User created successfully"
}`
            }
        },
        {
            method: 'GET',
            path: '/users/{id}',
            description: 'Retrieve a specific user',
            parameters: [
                { name: 'id', type: 'number', required: true, description: 'User ID' }
            ],
            response: {
                status: 200,
                example: `{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2023-01-15T10:30:00Z"
    }
}`
            }
        }
    ];

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Code copied to clipboard!');
    };

    return (
        <div className="h-full bg-white text-black p-6" style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ fontWeight: '600' }}>API Documentation</h1>
                    <p className="text-gray-600" style={{ fontWeight: '400' }}>Complete reference and guides for your API</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontWeight: '400' }}
                        />
                        <div className="absolute left-3 top-3 text-gray-400">
                            🔍
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <nav className="sticky top-6 space-y-2">
                            <button
                                onClick={() => setActiveDocTab('api-reference')}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${activeDocTab === 'api-reference' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                style={{ fontWeight: '500' }}
                            >
                                API Reference
                            </button>
                            <button
                                onClick={() => setActiveDocTab('guides')}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${activeDocTab === 'guides' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                style={{ fontWeight: '500' }}
                            >
                                Guides & Tutorials
                            </button>
                            <button
                                onClick={() => setActiveDocTab('examples')}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${activeDocTab === 'examples' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                style={{ fontWeight: '500' }}
                            >
                                Code Examples
                            </button>
                            <button
                                onClick={() => setActiveDocTab('changelog')}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${activeDocTab === 'changelog' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                                style={{ fontWeight: '500' }}
                            >
                                Changelog
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="lg:w-3/4">
                        {/* API Reference */}
                        {activeDocTab === 'api-reference' && (
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg">
                                    {/* Getting Started */}
                                    <div className="border-b border-gray-200">
                                        <button
                                            onClick={() => toggleSection('getting-started')}
                                            className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50"
                                            style={{ fontWeight: '600' }}
                                        >
                                            <h3 className="text-lg font-semibold">Getting Started</h3>
                                            <span>{expandedSections['getting-started'] ? '−' : '+'}</span>
                                        </button>
                                        {expandedSections['getting-started'] && (
                                            <div className="p-4 bg-gray-50">
                                                <div className="prose max-w-none" style={{ fontWeight: '400' }}>
                                                    <p className="mb-4">Welcome to the API Documentation. This guide will help you get started with our REST API.</p>
                                                    
                                                    <h4 className="font-semibold mb-2" style={{ fontWeight: '600' }}>Base URL</h4>
                                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://api.yourdomain.com/v1</code>
                                                    
                                                    <h4 className="font-semibold mt-4 mb-2" style={{ fontWeight: '600' }}>Authentication</h4>
                                                    <p>All API requests require authentication using Bearer tokens in the Authorization header.</p>
                                                    
                                                    <h4 className="font-semibold mt-4 mb-2" style={{ fontWeight: '600' }}>Rate Limiting</h4>
                                                    <p>API requests are limited to 1000 requests per hour per API key.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Authentication */}
                                    <div className="border-b border-gray-200">
                                        <button
                                            onClick={() => toggleSection('authentication')}
                                            className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50"
                                            style={{ fontWeight: '600' }}
                                        >
                                            <h3 className="text-lg font-semibold">Authentication</h3>
                                            <span>{expandedSections['authentication'] ? '−' : '+'}</span>
                                        </button>
                                        {expandedSections['authentication'] && (
                                            <div className="p-4 bg-gray-50">
                                                <div className="prose max-w-none" style={{ fontWeight: '400' }}>
                                                    <p>Use Bearer token authentication for all API requests.</p>
                                                    
                                                    <h4 className="font-semibold mt-4 mb-2" style={{ fontWeight: '600' }}>Getting an API Key</h4>
                                                    <ol className="list-decimal list-inside space-y-2">
                                                        <li>Navigate to your project settings</li>
                                                        <li>Go to the API Keys section</li>
                                                        <li>Generate a new API key</li>
                                                        <li>Copy the key and store it securely</li>
                                                    </ol>
                                                    
                                                    <h4 className="font-semibold mt-4 mb-2" style={{ fontWeight: '600' }}>Example Header</h4>
                                                    <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto" style={{ fontWeight: '400' }}>
                                                        {`Authorization: Bearer your-api-key-here\nContent-Type: application/json`}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Endpoints */}
                                    <div>
                                        <button
                                            onClick={() => toggleSection('endpoints')}
                                            className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50"
                                            style={{ fontWeight: '600' }}
                                        >
                                            <h3 className="text-lg font-semibold">API Endpoints</h3>
                                            <span>{expandedSections['endpoints'] ? '−' : '+'}</span>
                                        </button>
                                        {expandedSections['endpoints'] && (
                                            <div className="p-4 bg-gray-50 space-y-6">
                                                {apiEndpoints.map((endpoint, index) => (
                                                    <div key={index} className="border border-gray-200 rounded-lg bg-white">
                                                        <div className="p-4 border-b border-gray-200">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                                                                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                                                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                                                    endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`} style={{ fontWeight: '500' }}>
                                                                    {endpoint.method}
                                                                </span>
                                                                <code className="text-sm bg-gray-100 px-2 py-1 rounded" style={{ fontWeight: '400' }}>
                                                                    {endpoint.path}
                                                                </code>
                                                            </div>
                                                            <p className="text-gray-600" style={{ fontWeight: '400' }}>{endpoint.description}</p>
                                                        </div>

                                                        {endpoint.parameters.length > 0 && (
                                                            <div className="p-4 border-b border-gray-200">
                                                                <h5 className="font-semibold mb-2" style={{ fontWeight: '600' }}>Parameters</h5>
                                                                <div className="space-y-2">
                                                                    {endpoint.parameters.map((param, paramIndex) => (
                                                                        <div key={paramIndex} className="flex items-start gap-4 text-sm">
                                                                            <div className="w-24 flex-shrink-0">
                                                                                <code className="bg-gray-100 px-2 py-1 rounded" style={{ fontWeight: '400' }}>{param.name}</code>
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <span className={`px-2 py-1 rounded text-xs ${
                                                                                    param.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                                                }`} style={{ fontWeight: '500' }}>
                                                                                    {param.required ? 'Required' : 'Optional'}
                                                                                </span>
                                                                                <span className="ml-2 text-gray-600" style={{ fontWeight: '400' }}>{param.type}</span>
                                                                            </div>
                                                                            <div className="flex-1 text-gray-600" style={{ fontWeight: '400' }}>
                                                                                {param.description}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="p-4">
                                                            <h5 className="font-semibold mb-2" style={{ fontWeight: '600' }}>Response</h5>
                                                            <div className="mb-2">
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm" style={{ fontWeight: '500' }}>
                                                                    Status: {endpoint.response.status}
                                                                </span>
                                                            </div>
                                                            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm" style={{ fontWeight: '400' }}>
                                                                {endpoint.response.example}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Guides & Tutorials */}
                        {activeDocTab === 'guides' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <h3 className="text-xl font-semibold mb-3" style={{ fontWeight: '600' }}>Quick Start Guide</h3>
                                        <p className="text-gray-600 mb-4" style={{ fontWeight: '400' }}>Get your first API request working in 5 minutes.</p>
                                        <button className="text-blue-600 hover:text-blue-800 font-medium" style={{ fontWeight: '500' }}>
                                            Read Guide →
                                        </button>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <h3 className="text-xl font-semibold mb-3" style={{ fontWeight: '600' }}>Authentication Setup</h3>
                                        <p className="text-gray-600 mb-4" style={{ fontWeight: '400' }}>Learn how to set up and manage API keys.</p>
                                        <button className="text-blue-600 hover:text-blue-800 font-medium" style={{ fontWeight: '500' }}>
                                            Read Guide →
                                        </button>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <h3 className="text-xl font-semibold mb-3" style={{ fontWeight: '600' }}>Error Handling</h3>
                                        <p className="text-gray-600 mb-4" style={{ fontWeight: '400' }}>Best practices for handling API errors.</p>
                                        <button className="text-blue-600 hover:text-blue-800 font-medium" style={{ fontWeight: '500' }}>
                                            Read Guide →
                                        </button>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <h3 className="text-xl font-semibold mb-3" style={{ fontWeight: '600' }}>Rate Limiting</h3>
                                        <p className="text-gray-600 mb-4" style={{ fontWeight: '400' }}>Understand and manage API rate limits.</p>
                                        <button className="text-blue-600 hover:text-blue-800 font-medium" style={{ fontWeight: '500' }}>
                                            Read Guide →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Code Examples */}
                        {activeDocTab === 'examples' && (
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-4" style={{ fontWeight: '600' }}>Code Examples</h3>
                                    
                                    {/* Language Selector */}
                                    <div className="flex gap-2 mb-4">
                                        {Object.keys(codeSnippets).map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => setActiveLanguage(lang)}
                                                className={`px-4 py-2 rounded-lg capitalize ${
                                                    activeLanguage === lang 
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                                style={{ fontWeight: '500' }}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Code Snippet */}
                                    <div className="relative">
                                        <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm" style={{ fontWeight: '400' }}>
                                            {codeSnippets[activeLanguage]}
                                        </pre>
                                        <button
                                            onClick={() => copyToClipboard(codeSnippets[activeLanguage])}
                                            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                                            style={{ fontWeight: '500' }}
                                        >
                                            Copy
                                        </button>
                                    </div>

                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold mb-2" style={{ fontWeight: '600' }}>Notes:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700" style={{ fontWeight: '400' }}>
                                            <li>Replace <code className="bg-gray-200 px-1 rounded" style={{ fontWeight: '400' }}>your-token-here</code> with your actual API key</li>
                                            <li>Make sure to handle errors appropriately in production code</li>
                                            <li>Consider implementing retry logic for failed requests</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Changelog */}
                        {activeDocTab === 'changelog' && (
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold mb-6" style={{ fontWeight: '600' }}>API Changelog</h3>
                                    
                                    <div className="space-y-8">
                                        {/* Version 1.2.0 */}
                                        <div className="border-l-4 border-blue-500 pl-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-lg font-semibold" style={{ fontWeight: '600' }}>Version 1.2.0</h4>
                                                <span className="text-sm text-gray-500" style={{ fontWeight: '400' }}>January 15, 2024</span>
                                            </div>
                                            <ul className="list-disc list-inside space-y-1 text-gray-700" style={{ fontWeight: '400' }}>
                                                <li>Added pagination support for user lists</li>
                                                <li>New webhook events for user registration</li>
                                                <li>Improved error messages for validation failures</li>
                                                <li>Deprecated <code className="bg-gray-100 px-1 rounded" style={{ fontWeight: '400' }}>/v1/legacy-endpoint</code></li>
                                            </ul>
                                        </div>

                                        {/* Version 1.1.0 */}
                                        <div className="border-l-4 border-green-500 pl-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-lg font-semibold" style={{ fontWeight: '600' }}>Version 1.1.0</h4>
                                                <span className="text-sm text-gray-500" style={{ fontWeight: '400' }}>December 1, 2023</span>
                                            </div>
                                            <ul className="list-disc list-inside space-y-1 text-gray-700" style={{ fontWeight: '400' }}>
                                                <li>Added bulk user creation endpoint</li>
                                                <li>Enhanced search filters for user queries</li>
                                                <li>Rate limiting improvements</li>
                                            </ul>
                                        </div>

                                        {/* Version 1.0.0 */}
                                        <div className="border-l-4 border-purple-500 pl-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-lg font-semibold" style={{ fontWeight: '600' }}>Version 1.0.0</h4>
                                                <span className="text-sm text-gray-500" style={{ fontWeight: '400' }}>October 10, 2023</span>
                                            </div>
                                            <ul className="list-disc list-inside space-y-1 text-gray-700" style={{ fontWeight: '400' }}>
                                                <li>Initial API release</li>
                                                <li>Basic CRUD operations for users</li>
                                                <li>JWT-based authentication</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documentation;