import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import Email from '@/shared/components/Email';
import { renderToBuffer } from '@react-pdf/renderer'; 
import DespesaDocument from '@/shared/components/PDFComponent';

// Importe ou defina a constante aqui para a API ter acesso
export const COLLABORATORS_DATA: Record<string, any> = {
  "khryss-mylla": { name: "KHRYSS MYLLA", email: "heli@somosempilhadeiras.com.br" },
  "lais-toledo": { name: "LAIS TOLEDO", email: "lais@somosempilhadeiras.com.br" },
  "aguinaldo-lemes": { name: "AGUINALDO LEMES", email: "aguinaldo@somosempilhadeiras.com.br" },
  "ezequiel": { name: "EZEQUIEL", email: "ezequiel@somosempilhadeiras.com.br" },
  "tiago-freua": { name: "TIAGO FREUA", email: "tiago@somosempilhadeiras.com.br" },
  "rafael-gomes": { name: "RAFAEL GOMES", email: "rafael@somosempilhadeiras.com.br" },
  "jose-henrique": { name: "JOSÉ HENRIQUE", email: "josehenrique@somosempilhadeiras.com.br" },
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {

  
  try {
    const body = await req.json();
    const { slug, data, state } = body;
    const emailToSend = "informatica@somosempilhadeiras.com.br"

    // 1. Buscamos o colaborador na constante usando o SLUG vindo do body
    const collaborator = COLLABORATORS_DATA[slug];

    if (!collaborator) {
      return NextResponse.json({ error: 'Colaborador não mapeado' }, { status: 404 });
    }

    const pdfBuffer = await renderToBuffer(
      DespesaDocument({ data, receiptUrl: null, docState: state })
    );

    // 2. Enviar E-mail
    const { data: dataSent, error } = await resend.emails.send({
      // REMETENTE
      from: `${collaborator.name} <${collaborator.email}>`, 
      
      // DESTINATÁRIO
      to: emailToSend,

      // ASSUNTO
      subject: `Acerto de Despesa: ${collaborator.name} - R$ ${data.valor_cupom}`,
      
      // CONTEÚDO DO E-MAIL
      react: Email({ data }),

      // ANEXO(S) DO E-MAIL
      attachments: [
        {
          filename: `despesa_${collaborator.name.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ success: true, dataSent }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}