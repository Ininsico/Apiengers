import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  PlusIcon, 
  TrashIcon, 
  GenerateIcon, 
  CopyIcon, 
  DownloadIcon,
  FieldIcon,
  TableIcon,
  CloseIcon,
  KeyIcon,
  RequiredIcon,
  EditIcon,
  RelationshipIcon,
  SaveIcon
} from './Svg';

// API config
const API_BASE_URL = 'https://apivengers.onrender.com/api';

// API functions
const saveSchemaToDB = async (name, mongooseSchema) => {
  const response = await fetch(`${API_BASE_URL}/save-schema`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mongooseSchema })
  });
  return await response.json();
};

const getSchemasFromDB = async () => {
  const response = await fetch(`${API_BASE_URL}/schemas`);
  return await response.json();
};

const deleteSchemaFromDB = async (id) => {
  const response = await fetch(`${API_BASE_URL}/schema/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
};

// Entity Node Component
const EntityNode = ({ data, selected }) => {
  const handleEditField = (index) => {
    if (data.onEditField) {
      data.onEditField(index);
    }
  };

  const handleDeleteField = (index) => {
    if (data.onDeleteField) {
      data.onDeleteField(index);
    }
  };

  return (
    <div className={`bg-white border-2 ${selected ? 'border-blue-500 shadow-xl' : 'border-gray-300 shadow-lg'} rounded-lg p-0 min-w-[280px] max-w-[400px] transition-all duration-200`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <div className="bg-gray-900 text-white px-4 py-3 rounded-t-lg border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg tracking-tight">{data.label}</h3>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">Entity</span>
        </div>
      </div>
      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
        {data.fields.map((field, index) => (
          <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded border border-gray-200 group hover:bg-gray-100">
            <div className="flex items-center space-x-2 flex-1">
              {field.primaryKey && <KeyIcon className="w-3 h-3 text-yellow-600" />}
              {field.required && !field.primaryKey && <RequiredIcon className="w-3 h-3 text-red-500" />}
              {field.isReference && <RelationshipIcon className="w-3 h-3 text-purple-600" />}
              <span className="font-medium text-gray-900">{field.name}</span>
              {field.referenceTo && (
                <span className="text-xs text-purple-600 bg-purple-100 px-1 rounded">→ {field.referenceTo}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEditField(index)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Edit field"
              >
                <EditIcon className="w-3 h-3 text-gray-600" />
              </button>
              <button 
                onClick={() => handleDeleteField(index)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Delete field"
              >
                <TrashIcon className="w-3 h-3 text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {data.fields.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-2">No fields added</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </div>
  );
};

const nodeTypes = { entity: EntityNode };
const initialNodes = [];
const initialEdges = [];

const FIELD_TYPES = ['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Array', 'Object', 'Buffer', 'Mixed', 'Decimal128', 'Map'];
const RELATIONSHIP_TYPES = [
  { value: 'one-to-one', label: 'One-to-One' },
  { value: 'one-to-many', label: 'One-to-Many' },
  { value: 'many-to-one', label: 'Many-to-One' },
  { value: 'many-to-many', label: 'Many-to-Many' }
];

const SchemaDesigner = () => {
  // State
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [newEntityName, setNewEntityName] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [mongoSchema, setMongoSchema] = useState('');
  const [savedSchemas, setSavedSchemas] = useState([]);
  
  // Modals
  const [fieldModal, setFieldModal] = useState({ open: false, entityId: null, fieldIndex: null });
  const [relationshipModal, setRelationshipModal] = useState({ open: false, sourceEntity: null, targetEntity: null });
  const [saveModal, setSaveModal] = useState({ open: false, schemaName: '' });
  const [exportModal, setExportModal] = useState({ open: false, fileName: '' });
  
  // Form data
  const [newField, setNewField] = useState({ 
    name: '', type: 'String', required: false, primaryKey: false, unique: false,
    trim: false, lowercase: false, uppercase: false, minlength: '', maxlength: '',
    min: '', max: '', defaultValue: '', isReference: false, referenceTo: '', referenceType: ''
  });
  
  const [newRelationship, setNewRelationship] = useState({
    type: 'one-to-many', sourceField: '', targetField: '', cascade: false
  });

  // Fix: Stable callback functions for node actions
  const openEditFieldModal = useCallback((entityId, fieldIndex) => {
    const entity = nodes.find(node => node.id === entityId);
    if (entity && entity.data.fields[fieldIndex]) {
      setFieldModal({ open: true, entityId, fieldIndex });
      setNewField({ ...entity.data.fields[fieldIndex] });
    }
  }, [nodes]);

  const deleteField = useCallback((entityId, fieldIndex) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === entityId ? {
          ...node,
          data: {
            ...node.data,
            fields: node.data.fields.filter((_, index) => index !== fieldIndex)
          }
        } : node
      )
    );
  }, [setNodes]);

  // Fix: Proper node creation with stable callbacks
  const createNodeWithCallbacks = useCallback((id, label, fields = []) => ({
    id,
    type: 'entity',
    position: { x: Math.random() * 500, y: Math.random() * 400 },
    data: { 
      label,
      fields,
      onEditField: (fieldIndex) => openEditFieldModal(id, fieldIndex),
      onDeleteField: (fieldIndex) => deleteField(id, fieldIndex)
    }
  }), [openEditFieldModal, deleteField]);

  // Entity management
  const addNewEntity = () => {
    if (!newEntityName.trim()) return;
    const entityId = `entity-${Date.now()}`;
    const newNode = createNodeWithCallbacks(entityId, newEntityName);
    setNodes((nds) => [...nds, newNode]);
    setNewEntityName('');
    setSelectedNode(entityId);
  };

  const deleteSelectedEntity = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode && edge.target !== selectedNode));
    setSelectedNode(null);
  };

  // Field management
  const openAddFieldModal = (entityId) => {
    setFieldModal({ open: true, entityId, fieldIndex: null });
    setNewField({ 
      name: '', type: 'String', required: false, primaryKey: false, unique: false,
      trim: false, lowercase: false, uppercase: false, minlength: '', maxlength: '',
      min: '', max: '', defaultValue: '', isReference: false, referenceTo: '', referenceType: ''
    });
  };

  const saveField = () => {
    if (!fieldModal.entityId || !newField.name.trim()) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === fieldModal.entityId) {
          const updatedFields = [...node.data.fields];
          if (fieldModal.fieldIndex !== null) {
            updatedFields[fieldModal.fieldIndex] = { ...newField };
          } else {
            updatedFields.push({ ...newField });
          }
          return createNodeWithCallbacks(node.id, node.data.label, updatedFields);
        }
        return node;
      })
    );
    setFieldModal({ open: false, entityId: null, fieldIndex: null });
  };

  // Relationship management
  const onConnect = useCallback((params) => {
    const sourceEntity = nodes.find(node => node.id === params.source);
    const targetEntity = nodes.find(node => node.id === params.target);
    
    if (sourceEntity && targetEntity) {
      setRelationshipModal({
        open: true,
        sourceEntity: params.source,
        targetEntity: params.target
      });
      setNewRelationship({
        type: 'one-to-many',
        sourceField: `${targetEntity.data.label.toLowerCase()}Id`,
        targetField: `${sourceEntity.data.label.toLowerCase()}Id`,
        cascade: false
      });
    }
  }, [nodes]);

  const createRelationship = () => {
    if (!relationshipModal.sourceEntity || !relationshipModal.targetEntity) return;

    const sourceNode = nodes.find(node => node.id === relationshipModal.sourceEntity);
    const targetNode = nodes.find(node => node.id === relationshipModal.targetEntity);
    if (!sourceNode || !targetNode) return;

    // Update nodes with reference fields
    const updatedNodes = nodes.map(node => {
      if (node.id === relationshipModal.sourceEntity) {
        const newRefField = {
          name: newRelationship.sourceField,
          type: newRelationship.type === 'many-to-many' ? 'Array' : 'ObjectId',
          required: true,
          isReference: true,
          referenceTo: targetNode.data.label,
          referenceType: newRelationship.type
        };
        return createNodeWithCallbacks(node.id, node.data.label, [...node.data.fields, newRefField]);
      }
      return node;
    });

    setNodes(updatedNodes);

    // Add visual edge
    const newEdge = {
      id: `edge-${relationshipModal.sourceEntity}-${relationshipModal.targetEntity}-${Date.now()}`,
      source: relationshipModal.sourceEntity,
      target: relationshipModal.targetEntity,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8b5cf6' },
      label: newRelationship.type
    };

    setEdges((eds) => [...eds, newEdge]);
    setRelationshipModal({ open: false, sourceEntity: null, targetEntity: null });
  };

  // Schema generation
  const generateMongoSchema = () => {
    if (nodes.length === 0) {
      setMongoSchema('// No entities to generate schema from');
      return;
    }

    const schemas = nodes.map(node => {
      const fields = node.data.fields.map(field => {
        let fieldDef = `    ${field.name}: { \n      type: ${field.type === 'ObjectId' ? 'mongoose.Schema.Types.ObjectId' : field.type}`;
        
        if (field.required) fieldDef += `,\n      required: true`;
        if (field.unique) fieldDef += `,\n      unique: true`;
        if (field.isReference) fieldDef += `,\n      ref: '${field.referenceTo}'`;
        
        if (field.defaultValue) {
          let defaultValue = field.defaultValue;
          if (field.type === 'Boolean') defaultValue = field.defaultValue === 'true';
          else if (field.type === 'Number') defaultValue = parseFloat(field.defaultValue) || 0;
          fieldDef += `,\n      default: ${defaultValue}`;
        }

        if (field.type === 'String') {
          if (field.trim) fieldDef += `,\n      trim: true`;
          if (field.lowercase) fieldDef += `,\n      lowercase: true`;
          if (field.uppercase) fieldDef += `,\n      uppercase: true`;
          if (field.minlength) fieldDef += `,\n      minlength: ${field.minlength}`;
          if (field.maxlength) fieldDef += `,\n      maxlength: ${field.maxlength}`;
        }

        if (field.type === 'Number') {
          if (field.min !== '') fieldDef += `,\n      min: ${field.min}`;
          if (field.max !== '') fieldDef += `,\n      max: ${field.max}`;
        }
        
        fieldDef += '\n    }';
        return fieldDef;
      }).join(',\n');

      return `const ${node.data.label.toLowerCase()}Schema = new mongoose.Schema({\n${fields}\n});\n\nconst ${node.data.label} = mongoose.model('${node.data.label}', ${node.data.label.toLowerCase()}Schema);`;
    }).join('\n\n');

    setMongoSchema(`const mongoose = require('mongoose');\n\n${schemas}`);
  };

  // Database operations
  const handleSaveToDatabase = () => {
    if (!mongoSchema) {
      alert('Generate schema first!');
      return;
    }
    setSaveModal({ open: true, schemaName: '' });
  };

  const confirmSaveToDatabase = async () => {
    if (!saveModal.schemaName.trim()) {
      alert('Enter a schema name!');
      return;
    }
    try {
      await saveSchemaToDB(saveModal.schemaName, mongoSchema);
      alert('Schema saved to database successfully!');
      setSaveModal({ open: false, schemaName: '' });
      loadSavedSchemas();
    } catch (error) {
      alert('Failed to save schema: ' + error.message);
    }
  };

  const loadSavedSchemas = async () => {
    try {
      const schemas = await getSchemasFromDB();
      setSavedSchemas(schemas);
    } catch (error) {
      console.error('Error loading schemas:', error);
    }
  };

  const handleDeleteSchema = async (id) => {
    if (!confirm('Are you sure you want to delete this schema?')) return;
    try {
      await deleteSchemaFromDB(id);
      loadSavedSchemas();
    } catch (error) {
      alert('Failed to delete schema: ' + error.message);
    }
  };

  const handleLoadSchema = async (schema) => {
    setMongoSchema(schema.mongooseSchema);
    alert(`Schema "${schema.name}" loaded!`);
  };

  // Export operations
  const handleExportSchema = () => {
    if (!mongoSchema) {
      alert('Generate schema first!');
      return;
    }
    setExportModal({ open: true, fileName: 'mongodb-schema' });
  };

  const confirmExportSchema = () => {
    if (!exportModal.fileName.trim()) {
      alert('Enter a file name!');
      return;
    }
    const blob = new Blob([mongoSchema], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportModal.fileName}.js`;
    a.click();
    URL.revokeObjectURL(url);
    setExportModal({ open: false, fileName: '' });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mongoSchema);
  };

  const downloadSchema = () => {
    const blob = new Blob([mongoSchema], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mongodb-schemas.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setMongoSchema('');
  };

  // Field options renderer
  const renderFieldOptions = () => {
    switch (newField.type) {
      case 'String':
        return (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={newField.trim} onChange={(e) => setNewField({...newField, trim: e.target.checked})} className="rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500" />
              <span className="text-sm text-gray-300">Trim</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={newField.lowercase} onChange={(e) => setNewField({...newField, lowercase: e.target.checked})} className="rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500" />
              <span className="text-sm text-gray-300">Lowercase</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Min Length</label>
              <input type="number" value={newField.minlength} onChange={(e) => setNewField({...newField, minlength: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-blue-500" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Max Length</label>
              <input type="number" value={newField.maxlength} onChange={(e) => setNewField({...newField, maxlength: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-blue-500" placeholder="Optional" />
            </div>
          </div>
        );
      case 'Number':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Min Value</label>
              <input type="number" value={newField.min} onChange={(e) => setNewField({...newField, min: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-blue-500" placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Max Value</label>
              <input type="number" value={newField.max} onChange={(e) => setNewField({...newField, max: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white focus:outline-none focus:border-blue-500" placeholder="Optional" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Load saved schemas on mount
  useEffect(() => {
    loadSavedSchemas();
  }, []);

  return (
    <div className="flex h-full bg-black text-white">
      {/* Left Panel */}
      <div className="w-80 bg-gray-900 border-r border-gray-700 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Schema Designer</h3>
          <TableIcon className="w-6 h-6 text-blue-400" />
        </div>
        
        {/* Create Entity */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">Create New Entity</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              placeholder="Enter entity name..."
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addNewEntity()}
            />
            <button onClick={addNewEntity} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-1 border border-gray-600">
              <PlusIcon className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-6">
          <button onClick={() => selectedNode && openAddFieldModal(selectedNode)} disabled={!selectedNode} className={`w-full py-3 px-4 rounded-lg text-left font-medium transition-colors duration-200 flex items-center space-x-3 ${!selectedNode ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'}`}>
            <FieldIcon className="w-5 h-5" />
            <span>Add Field</span>
          </button>
          
          <button onClick={deleteSelectedEntity} disabled={!selectedNode} className={`w-full py-3 px-4 rounded-lg text-left font-medium transition-colors duration-200 flex items-center space-x-3 ${!selectedNode ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'}`}>
            <TrashIcon className="w-5 h-5" />
            <span>Delete Entity</span>
          </button>
          
          <button onClick={generateMongoSchema} disabled={nodes.length === 0} className={`w-full py-3 px-4 rounded-lg text-left font-medium transition-colors duration-200 flex items-center space-x-3 ${nodes.length === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'}`}>
            <GenerateIcon className="w-5 h-5" />
            <span>Generate Schema</span>
          </button>

          <button onClick={handleSaveToDatabase} disabled={!mongoSchema} className={`w-full py-3 px-4 rounded-lg text-left font-medium transition-colors duration-200 flex items-center space-x-3 ${!mongoSchema ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'}`}>
            <SaveIcon className="w-5 h-5" />
            <span>Save to Database</span>
          </button>

          <button onClick={handleExportSchema} disabled={!mongoSchema} className={`w-full py-3 px-4 rounded-lg text-left font-medium transition-colors duration-200 flex items-center space-x-3 ${!mongoSchema ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'}`}>
            <DownloadIcon className="w-5 h-5" />
            <span>Export Schema</span>
          </button>
          
          <button onClick={clearAll} className="w-full py-3 px-4 rounded-lg text-left font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-200 flex items-center space-x-3 border border-gray-600">
            <TrashIcon className="w-5 h-5" />
            <span>Clear All</span>
          </button>
        </div>

        {/* Entities List */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-white">Entities</h4>
            <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-600">{nodes.length} total</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {nodes.map((node) => (
              <div key={node.id} className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${selectedNode === node.id ? 'bg-gray-700 border-gray-500 shadow-lg' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`} onClick={() => setSelectedNode(node.id)}>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{node.data.label}</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded border border-gray-600">{node.data.fields.length} fields</span>
                </div>
              </div>
            ))}
            {nodes.length === 0 && (
              <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-700 rounded-lg">
                <TableIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No entities created</p>
              </div>
            )}
          </div>
        </div>

        {/* Saved Schemas */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-white">Saved Schemas</h4>
            <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-600">{savedSchemas.length} total</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {savedSchemas.map((schema) => (
              <div key={schema._id} className="p-2 bg-gray-800 rounded border border-gray-600 flex justify-between items-center">
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{schema.name}</div>
                  <div className="text-xs text-gray-400">{new Date(schema.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => handleLoadSchema(schema)} className="p-1 hover:bg-gray-700 rounded text-blue-400" title="Load Schema">
                    <DownloadIcon className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDeleteSchema(schema._id)} className="p-1 hover:bg-gray-700 rounded text-red-400" title="Delete Schema">
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {savedSchemas.length === 0 && (
              <div className="text-center text-gray-500 py-4 text-sm border border-dashed border-gray-700 rounded">No saved schemas</div>
            )}
          </div>
        </div>

        {/* Relationships */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-white">Relationships</h4>
            <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-600">{edges.length} total</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {edges.map((edge) => {
              const sourceEntity = nodes.find(node => node.id === edge.source)?.data.label;
              const targetEntity = nodes.find(node => node.id === edge.target)?.data.label;
              return (
                <div key={edge.id} className="p-2 bg-gray-800 rounded border border-gray-600 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-xs text-purple-400">{edge.label}</div>
                    <div className="text-sm text-gray-300">{sourceEntity} → {targetEntity}</div>
                  </div>
                  <button onClick={() => setEdges((eds) => eds.filter((e) => e.id !== edge.id))} className="p-1 hover:bg-gray-700 rounded">
                    <TrashIcon className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              );
            })}
            {edges.length === 0 && (
              <div className="text-center text-gray-500 py-4 text-sm border border-dashed border-gray-700 rounded">Drag connections between entities</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative bg-gray-800 overflow-hidden">
        <ReactFlowProvider>
          <div className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNode(node.id)}
              nodeTypes={nodeTypes}
              fitView
              connectionLineStyle={{ stroke: '#8b5cf6', strokeWidth: 2 }}
            >
              <Controls className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden" showInteractive={false} />
              <MiniMap className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden" nodeColor="#4B5563" maskColor="rgba(0, 0, 0, 0.5)" position="bottom-right" />
              <Background variant="dots" gap={20} size={1} color="#374151" />
            </ReactFlow>
          </div>
        </ReactFlowProvider>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <TableIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold mb-2">No Entities Created</h3>
              <p className="text-gray-500">Start by creating your first entity in the left panel</p>
              <p className="text-gray-500 text-sm mt-2">Drag between entities to create relationships</p>
            </div>
          </div>
        )}
      </div>

      {/* Schema Panel */}
      {mongoSchema && (
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">MongoDB Schema</h3>
              <button onClick={() => setMongoSchema('')} className="text-gray-400 hover:text-white transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-800 p-4 overflow-auto max-h-96">
            <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono leading-relaxed">{mongoSchema}</pre>
          </div>
          
          <div className="p-4 border-t border-gray-700 space-y-2">
            <button onClick={copyToClipboard} className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 border border-gray-600">
              <CopyIcon className="w-4 h-4" />
              <span>Copy to Clipboard</span>
            </button>
            <button onClick={downloadSchema} className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 border border-gray-600">
              <DownloadIcon className="w-4 h-4" />
              <span>Download Schema</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Save Modal */}
      {saveModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Save Schema to Database</h3>
              <button onClick={() => setSaveModal({ open: false, schemaName: '' })} className="text-gray-400 hover:text-white transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Schema Name</label>
                <input type="text" value={saveModal.schemaName} onChange={(e) => setSaveModal({...saveModal, schemaName: e.target.value})} placeholder="Enter schema name..." className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" onKeyPress={(e) => e.key === 'Enter' && confirmSaveToDatabase()} />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setSaveModal({ open: false, schemaName: '' })} className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 border border-gray-600">Cancel</button>
              <button onClick={confirmSaveToDatabase} disabled={!saveModal.schemaName.trim()} className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${!saveModal.schemaName.trim() ? 'bg-gray-700 cursor-not-allowed border border-gray-600' : 'bg-blue-600 hover:bg-blue-700 border border-blue-600'}`}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Export Schema as JS File</h3>
              <button onClick={() => setExportModal({ open: false, fileName: '' })} className="text-gray-400 hover:text-white transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">File Name</label>
                <input type="text" value={exportModal.fileName} onChange={(e) => setExportModal({...exportModal, fileName: e.target.value})} placeholder="Enter file name..." className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" onKeyPress={(e) => e.key === 'Enter' && confirmExportSchema()} />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setExportModal({ open: false, fileName: '' })} className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200 border border-gray-600">Cancel</button>
              <button onClick={confirmExportSchema} disabled={!exportModal.fileName.trim()} className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${!exportModal.fileName.trim() ? 'bg-gray-700 cursor-not-allowed border border-gray-600' : 'bg-green-600 hover:bg-green-700 border border-green-600'}`}>Export</button>
            </div>
          </div>
        </div>
      )}

      {/* Field Modal */}
      {fieldModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{fieldModal.fieldIndex !== null ? 'Edit Field' : 'Add New Field'}</h3>
              <button onClick={() => setFieldModal({ open: false, entityId: null, fieldIndex: null })} className="text-gray-400 hover:text-white transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Field Name</label>
                  <input type="text" value={newField.name} onChange={(e) => setNewField({...newField, name: e.target.value})} placeholder="e.g., email, username, age" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Field Type</label>
                  <select value={newField.type} onChange={(e) => setNewField({...newField, type: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    {FIELD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Default Value (Optional)</label>
                <input type="text" value={newField.defaultValue} onChange={(e) => setNewField({...newField, defaultValue: e.target.value})} placeholder="e.g., Date.now, false, 0, 'default'" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              {renderFieldOptions()}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={newField.required} onChange={(e) => setNewField({...newField, required: e.target.checked})} className="rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500" />
                  <RequiredIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Required</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={newField.unique} onChange={(e) => setNewField({...newField, unique: e.target.checked})} className="rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500" />
                  <KeyIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Unique</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={newField.primaryKey} onChange={(e) => setNewField({...newField, primaryKey: e.target.checked})} className="rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500" />
                  <KeyIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Primary Key</span>
                </label>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={saveField} disabled={!newField.name.trim()} className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${!newField.name.trim() ? 'bg-gray-700 cursor-not-allowed border border-gray-600' : 'bg-gray-800 hover:bg-gray-700 border border-gray-600'}`}>
                <PlusIcon className="w-4 h-4" />
                <span>{fieldModal.fieldIndex !== null ? 'Update Field' : 'Add Field'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relationship Modal */}
      {relationshipModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Create Relationship</h3>
              <button onClick={() => setRelationshipModal({ open: false, sourceEntity: null, targetEntity: null })} className="text-gray-400 hover:text-white transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Relationship Type</label>
                <select value={newRelationship.type} onChange={(e) => setNewRelationship({...newRelationship, type: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                  {RELATIONSHIP_TYPES.map(rel => <option key={rel.value} value={rel.value}>{rel.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Reference Field Name</label>
                <input type="text" value={newRelationship.sourceField} onChange={(e) => setNewRelationship({...newRelationship, sourceField: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Field name for reference" />
              </div>
              <div className="text-sm text-gray-400">
                <p>This will create a reference field in the source entity that points to the target entity.</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={createRelationship} className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors duration-200">Create Relationship</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaDesigner;