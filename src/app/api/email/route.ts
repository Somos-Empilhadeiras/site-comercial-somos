import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import Email from '@/shared/components/Email';
import { renderToBuffer } from '@react-pdf/renderer'; 
import DespesaDocument from '@/shared/components/PDF_Cmponent';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, data, state } = body;

    // 1. Gerar o PDF no servidor (Buffer)
    const pdfBuffer = await renderToBuffer(
      DespesaDocument({ data, receiptUrl: null, docState: state })
    );

    // 2. Enviar E-mail com Anexo
    const { data: dataSent, error } = await resend.emails.send({
      from: 'Somos Empilhadeiras <no-reply@somosempilhadeiras.com.br>', 
      to: [email],
      subject: `Acerto de Despesa: ${data.nome} - R$ ${data.valor_cupom}`,
      react: Email({ data }),
      attachments: [
        {
            // Remove espaços do nome do arquivo para evitar erros
            filename: `despesa_${(data.nome || 'relatorio').replace(/\s+/g, '_')}.pdf`,
            content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Erro Resend:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, dataSent }, { status: 200 });
  } catch (err) {
    console.error("Erro Interno:", err);
    return NextResponse.json({ error: 'Erro interno ao processar email' }, { status: 500 });
  }
}