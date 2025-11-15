const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS setup - this allows frontend to communicate
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://your-production-domain.com'],
    credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/schema', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const storedSchemaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mongooseSchema: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const apiEndpointSchema = new mongoose.Schema({
    schemaName: { type: String, required: true },
    name: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    description: { type: String },
    authRequired: { type: Boolean, default: false },
    role: { type: String, default: 'user' },
    isCustom: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const StoredSchema = mongoose.model('StoredSchema', storedSchemaSchema);
const ApiEndpoint = mongoose.model('ApiEndpoint', apiEndpointSchema);

// Schema routes
app.post('/api/save-schema', async (req, res) => {
    try {
        const { name, mongooseSchema } = req.body;
        
        if (!name || !mongooseSchema) {
            return res.status(400).json({ error: 'Name and Mongoose schema are required' });
        }

        const schema = new StoredSchema({
            name,
            mongooseSchema
        });

        await schema.save();
        res.json({ 
            message: 'Schema saved successfully', 
            id: schema._id 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/schemas', async (req, res) => {
    try {
        const schemas = await StoredSchema.find().sort({ createdAt: -1 });
        res.json(schemas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/schema/:id', async (req, res) => {
    try {
        const schema = await StoredSchema.findById(req.params.id);
        if (!schema) {
            return res.status(404).json({ error: 'Schema not found' });
        }
        res.json(schema);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/schema/:id', async (req, res) => {
    try {
        const schema = await StoredSchema.findByIdAndDelete(req.params.id);
        if (!schema) {
            return res.status(404).json({ error: 'Schema not found' });
        }
        res.json({ message: 'Schema deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API Endpoints routes
app.post('/api/endpoints', async (req, res) => {
    try {
        const { schemaName, endpoints } = req.body;
        
        if (!schemaName || !endpoints || !Array.isArray(endpoints)) {
            return res.status(400).json({ error: 'Schema name and endpoints array are required' });
        }

        // Delete existing endpoints for this schema
        await ApiEndpoint.deleteMany({ schemaName });

        // Insert new endpoints
        const endpointsWithSchema = endpoints.map(endpoint => ({
            ...endpoint,
            schemaName
        }));

        const savedEndpoints = await ApiEndpoint.insertMany(endpointsWithSchema);
        res.json({ 
            message: 'Endpoints saved successfully', 
            count: savedEndpoints.length 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/endpoints/:schemaName', async (req, res) => {
    try {
        const { schemaName } = req.params;
        const endpoints = await ApiEndpoint.find({ schemaName }).sort({ createdAt: -1 });
        res.json(endpoints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/endpoints/:id', async (req, res) => {
    try {
        const { enabled } = req.body;
        const endpoint = await ApiEndpoint.findByIdAndUpdate(
            req.params.id, 
            { enabled }, 
            { new: true }
        );
        
        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint not found' });
        }
        res.json(endpoint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/endpoints/:id', async (req, res) => {
    try {
        const endpoint = await ApiEndpoint.findByIdAndDelete(req.params.id);
        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint not found' });
        }
        res.json({ message: 'Endpoint deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/endpoints/schema/:schemaName', async (req, res) => {
    try {
        const { schemaName } = req.params;
        const result = await ApiEndpoint.deleteMany({ schemaName });
        res.json({ 
            message: `All endpoints for ${schemaName} deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});