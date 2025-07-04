import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';

// Define styles without custom fonts to avoid loading issues
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  
  // Header styles
  header: {
    backgroundColor: '#2C3E50',
    padding: 15,
    marginBottom: 20,
    borderRadius: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  companySubtitle: {
    fontSize: 9,
    color: '#BDC3C7',
  },
  
  // Title section
  titleSection: {
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  reportDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  
  // Info grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 4,
    border: '1px solid #E9ECEF',
    marginBottom: 20,
  },
  infoItem: {
    width: '50%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    color: '#212529',
  },
  
  // Crew members
  crewSection: {
    marginTop: 10,
    width: '100%',
  },
  crewTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 5,
  },
  crewMember: {
    fontSize: 9,
    color: '#6C757D',
    marginBottom: 2,
  },
  
  // Section headers
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    marginTop: 15,
  },
  
  // Text content
  textSection: {
    marginBottom: 15,
  },
  textLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 5,
  },
  textContent: {
    fontSize: 9,
    color: '#212529',
    lineHeight: 1.4,
  },
  
  // Equipment list
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentItem: {
    fontSize: 9,
    color: '#6C757D',
    marginRight: 15,
    marginBottom: 3,
  },
  
  // Photos section
  photosSection: {
    marginTop: 20,
  },
  photoNote: {
    fontSize: 8,
    color: '#6C757D',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  photoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  photo: {
    maxWidth: '70%',
    maxHeight: 200,
    objectFit: 'contain',
    borderRadius: 4,
    border: '1px solid #E9ECEF',
  },
  photoCaption: {
    fontSize: 9,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 5,
  },
  photoMeta: {
    fontSize: 7,
    color: '#ADB5BD',
    textAlign: 'center',
    marginTop: 2,
  },
  
  // Footer
  footer: {
    marginTop: 30,
    borderTop: '1px solid #E9ECEF',
    paddingTop: 15,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: 150,
    height: 40,
    border: '1px solid #ADB5BD',
    borderRadius: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#6C757D',
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#212529',
  },
  reportMeta: {
    alignItems: 'flex-end',
  },
  metaItem: {
    fontSize: 8,
    color: '#6C757D',
    marginBottom: 2,
  },
  
  // Page numbers
  pageNumber: {
    position: 'absolute',
    fontSize: 7,
    bottom: 20,
    right: 30,
    color: '#ADB5BD',
  },
});

const DailyReportPDF = ({ reportData }) => {
  // Safety check for report data
  const safeReport = {
    project: reportData?.project || 'No project specified',
    supervisor: reportData?.supervisor || 'No supervisor specified',
    date: reportData?.date || new Date().toISOString().split('T')[0],
    workersOnSite: reportData?.workersOnSite || 0,
    workCompleted: reportData?.workCompleted || 'No work details provided',
    issuesDelays: reportData?.issuesDelays || '',
    equipmentUsed: reportData?.equipmentUsed || [],
    selectedCrewMembers: reportData?.selectedCrewMembers || [],
    selectedEquipment: reportData?.selectedEquipment || [],
    photos: reportData?.photos || [],
    status: reportData?.status || 'draft',
    submittedAt: reportData?.submittedAt || null
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date provided';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateStr;
    }
  };

  return (
    <Document>
      {/* Page 1: Main Content */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>NORSKK MANAGEMENT</Text>
          <Text style={styles.companySubtitle}>Construction Management & Consulting</Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.reportTitle}>DAILY SITE REPORT</Text>
          <Text style={styles.reportDate}>{formatDate(safeReport.date)}</Text>
        </View>

        {/* Basic Information Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Project:</Text>
            <Text style={styles.infoValue}>{safeReport.project}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{new Date(safeReport.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Supervisor:</Text>
            <Text style={styles.infoValue}>{safeReport.supervisor}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Number of Crew Members:</Text>
            <Text style={styles.infoValue}>{safeReport.selectedCrewMembers.length}</Text>
          </View>
          
          {/* Crew Members */}
          {safeReport.selectedCrewMembers && safeReport.selectedCrewMembers.length > 0 && (
            <View style={styles.crewSection}>
              <Text style={styles.crewTitle}>Crew Members:</Text>
              {safeReport.selectedCrewMembers.map((member, index) => (
                <Text key={member.id || index} style={styles.crewMember}>
                  • {member.name} ({member.role})
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Work Progress */}
        <Text style={styles.sectionTitle}>Work Progress</Text>
        <View style={styles.textSection}>
          <Text style={styles.textLabel}>Work Completed Today:</Text>
          <Text style={styles.textContent}>{safeReport.workCompleted}</Text>
        </View>
        <View style={styles.textSection}>
          <Text style={styles.textLabel}>Issues or Delays:</Text>
          <Text style={styles.textContent}>{safeReport.issuesDelays || 'None reported'}</Text>
        </View>

        {/* Equipment */}
        {((safeReport.selectedEquipment && safeReport.selectedEquipment.length > 0) || 
          (safeReport.equipmentUsed && safeReport.equipmentUsed.length > 0)) && (
          <>
            <Text style={styles.sectionTitle}>Equipment Used</Text>
            <View style={styles.equipmentList}>
              {/* Display selectedEquipment (new format) first */}
              {safeReport.selectedEquipment && safeReport.selectedEquipment.map((equipment, index) => (
                <Text key={`selected-${index}`} style={styles.equipmentItem}>
                  • {equipment.name} ({equipment.type})
                </Text>
              ))}
              {/* Fallback to old equipmentUsed format if no selectedEquipment */}
              {(!safeReport.selectedEquipment || safeReport.selectedEquipment.length === 0) && 
               safeReport.equipmentUsed && safeReport.equipmentUsed.map((equipment, index) => (
                <Text key={`legacy-${index}`} style={styles.equipmentItem}>
                  • {equipment.name || equipment}
                </Text>
              ))}
            </View>
          </>
        )}

        {/* Page Number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      {/* Page 2: Photos (if any) */}
      {safeReport.photos && safeReport.photos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Site Photos</Text>
          <Text style={styles.photoNote}>
            Click on any image to open the full-size version in a new tab
          </Text>
          
          <View style={styles.photosSection}>
            {safeReport.photos.map((photo, index) => {
              // Debug photo data
              console.log(`PDF Photo ${index}:`, {
                name: photo.name,
                urlType: photo.url?.startsWith('data:') ? 'base64' : 
                        photo.url?.startsWith('http') ? 'firebase' : 
                        photo.url?.startsWith('blob:') ? 'blob' : 'none',
                urlLength: photo.url?.length || 0,
                pdfReady: photo.pdfReady,
                hasOriginalUrl: !!photo.originalUrl
              });
              
              // Show placeholder for photos that couldn't be converted for PDF
              if (!photo.url || photo.pdfReady === false) {
                return (
                  <View key={index} style={styles.photoContainer}>
                    <View style={[styles.photo, { 
                      backgroundColor: '#f8f9fa', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px dashed #dee2e6',
                      padding: 20
                    }]}>
                      <Text style={{ color: '#6c757d', fontSize: 10, textAlign: 'center', marginBottom: 4 }}>
                        📷 Image not available in PDF
                      </Text>
                      <Text style={{ color: '#6c757d', fontSize: 8, textAlign: 'center' }}>
                        {photo.originalUrl ? 'CORS restriction - view in web form' : 'Image could not be loaded'}
                      </Text>
                    </View>
                    <Text style={styles.photoCaption}>{photo.name}</Text>
                    <Text style={styles.photoMeta}>
                      Image {index + 1} of {safeReport.photos.length}
                      {photo.originalUrl && (
                        <Text style={{ fontSize: 8 }}> • Available in web version</Text>
                      )}
                    </Text>
                  </View>
                );
              }
              
              return (
                <View key={index} style={styles.photoContainer}>
                  {photo.originalUrl ? (
                    <Link src={photo.originalUrl}>
                      <Image 
                        style={styles.photo} 
                        src={photo.url}
                        cache={false}
                        onError={() => console.warn(`Failed to load image: ${photo.name}`)}
                      />
                    </Link>
                  ) : (
                    <Image 
                      style={styles.photo} 
                      src={photo.url}
                      cache={false}
                      onError={() => console.warn(`Failed to load image: ${photo.name}`)}
                    />
                  )}
                  <Text style={styles.photoCaption}>{photo.name}</Text>
                  <Text style={styles.photoMeta}>
                    Image {index + 1} of {safeReport.photos.length}
                    {photo.pdfReady === false && ' (⚠️ May not display properly)'}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Page Number */}
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Final Page: Signature */}
      <Page size="A4" style={styles.page}>
        <View style={styles.footer}>
          <View style={styles.signatureSection}>
            <View>
              <Text style={styles.signatureLabel}>Supervisor Signature:</Text>
              <View style={styles.signatureBox}></View>
              <Text style={styles.signatureName}>{safeReport.supervisor}</Text>
            </View>
            
            <View style={styles.reportMeta}>
              <Text style={styles.metaItem}>Status: {safeReport.status}</Text>
              {safeReport.submittedAt && (
                <Text style={styles.metaItem}>
                  Submitted: {new Date(safeReport.submittedAt).toLocaleString()}
                </Text>
              )}
              <Text style={styles.metaItem}>
                Generated: {new Date().toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default DailyReportPDF;
