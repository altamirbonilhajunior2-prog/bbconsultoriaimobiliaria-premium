This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Consentimento publicitário — preparação local

O fluxo usa comprovante HMAC-SHA-256 em cookie HttpOnly/Secure/SameSite=Lax e
registro `AdvertisingConsent` no PostgreSQL existente. A validade é de 180 dias;
somente uma escolha explícita emite um comprovante. Visitas e validações não renovam
o prazo. A preferência antiga do navegador, isoladamente, não autoriza atribuição.
O recibo depende da sessão assinada, da revisão atual e do recibo ativo no servidor.
A expiração da sessão também bloqueia a coleta, mesmo que o recibo ainda não tenha
vencido. O GET estabelece a sessão sem gravar no banco e sem conceder publicidade.

`BB_CONSENT_SIGNING_KEY` deverá conter 32 bytes aleatórios codificados em 64 caracteres
hexadecimais, exclusivamente no servidor, com chaves distintas por ambiente. Nenhuma
chave ou variável de ambiente foi criada nesta implementação. Configuração ausente
ou inválida bloqueia emissão/atribuição. A troca da chave invalida os comprovantes
anteriores. O cookie Secure exige HTTPS no ambiente de homologação.

A migration `20261011120000_add_advertising_consent` é apenas revisável: adiciona
duas tabelas (`AdvertisingConsentSession`, para revisão e recibo ativo, e
`AdvertisingConsent`, para os recibos), duas colunas opcionais de referência ao
comprovante e `WhatsAppLeadIntent.interactionId` com índice único, sem preencher,
apagar ou alterar valores históricos. Não foi aplicada. As referências não usam
cascata de exclusão; não há rotina de remoção de autorizações nesta etapa.

Leads e intenções são criados primeiro sem publicidade. Uma transação posterior
confere assinatura e autorização ativa, mantém bloqueio compartilhado na linha
até concluir e grava UTMs/GCLID com o identificador do comprovante. A atualização
de revogação disputa esse bloqueio: após sua confirmação, o mesmo comprovante não
permite novas atribuições. Erros publicitários não desfazem o cadastro operacional.
O redirecionamento para WhatsApp continua funcionando mesmo com banco indisponível.
Registros duplicados não são reatribuídos para evitar sobrescrever campanhas.
Sem dados de campanha, a atribuição não consulta nem grava no banco. Recusas
repetidas não avançam novamente a revisão; sincronizações simultâneas na mesma
aba compartilham uma requisição. Interações do WhatsApp usam UUID por clique,
reutilizado em cliques repetidos imediatos, sem agrupar compradores pela página.

Campanhas são guardadas na sessão da aba somente após aceite e vinculadas à revisão
da escolha. Recusa, expiração ou revogação pendente bloqueiam o envio e limpam esse
armazenamento. Não há captura retroativa de campanhas que saíram da URL antes do
aceite. URLs completas de referência não são persistidas. O comprovante registra
uma escolha do navegador, não comprova identidade civil nem autenticidade do GCLID.

Se a revogação falhar, a interface bloqueia localmente e exige nova tentativa; ela
não afirma sucesso no servidor. Até a confirmação, uma cópia do comprovante ainda
pode ser válida. Revogação não apaga atribuições históricas. A retenção de 90 dias
continua proposta pendente: nenhum expurgo ou bloqueio histórico por idade foi ativado.

Validação local, com banco simulado e sem rede:

```sh
node --import tsx --test lib/privacy/*.test.ts
```

Antes da produção: aprovar a migration, provisionar a chave com segurança, confirmar
limites/custos de Neon e Vercel e autorizar homologação/publicação. Os testes simulados
não substituem a validação de concorrência em PostgreSQL isolado, ainda pendente.
Não há serviço novo, agendador ou limpeza contratada/configurada.
`ADVERTISING_RELEASE_READY = false` permanece; a integração de atribuição não libera
Google Tag Manager, Google Ads ou Meta. Qualquer liberação exige decisão separada.
