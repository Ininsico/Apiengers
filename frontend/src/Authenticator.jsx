// Authentication.jsx - FIXED VERSION THAT USES YOUR BACKEND
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
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // Fetch schemas from YOUR backend
  const fetchSchemas = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/schemas');
      const data = await response.json();
      setSchemas(data);
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
      alert('Failed to connect to backend. Make sure server.js is running on port 5000');
    } finally {
      setLoading(false);
    }
  };

  // Save auth schema to YOUR backend
  const saveAuthSchema = async (schemaName, schemaCode) => {
    try {
      const response = await fetch('http://localhost:5000/api/save-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: schemaName,
          mongooseSchema: schemaCode
        })
      });
      
      const result = await response.json();
      if (result.message) {
        alert(`✅ Schema "${schemaName}" saved successfully! ID: ${result.id}`);
        fetchSchemas(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to save schema:', error);
      alert('❌ Failed to save schema - Check server connection');
    }
  };

  // Delete schema from YOUR backend
  const deleteSchema = async (schemaId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/schema/${schemaId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.message) {
        alert('✅ Schema deleted successfully!');
        fetchSchemas(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to delete schema:', error);
      alert('❌ Failed to delete schema');
    }
  };

  // Generate authentication code using YOUR existing schemas
  const generateAuthCodeFromSchemas = () => {
    // Find user-related schemas
    const userSchemas = schemas.filter(schema => 
      schema.name.toLowerCase().includes('user') || 
      schema.name.toLowerCase().includes('auth')
    );

    if (userSchemas.length === 0) {
      return "// No user/auth schemas found. Create a user schema first.";
    }

    // Use the actual schema data from YOUR database
    const userSchema = userSchemas[0].mongooseSchema;

    const authCode = `
// AUTHENTICATION SYSTEM GENERATED FROM YOUR SCHEMAS
// Using schema: ${userSchemas[0].name}

// 1. USER MODEL (From your database)
${userSchema}

// 2. AUTHENTICATION CONTROLLER
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthController {
  // Register user
  async register(req, res) {
    try {
      const { email, password, username } = req.body;
      
      // Check if user exists using your schema
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user using your schema
      const user = new User({ 
        email, 
        password: hashedPassword, 
        username,
        role: 'user',
        isVerified: false
      });
      
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

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
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user using your schema
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

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
  }
}

module.exports = new AuthController();

// 3. PROTECTED ROUTE MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// 4. ROUTES SETUP
const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route example
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
    `;

    return authCode;
  };

  // Handle saving the generated authentication system
  const handleSaveAuthSystem = () => {
    const authCode = generateAuthCodeFromSchemas();
    const schemaName = `Authentication_System_${new Date().toISOString()}`;
    saveAuthSchema(schemaName, authCode);
    setGeneratedCode(authCode);
  };

  // Load schemas when component mounts
  useEffect(() => {
    fetchSchemas();
  }, []);

  return (
    <div className="h-full bg-white">
      {/* Header Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'providers', label: 'Auth Providers', icon: SecurityIcon },
            { id: 'schemas', label: 'Your Schemas', icon: UserIcon },
            { id: 'security', label: 'Security', icon: TwoFAIcon },
            { id: 'code', label: 'Generate Auth', icon: RoleIcon }
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
              <p className="text-gray-600 mb-4">
                Configure your authentication providers. The system will use your existing schemas from the database.
              </p>
              
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
              <h3 className="text-lg font-medium mb-4">Configuration</h3>
              
              {selectedProvider === 'jwt' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">JWT Secret Key</label>
                    <input
                      type="text"
                      placeholder="Enter your JWT secret"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Token Expiry</label>
                      <select className="w-full p-2 border border-gray-300 rounded">
                        <option value="15m">15 minutes</option>
                        <option value="1h">1 hour</option>
                        <option value="24h">24 hours</option>
                        <option value="7d">7 days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Algorithm</label>
                      <select className="w-full p-2 border border-gray-300 rounded">
                        <option value="HS256">HS256</option>
                        <option value="RS256">RS256</option>
                        <option value="ES256">ES256</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* YOUR SCHEMAS TAB */}
        {activeTab === 'schemas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">📁 Your Schemas from Backend</h3>
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
                <p className="mt-2 text-gray-600">Loading schemas from backend...</p>
              </div>
            ) : schemas.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No schemas found in database.</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create schemas in the Schema Designer first, then they'll appear here.
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
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => deleteSchema(schema._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                      {schema.mongooseSchema}
                    </pre>
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
              <p className="text-gray-600 mb-4">
                This will create a complete authentication system using your existing schemas from the database.
              </p>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Available Schemas:</h4>
                {schemas.length === 0 ? (
                  <p className="text-red-500">No schemas found. Create user schemas first!</p>
                ) : (
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {schemas.map(schema => (
                      <li key={schema._id}>{schema.name}</li>
                    ))}
                  </ul>
                )}
              </div>

              <button 
                onClick={handleSaveAuthSystem}
                disabled={schemas.length === 0}
                className={`px-6 py-3 rounded font-medium ${
                  schemas.length === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {schemas.length === 0 ? 'No Schemas Available' : 'Generate & Save Auth System'}
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