import * as React from 'react';
import { Section, Row, Column, Text, Tailwind, Html, Head, Body, Container, Heading, Hr, Link, Img, Preview, Button } from "@react-email/components";

export interface BaseEmailProps {
    previewText?: string;
    title: string;
    greeting?: string;
    paragraphs: string[];
    summaryData?: {
        label: string; 
        value: string | number; 
        isHighlight?: boolean;
    }[];
    charts?: string[]; // ADICIONADO: Suporte a gráficos no e-mail
    callToAction?: {
        text: string;
        url: string;
    };
}

export default function BaseEmail({ 
    previewText = "Nova notificação da Somos Empilhadeiras", 
    title, 
    greeting, 
    paragraphs, 
    summaryData,
    charts, 
    callToAction 
}: BaseEmailProps) {
    return (
        <Html>
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Head>
                    <Section className="my-2 px-8 py-6">
                        <Row>
                            <Column className="w-[80%]">
                                <Link href="https://somosempilhadeiras.com/">
                                    <Img alt="Logo Somos Empilhadeiras" height="42" src="https://i.imgur.com/wMNkJrW.png" />
                                </Link>
                            </Column>
                            <Column align="right">
                                <Row align="right">
                                    <Column className="px-2"><Link className="text-gray-600 [text-decoration:none]" href="https://somosempilhadeiras.com/sobre">Sobre</Link></Column>
                                    <Column className="px-2"><Link className="text-gray-600 [text-decoration:none]" href="https://somosempilhadeiras.com/">Empresa</Link></Column>
                                    <Column className="px-2"><Link className="text-gray-600 [text-decoration:none]" href="https://somosempilhadeiras.com/">Catalogo</Link></Column>
                                </Row>
                            </Column>
                        </Row>
                    </Section>
                </Head>

                <Hr className="border-[#67DB1A] border-t-4" />

                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-10 mx-auto p-8 w-116.25 shadow-sm">
                        
                        <Section className="mt-4">
                            <Heading className="text-[#15803d] text-[22px] font-black text-center m-0 mb-6 uppercase tracking-tight">
                                {title}
                            </Heading>

                            {greeting && <Text className="text-gray-800 text-[16px] font-bold mb-4">{greeting}</Text>}

                            {paragraphs.map((text, index) => (
                                <Text key={index} className="text-gray-600 text-[15px] leading-relaxed mb-4">{text}</Text>
                            ))}
                        </Section>

                        {/* RESUMO DE DADOS */}
                        {summaryData && summaryData.length > 0 && (
                            <Section className="bg-slate-50 p-6 rounded-xl mt-6 border border-slate-100">
                                {summaryData.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <Row className="my-2">
                                            <Column><Text className="text-gray-500 text-xs font-bold uppercase tracking-wider m-0">{item.label}</Text></Column>
                                            <Column align='right'>
                                                <Text className={`m-0 text-sm ${item.isHighlight ? 'text-[#15803d] font-black text-lg' : 'text-slate-800 font-semibold'}`}>
                                                    {item.value}
                                                </Text>
                                            </Column>
                                        </Row>
                                        {index < summaryData.length - 1 && <Hr className="border border-solid border-slate-200 my-3 mx-0 w-full" />}
                                    </React.Fragment>
                                ))}
                            </Section>
                        )}

                        {/* GRÁFICOS DIRETO NO CORPO DO E-MAIL */}
                        {charts && charts.length > 0 && (
                            <Section className="mt-8 mb-4">
                                <Heading className="text-[#15803d] text-[14px] font-bold text-center m-0 mb-4 uppercase tracking-widest border-b border-slate-100 pb-4">
                                    Análise Gráfica de Desempenho
                                </Heading>
                                {charts.map((url, idx) => (
                                    <Img key={idx} src={url} width="100%" style={{ marginBottom: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                                ))}
                            </Section>
                        )}

                        {callToAction && (
                            <Section className="text-center mt-8 mb-4">
                                <Button href={callToAction.url} className="bg-[#15803d] text-white font-bold px-6 py-3 rounded-lg text-sm tracking-wide">
                                    {callToAction.text}
                                </Button>
                            </Section>
                        )}
                    </Container>

                    {/* FOOTER */}
                    <Section className="w-full bg-slate-50 border-t border-slate-200">
                        <Container>
                            <Section className="text-center px-8 py-10">
                                <table className="w-full">
                                    <tr className="w-full">
                                        <td align="center"><Img alt="Somos Empilhadeiras Logo" height="42" src="https://i.imgur.com/wMNkJrW.png" className="mb-4 grayscale opacity-50" /></td>
                                    </tr>
                                    <tr>
                                        <td align="center">
                                            <Text className="my-2 text-[12px] text-gray-400 font-medium">Av. Caiapó, 1190 - Santa Genoveva, Goiânia - GO, 74672-400</Text>
                                            <Text className="mt-1 mb-0 text-[12px] text-gray-400 font-medium">heli@somosempilhadeiras.com.br | (62) 99183-4188</Text>
                                        </td>
                                    </tr>
                                </table>
                            </Section>
                        </Container>
                    </Section>
                </Body>
            </Tailwind>
        </Html>
    );
}