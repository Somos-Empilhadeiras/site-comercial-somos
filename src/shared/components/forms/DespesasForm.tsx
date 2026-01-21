'use client'
import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer';
import { useParams } from 'next/navigation';
import "@/app/globals.css";
import { ChevronsLeftIcon, ChevronsRightIcon, DownloadIcon, MailIcon } from 'lucide-react';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica', // Fonte padrão segura
    color: '#333'
  },
  // Cabeçalho com a Marca
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#15803d', // green-700
    paddingBottom: 10
  },
  brandTitle: {
    color: '#15803d',
    fontSize: 24,
    fontWeight: 'black',
    textTransform: 'uppercase'
  },
  reportTitle: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  // Seções
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8fafc', // slate-50
    borderRadius: 4
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4
  },
  // Grid System (Simulado com Flexbox)
  row: {
    flexDirection: 'row',
    marginBottom: 8
  },
  col: {
    flexGrow: 1,
    flexBasis: 0
  },
  col2: {
    flexGrow: 2,
    flexBasis: 0
  },
  label: {
    color: '#64748b', // slate-500
    fontSize: 8,
    textTransform: 'uppercase',
    marginBottom: 2
  },
  value: {
    fontSize: 11,
    fontWeight: 'medium'
  },
  // Destaque de Valor
  totalBox: {
    marginTop: 10,
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#dcfce7', // green-100
    borderRadius: 4
  },
  totalLabel: {
    fontSize: 10,
    color: '#166534',
    fontWeight: 'bold'
  },
  totalValue: {
    fontSize: 18,
    color: '#15803d',
    fontWeight: 'bold'
  },
  // Imagem do Cupom
  receiptContainer: {
    marginTop: 20,
    height: 300, // Altura fixa para a imagem não quebrar a página
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    backgroundColor: '#f1f5f9'
  },
  receiptImage: {
    objectFit: 'contain',
    maxHeight: '100%',
    maxWidth: '100%'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    paddingTop: 10
  }
});

const emailDestinoResend: string = 'financeiro@somosempilhadeiras.com.br'

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
  foto_cupom: File | any | null;
}

const initialFormValues: FormValuesProps = {
  email: '',
  nome: '',
  parceiro: '',
  relatorio: '',
  tipo_pagamento: '',
  data_cupom: '',
  nome_estabelecimento: '',
  tipo_despesa: '',
  valor_cupom: 0,
  declaracao_veracidade: false,
  foto_cupom: null,
}

// --- 3. COMPONENTE FORMULÁRIO ---
const DespesasForm = ({ name, email }: { name: string, email: string }) => {
  const [isClient, setIsClient] = useState(false);
  const [formValues, setFormValues] = useState<FormValuesProps>(initialFormValues);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState(true);


  const params = useParams();

  const stateNames: Record<string, string> = {
    'GO': 'Goiás',
    'DF': 'Distrito Federal',
    'TO': 'Tocantins',
    'BA': 'Bahia',
    'PE': 'Pernambuco'
  };

  const DespesaDocument = ({ data, receiptUrl, docState }: { data: FormValuesProps, receiptUrl: string | null, docState: string | any }) => (

    < Document >
      <Page size="A4" style={styles.page}>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Image src="/logo.png" style={{ width: 160, height: 40 }} />
          </View>
          <Text style={styles.reportTitle}>Relatório de Despesa</Text>
        </View>

        {/* Dados do Colaborador */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificação</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Nome do Colaborador</Text>
              <Text style={styles.value}>{data.nome || '-'}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>E-mail Corporativo</Text>
              <Text style={styles.value}>{data.email || '-'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Parceiro / Cliente</Text>
              <Text style={styles.value}>{data.parceiro || '-'}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Estado</Text>
              <Text style={styles.value}>{(stateNames[docState.toUpperCase()] || docState.toUpperCase()).toUpperCase() || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Detalhes da Despesa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes da Despesa</Text>

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
              <Text style={styles.label}>Pagamento via</Text>
              <Text style={styles.value}>{data.tipo_pagamento || '-'}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Estabelecimento</Text>
              <Text style={styles.value}>{data.nome_estabelecimento || '-'}</Text>
            </View>
          </View>

          <View style={{ marginTop: 5 }}>
            <Text style={styles.label}>Descrição / Relatório</Text>
            <Text style={styles.value}>{data.relatorio || 'Sem descrição adicional.'}</Text>
          </View>

          {/* Caixa de Total */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>VALOR TOTAL</Text>
            <Text style={styles.totalValue}>R$ {Number(data.valor_cupom).toFixed(2)}</Text>
          </View>
        </View>

        {/* Imagem do Cupom */}
        <Text style={styles.sectionTitle}>Comprovante Anexado</Text>
        <View style={styles.receiptContainer}>
          {receiptUrl ? (
            <Image src={receiptUrl} style={styles.receiptImage} />
          ) : (
            <Text style={{ color: '#94a3b8' }}>Nenhum comprovante anexado</Text>
          )}
        </View>

        {/* Rodapé */}
        <Text style={styles.footer}>
          Documento gerado automaticamente pelo Portal Comercial Somos Empilhadeiras em {new Date().toLocaleString('pt-BR')}
        </Text>
      </Page>
    </Document >
  );

  useEffect(() => { setIsClient(true) }, []);

  // Lógica para transformar o Arquivo em URL para o PDF
  useEffect(() => {
    if (formValues.foto_cupom) {
      const url = URL.createObjectURL(formValues.foto_cupom);
      setReceiptUrl(url);
      // Limpeza de memória
      return () => URL.revokeObjectURL(url);
    }
  }, [formValues.foto_cupom]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  async function handleSend() {
    try {
      let base64Image = null;

      if (formValues.foto_cupom) {
        base64Image = await fileToBase64(formValues.foto_cupom);
      }

      // Pegamos o slug da URL (ex: "khryss-mylla")
      const collaboratorSlug = params.collaborator as string;

      const payload = {
        ...formValues,
        foto_cupom_base64: base64Image,
        foto_cupom: undefined
      };

      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: collaboratorSlug, // Enviamos a CHAVE para a API
          data: payload,
          state: params.state
        })
      });
      
      if (response.ok) {
        alert('Relatório enviado com sucesso!');
        window.location.reload();
      } else {
        alert('Erro ao enviar.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão.');
    }
  }

  return (
    <div className="min-w-full min-h-screen flex justify-center">

      <form className="flex flex-col gap-6 w-lvw md:w-full lg:w-3xl xl:w-5xl bg-white p-8 rounded-2xl shadow-xl" onSubmit={(e) => e.preventDefault()}>
        <div className="border-b pb-4 mb-2">
          <h2 className="text-2xl font-bold text-green-800">Novo Relatório de Despesa</h2>
          <p className="text-gray-500 text-sm">{activeForm ? "Preencha os dados abaixo para gerar o PDF de reembolso." : "Escolha a opção abaixo para dar continuidade."}</p>
        </div>
        {activeForm ? (
          <>

            {/* --- DADOS DO COLABORADOR --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Corporativo</label>
                <input
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  type="email"
                  readOnly={true}
                  value={formValues.email = email}
                  onChange={(e) => setFormValues({ ...formValues, email: email })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                <input
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  type="text"
                  readOnly={true}
                  value={formValues.nome = name}
                  onChange={(e) => setFormValues({ ...formValues, nome: name })}

                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Parceiro / Cliente Visitado</label>
                <input
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  type="text"
                  value={formValues.parceiro}
                  onChange={(e) => setFormValues({ ...formValues, parceiro: e.target.value })}
                />
              </div>
            </div>

            {/* --- DETALHES DA DESPESA --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-4 rounded-xl">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Estabelecimento</label>
                <input
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  type="text"
                  value={String(formValues.nome_estabelecimento)}
                  onChange={(e) => setFormValues({ ...formValues, nome_estabelecimento: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Despesa</label>
                <select
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                  value={formValues.tipo_despesa}
                  onChange={(e) => setFormValues({ ...formValues, tipo_despesa: e.target.value })}
                >
                  <option value="" disabled>Selecione...</option>
                  {["Alimentação (Almoço/Jantar)", "Hospedagem", "Combustível", "Pedágio", "Manutenção/Peças", "Outros"].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Método de Pagamento</label>
                <select
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                  value={formValues.tipo_pagamento}
                  onChange={(e) => setFormValues({ ...formValues, tipo_pagamento: e.target.value })}>
                  <option value="" disabled>Selecione...</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão Corporativo">Cartão Corporativo</option>
                  <option value="Cartão Pessoal">Cartão Pessoal (Reembolso)</option>
                  <option value="PIX">PIX</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data do Cupom</label>
                <input
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  type="date"
                  value={String(formValues.data_cupom)}
                  onChange={(e) => setFormValues({ ...formValues, data_cupom: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Valor (R$)</label>
                <input
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  type="number"
                  step="0.01"
                  value={formValues.valor_cupom}
                  onChange={(e) => setFormValues({ ...formValues, valor_cupom: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Relatório / Observações</label>
              <textarea
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                rows={3}
                placeholder="Descreva o motivo da despesa..."
                value={formValues.relatorio}
                onChange={(e) => setFormValues({ ...formValues, relatorio: e.target.value })}
              />
            </div>

            {/* --- UPLOAD DE ARQUIVO --- */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
              <input
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const file = e.target.files ? e.target.files[0] : null;
                  setFormValues({ ...formValues, foto_cupom: file });
                }}
              />
              <div className="flex flex-col items-center">
                <span className="text-gray-500 font-medium">
                  {formValues.foto_cupom ? `Arquivo selecionado: ${formValues.foto_cupom.name}` : "Clique para anexar a foto do cupom"}
                </span>
                <span className="text-xs text-gray-400 mt-1">Formatos: JPG, PNG (Max 5MB)</span>
              </div>
            </div>

            <div className='w-full flex text-center justify-end'>
              <button className='transition-all flex w-fit px-3 gap-1 hover:scale-105  border-green-600 hover:bg-green-600 border-2 h-10 text-black hover:text-white font-bold rounded-3xl items-center justify-center hover:cursor-pointer'
                onClick={() => setActiveForm(!activeForm)}>
                <p>Proximo</p> <span className=''><ChevronsRightIcon /></span>
              </button>
            </div>
          </>
        ) : (
          <div className='flex flex-col gap-10'>
            <div className='grid grid-rows-2 md:grid-cols-2 gap-5'>
              {/* BOTAO BAIXAR PDF */}
              <PDFDownloadLink
                document={<DespesaDocument data={formValues} receiptUrl={receiptUrl} docState={params.state} />}
                fileName={`despesa_${formValues.nome || 'relatorio'}_${Date.now()}.pdf`}
                className="relative group flex flex-col items-center justify-center p-10 min-h-[220px] bg-gradient-to-br from-green-600 to-green-800 rounded-3xl shadow-xl hover:shadow-green-900/40 hover:-translate-y-2 transition-all duration-500 border border-green-500/30 overflow-hidden"
              >
                {({ loading }) => (
                  <>
                    {/* Efeito de brilho ao passar o mouse */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="bg-white/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                      <DownloadIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center z-10">
                      <span className="block text-white font-black text-xl tracking-wider mb-1">
                        {loading ? 'PROCESSANDO...' : 'BAIXAR RELATÓRIO'}
                      </span>
                      <span className="text-green-100/70 text-sm font-medium uppercase tracking-widest">
                        Arquivo PDF para impressão
                      </span>
                    </div>
                  </>
                )}
              </PDFDownloadLink>
              {/* BOTAO ENVIAR EMAIL */}
              <button
                onClick={handleSend}
                className="relative group flex flex-col items-center justify-center p-10 min-h-55 bg-linear-to-br from-blue-600 to-blue-800 rounded-3xl shadow-xl hover:shadow-blue-900/40 hover:-translate-y-2 transition-all duration-500 border border-blue-500/30 overflow-hidden"
              >
                {/* Efeito de brilho ao passar o mouse */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-white/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                  <MailIcon className="w-10 h-10 text-white" />
                </div>
                <div className="text-center z-10">
                  <span className="block text-white font-black text-xl tracking-wider mb-1">
                    ENVIAR PARA FINANCEIRO
                  </span>
                  <span className="text-blue-100/70 text-sm font-medium uppercase tracking-widest">
                    Envio direto para o departamento financeiro
                  </span>
                </div>
              </button>
            </div>

            {/* BOTÃO DE VOLTAR */}
            <div className='w-full col-span-2 flex text-center h-fit justify-start'>
              <button className='transition-all flex w-fit px-3 gap-1 hover:scale-105  border-green-600 hover:bg-green-600 border-2 h-10 text-black hover:text-white font-bold rounded-3xl items-center justify-center hover:cursor-pointer'
                onClick={() => {

                  // 1. Limpa a URL do comprovante para não vazar memória
                  if (receiptUrl) URL.revokeObjectURL(receiptUrl);
                  setReceiptUrl(null);

                  // 2. Volta para a visualização do formulário
                  setActiveForm(true);
                }}>
                <span className=''><ChevronsLeftIcon /></span> <p>Voltar</p>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default DespesasForm;