import { useState,useEffect } from "react";
const APIBuilder = () => {
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState('');
  const [apiType, setApiType] = useState('public');
  const [generatedEndpoints, setGeneratedEndpoints] = useState([]);
  const [customEndpoints, setCustomEndpoints] = useState([]);
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
      generateCRUDEndpoints();
    }
  }, [selectedSchema, apiType]);

  const fetchSchemas = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/schemas');
      const data = await response.json();
      setSchemas(data);
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
    }
  };

  const generateCRUDEndpoints = () => {
    const schema = schemas.find(s => s.name === selectedSchema);
    if (!schema) return;

    const basePath = `/api/${selectedSchema.toLowerCase()}`;
    const authConfig = getAuthConfig();
    
    const crudEndpoints = [
      {
        id: 1,
        name: `Get All ${selectedSchema}`,
        method: 'GET',
        path: basePath,
        description: `Fetch all ${selectedSchema} records`,
        ...authConfig
      },
      {
        id: 2,
        name: `Get ${selectedSchema} by ID`,
        method: 'GET',
        path: `${basePath}/:id`,
        description: `Fetch single ${selectedSchema} record`,
        ...authConfig
      },
      {
        id: 3,
        name: `Create ${selectedSchema}`,
        method: 'POST',
        path: basePath,
        description: `Create new ${selectedSchema} record`,
        ...authConfig
      },
      {
        id: 4,
        name: `Update ${selectedSchema}`,
        method: 'PUT',
        path: `${basePath}/:id`,
        description: `Update existing ${selectedSchema} record`,
        ...authConfig
      },
      {
        id: 5,
        name: `Delete ${selectedSchema}`,
        method: 'DELETE',
        path: `${basePath}/:id`,
        description: `Delete ${selectedSchema} record`,
        ...authConfig
      }
    ];

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

  const handleAddCustomEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.path) return;
    
    const endpoint = {
      id: Date.now(),
      ...newEndpoint,
      path: `/api/${selectedSchema.toLowerCase()}${newEndpoint.path}`
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

  const handleTestEndpoint = (endpoint) => {
    alert(`Testing ${endpoint.method} ${endpoint.path}`);
  };

  const handleDeleteEndpoint = (id, type) => {
    if (type === 'custom') {
      setCustomEndpoints(customEndpoints.filter(ep => ep.id !== id));
    }
  };

  const handleGenerateCode = async () => {
    const allEndpoints = [...generatedEndpoints, ...customEndpoints];
    
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
          <button onClick={handleGenerateCode} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
            Generate Code
          </button>
          <button onClick={() => setGeneratedEndpoints([])} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <div className="space-y-2">
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

          <button 
            onClick={generateCRUDEndpoints}
            disabled={!selectedSchema}
            className="w-full mt-4 p-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Generate CRUD Endpoints
          </button>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h4 className="font-bold mb-4 uppercase tracking-wider">Generated Endpoints</h4>
          <div className="space-y-3">
            {generatedEndpoints.map(endpoint => (
              <div key={endpoint.id} className="p-3 bg-white rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono">{endpoint.method} {endpoint.path}</span>
                  <button onClick={() => handleTestEndpoint(endpoint)} className="text-sm px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">
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
          </div>
        </div>

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
              <input 
                type="text" 
                placeholder="Path (e.g., /search)"
                value={newEndpoint.path}
                onChange={(e) => setNewEndpoint({...newEndpoint, path: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded mb-3" 
              />
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
                disabled={!newEndpoint.name || !newEndpoint.path}
                className="w-full p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Add Custom Endpoint
              </button>
            </div>

            {customEndpoints.map(endpoint => (
              <div key={endpoint.id} className="p-3 bg-white rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono">{endpoint.method} {endpoint.path}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => handleTestEndpoint(endpoint)} className="text-sm px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">
                      Test
                    </button>
                    <button onClick={() => handleDeleteEndpoint(endpoint.id, 'custom')} className="text-sm px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500">
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{endpoint.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default APIBuilder;