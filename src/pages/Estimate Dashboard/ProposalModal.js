// ProposalModal.js
import React, { useState } from 'react';
import { PDFPreviewModal } from './PDFGenerator';
import './ProposalModal.css';

const PROPOSAL_TEMPLATES = [
  {
    id: 'executive',
    name: 'Executive Modern',
    description: 'Dark blue with geometric design and professional cards',
    preview: 'Modern Header | Executive Cards | Investment Total'
  },
  {
    id: 'corporate',
    name: 'Corporate Professional',
    description: 'Clean lines with blue accents and two-column layout',
    preview: 'Company Header | Two-Column Details | Cost Summary'
  },
  {
    id: 'technical',
    name: 'Construction Technical',
    description: 'Orange/gray industrial theme with technical specifications',
    preview: 'Technical Header | Specifications Grid | Cost Breakdown'
  },
  {
    id: 'elegant',
    name: 'Elegant Minimalist',
    description: 'Black and white minimalist design with clean typography',
    preview: 'Elegant Header | Client Section | Grand Total'
  }
];

export default function ProposalModal({ 
  isOpen, 
  onClose, 
  project, 
  scopes, 
  scopeItems, 
  totalAmount 
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('executive');
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [proposalOptions, setProposalOptions] = useState({
    companyName: 'Norskk Management',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    logoUrl: '',
    proposalTitle: `${project?.name || 'Project'} Proposal`,
    validityPeriod: '30',
    includeTerms: true,
    includePaymentSchedule: true,
    includeTimeline: false,
    customNotes: '',
    showItemizedBreakdown: true,
    showScopeDescriptions: true
  });
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleOptionChange = (key, value) => {
    setProposalOptions(prev => ({ ...prev, [key]: value }));
  };

  const generateProposal = async () => {
    setIsGenerating(true);
    
    try {
      // Small delay to show the generating state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show PDF preview instead of direct download
      setShowPDFPreview(true);
      setIsGenerating(false);
      
    } catch (error) {
      console.error('Error generating proposal:', error);
      alert('Failed to generate proposal. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="proposal-modal-overlay" onClick={onClose}>
      <div className="proposal-modal" onClick={e => e.stopPropagation()}>
        <div className="proposal-modal-header">
          <h2>Create PDF Proposal</h2>
          <button className="proposal-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="proposal-modal-body">
          {/* Template Selection */}
          <div className="template-selection">
            <h3>Choose Template</h3>
            <div className="template-grid">
              {PROPOSAL_TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="template-preview">{template.preview}</div>
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Proposal Options */}
          <div className="proposal-options">
            <h3>Proposal Options</h3>
            <div className="options-grid">
              <div className="option-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={proposalOptions.companyName}
                  onChange={e => handleOptionChange('companyName', e.target.value)}
                />
              </div>
              
              <div className="option-group">
                <label>Company Address</label>
                <input
                  type="text"
                  value={proposalOptions.companyAddress}
                  onChange={e => handleOptionChange('companyAddress', e.target.value)}
                  placeholder="123 Main St, City, State"
                />
              </div>
              
              <div className="option-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={proposalOptions.companyPhone}
                  onChange={e => handleOptionChange('companyPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="option-group">
                <label>Email</label>
                <input
                  type="email"
                  value={proposalOptions.companyEmail}
                  onChange={e => handleOptionChange('companyEmail', e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
              
              <div className="option-group">
                <label>Proposal Title</label>
                <input
                  type="text"
                  value={proposalOptions.proposalTitle}
                  onChange={e => handleOptionChange('proposalTitle', e.target.value)}
                />
              </div>
              
              <div className="option-group">
                <label>Valid for (days)</label>
                <select
                  value={proposalOptions.validityPeriod}
                  onChange={e => handleOptionChange('validityPeriod', e.target.value)}
                >
                  <option value="15">15 days</option>
                  <option value="30">30 days</option>
                  <option value="45">45 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            </div>
            
            <div className="option-group" style={{ marginTop: '16px' }}>
              <label>Custom Notes</label>
              <textarea
                value={proposalOptions.customNotes}
                onChange={e => handleOptionChange('customNotes', e.target.value)}
                placeholder="Additional notes or special terms..."
              />
            </div>
            
            {/* Checkboxes */}
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="includeTerms"
                  checked={proposalOptions.includeTerms}
                  onChange={e => handleOptionChange('includeTerms', e.target.checked)}
                />
                <label htmlFor="includeTerms">Include Terms & Conditions</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="includePayment"
                  checked={proposalOptions.includePaymentSchedule}
                  onChange={e => handleOptionChange('includePaymentSchedule', e.target.checked)}
                />
                <label htmlFor="includePayment">Include Payment Schedule</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="includeTimeline"
                  checked={proposalOptions.includeTimeline}
                  onChange={e => handleOptionChange('includeTimeline', e.target.checked)}
                />
                <label htmlFor="includeTimeline">Include Project Timeline</label>
              </div>
              
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="showBreakdown"
                  checked={proposalOptions.showItemizedBreakdown}
                  onChange={e => handleOptionChange('showItemizedBreakdown', e.target.checked)}
                />
                <label htmlFor="showBreakdown">Show Itemized Breakdown</label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="proposal-modal-footer">
          <button 
            className="classic-button secondary" 
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            className="classic-button"
            onClick={generateProposal}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Preview PDF'}
          </button>
        </div>
      </div>
      
      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        template={selectedTemplate}
        project={project}
        scopes={scopes}
        scopeItems={scopeItems}
        totalAmount={totalAmount}
        options={proposalOptions}
      />
    </div>
  );
}
