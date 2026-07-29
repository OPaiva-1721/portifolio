# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Público primário confirmado: **tech leads** avaliando Gabryel Paiva Neves para vagas de desenvolvimento de software (estágio/júnior) — quem lê git log profissionalmente e reconhece a metáfora do site pela forma, não só pelo conteúdo. Recrutadores generalistas são público secundário; decisões de design priorizam legibilidade técnica para o tech lead mesmo quando isso custa um pouco de clareza pro recrutador não-técnico. Majoritariamente mercado brasileiro — conteúdo em pt-BR, contato via WhatsApp com DDD brasileiro, base em Toledo, Paraná.

## Product Purpose

Portfólio pessoal que expõe a trajetória, experiência e projetos de Gabryel como candidato a vagas de desenvolvimento de software. A ação de sucesso confirmada é o visitante explorar os projetos reais no GitHub a partir do site.

## Positioning

A trajetória de carreira é apresentada com a metáfora de histórico de commits/terminal Git — cada emprego é um "commit" com hash, escopo, adições e stack, e o hero abre com `$ whoami` / "ver o changelog". Essa moldura técnica é o mecanismo distintivo do portfólio: comunica fluência técnica pela própria forma da apresentação, não só pelo conteúdo.

## Operating Context

- SPA em React + Vite, hospedada na Vercel (https://portifolio-orcin-mu.vercel.app).
- Rota `/#cv` alterna para uma versão de currículo imprimível (`window.print`), separada da landing principal com hero e vídeo de fundo.
- Conteúdo centralizado em `src/data/content.js` (bio, formação, certificações, "commits" de experiência, projetos, contato).

## Capabilities and Constraints

- Idioma: pt-BR em todo o conteúdo.
- Stack técnica declarada: TypeScript, React, NestJS, Flutter, Node.js, Python, PostgreSQL, Docker, Drizzle ORM.
- Contato: email, GitHub (`OPaiva-1721`), WhatsApp — com fallback de placeholder quando o valor começa com `[`.
- Vídeo de fundo (`public/media/bg-loop.mp4`) é opcional e degrada com grace: se ausente, cai para poster estático + blobs decorativos; telas pequenas e "economia de dados" pulam o vídeo. Não é uma dependência rígida.
- O projeto PRICE DROP aparece na home mas é filtrado do CV (`projects.filter(p => p.id !== 'price-drop')`) — decisão editorial existente a preservar.

## Brand Commitments

- Nome: Gabryel Paiva Neves, título "Desenvolvedor de Software".
- Identidade visual apoiada na metáfora de terminal/git (prompt `$`, `~/seção`, hashes, diffs, tipografia monoespaçada para elementos técnicos).

## Evidence on Hand

- Projetos reais com descrições e links de GitHub: BarberFoundation, Orçamento.V2, PRICE DROP. Não inventar métricas, depoimentos ou clientes além do que já está documentado (ex.: "elevou a qualidade de 6,0 para 7,5/10" é uma métrica real já confirmada).
- Formação: Engenharia de Software, Faculdade Biopark (2023 — previsão 2027).
- Certificações: Google Cloud Cybersecurity, Google Cloud IA Generativa, Inglês técnico, Pacote Office.

## Product Principles

1. A metáfora git/terminal é o diferencial do portfólio e deve ser preservada e aprofundada, não suavizada para um formato genérico. Confirmado com o usuário: o site é feito pra tech lead antes de tudo — quando surgir a escolha entre aprofundar a metáfora (mais autêntica, mais jargão) ou suavizar pra alcançar um público mais amplo, aprofundar vence.
2. Todo conteúdo de experiência e projetos é fato verificável — nunca inventar métricas, depoimentos ou clientes.
3. O objetivo primário é levar o visitante a explorar os projetos no GitHub; a apresentação deve reduzir fricção até esse clique.
4. O site serve dois formatos do mesmo conteúdo (landing interativa e CV imprimível em `/#cv`) que devem permanecer consistentes entre si.

## Accessibility & Inclusion

`prefers-reduced-motion` já é respeitado no Hero e no vídeo de fundo (evita animações/autoplay quando o usuário pede menos movimento) — constraint técnica confirmada a preservar.
