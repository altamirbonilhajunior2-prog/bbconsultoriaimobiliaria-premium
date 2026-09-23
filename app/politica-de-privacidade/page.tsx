import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exclusão de Dados | B&B Consultoria Imobiliária",
  description:
    "Instruções para solicitação de exclusão de dados pessoais na B&B Consultoria Imobiliária.",
};

export default function ExclusaoDeDadosPage() {
  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "48px 24px 80px",
        lineHeight: 1.7,
      }}
    >
      <h1>Solicitação de Exclusão de Dados</h1>

      <p>
        Última atualização: 23 de setembro de 2026.
      </p>

      <p>
        A B&amp;B Consultoria Imobiliária permite que o
        titular solicite a exclusão de seus dados pessoais,
        observados os limites e hipóteses previstos na
        legislação aplicável.
      </p>

      <h2>Como solicitar</h2>

      <p>
        Para solicitar a exclusão de dados relacionados ao
        seu atendimento, entre em contato com a B&amp;B
        Consultoria Imobiliária pelo WhatsApp comercial:
      </p>

      <p>
        <strong>+55 12 97814-0636</strong>
      </p>

      <p>
        Informe que deseja realizar uma
        <strong> solicitação de exclusão de dados</strong>.
      </p>

      <h2>Informações necessárias</h2>

      <p>
        Para localizar corretamente os dados e evitar a
        exclusão de informações pertencentes a outra pessoa,
        poderemos solicitar informações suficientes para
        confirmar a identidade do solicitante, como:
      </p>

      <ul>
        <li>nome;</li>
        <li>telefone utilizado no atendimento;</li>
        <li>
          e-mail, quando tiver sido anteriormente informado;
        </li>
        <li>
          outras informações estritamente necessárias para
          localizar o cadastro.
        </li>
      </ul>

      <h2>Dados relacionados ao WhatsApp e à Íris</h2>

      <p>
        A solicitação poderá abranger, quando aplicável:
      </p>

      <ul>
        <li>dados de identificação e contato;</li>
        <li>perfil de busca imobiliária;</li>
        <li>
          histórico de mensagens mantidas durante o
          atendimento da Íris;
        </li>
        <li>
          informações associadas ao atendimento comercial;
        </li>
        <li>
          outros dados pessoais vinculados ao solicitante.
        </li>
      </ul>

      <h2>Limitações legais</h2>

      <p>
        A exclusão poderá não abranger informações que a
        B&amp;B precise conservar para cumprimento de
        obrigação legal ou regulatória, exercício regular de
        direitos, prevenção de fraude, segurança ou outras
        hipóteses autorizadas pela legislação.
      </p>

      <p>
        Quando a exclusão integral não for juridicamente
        possível, os dados serão tratados de acordo com a
        finalidade legal aplicável e com medidas adequadas de
        proteção.
      </p>

      <h2>Confirmação</h2>

      <p>
        Após a análise da solicitação, a B&amp;B informará ao
        titular as providências adotadas, observados os prazos
        e requisitos estabelecidos pela legislação aplicável.
      </p>

      <h2>Política de Privacidade</h2>

      <p>
        Para mais informações sobre o tratamento de dados
        pessoais:
      </p>

      <p>
        <a href="https://www.bbconsultoriaimoveis.com.br/politica-de-privacidade">
          www.bbconsultoriaimoveis.com.br/politica-de-privacidade
        </a>
      </p>
    </main>
  );
}