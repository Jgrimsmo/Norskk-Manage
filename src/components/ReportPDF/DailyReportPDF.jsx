import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';

// Professional Construction Daily Report Layout
// Inspired by industry standards (HCSS, Procore, PlanRadar)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.3,
  },
  
  // Professional Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8fafc',
    border: '1 solid #e2e8f0',
  },
  
  companySection: {
    flex: 1,
  },
  
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 2,
  },
  
  companyTagline: {
    fontSize: 8,
    color: '#64748b',
    fontStyle: 'italic',
  },
  
  reportSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 2,
  },
  
  reportDate: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
  },
  
  // Project Information Grid
  projectInfo: {
    flexDirection: 'row',
    marginBottom: 15,
    border: '1 solid #d1d5db',
    borderRadius: 4,
  },
  
  infoColumn: {
    flex: 1,
    padding: 8,
    borderRight: '1 solid #e5e7eb',
  },
  
  infoColumnLast: {
    flex: 1,
    padding: 8,
  },
  
  infoLabel: {
    fontSize: 8,
    color: '#6b7280',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  
  infoValue: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 'bold',
  },
  
  // Weather & Conditions Section
  conditionsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  
  conditionBox: {
    flex: 1,
    padding: 6,
    backgroundColor: '#f1f5f9',
    border: '1 solid #cbd5e1',
    borderRadius: 3,
    alignItems: 'center',
  },
  
  conditionLabel: {
    fontSize: 7,
    color: '#475569',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  
  conditionValue: {
    fontSize: 9,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  
  // Personnel & Equipment Grid
  resourcesSection: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  
  resourceColumn: {
    flex: 1,
    border: '1 solid #d1d5db',
    borderRadius: 4,
  },
  
  resourceHeader: {
    padding: 6,
    backgroundColor: '#3b82f6',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  
  resourceHeaderText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  
  resourceContent: {
    padding: 8,
    minHeight: 40,
  },
  
  resourceItem: {
    fontSize: 8,
    color: '#374151',
    marginBottom: 2,
    lineHeight: 1.2,
  },
  
  // Work Completed Section
  workSection: {
    marginBottom: 12,
    border: '1 solid #d1d5db',
    borderRadius: 4,
  },
  
  workHeader: {
    padding: 8,
    backgroundColor: '#059669',
  },
  
  workHeaderText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  workContent: {
    padding: 10,
    minHeight: 50,
  },
  
  workText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  
  // Photos Section - Compact Grid Layout
  photosSection: {
    marginTop: 10,
    marginBottom: 15,
  },
  
  photosHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 4,
  },
  
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  
  photoContainer: {
    width: '48%',
    marginBottom: 8,
    border: '1 solid #e5e7eb',
    borderRadius: 3,
    padding: 4,
    backgroundColor: '#fafafa',
  },
  
  photo: {
    width: '100%',
    height: 80,
    objectFit: 'cover',
    borderRadius: 2,
    marginBottom: 3,
  },
  
  photoCaption: {
    fontSize: 7,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  
  // Notes & Issues Section
  notesSection: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 8,
  },
  
  noteColumn: {
    flex: 1,
    border: '1 solid #d1d5db',
    borderRadius: 4,
  },
  
  noteHeader: {
    padding: 6,
    backgroundColor: '#f59e0b',
  },
  
  noteHeaderText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  
  noteContent: {
    padding: 8,
    minHeight: 30,
  },
  
  noteText: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.3,
  },
  
  // Footer Section
  footer: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTop: '1 solid #e5e7eb',
  },
  
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  
  signatureBox: {
    width: 120,
    borderBottom: '1 solid #374151',
    paddingBottom: 2,
    marginBottom: 4,
  },
  
  signatureLabel: {
    fontSize: 7,
    color: '#6b7280',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 8,
    color: '#9ca3af',
  },
});

export default function DailyReportPDF({ reportData }) {
  // Safely handle missing data
  const safeReport = {
    project: reportData?.project || 'Untitled Project',
    date: reportData?.date || new Date().toLocaleDateString(),
    location: reportData?.location || 'Not specified',
    foreman: reportData?.foreman || 'Not assigned',
    weather: reportData?.weather || 'Not recorded',
    temperature: reportData?.temperature || 'N/A',
    workHours: reportData?.workHours || 'Not specified',
    crew: reportData?.crew || [],
    equipment: reportData?.equipment || [],
    workCompleted: reportData?.workCompleted || 'No work description provided.',
    materials: reportData?.materials || 'No materials recorded.',
    notes: reportData?.notes || 'No additional notes.',
    issues: reportData?.issues || 'No issues reported.',
    photos: reportData?.photos || [],
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Professional Header */}
        <View style={styles.header}>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>NORSKK MANAGEMENT</Text>
            <Text style={styles.companyTagline}>Professional Construction Management</Text>
          </View>
          <View style={styles.reportSection}>
            <Text style={styles.reportTitle}>DAILY SITE REPORT</Text>
            <Text style={styles.reportDate}>{safeReport.date}</Text>
          </View>
        </View>

        {/* Project Information Grid */}
        <View style={styles.projectInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Project</Text>
            <Text style={styles.infoValue}>{safeReport.project}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{safeReport.location}</Text>
          </View>
          <View style={styles.infoColumnLast}>
            <Text style={styles.infoLabel}>Foreman</Text>
            <Text style={styles.infoValue}>{safeReport.foreman}</Text>
          </View>
        </View>

        {/* Weather & Conditions */}
        <View style={styles.conditionsRow}>
          <View style={styles.conditionBox}>
            <Text style={styles.conditionLabel}>Weather</Text>
            <Text style={styles.conditionValue}>{safeReport.weather}</Text>
          </View>
          <View style={styles.conditionBox}>
            <Text style={styles.conditionLabel}>Temperature</Text>
            <Text style={styles.conditionValue}>{safeReport.temperature}</Text>
          </View>
          <View style={styles.conditionBox}>
            <Text style={styles.conditionLabel}>Work Hours</Text>
            <Text style={styles.conditionValue}>{safeReport.workHours}</Text>
          </View>
        </View>

        {/* Personnel & Equipment */}
        <View style={styles.resourcesSection}>
          <View style={styles.resourceColumn}>
            <View style={styles.resourceHeader}>
              <Text style={styles.resourceHeaderText}>Personnel On Site</Text>
            </View>
            <View style={styles.resourceContent}>
              {safeReport.crew.length > 0 ? (
                safeReport.crew.map((member, index) => (
                  <Text key={index} style={styles.resourceItem}>• {member}</Text>
                ))
              ) : (
                <Text style={styles.resourceItem}>No crew members recorded</Text>
              )}
            </View>
          </View>
          
          <View style={styles.resourceColumn}>
            <View style={styles.resourceHeader}>
              <Text style={styles.resourceHeaderText}>Equipment Used</Text>
            </View>
            <View style={styles.resourceContent}>
              {safeReport.equipment.length > 0 ? (
                safeReport.equipment.map((item, index) => (
                  <Text key={index} style={styles.resourceItem}>• {item}</Text>
                ))
              ) : (
                <Text style={styles.resourceItem}>No equipment recorded</Text>
              )}
            </View>
          </View>
        </View>

        {/* Work Completed */}
        <View style={styles.workSection}>
          <View style={styles.workHeader}>
            <Text style={styles.workHeaderText}>Work Completed Today</Text>
          </View>
          <View style={styles.workContent}>
            <Text style={styles.workText}>{safeReport.workCompleted}</Text>
          </View>
        </View>

        {/* Notes & Issues */}
        <View style={styles.notesSection}>
          <View style={styles.noteColumn}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteHeaderText}>Materials Used</Text>
            </View>
            <View style={styles.noteContent}>
              <Text style={styles.noteText}>{safeReport.materials}</Text>
            </View>
          </View>
          
          <View style={styles.noteColumn}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteHeaderText}>Issues / Delays</Text>
            </View>
            <View style={styles.noteContent}>
              <Text style={styles.noteText}>{safeReport.issues}</Text>
            </View>
          </View>
        </View>

        {/* Compact Photos Section */}
        {safeReport.photos && safeReport.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.photosHeader}>Site Documentation ({safeReport.photos.length} photos)</Text>
            <View style={styles.photosGrid}>
              {safeReport.photos.slice(0, 4).map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Link src={photo.url}>
                    <Image 
                      style={styles.photo} 
                      src={photo.url}
                      cache={false}
                    />
                  </Link>
                  <Text style={styles.photoCaption}>
                    {photo.name || `Photo ${index + 1}`}
                  </Text>
                </View>
              ))}
            </View>
            {safeReport.photos.length > 4 && (
              <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 4, textAlign: 'center' }}>
                + {safeReport.photos.length - 4} additional photos available in digital format
              </Text>
            )}
          </View>
        )}

        {/* Additional Notes */}
        {safeReport.notes && safeReport.notes !== 'No additional notes.' && (
          <View style={styles.workSection}>
            <View style={[styles.workHeader, { backgroundColor: '#6366f1' }]}>
              <Text style={styles.workHeaderText}>Additional Notes</Text>
            </View>
            <View style={styles.workContent}>
              <Text style={styles.workText}>{safeReport.notes}</Text>
            </View>
          </View>
        )}

        {/* Footer & Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureRow}>
            <View>
              <View style={styles.signatureBox}></View>
              <Text style={styles.signatureLabel}>Foreman Signature</Text>
            </View>
            <View>
              <View style={styles.signatureBox}></View>
              <Text style={styles.signatureLabel}>Project Manager</Text>
            </View>
            <View>
              <Text style={{ fontSize: 8, color: '#6b7280' }}>
                Report Generated: {new Date().toLocaleDateString()}
              </Text>
              <Text style={{ fontSize: 7, color: '#9ca3af', marginTop: 2 }}>
                Norskk Management System v2.0
              </Text>
            </View>
          </View>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
}
