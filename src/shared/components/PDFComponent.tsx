import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#15803d', paddingBottom: 10 },
  brandTitle: { color: '#15803d', fontSize: 24, fontWeight: 'black', textTransform: 'uppercase' },
  reportTitle: { fontSize: 14, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  section: { marginBottom: 15, padding: 10, backgroundColor: '#f8fafc', borderRadius: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#15803d', marginBottom: 8, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 8 },
  col: { flexGrow: 1, flexBasis: 0 },
  label: { color: '#64748b', fontSize: 8, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 11, fontWeight: 'medium' },
  totalBox: { marginTop: 10, alignItems: 'flex-end', padding: 10, backgroundColor: '#dcfce7', borderRadius: 4 },
  totalLabel: { fontSize: 10, color: '#166534', fontWeight: 'bold' },
  totalValue: { fontSize: 18, color: '#15803d', fontWeight: 'bold' },
  receiptContainer: { marginTop: 20, height: 300, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#cbd5e1', backgroundColor: '#f1f5f9' },
  receiptImage: { objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 8, borderTopWidth: 1, borderColor: '#e2e8f0', paddingTop: 10 }
});

// Interface exportada
export interface FormValuesProps {
  email: string;
  nome: string;
  parceiro: string;
  relatorio: string;
  tipo_pagamento: string;
  data_cupom: string;
  nome_estabelecimento: string;
  tipo_despesa: string;
  valor_cupom: number;
  declaracao_veracidade: boolean;
  foto_cupom: File | null;
  foto_cupom_base64?: string | null;
}

// Componente Default
export default function DespesaDocument({ data, receiptUrl, docState }: { data: FormValuesProps, receiptUrl: string | null, docState?: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>SOMOS</Text>
            <Text style={{fontSize: 8, color: '#15803d'}}>EMPILHADEIRAS</Text>
          </View>
          <Text style={styles.reportTitle}>Relatório de Despesa</Text>
        </View>

        {/* Identificação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificação</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value}>{data.nome || '-'}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{data.email || '-'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Parceiro</Text>
              <Text style={styles.value}>{data.parceiro || '-'}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Estado</Text>
              <Text style={styles.value}>{docState || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Detalhes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Despesa</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Data</Text>
              <Text style={styles.value}>{data.data_cupom ? new Date(data.data_cupom).toLocaleDateString('pt-BR') : '-'}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Categoria</Text>
              <Text style={styles.value}>{data.tipo_despesa || '-'}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Pagamento</Text>
              <Text style={styles.value}>{data.tipo_pagamento || '-'}</Text>
            </View>
          </View>
          <View style={{ marginTop: 5 }}>
            <Text style={styles.label}>Descrição</Text>
            <Text style={styles.value}>{data.relatorio || '-'}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>R$ {Number(data.valor_cupom).toFixed(2)}</Text>
          </View>
        </View>

        {/* Comprovante */}
        <Text style={styles.sectionTitle}>Comprovante</Text>
        <View style={styles.receiptContainer}>
          {receiptUrl || data.foto_cupom_base64 ? (
            <Image src={receiptUrl || data.foto_cupom_base64 || ''} style={styles.receiptImage} />
          ) : (
            <Text style={{ color: '#94a3b8' }}>Sem anexo</Text>
          )}
        </View>

        <Text style={styles.footer}>Gerado via Portal Somos Empilhadeiras</Text>
      </Page>
    </Document>
  );
}