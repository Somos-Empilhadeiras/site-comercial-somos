'use client'
import React, { useState } from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// 1. Definimos o estilo do PDF (parecido com StyleSheet do React Native)
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  header: { fontSize: 20, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  section: { margin: 10, padding: 10, borderBottom: '1px solid #ccc' },
  label: { fontWeight: 'bold', marginBottom: 5 },
  value: { marginBottom: 10 }
});

// 2. Criamos o Componente do PDF (O que vai ser impresso)
const DespesaDocument = ({ descricao, valor }: { descricao: string, valor: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Relatório de Despesa</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Descrição:</Text>
        <Text style={styles.value}>{descricao}</Text>
        
        <Text style={styles.label}>Valor:</Text>
        <Text style={styles.value}>R$ {valor}</Text>
      </View>
      
      <Text style={{ marginTop: 20, color: 'gray', fontSize: 10 }}>
        Gerado automaticamente pelo sistema.
      </Text>
    </Page>
  </Document>
);

// 3. O seu componente da Tela (Formulário)
const DespesasForm = () => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Hack necessário para Next.js evitar erro de hidratação com o PDFDownloadLink
  React.useEffect(() => { setIsClient(true) }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Despesas Form Component</h1>

      <form className="flex flex-col gap-4 max-w-md" onSubmit={(e) => e.preventDefault()}>
        <div>
            <label className="block font-bold">Descrição:</label>
            <input 
                className="border p-2 w-full"
                type="text" 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)} 
            />
        </div>

        <div>
            <label className="block font-bold">Valor:</label>
            <input 
                className="border p-2 w-full"
                type="number" 
                value={valor}
                onChange={(e) => setValor(e.target.value)} 
            />
        </div>

        {/* Aqui está a mágica: O botão já é o link de download. 
            Ele renderiza o PDF em tempo real.
        */}
        {isClient && (
            <PDFDownloadLink 
                document={<DespesaDocument descricao={descricao} valor={valor} />} 
                fileName="despesa.pdf"
                className="bg-blue-600 text-white p-2 rounded text-center hover:bg-blue-700 transition"
            >
                {({ loading }) => (loading ? 'Gerando documento...' : 'Baixar PDF')}
            </PDFDownloadLink>
        )}
      </form>
    </div>
  );
}

export default DespesasForm;