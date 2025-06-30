import React, { useState } from "react";
import Layout from "../../components/Layout";
import "../../styles/page.css";
import "../../styles/tables.css";

export default function ExportCalculator() {
  const [inputs, setInputs] = useState({
    materialType: "topsoil",
    volumeInPlace: 0,
    naturalDensity: 1400, // kg/m³
    swellFactor: 25, // percentage
    truckCapacity: 15, // m³
    truckPayload: 25000, // kg
    distanceOneWay: 10, // km
    loadTime: 15, // minutes
    unloadTime: 10, // minutes
    travelSpeed: 60 // km/h
  });

  const [results, setResults] = useState({
    swollenVolume: 0,
    totalWeight: 0,
    trucksNeeded: 0,
    cycleTime: 0,
    tripsPerDay: 0,
    trucksPerDay: 0,
    dailyCapacity: 0
  });

  // Material presets
  const materialPresets = {
    topsoil: { density: 1400, swell: 25 },
    clay: { density: 1600, swell: 30 },
    sand: { density: 1600, swell: 15 },
    gravel: { density: 1800, swell: 20 },
    rock: { density: 2400, swell: 50 },
    mixed: { density: 1700, swell: 25 }
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleMaterialChange = (materialType) => {
    const preset = materialPresets[materialType];
    setInputs(prev => ({
      ...prev,
      materialType,
      naturalDensity: preset.density,
      swellFactor: preset.swell
    }));
  };

  const calculateResults = () => {
    const {
      volumeInPlace,
      naturalDensity,
      swellFactor,
      truckCapacity,
      truckPayload,
      distanceOneWay,
      loadTime,
      unloadTime,
      travelSpeed
    } = inputs;

    // Calculate swollen volume
    const swollenVolume = volumeInPlace * (1 + swellFactor / 100);
    
    // Calculate total weight
    const totalWeight = volumeInPlace * naturalDensity;
    
    // Calculate limiting factor for truck loading
    const maxVolumePerTruck = truckCapacity;
    const maxWeightPerTruck = truckPayload / naturalDensity; // convert payload to volume
    const effectiveTruckCapacity = Math.min(maxVolumePerTruck, maxWeightPerTruck);
    
    // Calculate number of trucks needed (based on swollen volume)
    const trucksNeeded = Math.ceil(swollenVolume / effectiveTruckCapacity);
    
    // Calculate cycle time
    const travelTimeOneWay = (distanceOneWay / travelSpeed) * 60; // minutes
    const cycleTime = (travelTimeOneWay * 2) + loadTime + unloadTime; // minutes
    
    // Calculate trips per day (8 hour workday = 480 minutes)
    const tripsPerDay = Math.floor(480 / cycleTime);
    
    // Calculate trucks needed per day
    const trucksPerDay = Math.ceil(trucksNeeded / tripsPerDay);
    
    // Calculate daily capacity
    const dailyCapacity = tripsPerDay * effectiveTruckCapacity;

    setResults({
      swollenVolume: Math.round(swollenVolume * 100) / 100,
      totalWeight: Math.round(totalWeight),
      trucksNeeded,
      cycleTime: Math.round(cycleTime * 100) / 100,
      tripsPerDay,
      trucksPerDay,
      dailyCapacity: Math.round(dailyCapacity * 100) / 100
    });
  };

  React.useEffect(() => {
    calculateResults();
  }, [inputs]);
  return (
    <Layout title="Export Calculator">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Input Panel */}
          <div className="table-section">
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#0d5c7a', 
              borderBottom: '2px solid #0d5c7a', 
              paddingBottom: '8px' 
            }}>
              Project Inputs
            </h3>

            {/* Material Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Material Type
              </label>
              <select
                value={inputs.materialType}
                onChange={e => handleMaterialChange(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #808080', borderRadius: '4px' }}
              >
                <option value="topsoil">Topsoil</option>
                <option value="clay">Clay</option>
                <option value="sand">Sand</option>
                <option value="gravel">Gravel</option>
                <option value="rock">Rock</option>
                <option value="mixed">Mixed Soil</option>
              </select>
            </div>

            {/* Volume and Material Properties */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Volume In-Place (m³)
                </label>
                <input
                  type="number"
                  value={inputs.volumeInPlace}
                  onChange={e => handleInputChange('volumeInPlace', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Natural Density (kg/m³)
                </label>
                <input
                  type="number"
                  value={inputs.naturalDensity}
                  onChange={e => handleInputChange('naturalDensity', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Swell Factor (%)
              </label>
              <input
                type="number"
                value={inputs.swellFactor}
                onChange={e => handleInputChange('swellFactor', parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
              />
            </div>

            {/* Truck Specifications */}
            <h4 style={{ color: '#0d5c7a', marginBottom: '12px', marginTop: '24px' }}>Truck Specifications</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Truck Capacity (m³)
                </label>
                <input
                  type="number"
                  value={inputs.truckCapacity}
                  onChange={e => handleInputChange('truckCapacity', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Truck Payload (kg)
                </label>
                <input
                  type="number"
                  value={inputs.truckPayload}
                  onChange={e => handleInputChange('truckPayload', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Logistics */}
            <h4 style={{ color: '#0d5c7a', marginBottom: '12px', marginTop: '24px' }}>Logistics</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Distance One-Way (km)
                </label>
                <input
                  type="number"
                  value={inputs.distanceOneWay}
                  onChange={e => handleInputChange('distanceOneWay', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Travel Speed (km/h)
                </label>
                <input
                  type="number"
                  value={inputs.travelSpeed}
                  onChange={e => handleInputChange('travelSpeed', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Load Time (minutes)
                </label>
                <input
                  type="number"
                  value={inputs.loadTime}
                  onChange={e => handleInputChange('loadTime', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Unload Time (minutes)
                </label>
                <input
                  type="number"
                  value={inputs.unloadTime}
                  onChange={e => handleInputChange('unloadTime', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="table-section">
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#0d5c7a', 
              borderBottom: '2px solid #0d5c7a', 
              paddingBottom: '8px' 
            }}>
              Calculation Results
            </h3>

            {/* Volume & Weight Results */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#0d5c7a', marginBottom: '12px' }}>Volume & Weight</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.swollenVolume.toLocaleString()} m³
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Swollen Volume</div>
                </div>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.totalWeight.toLocaleString()} kg
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Weight</div>
                </div>
              </div>
            </div>

            {/* Truck Requirements */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#0d5c7a', marginBottom: '12px' }}>Truck Requirements</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px', background: '#e8f4f8', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.trucksNeeded}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Truck Loads</div>
                </div>
                <div style={{ padding: '12px', background: '#e8f4f8', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.cycleTime} min
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Cycle Time</div>
                </div>
              </div>
            </div>

            {/* Daily Operations */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#0d5c7a', marginBottom: '12px' }}>Daily Operations (8 hours)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.tripsPerDay}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Trips per Truck</div>
                </div>
                <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.trucksPerDay}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Trucks Needed per Day</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ padding: '16px', background: '#d1ecf1', borderRadius: '4px', border: '1px solid #bee5eb' }}>
              <h4 style={{ color: '#0d5c7a', marginBottom: '8px', marginTop: 0 }}>Summary</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Daily Capacity:</strong> {results.dailyCapacity.toLocaleString()} m³ per day
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Project Duration:</strong> {inputs.volumeInPlace > 0 ? Math.ceil(results.swollenVolume / results.dailyCapacity) : 0} days
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Efficiency:</strong> {results.tripsPerDay > 0 ? Math.round((480 / results.cycleTime) * 100) / 100 : 0}% truck utilization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
