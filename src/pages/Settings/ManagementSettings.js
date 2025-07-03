import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import "../../styles/page.css";
import "../../styles/tables.css";
import { fetchDocById, setDocById } from "../../lib/utils/firebaseHelpers";

export default function ManagementSettings() {
  const [settings, setSettings] = useState({
    // Company Information
    companyName: "",
    companyAddress: "",
    companyCity: "",
    companyState: "",
    companyZip: "",
    companyPhone: "",
    companyEmail: "",
    companyWebsite: "",
    
    // Time Tracking
    roundTimeToNearest: 15, // minutes
    requireTimeApproval: false,
    
    // Notifications
    emailNotifications: true,
    estimateReminders: true,
    projectDeadlineAlerts: true,
    
    // System Preferences
    timeFormat: "12-hour",
    defaultView: "dashboard"
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
      const settingsData = await fetchDocById("settings", "managementSettings");
      if (settingsData) {
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
    } catch (error) {
      console.error("Error loading management settings:", error);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDocById("settings", "managementSettings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error("Error saving management settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all management settings to defaults? This cannot be undone.")) {
      setSettings({
        companyName: "",
        companyAddress: "",
        companyCity: "",
        companyState: "",
        companyZip: "",
        companyPhone: "",
        companyEmail: "",
        companyWebsite: "",
        roundTimeToNearest: 15,
        requireTimeApproval: false,
        emailNotifications: true,
        estimateReminders: true,
        projectDeadlineAlerts: true,
        timeFormat: "12-hour",
        defaultView: "dashboard"
      });
    }
  };
  if (loading) {
    return (
      <Layout title="Management Settings">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading management settings...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Management Settings">
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
    <Layout title="Management Settings">
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
            ✓ Management Settings Saved Successfully
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
          {saving ? "Saving..." : "Save Management Settings"}
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
        {/* Row 1: Company Information */}
        <div style={{ marginBottom: '24px' }}>
          <div className="table-section">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#0d5c7a', 
              borderBottom: '2px solid #0d5c7a', 
              paddingBottom: '8px' 
            }}>
              Company Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={e => handleInputChange('companyName', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  value={settings.companyPhone}
                  onChange={e => handleInputChange('companyPhone', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Address
              </label>
              <input
                type="text"
                value={settings.companyAddress}
                onChange={e => handleInputChange('companyAddress', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                placeholder="123 Main Street"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  City
                </label>
                <input
                  type="text"
                  value={settings.companyCity}
                  onChange={e => handleInputChange('companyCity', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                  placeholder="City"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Province/State
                </label>
                <input
                  type="text"
                  value={settings.companyState}
                  onChange={e => handleInputChange('companyState', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                  placeholder="BC"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Postal Code
                </label>
                <input
                  type="text"
                  value={settings.companyZip}
                  onChange={e => handleInputChange('companyZip', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                  placeholder="V1A 1A1"
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={settings.companyEmail}
                  onChange={e => handleInputChange('companyEmail', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                  placeholder="info@company.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Website
                </label>
                <input
                  type="text"
                  value={settings.companyWebsite}
                  onChange={e => handleInputChange('companyWebsite', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                  placeholder="www.company.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Time Tracking & System Preferences */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Time Tracking Card */}
          <div className="table-section">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#0d5c7a', 
              borderBottom: '2px solid #0d5c7a', 
              paddingBottom: '8px' 
            }}>
              Time Tracking
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Round Time To Nearest (minutes)
                </label>
                <select
                  value={settings.roundTimeToNearest}
                  onChange={e => handleInputChange('roundTimeToNearest', parseInt(e.target.value))}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={settings.requireTimeApproval}
                    onChange={e => handleInputChange('requireTimeApproval', e.target.checked)}
                  />
                  <span style={{ fontWeight: 'bold' }}>Require time entry approval</span>
                </label>
              </div>
            </div>
          </div>

          {/* System Preferences Card */}
          <div className="table-section">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#0d5c7a', 
              borderBottom: '2px solid #0d5c7a', 
              paddingBottom: '8px' 
            }}>
              System Preferences
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Time Format
                </label>
                <select
                  value={settings.timeFormat}
                  onChange={e => handleInputChange('timeFormat', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                >
                  <option value="12-hour">12-hour</option>
                  <option value="24-hour">24-hour</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Default View
                </label>
                <select
                  value={settings.defaultView}
                  onChange={e => handleInputChange('defaultView', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="projects">Projects</option>
                  <option value="estimates">Estimates</option>
                  <option value="timetracking">Time Tracking</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Notifications */}
        <div style={{ marginBottom: '24px' }}>
          <div className="table-section">
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#0d5c7a', 
              borderBottom: '2px solid #0d5c7a', 
              paddingBottom: '8px' 
            }}>
              Notifications & Alerts
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={e => handleInputChange('emailNotifications', e.target.checked)}
                  />
                  <span style={{ fontWeight: 'bold' }}>Enable email notifications</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    checked={settings.estimateReminders}
                    onChange={e => handleInputChange('estimateReminders', e.target.checked)}
                  />
                  <span style={{ fontWeight: 'bold' }}>Estimate expiration reminders</span>
                </label>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    checked={settings.projectDeadlineAlerts}
                    onChange={e => handleInputChange('projectDeadlineAlerts', e.target.checked)}
                  />
                  <span style={{ fontWeight: 'bold' }}>Project deadline alerts</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
