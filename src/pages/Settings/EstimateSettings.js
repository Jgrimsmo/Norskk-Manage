import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import "../../styles/page.css";
import "../../styles/tables.css";
import { fetchDocById, setDocById } from "../../lib/utils/firebaseHelpers";

export default function EstimateSettings() {
  const [settings, setSettings] = useState({
    // Tax Settings
    pstRate: 7.0,
    gstRate: 5.0,
    defaultTaxType: "PST+GST",
    
    // Project Defaults
    defaultMarkupPercent: 15.0,
    defaultLaborRate: 45.0,
    defaultOvertimeRate: 67.5,
    
    // Estimate Settings
    estimateValidityDays: 30,
    defaultEstimateTerms: "Payment due within 30 days of completion",
    includeBreakdownInEstimate: true,
    
    // System Preferences (Estimate-related)
    currency: "CAD",
    dateFormat: "MM/DD/YYYY"
  });
    const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Load settings from Firebase on component mount
  useEffect(() => {
    loadSettings();
  }, []);  const loadSettings = async () => {
    try {
      setError(null);
      const settingsData = await fetchDocById("settings", "estimateSettings");
      if (settingsData) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
    } catch (error) {
      console.error("Error loading estimate settings:", error);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDocById("settings", "estimateSettings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error("Error saving estimate settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all estimate settings to defaults? This cannot be undone.")) {
      setSettings({
        pstRate: 7.0,
        gstRate: 5.0,
        defaultTaxType: "PST+GST",
        defaultMarkupPercent: 15.0,
        defaultLaborRate: 45.0,
        defaultOvertimeRate: 67.5,
        estimateValidityDays: 30,
        defaultEstimateTerms: "Payment due within 30 days of completion",
        includeBreakdownInEstimate: true,
        currency: "CAD",
        dateFormat: "MM/DD/YYYY"
      });
    }
  };
  if (loading) {
    return (
      <Layout title="Estimate Settings">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading estimate settings...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Estimate Settings">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f', backgroundColor: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px', margin: '1rem' }}>
          {error}
          <button 
            onClick={loadSettings} 
            style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Estimate Settings">
      {/* Global Save/Reset Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        padding: '0 20px'
      }}>
        {saved && (
          <span style={{ 
            background: '#198754', 
            color: 'white', 
            padding: '6px 16px', 
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ✓ Estimate Settings Saved Successfully
          </span>
        )}
        <button 
          className="classic-button" 
          onClick={saveSettings}
          disabled={saving}
          style={{ 
            background: '#0d5c7a', 
            color: 'white',
            fontSize: '14px',
            padding: '10px 20px',
            fontWeight: 'bold'
          }}
        >
          {saving ? "Saving..." : "Save Estimate Settings"}
        </button>
        <button 
          className="classic-button" 
          onClick={resetToDefaults}
          style={{ 
            background: '#dc3545', 
            color: 'white',
            fontSize: '14px',
            padding: '10px 20px',
            fontWeight: 'bold'
          }}
        >
          Reset to Defaults
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Row 1: Tax Settings & Project Defaults */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Tax Settings Card */}
          <div className="table-section">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#0d5c7a', 
              borderBottom: '2px solid #0d5c7a', 
              paddingBottom: '8px' 
            }}>
              Tax Settings
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  PST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={settings.pstRate}
                  onChange={e => handleInputChange('pstRate', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  GST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={settings.gstRate}
                  onChange={e => handleInputChange('gstRate', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Default Tax Type
              </label>
              <select
                value={settings.defaultTaxType}
                onChange={e => handleInputChange('defaultTaxType', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
              >
                <option value="PST+GST">PST + GST</option>
                <option value="HST">HST</option>
                <option value="GST">GST Only</option>
                <option value="None">No Tax</option>
              </select>
            </div>
          </div>

          {/* Project Defaults Card */}
          <div className="table-section">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#0d5c7a', 
              borderBottom: '2px solid #0d5c7a', 
              paddingBottom: '8px' 
            }}>
              Project Defaults
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Default Markup (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={settings.defaultMarkupPercent}
                  onChange={e => handleInputChange('defaultMarkupPercent', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Labor Rate ($/hr)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={settings.defaultLaborRate}
                  onChange={e => handleInputChange('defaultLaborRate', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Overtime Rate ($/hr)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={settings.defaultOvertimeRate}
                  onChange={e => handleInputChange('defaultOvertimeRate', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Estimate Settings & Display Preferences */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Estimate Settings Card */}
          <div className="table-section">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#0d5c7a', 
              borderBottom: '2px solid #0d5c7a', 
              paddingBottom: '8px' 
            }}>
              Estimate Configuration
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Estimate Validity (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.estimateValidityDays}
                  onChange={e => handleInputChange('estimateValidityDays', parseInt(e.target.value) || 30)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={settings.includeBreakdownInEstimate}
                    onChange={e => handleInputChange('includeBreakdownInEstimate', e.target.checked)}
                  />
                  <span style={{ fontWeight: 'bold' }}>Include cost breakdown in estimates</span>
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Default Estimate Terms
                </label>
                <textarea
                  value={settings.defaultEstimateTerms}
                  onChange={e => handleInputChange('defaultEstimateTerms', e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #808080', 
                    borderRadius: '4px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="Enter default terms and conditions for estimates..."
                />
              </div>
            </div>
          </div>

          {/* Display Preferences Card */}
          <div className="table-section">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#0d5c7a', 
              borderBottom: '2px solid #0d5c7a', 
              paddingBottom: '8px' 
            }}>
              Display Preferences
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={e => handleInputChange('currency', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                >
                  <option value="CAD">CAD ($)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={e => handleInputChange('dateFormat', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
