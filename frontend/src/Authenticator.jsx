// Fixed Authenticator.jsx
import React, { useState, useEffect } from 'react';
import { 
  JWTIcon, 
  OAuthIcon, 
  SessionIcon, 
  APIKeyIcon, 
  GoogleIcon, 
  GitHubIcon, 
  FacebookIcon, 
  TwoFAIcon, 
  SecurityIcon,
  UserIcon,
  PasswordIcon,
  RoleIcon,
  RateLimitIcon 
} from './Svg';

const Authentication = () => {
  const [activeTab, setActiveTab] = useState('providers');
  const [selectedProvider, setSelectedProvider] = useState('jwt');
  const [schemas, setSchemas] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [authConfig, setAuthConfig] = useState({
    jwtSecret: 'your-super-secret-jwt-key-change-in-production',
    tokenExpiry: '24h',
    algorithm: 'HS256',
    enable2FA: false,
    enableRateLimit: true,
    requireEmailVerification: false
  });

  // Fetch schemas from backend
  const fetchSchemas = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/schemas');
      if (!response.ok) throw new Error('Failed to fetch schemas');
      const data = await response.json();
      setSchemas(data);
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
      alert('Failed to connect to backend. Make sure server.js is running on port 5000');
    } finally {
      setLoading(false);
    }
  };

  // Fetch endpoints for a specific schema
  const fetchEndpointsForSchema = async (schemaName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/endpoints/${schemaName}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch endpoints:', error);
      return [];
    }
  };

  // Get all endpoints from all schemas
  const fetchAllEndpoints = async () => {
    try {
      setLoading(true);
      const allEndpoints = [];
      
      // Fetch endpoints for each schema
      for (const schema of schemas) {
        const endpoints = await fetchEndpointsForSchema(schema.name);
        allEndpoints.push(...endpoints);
      }
      
      setEndpoints(allEndpoints);
    } catch (error) {
      console.error('Failed to fetch all endpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate authentication middleware code (NOT as a schema)
  const generateAuthMiddleware = () => {
    return `
// AUTHENTICATION MIDDLEWARE - GENERATED CODE
// Generated: ${new Date().toISOString()}

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || '${authConfig.jwtSecret}', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based Authorization Middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Password Hashing Utility
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Password Verification Utility
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || '${authConfig.jwtSecret}',
    { expiresIn: '${authConfig.tokenExpiry}' }
  );
};

module.exports = {
  authenticateToken,
  authorizeRole,
  hashPassword,
  verifyPassword,
  generateToken
};
    `;
  };

  // Generate complete authentication routes
  const generateAuthRoutes = () => {
    const userSchemas = schemas.filter(schema => 
      schema.name.toLowerCase().includes('user') || 
      schema.name.toLowerCase().includes('auth')
    );

    if (userSchemas.length === 0) {
      return {
        code: "// No user/auth schemas found. Create a user schema first.",
        endpoints: []
      };
    }

    const userSchemaName = userSchemas[0].name;

    const authEndpoints = [
      {
        name: 'User Registration',
        method: 'POST',
        path: `/api/auth/register`,
        description: 'Register a new user account',
        authRequired: false,
        role: 'public',
        isCustom: true,
        enabled: true
      },
      {
        name: 'User Login',
        method: 'POST',
        path: `/api/auth/login`,
        description: 'Login user and get JWT token',
        authRequired: false,
        role: 'public',
        isCustom: true,
        enabled: true
      },
      {
        name: 'Get User Profile',
        method: 'GET',
        path: `/api/auth/profile`,
        description: 'Get current user profile (protected)',
        authRequired: true,
        role: 'user',
        isCustom: true,
        enabled: true
      },
      {
        name: 'Update User Profile',
        method: 'PUT',
        path: `/api/auth/profile`,
        description: 'Update user profile (protected)',
        authRequired: true,
        role: 'user',
        isCustom: true,
        enabled: true
      }
    ];

    const authCode = `
// COMPLETE AUTHENTICATION ROUTES
// Using schema: ${userSchemaName}
// Generated: ${new Date().toISOString()}

const express = require('express');
const router = express.Router();
const { 
  authenticateToken, 
  authorizeRole, 
  hashPassword, 
  verifyPassword, 
  generateToken 
} = require('./authMiddleware');
const ${userSchemaName} = require('../models/${userSchemaName}');

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await ${userSchemaName}.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = new ${userSchemaName}({ 
      email, 
      password: hashedPassword, 
      username: username || email.split('@')[0],
      firstName,
      lastName,
      role: 'user',
      isVerified: false,
      createdAt: new Date()
    });
    
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id, 
      email: user.email, 
      role: user.role 
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await ${userSchemaName}.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({
      userId: user._id, 
      email: user.email, 
      role: user.role 
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Profile (Protected)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await ${userSchemaName}.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Profile (Protected)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body;
    const user = await ${userSchemaName}.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (username) user.username = username;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
    `;

    return { 
      middleware: generateAuthMiddleware(),
      routes: authCode, 
      endpoints: authEndpoints 
    };
  };

  // Save authentication endpoints to a specific schema
  const saveAuthEndpoints = async (endpoints) => {
    try {
      // Use the first user schema or create a generic auth schema
      const userSchemas = schemas.filter(s => s.name.toLowerCase().includes('user'));
      const schemaName = userSchemas.length > 0 ? userSchemas[0].name : 'Authentication';
      
      const response = await fetch('http://localhost:5000/api/endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schemaName: schemaName,
          endpoints: endpoints
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.count} authentication endpoints saved!`);
        fetchAllEndpoints();
        return true;
      } else {
        const error = await response.json();
        alert(`❌ Failed to save endpoints: ${error.error}`);
        return false;
      }
    } catch (error) {
      console.error('Failed to save endpoints:', error);
      alert('❌ Failed to save authentication endpoints');
      return false;
    }
  };

  // Handle generating the complete authentication system
  const handleGenerateAuthSystem = async () => {
    const { middleware, routes, endpoints } = generateAuthRoutes();
    
    if (endpoints.length > 0) {
      // Save the authentication endpoints
      const saved = await saveAuthEndpoints(endpoints);
      
      if (saved) {
        // Combine middleware and routes for display
        const completeCode = `// AUTH MIDDLEWARE\n${middleware}\n\n// AUTH ROUTES\n${routes}`;
        setGeneratedCode(completeCode);
        alert('✅ Authentication system generated successfully!');
      }
    } else {
      setGeneratedCode("// No user schemas found to generate authentication system");
      alert('❌ No user schemas found. Create a user schema first.');
    }
  };

  // Update existing endpoints with authentication
  const updateEndpointsWithAuth = async () => {
    if (endpoints.length === 0) {
      alert('No endpoints found to update');
      return;
    }

    try {
      // Group endpoints by schema name for batch updates
      const endpointsBySchema = {};
      endpoints.forEach(endpoint => {
        if (!endpointsBySchema[endpoint.schemaName]) {
          endpointsBySchema[endpoint.schemaName] = [];
        }
        endpointsBySchema[endpoint.schemaName].push({
          ...endpoint,
          authRequired: shouldProtectEndpoint(endpoint),
          role: shouldProtectEndpoint(endpoint) ? 'user' : endpoint.role
        });
      });

      // Update each schema's endpoints
      let totalUpdated = 0;
      for (const [schemaName, schemaEndpoints] of Object.entries(endpointsBySchema)) {
        const response = await fetch('http://localhost:5000/api/endpoints', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            schemaName: schemaName,
            endpoints: schemaEndpoints
          })
        });

        if (response.ok) {
          const result = await response.json();
          totalUpdated += result.count;
        }
      }

      if (totalUpdated > 0) {
        alert(`✅ ${totalUpdated} endpoints updated with authentication rules!`);
        fetchAllEndpoints();
      }
    } catch (error) {
      console.error('Failed to update endpoints:', error);
      alert('❌ Failed to update endpoints with authentication');
    }
  };

  // Helper function to determine if endpoint should be protected
  const shouldProtectEndpoint = (endpoint) => {
    return (
      endpoint.path.includes('/api/') && 
      !endpoint.path.includes('/auth/') &&
      !endpoint.path.includes('/public/') &&
      endpoint.method !== 'GET' // Only protect non-GET endpoints by default
    );
  };

  // Load data when component mounts or schemas change
  useEffect(() => {
    fetchSchemas();
  }, []);

  useEffect(() => {
    if (schemas.length > 0) {
      fetchAllEndpoints();
    }
  }, [schemas]);

  return (
    <div className="h-full bg-white">
      {/* Header Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'providers', label: 'Auth Providers', icon: SecurityIcon },
            { id: 'schemas', label: 'Your Schemas', icon: UserIcon },
            { id: 'endpoints', label: 'API Endpoints', icon: RoleIcon },
            { id: 'code', label: 'Generate Auth', icon: PasswordIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon />
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 h-[calc(100vh-200px)] overflow-y-auto">
        {/* AUTH PROVIDERS TAB */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">🔐 Authentication Setup</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'jwt', label: 'JWT', icon: JWTIcon, description: 'JSON Web Tokens' },
                  { id: 'oauth', label: 'OAuth 2.0', icon: OAuthIcon, description: 'Social Login' },
                  { id: 'session', label: 'Session', icon: SessionIcon, description: 'Cookie-based' },
                  { id: 'apikey', label: 'API Keys', icon: APIKeyIcon, description: 'Server-to-server' }
                ].map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedProvider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <provider.icon />
                      <span className="ml-2 font-medium">{provider.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">JWT Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">JWT Secret Key</label>
                  <input
                    type="text"
                    value={authConfig.jwtSecret}
                    onChange={(e) => setAuthConfig({...authConfig, jwtSecret: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">Change this in production!</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Token Expiry</label>
                    <select 
                      value={authConfig.tokenExpiry}
                      onChange={(e) => setAuthConfig({...authConfig, tokenExpiry: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="15m">15 minutes</option>
                      <option value="1h">1 hour</option>
                      <option value="24h">24 hours</option>
                      <option value="7d">7 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Algorithm</label>
                    <select 
                      value={authConfig.algorithm}
                      onChange={(e) => setAuthConfig({...authConfig, algorithm: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="HS256">HS256</option>
                      <option value="RS256">RS256</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YOUR SCHEMAS TAB */}
        {activeTab === 'schemas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">📁 Your Schemas</h3>
              <button 
                onClick={fetchSchemas}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Schemas
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading schemas...</p>
              </div>
            ) : schemas.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No schemas found.</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create schemas in the Schema Designer first.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {schemas.map(schema => (
                  <div key={schema._id} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{schema.name}</h4>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(schema.createdAt).toLocaleDateString()}
                        </p>
                        {schema.name.toLowerCase().includes('user') && (
                          <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            User Schema
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API ENDPOINTS TAB */}
        {activeTab === 'endpoints' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">🔌 API Endpoints</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={updateEndpointsWithAuth}
                  disabled={endpoints.length === 0}
                  className={`px-4 py-2 rounded ${
                    endpoints.length === 0 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  Add Auth to Endpoints
                </button>
                <button 
                  onClick={fetchAllEndpoints}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Refresh Endpoints
                </button>
              </div>
            </div>

            {endpoints.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No endpoints found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {endpoints.map(endpoint => (
                  <div key={endpoint._id} className={`bg-white border rounded-lg p-4 ${
                    endpoint.authRequired ? 'border-l-4 border-l-green-500' : ''
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                            endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                            endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                            endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {endpoint.method}
                          </span>
                          <h4 className="font-medium">{endpoint.name}</h4>
                          {endpoint.authRequired && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              🔒 Protected
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{endpoint.path}</p>
                        <p className="text-xs text-gray-500 mt-1">Schema: {endpoint.schemaName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GENERATE AUTH TAB */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">🚀 Generate Authentication System</h3>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Available User Schemas:</h4>
                {schemas.filter(s => s.name.toLowerCase().includes('user')).length === 0 ? (
                  <p className="text-red-500">No user schemas found. Create a user schema first!</p>
                ) : (
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {schemas.filter(s => s.name.toLowerCase().includes('user')).map(schema => (
                      <li key={schema._id} className="text-green-600 font-medium">
                        {schema.name} (will be used for authentication)
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button 
                onClick={handleGenerateAuthSystem}
                disabled={schemas.filter(s => s.name.toLowerCase().includes('user')).length === 0}
                className={`px-6 py-3 rounded font-medium ${
                  schemas.filter(s => s.name.toLowerCase().includes('user')).length === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {schemas.filter(s => s.name.toLowerCase().includes('user')).length === 0 
                  ? 'No User Schemas Available' 
                  : 'Generate Authentication System'}
              </button>
            </div>

            {generatedCode && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Generated Authentication Code</h3>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-96">
                  <pre>{generatedCode}</pre>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button 
                    onClick={() => navigator.clipboard.writeText(generatedCode)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Authentication;