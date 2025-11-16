import { useState, useEffect } from "react";

const APIBuilder = () => {
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState('');
  const [apiType, setApiType] = useState('public');
  const [generatedEndpoints, setGeneratedEndpoints] = useState([]);
  const [customEndpoints, setCustomEndpoints] = useState([]);
  const [savedEndpoints, setSavedEndpoints] = useState([]);
  const [selectedCRUD, setSelectedCRUD] = useState({
    getAll: true,
    getById: true,
    create: true,
    update: true,
    delete: true
  });

  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    method: 'GET',
    path: '',
    authRequired: false,
    role: 'user'
  });

  useEffect(() => {
    fetchSchemas();
  }, []);

  useEffect(() => {
    if (selectedSchema) {
      fetchSavedEndpoints();
      generateCRUDEndpoints();
    }
  }, [selectedSchema, apiType, selectedCRUD]);

  const fetchSchemas = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/schemas');
      const data = await response.json();
      setSchemas(data);
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
    }
  };

  const fetchSavedEndpoints = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/endpoints/${selectedSchema}`);
      const data = await response.json();
      setSavedEndpoints(data);
    } catch (error) {
      console.error('Failed to fetch saved endpoints:', error);
    }
  };

  const generateCRUDEndpoints = () => {
    const schema = schemas.find(s => s.name === selectedSchema);
    if (!schema) return;

    const basePath = `/api/${selectedSchema.toLowerCase()}`;
    const authConfig = getAuthConfig();
    
    const crudEndpoints = [];
    let id = 1;

    if (selectedCRUD.getAll) {
      crudEndpoints.push({
        id: id++,
        name: `Get All ${selectedSchema}`,
        method: 'GET',
        path: basePath,
        description: `Fetch all ${selectedSchema} records`,
        isCustom: false,
        enabled: true,
        ...authConfig
      });
    }

    if (selectedCRUD.getById) {
      crudEndpoints.push({
        id: id++,
        name: `Get ${selectedSchema} by ID`,
        method: 'GET',
        path: `${basePath}/:id`,
        description: `Fetch single ${selectedSchema} record`,
        isCustom: false,
        enabled: true,
        ...authConfig
      });
    }

    if (selectedCRUD.create) {
      crudEndpoints.push({
        id: id++,
        name: `Create ${selectedSchema}`,
        method: 'POST',
        path: basePath,
        description: `Create new ${selectedSchema} record`,
        isCustom: false,
        enabled: true,
        ...authConfig
      });
    }

    if (selectedCRUD.update) {
      crudEndpoints.push({
        id: id++,
        name: `Update ${selectedSchema}`,
        method: 'PUT',
        path: `${basePath}/:id`,
        description: `Update existing ${selectedSchema} record`,
        isCustom: false,
        enabled: true,
        ...authConfig
      });
    }

    if (selectedCRUD.delete) {
      crudEndpoints.push({
        id: id++,
        name: `Delete ${selectedSchema}`,
        method: 'DELETE',
        path: `${basePath}/:id`,
        description: `Delete ${selectedSchema} record`,
        isCustom: false,
        enabled: true,
        ...authConfig
      });
    }

    setGeneratedEndpoints(crudEndpoints);
  };

  const getAuthConfig = () => {
    switch(apiType) {
      case 'public':
        return { authRequired: false, role: 'any' };
      case 'private':
        return { authRequired: true, role: 'user' };
      case 'admin':
        return { authRequired: true, role: 'admin' };
      default:
        return { authRequired: false, role: 'any' };
    }
  };

  const handleSaveEndpoints = async () => {
    if (!selectedSchema) return;
    
    const allEndpoints = [...generatedEndpoints, ...customEndpoints];
    
    try {
      const response = await fetch('http://localhost:5000/api/endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schemaName: selectedSchema,
          endpoints: allEndpoints
        })
      });

      if (response.ok) {
        alert('Endpoints saved successfully!');
        fetchSavedEndpoints();
      } else {
        const errorData = await response.json();
        alert(`Failed to save endpoints: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to save endpoints:', error);
      alert('Failed to save endpoints');
    }
  };

  const handleAddCustomEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.path) return;
    
    // Ensure path starts with /
    const path = newEndpoint.path.startsWith('/') ? newEndpoint.path : `/${newEndpoint.path}`;
    
    const endpoint = {
      id: Date.now(),
      ...newEndpoint,
      path: `/api/${selectedSchema.toLowerCase()}${path}`,
      description: newEndpoint.name,
      isCustom: true,
      enabled: true
    };
    
    setCustomEndpoints([...customEndpoints, endpoint]);
    setNewEndpoint({
      name: '',
      method: 'GET',
      path: '',
      authRequired: false,
      role: 'user'
    });
  };

  const handleToggleEndpoint = async (endpointId, enabled) => {
    try {
      const response = await fetch(`http://localhost:5000/api/endpoints/${endpointId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchSavedEndpoints();
      } else {
        console.error('Failed to toggle endpoint');
      }
    } catch (error) {
      console.error('Failed to toggle endpoint:', error);
    }
  };

  const handleDeleteEndpoint = async (endpointId, type) => {
    if (type === 'custom') {
      setCustomEndpoints(customEndpoints.filter(ep => ep.id !== endpointId));
    } else {
      try {
        const response = await fetch(`http://localhost:5000/api/endpoints/${endpointId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchSavedEndpoints();
        }
      } catch (error) {
        console.error('Failed to delete endpoint:', error);
      }
    }
  };

  const handleClearAllEndpoints = async () => {
    if (!selectedSchema) return;
    
    if (window.confirm('Are you sure you want to clear all endpoints for this schema?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/endpoints/schema/${selectedSchema}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSavedEndpoints([]);
          alert('All endpoints cleared!');
        }
      } catch (error) {
        console.error('Failed to clear endpoints:', error);
      }
    }
  };

  const handleTestEndpoint = async (endpoint) => {
    try {
      // Replace :id with a sample ID for testing
      let testPath = endpoint.path;
      if (testPath.includes(':id')) {
        testPath = testPath.replace(':id', '123');
      }

      const testUrl = `http://localhost:5000${testPath}`;
      
      let options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // Add body for POST and PUT requests
      if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
        options.body = JSON.stringify({
          name: 'Test Item',
          description: 'This is a test item'
        });
      }

      const response = await fetch(testUrl, options);
      const result = await response.json();

      alert(`Test Result for ${endpoint.method} ${testPath}:\nStatus: ${response.status}\nResponse: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      alert(`Test failed for ${endpoint.method} ${endpoint.path}:\n${error.message}`);
    }
  };

  const handleGenerateCode = async () => {
    const allEndpoints = [...savedEndpoints.filter(ep => ep.enabled)];
    
    const code = `
const express = require('express');
const router = express.Router();
const ${selectedSchema} = require('../models/${selectedSchema}');

${allEndpoints.map(endpoint => `
// ${endpoint.description}
router.${endpoint.method.toLowerCase()}('${endpoint.path}', ${endpoint.authRequired ? 'authenticateMiddleware, ' : ''}async (req, res) => {
  try {
    ${generateEndpointLogic(endpoint)}
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
`).join('\n')}

module.exports = router;
    `;

    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSchema}Routes.js`;
    a.click();
  };

  const generateEndpointLogic = (endpoint) => {
    switch(endpoint.method) {
      case 'GET':
        if (endpoint.path.includes(':id')) {
          return `const item = await ${selectedSchema}.findById(req.params.id);
    if (!item) return res.status(404).json({ error: '${selectedSchema} not found' });
    res.json(item);`;
        } else {
          return `const items = await ${selectedSchema}.find();
    res.json(items);`;
        }
      case 'POST':
        return `const newItem = new ${selectedSchema}(req.body);
    await newItem.save();
    res.status(201).json(newItem);`;
      case 'PUT':
        return `const updatedItem = await ${selectedSchema}.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ error: '${selectedSchema} not found' });
    res.json(updatedItem);`;
      case 'DELETE':
        return `const deletedItem = await ${selectedSchema}.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: '${selectedSchema} not found' });
    res.json({ message: '${selectedSchema} deleted successfully' });`;
      default:
        return '// Custom endpoint logic here';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl uppercase tracking-wider">API Endpoint Builder</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleSaveEndpoints} 
            disabled={!selectedSchema}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            Save Endpoints
          </button>
          <button 
            onClick={handleGenerateCode} 
            disabled={!selectedSchema || savedEndpoints.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            Generate Code
          </button>
          <button 
            onClick={handleClearAllEndpoints} 
            disabled={!selectedSchema}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Panel */}
        <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h4 className="font-bold mb-4 uppercase tracking-wider">Schema Selection</h4>
          <select 
            value={selectedSchema} 
            onChange={(e) => setSelectedSchema(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-4"
          >
            <option value="">Select a Schema</option>
            {schemas.map(schema => (
              <option key={schema._id} value={schema.name}>{schema.name}</option>
            ))}
          </select>

          <h4 className="font-bold mb-4 uppercase tracking-wider">API Type</h4>
          <div className="space-y-2 mb-6">
            <label className="flex items-center">
              <input 
                type="radio" 
                value="public" 
                checked={apiType === 'public'} 
                onChange={(e) => setApiType(e.target.value)}
                className="mr-2"
              />
              Public API (No Auth)
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                value="private" 
                checked={apiType === 'private'} 
                onChange={(e) => setApiType(e.target.value)}
                className="mr-2"
              />
              Private API (User Auth)
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                value="admin" 
                checked={apiType === 'admin'} 
                onChange={(e) => setApiType(e.target.value)}
                className="mr-2"
              />
              Admin API (Admin Only)
            </label>
          </div>

          <h4 className="font-bold mb-4 uppercase tracking-wider">CRUD Operations</h4>
          <div className="space-y-2">
            {Object.keys(selectedCRUD).map(key => (
              <label key={key} className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={selectedCRUD[key]}
                  onChange={(e) => setSelectedCRUD({...selectedCRUD, [key]: e.target.checked})}
                  className="mr-2"
                />
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            ))}
          </div>

          <button 
            onClick={generateCRUDEndpoints}
            disabled={!selectedSchema}
            className="w-full mt-4 p-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Generate CRUD Endpoints
          </button>
        </div>

        {/* Generated Endpoints */}
        <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h4 className="font-bold mb-4 uppercase tracking-wider">Generated Endpoints</h4>
          <div className="space-y-3">
            {generatedEndpoints.map(endpoint => (
              <div key={endpoint.id} className="p-3 bg-white rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm">{endpoint.method} {endpoint.path}</span>
                  <button 
                    onClick={() => handleTestEndpoint(endpoint)} 
                    className="text-xs px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                  >
                    Test
                  </button>
                </div>
                <p className="text-sm text-gray-600">{endpoint.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    Auth: {endpoint.authRequired ? 'Required' : 'None'} 
                    {endpoint.authRequired && ` (${endpoint.role})`}
                  </span>
                </div>
              </div>
            ))}
            {generatedEndpoints.length === 0 && (
              <p className="text-gray-500 text-center py-4">No generated endpoints</p>
            )}
          </div>
        </div>

        {/* Custom Endpoints */}
        <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h4 className="font-bold mb-4 uppercase tracking-wider">Custom Endpoints</h4>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded border">
              <input 
                type="text" 
                placeholder="Endpoint name"
                value={newEndpoint.name}
                onChange={(e) => setNewEndpoint({...newEndpoint, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded mb-3" 
              />
              <select 
                value={newEndpoint.method}
                onChange={(e) => setNewEndpoint({...newEndpoint, method: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded mb-3"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <div className="flex items-center mb-2">
                <span className="text-gray-600 mr-2">{`/api/${selectedSchema ? selectedSchema.toLowerCase() : 'schema'}`}</span>
                <input 
                  type="text" 
                  placeholder="path (e.g., /search)"
                  value={newEndpoint.path}
                  onChange={(e) => setNewEndpoint({...newEndpoint, path: e.target.value})}
                  className="flex-1 p-2 border border-gray-300 rounded" 
                />
              </div>
              <div className="flex items-center mb-3">
                <input 
                  type="checkbox" 
                  checked={newEndpoint.authRequired}
                  onChange={(e) => setNewEndpoint({...newEndpoint, authRequired: e.target.checked})}
                  className="mr-2"
                />
                <span>Authentication Required</span>
              </div>
              <button 
                onClick={handleAddCustomEndpoint}
                disabled={!newEndpoint.name || !newEndpoint.path || !selectedSchema}
                className="w-full p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Add Custom Endpoint
              </button>
            </div>

            {customEndpoints.map(endpoint => (
              <div key={endpoint.id} className="p-3 bg-white rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm">{endpoint.method} {endpoint.path}</span>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleTestEndpoint(endpoint)} 
                      className="text-xs px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                    >
                      Test
                    </button>
                    <button 
                      onClick={() => handleDeleteEndpoint(endpoint.id, 'custom')} 
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{endpoint.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    Auth: {endpoint.authRequired ? 'Required' : 'None'} 
                    {endpoint.authRequired && ` (${endpoint.role})`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Endpoints */}
        <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h4 className="font-bold mb-4 uppercase tracking-wider">Saved Endpoints</h4>
          <div className="space-y-3">
            {savedEndpoints.map(endpoint => (
              <div key={endpoint._id} className="p-3 bg-white rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm">{endpoint.method} {endpoint.path}</span>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleToggleEndpoint(endpoint._id, endpoint.enabled)}
                      className={`text-xs px-2 py-1 rounded ${
                        endpoint.enabled ? 'bg-green-600 hover:bg-green-500' : 'bg-yellow-600 hover:bg-yellow-500'
                      } text-white`}
                    >
                      {endpoint.enabled ? 'On' : 'Off'}
                    </button>
                    <button 
                      onClick={() => handleTestEndpoint(endpoint)} 
                      className="text-xs px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                    >
                      Test
                    </button>
                    <button 
                      onClick={() => handleDeleteEndpoint(endpoint._id, 'saved')} 
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{endpoint.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {endpoint.isCustom ? 'Custom' : 'CRUD'} • 
                    Auth: {endpoint.authRequired ? 'Required' : 'None'} 
                    {endpoint.authRequired && ` (${endpoint.role})`}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    endpoint.enabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {endpoint.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
            {savedEndpoints.length === 0 && (
              <p className="text-gray-500 text-center py-4">No saved endpoints</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIBuilder;