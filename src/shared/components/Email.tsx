import * as React from 'react';
import { Section, Row, Column, Text, Tailwind, Html, Head, Body, Container, Heading, Hr, Link, Img } from "@react-email/components";
import { FormValuesProps } from './DespesasForm';

interface EmailTemplateProps {
    data: FormValuesProps;
}

export default function Email({ data }: EmailTemplateProps) {
    return (
        <Html>
            <Tailwind>
                <Head>

                    {/* CABEÇALHO */}
                    <Section className="my-2 px-8 py-6">
                        <Row>
                            <Column className="w-[80%]">
                                <Link href="https://somosempilhadeiras.com/">
                                    <Img
                                        alt="Logo Somos Empilhadeiras"
                                        height="42"
                                        src="https://i.imgur.com/wMNkJrW.png"
                                    />
                                </Link>
                            </Column>
                            <Column align="right">
                                <Row align="right">
                                    <Column className="px-2">
                                        <Link className="text-gray-600 [text-decoration:none]" href="https://somosempilhadeiras.com/sobre">
                                            Sobre
                                        </Link>
                                    </Column>
                                    <Column className="px-2">
                                        <Link className="text-gray-600 [text-decoration:none]" href="https://somosempilhadeiras.com/">
                                            Empresa
                                        </Link>
                                    </Column>
                                    <Column className="px-2">
                                        <Link className="text-gray-600 [text-decoration:none]" href="https://somosempilhadeiras.com/">
                                            Catalogo
                                        </Link>
                                    </Column>
                                </Row>
                            </Column>
                        </Row>
                    </Section>
                </Head>

                {/* DIVIDOR */}
                <Hr className="border-[#67DB1A] border-t-4" />

                <Body className="bg-white my-auto mx-auto font-sans">

                    {/* CONTEÚDO DO EMAIL (Mantém no Container para ficar centralizado) */}
                    <Container className="border border-solid border-[#eaeaea] rounded my-10 mx-auto p-5 w-116.25">
                        
                        <Section className="mt-8">
                            <Heading className="text-[#15803d] text-[22px] font-bold text-center m-0 mb-4">
                                Novo Relatório de Despesa Recebido
                            </Heading>

                            <Text className="text-gray-600 text-[14px] leading-6 mb-4">
                                Prezada equipe financeira,
                            </Text>
                            <Text className="text-gray-600 text-[14px] leading-6 mb-4">
                                Informamos que um novo formulário de prestação de contas foi submetido através do Portal Comercial.
                                O colaborador <strong>{data.nome}</strong> registrou uma despesa relacionada a atividades externas e solicita a conferência para fins de reembolso ou baixa de adiantamento.
                            </Text>
                            <Text className="text-gray-600 text-[14px] leading-6 mb-6">
                                Abaixo segue um resumo rápido dos dados lançados. O documento completo (PDF), contendo o comprovante fiscal digitalizado e maiores detalhes, encontra-se <strong>em anexo</strong> a este e-mail.
                            </Text>
                        </Section>

                        <Section>
                            <Row>
                                <Column><Text className="text-gray-500 text-xs uppercase">Valor</Text></Column>
                                <Column align='right'><Text className="text-[#15803d] font-bold text-lg">R$ {Number(data.valor_cupom).toFixed(2)}</Text></Column>
                            </Row>
                            <Hr className="border border-solid border-[#eaeaea] my-2.5 mx-0 w-full" />
                            <Row>
                                <Column><Text className="text-gray-500 text-xs uppercase">Tipo</Text></Column>
                                <Column align='right'><Text className="text-black text-sm">{data.tipo_despesa}</Text></Column>
                            </Row>
                            <Row>
                                <Column><Text className="text-gray-500 text-xs uppercase">Estabelecimento</Text></Column>
                                <Column align='right'><Text className="text-black text-sm">{data.nome_estabelecimento}</Text></Column>
                            </Row>
                        </Section>
                    </Container>

                    {/* CORREÇÃO DO FOOTER AQUI */}
                    {/* 1. Removi o <Container> que envolvia o Footer para ele poder esticar */}
                    {/* 2. Mudei o <Hr> para ser sutil e ocupar a largura toda */}
                    
                    <Section className="w-full bg-gray-100 border-t border-gray-200">
                        <Container> {/* Container interno opcional apenas para centralizar o texto no meio da faixa cinza */}
                            <Section className="text-center px-8 py-10">
                                <table className="w-full">
                                    <tr className="w-full">
                                        <td align="center">
                                            <Img
                                                alt="Somos Empilhadeiras Logo"
                                                height="42"
                                                src="https://i.imgur.com/wMNkJrW.png"
                                                className="mb-4" // Deixei a logo do footer mais discreta
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center">
                                            <Row className="table-cell h-11 w-14 align-bottom">
                                                <Column className="pr-2">
                                                    <Link href="https://www.facebook.com/p/Somos-Empilhadeiras-61554723444765/">
                                                        <Img alt="Facebook" height="28" src="https://react.email/static/facebook-logo.png" width="28" className="grayscale opacity-60 hover:opacity-100" />
                                                    </Link>
                                                </Column>
                                                <Column className="pr-2">
                                                    <Link href="https://linkedin.com/somosempilhadeiras">
                                                        <Img alt="Linkedin" height="28" src="https://react.email/static/x-logo.png" width="28" className="grayscale opacity-60 hover:opacity-100" />
                                                    </Link>
                                                </Column>
                                                <Column>
                                                    <Link href="https://www.instagram.com/somosempilhadeiras/">
                                                        <Img alt="Instagram" height="28" src="https://react.email/static/instagram-logo.png" width="28" className="grayscale opacity-60 hover:opacity-100" />
                                                    </Link>
                                                </Column>
                                            </Row>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center">
                                            <Text className="my-2 text-[12px] text-gray-400 leading-4">
                                                Av. Caiapó, 1190 - Santa Genoveva, Goiânia - GO, 74672-400
                                            </Text>
                                            <Text className="mt-1 mb-0 text-[12px] text-gray-400 leading-4">
                                                heli@somosempilhadeiras.com.br | (62) 99183-4188
                                            </Text>
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