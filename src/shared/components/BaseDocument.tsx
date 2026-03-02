import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos Reutilizáveis
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#15803d', paddingBottom: 10 },
  brandTitle: { color: '#15803d', fontSize: 24, fontWeight: 'black', textTransform: 'uppercase' },
  reportTitle: { fontSize: 14, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  
  section: { marginBottom: 15, padding: 10, backgroundColor: '#f8fafc', borderRadius: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#15803d', marginBottom: 8, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
  
  row: { flexDirection: 'row', marginBottom: 8, flexWrap: 'wrap' },
  col: { flexGrow: 1, flexBasis: '30%', paddingRight: 10, marginBottom: 8 },
  
  label: { color: '#64748b', fontSize: 8, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 11, fontWeight: 'medium', color: '#1e293b' },
  
  // Tabela para listas dinâmicas (ex: várias comissões)
  table: { width: '100%', marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 6, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableCol: { flex: 1 },
  tableColRight: { flex: 1, textAlign: 'right' },
  tableLabel: { fontSize: 9, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' },
  tableValue: { fontSize: 9, color: '#334155' },
  
  totalBox: { marginTop: 10, alignItems: 'flex-end', padding: 10, backgroundColor: '#dcfce7', borderRadius: 4 },
  totalLabel: { fontSize: 10, color: '#166534', fontWeight: 'bold' },
  totalValue: { fontSize: 18, color: '#15803d', fontWeight: 'bold' },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 8, borderTopWidth: 1, borderColor: '#e2e8f0', paddingTop: 10 }
});

// Tipagem Flexível
export interface BaseDocumentProps {
  documentTitle: string;
  subTitle?: string;
  charts?: string[]; // Array de URLs de imagens
  
  // Blocos de informações gerais (ex: Identificação do Funcionário)
  sections?: {
    title: string;
    fields: { label: string; value: string | number }[];
  }[];

  // Dados para renderizar uma tabela (ex: Extrato de vendas)
  tableData?: {
    headers: string[]; // ["Data", "Cliente", "Valor"]
    rows: (string | number)[][]; // [ ["01/01", "ABC", 100], ["02/01", "XYZ", 200] ]
  };

  // Caixa de destaque no final (ex: Total a receber)
  highlightTotal?: {
    label: string;
    value: string | number;
  };
}

export default function BaseDocument({ documentTitle, subTitle, charts, sections, tableData, highlightTotal }: BaseDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Cabeçalho Fixo da Marca */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>SOMOS</Text>
            <Text style={{fontSize: 8, color: '#15803d'}}>EMPILHADEIRAS</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.reportTitle}>{documentTitle}</Text>
            {subTitle && <Text style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>{subTitle}</Text>}
          </View>
        </View>

        {/* Gráficos (Renderiza se existirem URLs na prop charts) */}
        {charts && charts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise Gráfica</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {charts.map((url, idx) => (
                // O SEGREDRO: Se for base64 precisa ser tratado diferente
                <Image 
                  key={idx} 
                  src={url.startsWith('http') ? url : { uri: url, method: 'GET', headers: {}, body: '' }} 
                  style={{ width: '48%', height: 160, objectFit: 'contain' }} 
                />
              ))}
            </View>
          </View>
        )}

        {/* Renderização Dinâmica de Seções (Blocos 2x2 ou 3x3) */}
        {sections && sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.row}>
              {section.fields.map((field, fIdx) => (
                <View key={fIdx} style={styles.col}>
                  <Text style={styles.label}>{field.label}</Text>
                  <Text style={styles.value}>{field.value || '-'}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Renderização de Tabela (Perfeito para Extratos) */}
        {tableData && tableData.headers.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              {tableData.headers.map((header, idx) => (
                 <View key={idx} style={idx === tableData.headers.length - 1 ? styles.tableColRight : styles.tableCol}>
                    <Text style={styles.tableLabel}>{header}</Text>
                 </View>
              ))}
            </View>
            {tableData.rows.map((row, rIdx) => (
              <View key={rIdx} style={styles.tableRow}>
                {row.map((cell, cIdx) => (
                  <View key={cIdx} style={cIdx === row.length - 1 ? styles.tableColRight : styles.tableCol}>
                    <Text style={styles.tableValue}>{cell}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Destaque Financeiro */}
        {highlightTotal && (
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>{highlightTotal.label}</Text>
            <Text style={styles.totalValue}>{highlightTotal.value}</Text>
          </View>
        )}

        <Text style={styles.footer}>Documento gerado digitalmente via Portal Somos Empilhadeiras - {new Date().toLocaleDateString('pt-BR')}</Text>
      </Page>
    </Document>
  );
}