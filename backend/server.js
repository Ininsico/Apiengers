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

const StoredSchema = mongoose.model('StoredSchema', storedSchemaSchema);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});