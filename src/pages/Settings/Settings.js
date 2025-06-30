import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../styles/page.css";
import "../../styles/tables.css";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <Layout title="Settings">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: '#0d5c7a', marginBottom: '16px' }}>Application Settings</h2>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Choose the settings category you want to configure
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Estimate Settings Card */}
          <div 
            className="table-section" 
            style={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
            onClick={() => navigate('/estimate-settings')}
          >
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px',
                color: '#0d5c7a'
              }}>
                📊
              </div>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                color: '#0d5c7a',
                fontSize: '20px'
              }}>
                Estimate Settings
              </h3>
              <p style={{ 
                color: '#666', 
                fontSize: '14px',
                lineHeight: '1.5',
                margin: 0
              }}>
                Configure tax rates, project defaults, labor rates, markup percentages, estimate validity, and display preferences.
              </p>
              <div style={{ 
                marginTop: '20px',
                padding: '8px 16px',
                background: '#0d5c7a',
                color: 'white',
                borderRadius: '4px',
                display: 'inline-block',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Configure Estimates →
              </div>
            </div>
          </div>

          {/* Management Settings Card */}
          <div 
            className="table-section"
            style={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onClick={() => navigate('/management-settings')}
          >
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px',
                color: '#0d5c7a'
              }}>
                ⚙️
              </div>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                color: '#0d5c7a',
                fontSize: '20px'
              }}>
                Management Settings
              </h3>
              <p style={{ 
                color: '#666', 
                fontSize: '14px',
                lineHeight: '1.5',
                margin: 0
              }}>
                Manage company information, time tracking preferences, notifications, and general system settings.
              </p>
              <div style={{ 
                marginTop: '20px',
                padding: '8px 16px',
                background: '#0d5c7a',
                color: 'white',
                borderRadius: '4px',
                display: 'inline-block',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Configure Management →
              </div>
            </div>
          </div>
        </div>        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Settings are automatically saved when you make changes in each section.
          </p>
        </div>
      </div>
    </Layout>
  );
}
