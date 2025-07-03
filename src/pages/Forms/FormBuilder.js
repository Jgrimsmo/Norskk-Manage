import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { CONDITIONS, APPROVAL_STATUS, WEATHER_OPTIONS, FORM_FIELD_TYPES } from '../../lib/constants/appConstants';
import '../../styles/page.css';
import './FormBuilder.css';

// Use constants from our centralized file with additional specific ones
const FIELD_TYPES = {
  ...FORM_FIELD_TYPES,
  TIME: 'time',
  PHONE: 'phone',
  FILE: 'file',
  DIVIDER: 'divider'
};

const SAMPLE_FORMS = [
  {
    id: '1',
    name: 'Daily Site Report',
    description: 'Standard daily progress and safety report',
    category: 'Reports',
    created: '2025-01-15',
    fields: [
      { id: '1', type: 'heading', label: 'Site Information', required: false },
      { id: '2', type: 'text', label: 'Project Name', required: true },
      { id: '3', type: 'date', label: 'Date', required: true },
      { id: '4', type: 'select', label: 'Weather', required: true, options: WEATHER_OPTIONS.map(w => w.value) },
      { id: '5', type: 'heading', label: 'Work Progress', required: false },
      { id: '6', type: 'textarea', label: 'Work Completed Today', required: true },
      { id: '7', type: 'textarea', label: 'Work Planned for Tomorrow', required: true },
      { id: '8', type: 'number', label: 'Total Workers on Site', required: true },
      { id: '9', type: 'heading', label: 'Safety & Issues', required: false },
      { id: '10', type: 'textarea', label: 'Safety Incidents/Near Misses', required: false },
      { id: '11', type: 'textarea', label: 'Issues or Delays', required: false },
      { id: '12', type: 'signature', label: 'Supervisor Signature', required: true }
    ]
  },
  {
    id: '2',
    name: 'Equipment Inspection',
    description: 'Pre-use equipment safety inspection',
    category: 'Safety',
    created: '2025-01-12',
    fields: [
      { id: '1', type: 'text', label: 'Equipment ID', required: true },
      { id: '2', type: 'select', label: 'Equipment Type', required: true, options: ['Excavator', 'Bulldozer', 'Crane', 'Truck', 'Other'] },
      { id: '3', type: 'date', label: 'Inspection Date', required: true },
      { id: '4', type: 'text', label: 'Inspector Name', required: true },
      { id: '5', type: 'radio', label: 'Overall Condition', required: true, options: Object.values(CONDITIONS) },
      { id: '6', type: 'checkbox', label: 'Safety Features Checked', required: true, options: ['Brakes', 'Lights', 'Horn', 'Emergency Stop', 'Seatbelt'] },
      { id: '7', type: 'textarea', label: 'Issues Found', required: false },
      { id: '8', type: 'radio', label: 'Approved for Use', required: true, options: Object.values(APPROVAL_STATUS) }
    ]
  }
];

function FieldEditor({ field, onUpdate, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldChange = (property, value) => {
    onUpdate({ ...field, [property]: value });
  };

  const addOption = () => {
    const options = field.options || [];
    handleFieldChange('options', [...options, '']);
  };

  const updateOption = (index, value) => {
    const options = [...(field.options || [])];
    options[index] = value;
    handleFieldChange('options', options);
  };

  const removeOption = (index) => {
    const options = [...(field.options || [])];
    options.splice(index, 1);
    handleFieldChange('options', options);
  };

  const getFieldIcon = (type) => {
    const icons = {
      text: '📝', textarea: '📄', select: '📋', radio: '🔘', checkbox: '☑️',
      number: '🔢', date: '📅', time: '🕐', email: '📧', phone: '📞',
      signature: '✍️', file: '📎', heading: '📰', divider: '➖'
    };
    return icons[type] || '❓';
  };

  return (
    <div className="field-editor">
      <div className="field-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="field-info">
          <span className="field-icon">{getFieldIcon(field.type)}</span>
          <span className="field-title">{field.label || 'Untitled Field'}</span>
          <span className="field-type">({field.type})</span>
        </div>
        <div className="field-controls">
          <button
            type="button"
            className="control-button"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={!canMoveUp}
          >
            ↑
          </button>
          <button
            type="button"
            className="control-button"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={!canMoveDown}
          >
            ↓
          </button>
          <button
            type="button"
            className="control-button delete"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            🗑️
          </button>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="field-settings">
          {field.type !== 'divider' && (
            <div className="form-field">
              <label>Field Label</label>
              <input
                type="text"
                value={field.label || ''}
                onChange={(e) => handleFieldChange('label', e.target.value)}
                placeholder="Enter field label"
              />
            </div>
          )}

          {!['heading', 'divider'].includes(field.type) && (
            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  checked={field.required || false}
                  onChange={(e) => handleFieldChange('required', e.target.checked)}
                />
                Required Field
              </label>
            </div>
          )}

          {['select', 'radio', 'checkbox'].includes(field.type) && (
            <div className="form-field">
              <label>Options</label>
              {(field.options || []).map((option, index) => (
                <div key={index} className="option-editor">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="classic-button small danger"
                    onClick={() => removeOption(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="classic-button small"
                onClick={addOption}
              >
                + Add Option
              </button>
            </div>
          )}

          {field.type === 'text' && (
            <div className="form-field">
              <label>Placeholder Text</label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => handleFieldChange('placeholder', e.target.value)}
                placeholder="Enter placeholder text"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FormPreview({ form }) {
  const renderField = (field) => {
    switch (field.type) {
      case 'heading':
        return <h3 key={field.id} className="form-heading">{field.label}</h3>;
      
      case 'divider':
        return <hr key={field.id} className="form-divider" />;
      
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div key={field.id} className="form-field">
            <label>
              {field.label} {field.required && <span className="required">*</span>}
            </label>
            <input
              type={field.type === 'phone' ? 'tel' : field.type}
              placeholder={field.placeholder}
              required={field.required}
              disabled
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.id} className="form-field">
            <label>
              {field.label} {field.required && <span className="required">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder}
              required={field.required}
              disabled
              rows="3"
            />
          </div>
        );
      
      case 'select':
        return (
          <div key={field.id} className="form-field">
            <label>
              {field.label} {field.required && <span className="required">*</span>}
            </label>
            <select required={field.required} disabled>
              <option value="">Choose an option...</option>
              {(field.options || []).map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      case 'radio':
        return (
          <div key={field.id} className="form-field">
            <label>
              {field.label} {field.required && <span className="required">*</span>}
            </label>
            <div className="radio-group">
              {(field.options || []).map((option, index) => (
                <label key={index} className="radio-option">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    required={field.required}
                    disabled
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={field.id} className="form-field">
            <label>
              {field.label} {field.required && <span className="required">*</span>}
            </label>
            <div className="checkbox-group">
              {(field.options || []).map((option, index) => (
                <label key={index} className="checkbox-option">
                  <input
                    type="checkbox"
                    value={option}
                    disabled
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'date':
      case 'time':
        return (
          <div key={field.id} className="form-field">
            <label>
              {field.label} {field.required && <span className="required">*</span>}
            </label>
            <input
              type={field.type}
              required={field.required}
              disabled
            />
          </div>
        );
      
      case 'signature':
        return (
          <div key={field.id} className="form-field">
            <label>
              {field.label} {field.required && <span className="required">*</span>}
            </label>
            <div className="signature-field">
              <div className="signature-area">Signature area</div>
            </div>
          </div>
        );
      
      case 'file':
        return (
          <div key={field.id} className="form-field">
            <label>
              {field.label} {field.required && <span className="required">*</span>}
            </label>
            <input
              type="file"
              required={field.required}
              disabled
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="form-preview">
      <h3>Form Preview: {form.name}</h3>
      <div className="preview-form">
        {form.fields.map(renderField)}
        <div className="form-actions">
          <button type="submit" className="classic-button" disabled>
            Submit Form
          </button>
          <button type="button" className="classic-button secondary" disabled>
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FormBuilder() {
  const { hasPermission, PERMISSIONS } = useAuth();
  const [forms, setForms] = useState(SAMPLE_FORMS);
  const [selectedForm, setSelectedForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  if (!hasPermission(PERMISSIONS.MANAGE_SETTINGS)) {
    return (
      <Layout title="Access Denied">
        <div className="page-card">
          <div className="error-message">
            <h3>Access Denied</h3>
            <p>You don't have permission to access the form builder.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const createNewForm = () => {
    const newForm = {
      id: Date.now().toString(),
      name: 'New Form',
      description: '',
      category: 'Custom',
      created: new Date().toISOString().split('T')[0],
      fields: []
    };
    setForms([...forms, newForm]);
    setSelectedForm(newForm);
    setIsEditing(true);
  };

  const addField = (type) => {
    if (!selectedForm) return;
    
    const newField = {
      id: Date.now().toString(),
      type,
      label: type === 'heading' ? 'Section Heading' : type === 'divider' ? '' : `New ${type} field`,
      required: !['heading', 'divider'].includes(type),
      ...((['select', 'radio', 'checkbox'].includes(type)) && { options: ['Option 1', 'Option 2'] })
    };

    const updatedForm = {
      ...selectedForm,
      fields: [...selectedForm.fields, newField]
    };

    setSelectedForm(updatedForm);
    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
  };

  const updateField = (fieldId, updatedField) => {
    const updatedForm = {
      ...selectedForm,
      fields: selectedForm.fields.map(f => f.id === fieldId ? updatedField : f)
    };

    setSelectedForm(updatedForm);
    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
  };

  const deleteField = (fieldId) => {
    const updatedForm = {
      ...selectedForm,
      fields: selectedForm.fields.filter(f => f.id !== fieldId)
    };

    setSelectedForm(updatedForm);
    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
  };

  const moveField = (fieldId, direction) => {
    const fields = [...selectedForm.fields];
    const index = fields.findIndex(f => f.id === fieldId);
    
    if (direction === 'up' && index > 0) {
      [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
    } else if (direction === 'down' && index < fields.length - 1) {
      [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    }

    const updatedForm = { ...selectedForm, fields };
    setSelectedForm(updatedForm);
    setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
  };

  const saveForm = () => {
    setIsEditing(false);
  };

  const deleteForm = (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      setForms(forms.filter(f => f.id !== formId));
      if (selectedForm?.id === formId) {
        setSelectedForm(null);
        setIsEditing(false);
      }
    }
  };

  return (
    <Layout title="Form Builder">
      <div className="form-builder-container">
        <div className="forms-panel">
          <div className="panel-header">
            <h3>Forms</h3>
            <button className="classic-button" onClick={createNewForm}>
              + New Form
            </button>
          </div>
          
          <div className="forms-list">
            {forms.map(form => (
              <div
                key={form.id}
                className={`form-item ${selectedForm?.id === form.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedForm(form);
                  setIsEditing(false);
                }}
              >
                <div className="form-item-header">
                  <h4>{form.name}</h4>
                  <span className="form-category">{form.category}</span>
                </div>
                <p className="form-description">{form.description}</p>
                <div className="form-meta">
                  <span>{form.fields.length} fields</span>
                  <span>Created: {new Date(form.created).toLocaleDateString()}</span>
                </div>
                <div className="form-actions">
                  <button
                    className="classic-button small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedForm(form);
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="classic-button small danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteForm(form.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedForm && (
          <div className="form-editor-panel">
            {isEditing ? (
              <div className="form-editor">
                <div className="editor-header">
                  <div>
                    <input
                      type="text"
                      value={selectedForm.name}
                      onChange={(e) => {
                        const updatedForm = { ...selectedForm, name: e.target.value };
                        setSelectedForm(updatedForm);
                        setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
                      }}
                      className="form-name-input"
                    />
                    <textarea
                      value={selectedForm.description}
                      onChange={(e) => {
                        const updatedForm = { ...selectedForm, description: e.target.value };
                        setSelectedForm(updatedForm);
                        setForms(forms.map(f => f.id === selectedForm.id ? updatedForm : f));
                      }}
                      placeholder="Form description..."
                      className="form-description-input"
                      rows="2"
                    />
                  </div>
                  <button className="classic-button" onClick={saveForm}>
                    Save Form
                  </button>
                </div>

                <div className="field-types-panel">
                  <h4>Add Field:</h4>
                  <div className="field-types-grid">
                    {Object.entries(FIELD_TYPES).map(([key, type]) => (
                      <button
                        key={type}
                        className="field-type-button"
                        onClick={() => addField(type)}
                        title={`Add ${type} field`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="fields-editor">
                  <h4>Form Fields:</h4>
                  {selectedForm.fields.length === 0 ? (
                    <div className="empty-fields">
                      <p>No fields added yet. Click a field type above to get started.</p>
                    </div>
                  ) : (
                    selectedForm.fields.map((field, index) => (
                      <FieldEditor
                        key={field.id}
                        field={field}
                        onUpdate={(updatedField) => updateField(field.id, updatedField)}
                        onDelete={() => deleteField(field.id)}
                        onMoveUp={() => moveField(field.id, 'up')}
                        onMoveDown={() => moveField(field.id, 'down')}
                        canMoveUp={index > 0}
                        canMoveDown={index < selectedForm.fields.length - 1}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <FormPreview form={selectedForm} />
            )}
          </div>
        )}

        {!selectedForm && (
          <div className="no-form-selected">
            <h3>Select a form to view or edit</h3>
            <p>Choose a form from the list on the left, or create a new one.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
