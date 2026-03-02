import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import React from 'react'; 

// ATENÇÃO: Verifique se o nome do arquivo final é "BaseEmail" ou "Email". 
// Se for Email.tsx, mude o final do caminho abaixo para '/Email'
import dbConnect from '../../../../lib/mongodb';
import Collaborator from '../../../../models/Collaborator';
import AuditLog from '../../../../models/AuditLog';

import { renderToBuffer } from '@react-pdf/renderer';
import BaseDocument from '../../../../shared/components/BaseDocument';
import BaseEmail from '../../../../shared/components/Email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        
        const { collaboratorIds, subject, title, paragraphs, summaryData, documentProps } = body;

        if (!collaboratorIds || collaboratorIds.length === 0) {
            return NextResponse.json({ error: 'Nenhum destinatário selecionado.' }, { status: 400 });
        }

        // Correção do erro 2353 (_id tipagem do Mongoose)
        const employees = await Collaborator.find({ _id: { $in: collaboratorIds } } as any).lean();

        const sendPromises = employees.map(async (emp: any) => {
            
            // 1. GERA O PDF EM MEMÓRIA
            let pdfBuffer = null;
            if (documentProps) {
                // Correção dos Erros JSX: Chamando como função normal em vez de tag <BaseDocument />
                pdfBuffer = await renderToBuffer(
                    BaseDocument(documentProps) as React.ReactElement
                );
            }

            // 2. MONTA O E-MAIL
            return resend.emails.send({
                from: 'Somos Empilhadeiras <no-reply@somosempilhadeiras.com.br>',
                
                // CORREÇÃO AQUI: A variável do loop é "emp" e o campo de e-mail é o "login"
                to: emp.login, 
                
                bcc: 'informatica@somosempilhadeiras.com.br', 
                subject: subject || `Notificação do Sistema`,
                
                // Correção dos Erros JSX: Chamando BaseEmail como função e forçando a tipagem
                react: BaseEmail({
                    previewText: subject,
                    title: title || "Aviso Importante",
                    greeting: `Olá, ${emp.name},`,
                    paragraphs: paragraphs || ["Você tem uma nova atualização no sistema."],
                    summaryData: summaryData,
                    charts: documentProps?.charts || [],
                    callToAction: {
                        text: "Acessar Meu Extrato",
                        url: `https://comercial.somosempilhadeiras.com/${emp.state}/${encodeURIComponent(emp.name)}/comissao-vendas`
                    }
                }) as React.ReactElement,
                
                // ANEXA O PDF
                attachments: pdfBuffer ? [
                    {
                        filename: `Extrato_Comissoes_${emp.name.replace(/\s+/g, '_')}.pdf`,
                        content: pdfBuffer,
                    }
                ] : []
            });
        });

        const results = await Promise.all(sendPromises);

        const failedEmails = results.filter(r => r.error);
        if (failedEmails.length > 0) {
            console.error("[RESEND ERROR]: Falha ao enviar para alguns contatos:", failedEmails);
        }

        await AuditLog.create({
            action: 'send_email',
            entity: 'collaborator',
            description: `Extrato e E-mail disparados para ${employees.length} consultor(es).`,
            targetName: 'Múltiplos Destinatários'
        });

        return NextResponse.json({ success: true, delivered: results.length - failedEmails.length });

    } catch (err: any) {
        console.error("Erro fatal na rota de e-mail:", err);
        return NextResponse.json({ error: 'Erro interno ao processar e-mails' }, { status: 500 });
    }
}