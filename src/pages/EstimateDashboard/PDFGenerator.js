import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import './PDFPreview.css';

// TEMPLATE 1: Executive Modern - Clean and professional
const executiveStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  headerSection: {
    backgroundColor: '#1a365d',
    color: 'white',
    padding: 30,
    borderBottom: 3,
    borderBottomColor: '#3182ce',
  },
  companyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 11,
    opacity: 0.8,
  },
  dateInfo: {
    textAlign: 'right',
  },
  dateLabel: {
    fontSize: 9,
    opacity: 0.7,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  proposalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  projectName: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  bodySection: {
    padding: 30,
    flex: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  infoColumn: {
    flex: 1,
    backgroundColor: '#f7fafc',
    padding: 15,
    marginHorizontal: 5,
    border: 1,
    borderColor: '#e2e8f0',
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 9,
    color: '#4a5568',
    width: 70,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 9,
    color: '#2d3748',
    flex: 1,
  },
  scopeSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 12,
    paddingBottom: 5,
    borderBottom: 2,
    borderBottomColor: '#3182ce',
  },
  scopeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    backgroundColor: '#f7fafc',
    borderLeft: 2,
    borderLeftColor: '#3182ce',
  },
  scopeName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a365d',
    flex: 1,
  },
  scopeAmount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#38a169',
  },
  totalSection: {
    backgroundColor: '#1a365d',
    color: 'white',
    padding: 20,
    textAlign: 'center',
    marginTop: 15,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  notesSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fffbeb',
    borderLeft: 3,
    borderLeftColor: '#f6ad55',
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#744210',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: '#744210',
    lineHeight: 1.3,
  },
});

// TEMPLATE 2: Corporate Clean - Modern blue theme
const corporateStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  headerBand: {
    backgroundColor: '#2563eb',
    height: 6,
  },
  headerSection: {
    padding: 25,
    paddingBottom: 15,
  },
  logoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.3,
  },
  proposalInfo: {
    textAlign: 'right',
  },
  proposalNumber: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 3,
  },
  proposalDate: {
    fontSize: 9,
    color: '#6b7280',
  },
  titleSection: {
    backgroundColor: '#f8fafc',
    padding: 20,
    marginBottom: 25,
    textAlign: 'center',
  },
  proposalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  proposalSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  bodySection: {
    padding: 25,
    paddingTop: 0,
  },
  contentSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottom: 1,
    borderBottomColor: '#2563eb',
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailsColumn: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    marginHorizontal: 4,
    border: 1,
    borderColor: '#e5e7eb',
  },
  detailsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 9,
    color: '#6b7280',
    width: 65,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 9,
    color: '#1f2937',
    flex: 1,
  },
  scopeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 5,
    backgroundColor: '#f8fafc',
    borderLeft: 2,
    borderLeftColor: '#2563eb',
  },
  scopeName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  scopeAmount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  summaryCard: {
    backgroundColor: '#eff6ff',
    padding: 20,
    textAlign: 'center',
    border: 1,
    borderColor: '#2563eb',
    marginTop: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  footer: {
    marginTop: 25,
    paddingTop: 15,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
  },
  notesSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderLeft: 3,
    borderLeftColor: '#f59e0b',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 8,
    color: '#92400e',
    lineHeight: 1.3,
  },
});

// TEMPLATE 3: Technical Construction - Orange industrial theme
const technicalStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fafafa',
    padding: 25,
    fontFamily: 'Helvetica',
  },
  headerBand: {
    backgroundColor: '#ea580c',
    color: 'white',
    padding: 25,
    marginBottom: 20,
  },
  techTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  techSubtitle: {
    fontSize: 12,
    opacity: 0.9,
  },
  specSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15,
    border: 1,
    borderColor: '#d1d5db',
    borderLeft: 4,
    borderLeftColor: '#ea580c',
  },
  specTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: 1,
    borderBottomColor: '#f3f4f6',
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specItem: {
    width: '48%',
    marginBottom: 8,
    marginRight: '2%',
  },
  specLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  specValue: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    padding: 15,
    marginBottom: 15,
    borderLeft: 3,
    borderLeftColor: '#f59e0b',
  },
  warningTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 9,
    color: '#78350f',
    lineHeight: 1.3,
  },
  costBreakdown: {
    backgroundColor: '#4b5563',
    color: 'white',
    padding: 20,
    textAlign: 'center',
    marginTop: 15,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  breakdownAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

// TEMPLATE 4: Elegant Minimalist - Black and white
const elegantStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  elegantHeader: {
    textAlign: 'center',
    marginBottom: 40,
    paddingBottom: 25,
    borderBottom: 1,
    borderBottomColor: '#000000',
  },
  mainHeading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  companyLine: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  dateLine: {
    fontSize: 10,
    color: '#999999',
  },
  clientSection: {
    backgroundColor: '#f9f9f9',
    padding: 25,
    marginBottom: 30,
    textAlign: 'center',
  },
  clientTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  clientInfo: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  proposalSection: {
    marginBottom: 30,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
  },
  elegantTable: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: 2,
    borderBottomColor: '#000000',
    paddingBottom: 8,
    marginBottom: 12,
  },
  tableColumn: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottom: 1,
    borderBottomColor: '#eeeeee',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#333333',
    textAlign: 'center',
  },
  grandTotal: {
    backgroundColor: '#000000',
    color: 'white',
    padding: 20,
    textAlign: 'center',
    marginTop: 25,
  },
  totalText: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalFigure: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});

// TEMPLATE 1: Executive Modern Template
const ExecutiveTemplate = ({ project, scopes, scopeItems, totalAmount, options }) => {
  const currentDate = new Date().toLocaleDateString();
  const validUntil = new Date(Date.now() + (parseInt(options.validityPeriod) * 24 * 60 * 60 * 1000)).toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={executiveStyles.page}>
        {/* Professional Header */}
        <View style={executiveStyles.headerSection}>
          <View style={executiveStyles.companyHeader}>
            <View style={executiveStyles.companyInfo}>
              <Text style={executiveStyles.companyName}>{options.companyName}</Text>
              <Text style={executiveStyles.companyTagline}>Professional Construction Services</Text>
            </View>
            <View style={executiveStyles.dateInfo}>
              <Text style={executiveStyles.dateLabel}>PREPARED ON</Text>
              <Text style={executiveStyles.dateValue}>{currentDate}</Text>
            </View>
          </View>
          <Text style={executiveStyles.proposalTitle}>PROJECT PROPOSAL</Text>
          <Text style={executiveStyles.projectName}>{project?.name || 'Construction Project'}</Text>
        </View>

        {/* Body Content */}
        <View style={executiveStyles.bodySection}>
          {/* Information Grid */}
          <View style={executiveStyles.infoGrid}>
            <View style={executiveStyles.infoColumn}>
              <Text style={executiveStyles.columnTitle}>Project Details</Text>
              <View style={executiveStyles.infoRow}>
                <Text style={executiveStyles.infoLabel}>Location:</Text>
                <Text style={executiveStyles.infoValue}>{project?.address || 'N/A'}</Text>
              </View>
              <View style={executiveStyles.infoRow}>
                <Text style={executiveStyles.infoLabel}>Client:</Text>
                <Text style={executiveStyles.infoValue}>{project?.developer || 'N/A'}</Text>
              </View>
              <View style={executiveStyles.infoRow}>
                <Text style={executiveStyles.infoLabel}>Estimator:</Text>
                <Text style={executiveStyles.infoValue}>{project?.estimator || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={executiveStyles.infoColumn}>
              <Text style={executiveStyles.columnTitle}>Contact Information</Text>
              {options.companyAddress && (
                <View style={executiveStyles.infoRow}>
                  <Text style={executiveStyles.infoLabel}>Address:</Text>
                  <Text style={executiveStyles.infoValue}>{options.companyAddress}</Text>
                </View>
              )}
              {options.companyPhone && (
                <View style={executiveStyles.infoRow}>
                  <Text style={executiveStyles.infoLabel}>Phone:</Text>
                  <Text style={executiveStyles.infoValue}>{options.companyPhone}</Text>
                </View>
              )}
              <View style={executiveStyles.infoRow}>
                <Text style={executiveStyles.infoLabel}>Valid Until:</Text>
                <Text style={executiveStyles.infoValue}>{validUntil}</Text>
              </View>
            </View>
          </View>

          {/* Scope Breakdown */}
          <View style={executiveStyles.scopeSection}>
            <Text style={executiveStyles.sectionTitle}>Project Scope</Text>
            {scopes.map((scope, index) => (
              <View key={index} style={executiveStyles.scopeItem}>
                <Text style={executiveStyles.scopeName}>{scope.name}</Text>
                <Text style={executiveStyles.scopeAmount}>${scope.total?.toFixed(2) || '0.00'}</Text>
              </View>
            ))}
          </View>

          {/* Custom Notes */}
          {options.customNotes && (
            <View style={executiveStyles.notesSection}>
              <Text style={executiveStyles.notesTitle}>PROJECT NOTES</Text>
              <Text style={executiveStyles.notesText}>{options.customNotes}</Text>
            </View>
          )}
        </View>

        {/* Total Section */}
        <View style={executiveStyles.totalSection}>
          <Text style={executiveStyles.totalLabel}>TOTAL PROJECT INVESTMENT</Text>
          <Text style={executiveStyles.totalAmount}>${totalAmount}</Text>
        </View>
      </Page>
    </Document>
  );
};

// TEMPLATE 2: Corporate Clean Template
const CorporateTemplate = ({ project, scopes, scopeItems, totalAmount, options }) => {
  const currentDate = new Date().toLocaleDateString();
  const proposalNumber = `PROP-${Date.now().toString().slice(-6)}`;

  return (
    <Document>
      <Page size="A4" style={corporateStyles.page}>
        {/* Header Band */}
        <View style={corporateStyles.headerBand} />
        
        {/* Header Section */}
        <View style={corporateStyles.headerSection}>
          <View style={corporateStyles.logoSection}>
            <View style={corporateStyles.companyDetails}>
              <Text style={corporateStyles.companyName}>{options.companyName}</Text>
              {options.companyAddress && (
                <Text style={corporateStyles.companyAddress}>{options.companyAddress}</Text>
              )}
            </View>
            <View style={corporateStyles.proposalInfo}>
              <Text style={corporateStyles.proposalNumber}>Proposal #{proposalNumber}</Text>
              <Text style={corporateStyles.proposalDate}>{currentDate}</Text>
            </View>
          </View>

          <View style={corporateStyles.titleSection}>
            <Text style={corporateStyles.proposalTitle}>{options.proposalTitle || 'PROJECT PROPOSAL'}</Text>
            <Text style={corporateStyles.proposalSubtitle}>Prepared for {project?.developer || 'Valued Client'}</Text>
          </View>
        </View>

        {/* Body Section */}
        <View style={corporateStyles.bodySection}>
          <View style={corporateStyles.contentSection}>
            <Text style={corporateStyles.sectionHeader}>Project Information</Text>
            <View style={corporateStyles.detailsGrid}>
              <View style={corporateStyles.detailsColumn}>
                <Text style={corporateStyles.detailsTitle}>Project Details</Text>
                <View style={corporateStyles.detailRow}>
                  <Text style={corporateStyles.detailLabel}>Project:</Text>
                  <Text style={corporateStyles.detailValue}>{project?.name || 'N/A'}</Text>
                </View>
                <View style={corporateStyles.detailRow}>
                  <Text style={corporateStyles.detailLabel}>Location:</Text>
                  <Text style={corporateStyles.detailValue}>{project?.address || 'N/A'}</Text>
                </View>
                <View style={corporateStyles.detailRow}>
                  <Text style={corporateStyles.detailLabel}>Estimator:</Text>
                  <Text style={corporateStyles.detailValue}>{project?.estimator || 'N/A'}</Text>
                </View>
              </View>

              <View style={corporateStyles.detailsColumn}>
                <Text style={corporateStyles.detailsTitle}>Contact Information</Text>
                {options.companyPhone && (
                  <View style={corporateStyles.detailRow}>
                    <Text style={corporateStyles.detailLabel}>Phone:</Text>
                    <Text style={corporateStyles.detailValue}>{options.companyPhone}</Text>
                  </View>
                )}
                {options.companyEmail && (
                  <View style={corporateStyles.detailRow}>
                    <Text style={corporateStyles.detailLabel}>Email:</Text>
                    <Text style={corporateStyles.detailValue}>{options.companyEmail}</Text>
                  </View>
                )}
                <View style={corporateStyles.detailRow}>
                  <Text style={corporateStyles.detailLabel}>Valid:</Text>
                  <Text style={corporateStyles.detailValue}>
                    {new Date(Date.now() + (parseInt(options.validityPeriod) * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Scope Breakdown */}
          <View style={corporateStyles.contentSection}>
            <Text style={corporateStyles.sectionHeader}>Scope Breakdown</Text>
            {scopes.map((scope, index) => (
              <View key={index} style={corporateStyles.scopeItem}>
                <Text style={corporateStyles.scopeName}>{scope.name}</Text>
                <Text style={corporateStyles.scopeAmount}>${scope.total?.toFixed(2) || '0.00'}</Text>
              </View>
            ))}
          </View>

          {/* Custom Notes */}
          {options.customNotes && (
            <View style={corporateStyles.notesSection}>
              <Text style={corporateStyles.notesTitle}>ADDITIONAL NOTES</Text>
              <Text style={corporateStyles.notesText}>{options.customNotes}</Text>
            </View>
          )}

          {/* Summary */}
          <View style={corporateStyles.summaryCard}>
            <Text style={corporateStyles.summaryTitle}>TOTAL PROJECT COST</Text>
            <Text style={corporateStyles.summaryAmount}>${totalAmount}</Text>
          </View>

          <View style={corporateStyles.footer}>
            <Text style={corporateStyles.footerText}>Thank you for considering {options.companyName} for your project</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// TEMPLATE 3: Technical Construction Template
const TechnicalTemplate = ({ project, scopes, scopeItems, totalAmount, options }) => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={technicalStyles.page}>
        {/* Technical Header */}
        <View style={technicalStyles.headerBand}>
          <Text style={technicalStyles.techTitle}>CONSTRUCTION ESTIMATE</Text>
          <Text style={technicalStyles.techSubtitle}>Technical Specification & Cost Analysis</Text>
        </View>

        {/* Project Specifications */}
        <View style={technicalStyles.specSection}>
          <Text style={technicalStyles.specTitle}>Project Specifications</Text>
          <View style={technicalStyles.specGrid}>
            <View style={technicalStyles.specItem}>
              <Text style={technicalStyles.specLabel}>PROJECT NAME</Text>
              <Text style={technicalStyles.specValue}>{project?.name || 'N/A'}</Text>
            </View>
            <View style={technicalStyles.specItem}>
              <Text style={technicalStyles.specLabel}>LOCATION</Text>
              <Text style={technicalStyles.specValue}>{project?.address || 'N/A'}</Text>
            </View>
            <View style={technicalStyles.specItem}>
              <Text style={technicalStyles.specLabel}>CLIENT</Text>
              <Text style={technicalStyles.specValue}>{project?.developer || 'N/A'}</Text>
            </View>
            <View style={technicalStyles.specItem}>
              <Text style={technicalStyles.specLabel}>ESTIMATOR</Text>
              <Text style={technicalStyles.specValue}>{project?.estimator || 'N/A'}</Text>
            </View>
            <View style={technicalStyles.specItem}>
              <Text style={technicalStyles.specLabel}>DATE PREPARED</Text>
              <Text style={technicalStyles.specValue}>{currentDate}</Text>
            </View>
            <View style={technicalStyles.specItem}>
              <Text style={technicalStyles.specLabel}>VALID UNTIL</Text>
              <Text style={technicalStyles.specValue}>
                {new Date(Date.now() + (parseInt(options.validityPeriod) * 24 * 60 * 60 * 1000)).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Company Information */}
        <View style={technicalStyles.specSection}>
          <Text style={technicalStyles.specTitle}>Contractor Information</Text>
          <View style={technicalStyles.specGrid}>
            <View style={technicalStyles.specItem}>
              <Text style={technicalStyles.specLabel}>COMPANY</Text>
              <Text style={technicalStyles.specValue}>{options.companyName}</Text>
            </View>
            {options.companyAddress && (
              <View style={technicalStyles.specItem}>
                <Text style={technicalStyles.specLabel}>ADDRESS</Text>
                <Text style={technicalStyles.specValue}>{options.companyAddress}</Text>
              </View>
            )}
            {options.companyPhone && (
              <View style={technicalStyles.specItem}>
                <Text style={technicalStyles.specLabel}>PHONE</Text>
                <Text style={technicalStyles.specValue}>{options.companyPhone}</Text>
              </View>
            )}
            {options.companyEmail && (
              <View style={technicalStyles.specItem}>
                <Text style={technicalStyles.specLabel}>EMAIL</Text>
                <Text style={technicalStyles.specValue}>{options.companyEmail}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Technical Notes */}
        <View style={technicalStyles.warningBox}>
          <Text style={technicalStyles.warningTitle}>IMPORTANT TECHNICAL NOTES</Text>
          <Text style={technicalStyles.warningText}>
            • All costs based on current material pricing and may be subject to market fluctuations{'\n'}
            • Estimate includes standard construction practices and building code compliance{'\n'}
            • Site conditions may affect final pricing - contingency recommended{'\n'}
            • Permits, inspections, and utility connections not included unless specified
          </Text>
        </View>

        {/* Scope Breakdown */}
        <View style={technicalStyles.specSection}>
          <Text style={technicalStyles.specTitle}>Technical Scope Breakdown</Text>
          {scopes.map((scope, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 6,
              paddingHorizontal: 8,
              marginBottom: 3,
              backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff',
              borderLeft: 2,
              borderLeftColor: '#ea580c',
            }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1f2937', flex: 1 }}>
                {scope.name}
              </Text>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#059669' }}>
                ${scope.total?.toFixed(2) || '0.00'}
              </Text>
            </View>
          ))}
        </View>

        {/* Custom Notes */}
        {options.customNotes && (
          <View style={technicalStyles.specSection}>
            <Text style={technicalStyles.specTitle}>Additional Technical Notes</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.3, color: '#1f2937' }}>
              {options.customNotes}
            </Text>
          </View>
        )}

        {/* Cost Summary */}
        <View style={technicalStyles.costBreakdown}>
          <Text style={technicalStyles.breakdownTitle}>TOTAL PROJECT COST</Text>
          <Text style={technicalStyles.breakdownAmount}>${totalAmount}</Text>
        </View>
      </Page>
    </Document>
  );
};

// TEMPLATE 4: Elegant Minimalist Template
const ElegantTemplate = ({ project, scopes, scopeItems, totalAmount, options }) => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={elegantStyles.page}>
        {/* Elegant Header */}
        <View style={elegantStyles.elegantHeader}>
          <Text style={elegantStyles.mainHeading}>PROPOSAL</Text>
          <Text style={elegantStyles.companyLine}>{options.companyName}</Text>
          <Text style={elegantStyles.dateLine}>{currentDate}</Text>
        </View>

        {/* Client Section */}
        <View style={elegantStyles.clientSection}>
          <Text style={elegantStyles.clientTitle}>PREPARED FOR</Text>
          <Text style={elegantStyles.clientInfo}>{project?.developer || 'Valued Client'}</Text>
          <Text style={elegantStyles.clientInfo}>{project?.name || 'Construction Project'}</Text>
          <Text style={elegantStyles.clientInfo}>{project?.address || ''}</Text>
        </View>

        {/* Project Details */}
        <View style={elegantStyles.proposalSection}>
          <Text style={elegantStyles.sectionHeading}>PROJECT INFORMATION</Text>
          
          <View style={elegantStyles.elegantTable}>
            <View style={elegantStyles.tableHeader}>
              <Text style={elegantStyles.tableColumn}>Detail</Text>
              <Text style={elegantStyles.tableColumn}>Information</Text>
            </View>

            <View style={elegantStyles.tableRow}>
              <Text style={elegantStyles.tableCell}>Project</Text>
              <Text style={elegantStyles.tableCell}>{project?.name || 'N/A'}</Text>
            </View>
            
            <View style={elegantStyles.tableRow}>
              <Text style={elegantStyles.tableCell}>Location</Text>
              <Text style={elegantStyles.tableCell}>{project?.address || 'N/A'}</Text>
            </View>
            
            <View style={elegantStyles.tableRow}>
              <Text style={elegantStyles.tableCell}>Estimator</Text>
              <Text style={elegantStyles.tableCell}>{project?.estimator || 'N/A'}</Text>
            </View>
            
            <View style={elegantStyles.tableRow}>
              <Text style={elegantStyles.tableCell}>Valid Until</Text>
              <Text style={elegantStyles.tableCell}>
                {new Date(Date.now() + (parseInt(options.validityPeriod) * 24 * 60 * 60 * 1000)).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Scope Breakdown */}
        <View style={elegantStyles.proposalSection}>
          <Text style={elegantStyles.sectionHeading}>SCOPE BREAKDOWN</Text>
          
          <View style={elegantStyles.elegantTable}>
            <View style={elegantStyles.tableHeader}>
              <Text style={elegantStyles.tableColumn}>Scope</Text>
              <Text style={elegantStyles.tableColumn}>Amount</Text>
            </View>

            {scopes.map((scope, index) => (
              <View key={index} style={elegantStyles.tableRow}>
                <Text style={elegantStyles.tableCell}>{scope.name}</Text>
                <Text style={elegantStyles.tableCell}>${scope.total?.toFixed(2) || '0.00'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Custom Notes */}
        {options.customNotes && (
          <View style={elegantStyles.proposalSection}>
            <Text style={elegantStyles.sectionHeading}>NOTES</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5, color: '#333333', textAlign: 'center' }}>
              {options.customNotes}
            </Text>
          </View>
        )}

        {/* Grand Total */}
        <View style={elegantStyles.grandTotal}>
          <Text style={elegantStyles.totalText}>TOTAL</Text>
          <Text style={elegantStyles.totalFigure}>${totalAmount}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Export the generator function
export const generatePDF = (template, project, scopes, scopeItems, totalAmount, options) => {
  const props = { project, scopes, scopeItems, totalAmount, options };
  
  switch (template) {
    case 'executive':
      return <ExecutiveTemplate {...props} />;
    case 'corporate':
      return <CorporateTemplate {...props} />;
    case 'technical':
      return <TechnicalTemplate {...props} />;
    case 'elegant':
      return <ElegantTemplate {...props} />;
    default:
      return <CorporateTemplate {...props} />;
  }
};

// PDF Preview Component
export const PDFPreviewModal = ({ isOpen, onClose, template, project, scopes, scopeItems, totalAmount, options }) => {
  if (!isOpen) return null;

  const pdfDocument = generatePDF(template, project, scopes, scopeItems, totalAmount, options);
  const fileName = `${project?.name || 'Proposal'}_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <div className="pdf-preview-modal">
      <div className="pdf-preview-overlay" onClick={onClose}></div>
      <div className="pdf-preview-content">
        <div className="pdf-preview-header">
          <h3>PDF Preview - {template.charAt(0).toUpperCase() + template.slice(1)} Template</h3>
          <div className="pdf-preview-actions">
            <PDFDownloadLink
              document={pdfDocument}
              fileName={fileName}
              className="btn btn-primary"
              style={{ textDecoration: 'none', marginRight: '10px' }}
            >
              {({ blob, url, loading, error }) => (
                loading ? 'Preparing download...' : 'Download PDF'
              )}
            </PDFDownloadLink>
            <button onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        </div>
        <div className="pdf-preview-viewer">
          <PDFViewer width="100%" height="600px">
            {pdfDocument}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

// PDF Download Component (kept for backward compatibility)
export const PDFDownloadButton = ({ template, project, scopes, scopeItems, totalAmount, options, children, className, disabled }) => {
  const pdfDocument = generatePDF(template, project, scopes, scopeItems, totalAmount, options);
  const fileName = `${project?.name || 'Proposal'}_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={pdfDocument}
      fileName={fileName}
      className={className}
      style={{ textDecoration: 'none' }}
    >
      {({ blob, url, loading, error }) => (
        <button 
          className={className} 
          disabled={disabled || loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Generating...
            </>
          ) : (
            children || 'Download PDF'
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
};
