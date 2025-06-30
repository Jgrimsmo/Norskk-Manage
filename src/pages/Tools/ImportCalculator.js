import React, { useState } from "react";
import Layout from "../../components/Layout";
import "../../styles/page.css";
import "../../styles/tables.css";

export default function ImportCalculator() {
  const [inputs, setInputs] = useState({
    projectType: "driveway",
    length: 0,
    width: 0,
    depth: 0,
    compactionFactor: 15, // percentage
    wasteFactor: 10, // percentage
    baseRequired: true,
    baseDepth: 0.1, // meters
    baseMaterial: "gravel",
    surfaceMaterial: "asphalt",
    truckCapacity: 15, // m³
    truckPayload: 25000, // kg
    distanceOneWay: 10, // km
    loadTime: 15, // minutes
    unloadTime: 10, // minutes
    travelSpeed: 60 // km/h
  });

  const [results, setResults] = useState({
    totalVolume: 0,
    compactedVolume: 0,
    baseVolume: 0,
    baseMaterial: 0,
    surfaceMaterial: 0,
    totalMaterial: 0,
    totalWeight: 0,
    trucksNeeded: 0,
    cycleTime: 0,
    tripsPerDay: 0,
    trucksPerDay: 0,
    projectDays: 0
  });

  // Project type presets
  const projectPresets = {
    driveway: { depth: 0.15, baseDepth: 0.1, compaction: 15, waste: 10 },
    parking: { depth: 0.2, baseDepth: 0.15, compaction: 12, waste: 8 },
    roadway: { depth: 0.3, baseDepth: 0.2, compaction: 10, waste: 5 },
    foundation: { depth: 0.5, baseDepth: 0.3, compaction: 8, waste: 12 },
    landscaping: { depth: 0.05, baseDepth: 0, compaction: 20, waste: 15 },
    patio: { depth: 0.1, baseDepth: 0.05, compaction: 15, waste: 10 }
  };

  // Material properties (density in kg/m³)
  const materialProperties = {
    gravel: { density: 1800, name: "Gravel" },
    crushedStone: { density: 1600, name: "Crushed Stone" },
    sand: { density: 1600, name: "Sand" },
    topsoil: { density: 1400, name: "Topsoil" },
    asphalt: { density: 2400, name: "Asphalt" },
    concrete: { density: 2400, name: "Concrete" },
    limestone: { density: 2200, name: "Limestone" },
    recycledConcrete: { density: 2000, name: "Recycled Concrete" }
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectTypeChange = (projectType) => {
    const preset = projectPresets[projectType];
    setInputs(prev => ({
      ...prev,
      projectType,
      depth: preset.depth,
      baseDepth: preset.baseDepth,
      compactionFactor: preset.compaction,
      wasteFactor: preset.waste,
      baseRequired: preset.baseDepth > 0
    }));
  };

  const calculateResults = () => {
    const {
      length,
      width,
      depth,
      compactionFactor,
      wasteFactor,
      baseRequired,
      baseDepth,
      baseMaterial,
      surfaceMaterial,
      truckCapacity,
      truckPayload,
      distanceOneWay,
      loadTime,
      unloadTime,
      travelSpeed
    } = inputs;

    // Calculate basic volume
    const totalVolume = length * width * depth;
    
    // Calculate compacted volume (material needed to achieve final compacted volume)
    const compactedVolume = totalVolume * (1 + compactionFactor / 100);
    
    // Calculate base volume if required
    const baseVolume = baseRequired ? length * width * baseDepth * (1 + compactionFactor / 100) : 0;
    
    // Calculate material volumes with waste factor
    const surfaceVolumeNeeded = (compactedVolume - baseVolume) * (1 + wasteFactor / 100);
    const baseVolumeNeeded = baseVolume * (1 + wasteFactor / 100);
    
    // Calculate total material volume
    const totalMaterialVolume = surfaceVolumeNeeded + baseVolumeNeeded;
    
    // Calculate weights
    const baseDensity = materialProperties[baseMaterial]?.density || 1600;
    const surfaceDensity = materialProperties[surfaceMaterial]?.density || 2400;
    
    const baseWeight = baseVolumeNeeded * baseDensity;
    const surfaceWeight = surfaceVolumeNeeded * surfaceDensity;
    const totalWeight = baseWeight + surfaceWeight;
    
    // Calculate truck requirements
    const avgDensity = totalMaterialVolume > 0 ? totalWeight / totalMaterialVolume : 2000;
    const maxVolumePerTruck = truckCapacity;
    const maxWeightPerTruck = truckPayload / avgDensity;
    const effectiveTruckCapacity = Math.min(maxVolumePerTruck, maxWeightPerTruck);
    
    const trucksNeeded = Math.ceil(totalMaterialVolume / effectiveTruckCapacity);
    
    // Calculate cycle time and logistics
    const travelTimeOneWay = (distanceOneWay / travelSpeed) * 60; // minutes
    const cycleTime = (travelTimeOneWay * 2) + loadTime + unloadTime;
    
    const tripsPerDay = Math.floor(480 / cycleTime); // 8 hour workday
    const trucksPerDay = Math.ceil(trucksNeeded / tripsPerDay);
    const projectDays = Math.ceil(trucksNeeded / (tripsPerDay * trucksPerDay));

    setResults({
      totalVolume: Math.round(totalVolume * 100) / 100,
      compactedVolume: Math.round(compactedVolume * 100) / 100,
      baseVolume: Math.round(baseVolumeNeeded * 100) / 100,
      baseMaterial: Math.round(baseVolumeNeeded * 100) / 100,
      surfaceMaterial: Math.round(surfaceVolumeNeeded * 100) / 100,
      totalMaterial: Math.round(totalMaterialVolume * 100) / 100,
      totalWeight: Math.round(totalWeight),
      trucksNeeded,
      cycleTime: Math.round(cycleTime * 100) / 100,
      tripsPerDay,
      trucksPerDay,
      projectDays
    });
  };

  React.useEffect(() => {
    calculateResults();
  }, [inputs]);

  return (
    <Layout title="Import Calculator">
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
              Project Specifications
            </h3>

            {/* Project Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Project Type
              </label>
              <select
                value={inputs.projectType}
                onChange={e => handleProjectTypeChange(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #808080', borderRadius: '4px' }}
              >
                <option value="driveway">Driveway</option>
                <option value="parking">Parking Lot</option>
                <option value="roadway">Roadway</option>
                <option value="foundation">Foundation</option>
                <option value="landscaping">Landscaping</option>
                <option value="patio">Patio/Walkway</option>
              </select>
            </div>

            {/* Dimensions */}
            <h4 style={{ color: '#0d5c7a', marginBottom: '12px' }}>Dimensions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Length (m)
                </label>
                <input
                  type="number"
                  value={inputs.length}
                  onChange={e => handleInputChange('length', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Width (m)
                </label>
                <input
                  type="number"
                  value={inputs.width}
                  onChange={e => handleInputChange('width', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Depth (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.depth}
                  onChange={e => handleInputChange('depth', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Material Properties */}
            <h4 style={{ color: '#0d5c7a', marginBottom: '12px' }}>Material Properties</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Compaction Factor (%)
                </label>
                <input
                  type="number"
                  value={inputs.compactionFactor}
                  onChange={e => handleInputChange('compactionFactor', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Waste Factor (%)
                </label>
                <input
                  type="number"
                  value={inputs.wasteFactor}
                  onChange={e => handleInputChange('wasteFactor', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Base Material */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={inputs.baseRequired}
                  onChange={e => handleInputChange('baseRequired', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: 'bold' }}>Base Layer Required</span>
              </label>
              
              {inputs.baseRequired && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Base Depth (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.baseDepth}
                      onChange={e => handleInputChange('baseDepth', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      Base Material
                    </label>
                    <select
                      value={inputs.baseMaterial}
                      onChange={e => handleInputChange('baseMaterial', e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #808080', borderRadius: '4px' }}
                    >
                      {Object.entries(materialProperties).map(([key, material]) => (
                        <option key={key} value={key}>{material.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Surface Material */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Surface Material
              </label>
              <select
                value={inputs.surfaceMaterial}
                onChange={e => handleInputChange('surfaceMaterial', e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #808080', borderRadius: '4px' }}
              >
                {Object.entries(materialProperties).map(([key, material]) => (
                  <option key={key} value={key}>{material.name}</option>
                ))}
              </select>
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
              Material Requirements
            </h3>

            {/* Volume Results */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#0d5c7a', marginBottom: '12px' }}>Project Volume</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.totalVolume.toLocaleString()} m³
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Final Volume</div>
                </div>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.compactedVolume.toLocaleString()} m³
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Volume Before Compaction</div>
                </div>
              </div>
            </div>

            {/* Material Requirements */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#0d5c7a', marginBottom: '12px' }}>Material Requirements</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {inputs.baseRequired && (
                  <div style={{ padding: '12px', background: '#e8f4f8', borderRadius: '4px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d5c7a' }}>
                      {results.baseMaterial.toLocaleString()} m³
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {materialProperties[inputs.baseMaterial]?.name} (Base Layer)
                    </div>
                  </div>
                )}
                <div style={{ padding: '12px', background: '#e8f4f8', borderRadius: '4px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.surfaceMaterial.toLocaleString()} m³
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {materialProperties[inputs.surfaceMaterial]?.name} (Surface)
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '4px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.totalMaterial.toLocaleString()} m³
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Material Needed</div>
                </div>
              </div>
            </div>

            {/* Weight & Logistics */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#0d5c7a', marginBottom: '12px' }}>Weight & Logistics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.totalWeight.toLocaleString()} kg
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Weight</div>
                </div>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.trucksNeeded}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Truck Loads Needed</div>
                </div>
              </div>
            </div>

            {/* Project Timeline */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#0d5c7a', marginBottom: '12px' }}>Project Timeline</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '4px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.tripsPerDay}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Trips per Truck per Day</div>
                </div>
                <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '4px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d5c7a' }}>
                    {results.projectDays}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Project Days</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ padding: '16px', background: '#d1ecf1', borderRadius: '4px', border: '1px solid #bee5eb' }}>
              <h4 style={{ color: '#0d5c7a', marginBottom: '8px', marginTop: 0 }}>Project Summary</h4>
              <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>Project Area:</strong> {(inputs.length * inputs.width).toLocaleString()} m²
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Trucks per Day:</strong> {results.trucksPerDay} trucks needed
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Cycle Time:</strong> {results.cycleTime} minutes per round trip
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Cost Factor:</strong> Include {inputs.wasteFactor}% waste + {inputs.compactionFactor}% compaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
