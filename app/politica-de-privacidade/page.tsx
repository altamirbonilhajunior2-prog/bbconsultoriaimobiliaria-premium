import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | B&B Consultoria Imobiliária",
  description:
    "Como a B&B Consultoria Imobiliária trata dados de atendimento e oferece escolhas sobre publicidade.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 text-zinc-200 lg:py-16">
      <h1 className="font-serif text-3xl text-[#D5A85A]">Política de Privacidade</h1>
      <p className="mt-6 leading-7">
        A B&amp;B Consultoria Imobiliária usa informações fornecidas por você
        para atender solicitações sobre imóveis e visitas. Esta página explica
        o atendimento e suas escolhas sobre tecnologias publicitárias.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-white">Formulários e atendimento</h2>
        <p className="leading-7">
          Ao solicitar contato ou agendar uma visita, você informa dados como
          nome, telefone e imóvel de interesse. Esses dados são usados para
          registrar a solicitação no Portal, evitar registros duplicados e
          encaminhar o atendimento. O formulário pede uma autorização própria
          para contato pelo WhatsApp sobre o imóvel.
        </p>
        <p className="leading-7">
          Essa autorização de contato é independente da escolha sobre
          publicidade. Recusar publicidade não impede o envio do formulário
          nem o atendimento solicitado.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-white">WhatsApp e Íris</h2>
        <p className="leading-7">
          Links do Portal podem abrir o WhatsApp para iniciar uma conversa. O
          Portal registra a intenção de contato, o imóvel relacionado quando
          houver e a página pública de origem, para organizar o atendimento.
          As mensagens trocadas pelo WhatsApp também seguem o funcionamento
          desse serviço.
        </p>
        <p className="leading-7">
          A Íris auxilia na busca de imóveis e no atendimento. As respostas
          sobre preferências de busca e o histórico da conversa podem ser
          usados para dar continuidade ao atendimento e encaminhá-lo a um
          responsável quando necessário.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-white">Publicidade e cookies</h2>
        <p className="leading-7">
          O Portal oferece uma escolha para tecnologias publicitárias do
          Google Ads e do Pixel da Meta. Quando autorizadas e habilitadas,
          elas podem usar cookies ou identificadores para medir campanhas e
          apresentar publicidade. Sem autorização, essas tecnologias
          publicitárias permanecem bloqueadas.
        </p>
        <p className="leading-7">
          Tecnologias estritamente necessárias ao funcionamento do Portal e
          ao registro da sua escolha são tratadas separadamente. Identificadores
          e parâmetros de campanha não são registrados nos novos atendimentos
          do Portal enquanto não houver validação confiável do consentimento
          publicitário no servidor.
        </p>
      </section>

      <section id="preferencias" className="mt-10 scroll-mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-white">Suas preferências</h2>
        <p className="leading-7">
          O aviso permite aceitar ou recusar publicidade e abrir as
          preferências. Você pode mudar de ideia a qualquer momento pelo
          controle persistente “Preferências de privacidade”, exibido nas
          páginas públicas. Ao revogar, novos carregamentos e eventos
          publicitários devem ser interrompidos. A revogação não desfaz dados
          transmitidos antes dela.
        </p>
        <p className="leading-7">
          A escolha publicitária é guardada no navegador, separadamente do
          consentimento de contato dos formulários. Se não houver escolha
          válida, a publicidade permanece bloqueada.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-white">Seus dados e contato</h2>
        <p className="leading-7">
          Para solicitar informações ou a exclusão de dados relacionados ao
          atendimento, consulte a{" "}
          <Link href="/exclusao-de-dados" className="text-[#D5A85A] underline underline-offset-2">
            página de exclusão de dados
          </Link>
          . O WhatsApp comercial informado pelo Portal é (12) 97814-0636.
        </p>
      </section>
    </main>
  );
}
