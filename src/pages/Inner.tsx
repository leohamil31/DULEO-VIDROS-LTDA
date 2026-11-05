import { SITE, enderecoCompleto, waLink } from '../config';
import { PRODUTOS } from '../produtos';
import { CtaBand, FeatureCard, PageBanner, SectionHead } from '../components/Blocks';
import { ProductGrid } from '../components/ProductCard';
import { abrirPreferencias } from '../lib/consent';

export function Produtos() {
  return (
    <>
      <PageBanner eyebrow="Produtos" titulo="Esquadrias, vidros e fachadas sob medida">
        Escolha o produto e peça seu orçamento. Linha, cor e modelo a gente combina com você pelo WhatsApp.
      </PageBanner>
      <section aria-label="Lista de produtos" className="container-x pb-8">
        <ProductGrid itens={PRODUTOS} page="produtos" />
      </section>
      <CtaBand page="produtos" titulo="Precisa desta solução?" />
    </>
  );
}

export function Sobre() {
  return (
    <>
      <PageBanner eyebrow="Sobre nós" titulo="Da produção à instalação">
        A Duleo Vidros é uma vidraçaria de Curitiba e região com fabricação própria desde {SITE.fundacao}.
      </PageBanner>
      <section aria-labelledby="historia-titulo" className="container-x grid gap-10 pb-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <SectionHead id="historia-titulo" eyebrow="Como trabalhamos" titulo="Todas as etapas com a mesma equipe" />
        <div data-reveal className="space-y-5 text-pretty text-lg leading-relaxed text-mist">
          <p>
            Produzimos esquadrias de alumínio, vidros temperados, guarda-corpos e coberturas sob medida, cuidando de todas as etapas:
            medição, fabricação, instalação e pós-venda.
          </p>
          <p>
            Fabricar em casa nos dá controle sobre a qualidade e o prazo. Você fala com quem mede, produz e instala, e o suporte continua depois da entrega.
          </p>
        </div>
      </section>
      <section aria-label="Diferenciais" className="container-x pb-8">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FeatureCard icon="ruler" titulo="Medição no local" i={0}>Sem custo para orçar.</FeatureCard>
          <FeatureCard icon="factory" titulo="Fabricação própria" i={1}>Qualidade e prazo sob controle.</FeatureCard>
          <FeatureCard icon="wrench" titulo="Instalação" i={2}>Equipe treinada, obra limpa.</FeatureCard>
          <FeatureCard icon="shield" titulo="Garantia" i={3}>Suporte depois da entrega.</FeatureCard>
        </ul>
      </section>
      <CtaBand page="sobre" titulo="Vamos conversar sobre o seu projeto?" />
    </>
  );
}

export const POLITICA_ATUALIZADA = '5 de novembro de 2026';

export function Privacidade() {
  const h2 = 'mt-12 scroll-mt-28 font-display text-2xl font-semibold text-snow';
  const secoes = [
    ['quem', 'Quem somos'], ['dados', 'Quais dados coletamos'], ['uso', 'Para que usamos'], ['base', 'Base legal'],
    ['compartilhamento', 'Compartilhamento'], ['cookies', 'Cookies e armazenamento local'], ['guarda', 'Por quanto tempo guardamos'],
    ['seguranca', 'Segurança'], ['direitos', 'Seus direitos'], ['contato', 'Como falar com a gente'],
  ] as const;
  return (
    <>
      <PageBanner eyebrow="LGPD" titulo="Política de privacidade">
        Como a {SITE.nome} trata os dados pessoais de quem usa este site, de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018).
      </PageBanner>
      <div className="container-x grid gap-12 pb-24 lg:grid-cols-[16rem_1fr] lg:gap-16">
        <nav aria-label="Nesta página" className="lg:sticky lg:top-28 lg:self-start">
          <ol className="glass space-y-1 rounded-2xl p-4 text-sm">
            {secoes.map(([id, t], i) => (
              <li key={id}><a href={`#${id}`} className="block rounded-lg px-2 py-1.5 text-mist hover:bg-white/5 hover:text-snow">{i + 1}. {t}</a></li>
            ))}
          </ol>
        </nav>
        <article className="prosa max-w-3xl text-pretty leading-relaxed text-silver">
          <p className="text-sm text-mist">Última atualização: {POLITICA_ATUALIZADA}.</p>

          <h2 id="quem" className={h2}>1. Quem somos</h2>
          <p>
            {SITE.razaoSocial}{SITE.cnpj && <>, CNPJ {SITE.cnpj}</>}, com endereço em {enderecoCompleto}, é a controladora dos dados pessoais
            tratados por meio deste site.
          </p>

          <h2 id="dados" className={h2}>2. Quais dados coletamos</h2>
          <p>Só coletamos o que você mesmo informa no formulário de orçamento:</p>
          <ul>
            <li>nome;</li>
            <li>telefone ou WhatsApp;</li>
            <li>e-mail (opcional);</li>
            <li>produto de interesse e a mensagem que você escrever.</li>
          </ul>
          <p>
            Não usamos ferramentas de análise de audiência, pixels de publicidade nem cookies de rastreamento. Como qualquer site, o serviço de
            hospedagem registra dados técnicos de acesso (como endereço IP, data e hora) para segurança e funcionamento.
          </p>

          <h2 id="uso" className={h2}>3. Para que usamos</h2>
          <p>
            Usamos seus dados apenas para responder ao seu pedido: entrar em contato, entender o que você precisa, agendar a medição e enviar o
            orçamento. Não vendemos nem alugamos dados pessoais, e não enviamos propaganda sem a sua autorização.
          </p>

          <h2 id="base" className={h2}>4. Base legal</h2>
          <p>
            O tratamento se baseia na execução de procedimentos preliminares a um contrato, a seu pedido (art. 7º, V, da LGPD). O carregamento do
            mapa do Google se baseia no seu consentimento (art. 7º, I), que você pode retirar a qualquer momento.
          </p>

          <h2 id="compartilhamento" className={h2}>5. Compartilhamento</h2>
          <ul>
            <li>
              <b>WhatsApp (Meta):</b> quando o envio é feito pelo WhatsApp, a mensagem sai do seu aparelho pelo aplicativo, sujeita à política de
              privacidade do WhatsApp.
            </li>
            <li><b>Hospedagem:</b> o site é hospedado por provedores de infraestrutura que processam os dados técnicos de acesso.</li>
            <li><b>Google Maps:</b> só é carregado se você permitir; nesse caso o Google pode usar cookies próprios.</li>
            <li><b>Autoridades:</b> quando houver obrigação legal ou ordem judicial.</li>
          </ul>

          <h2 id="cookies" className={h2}>6. Cookies e armazenamento local</h2>
          <p>
            Este site não cria cookies próprios. Guardamos apenas a sua escolha sobre conteúdo de terceiros no armazenamento local do navegador
            (chave <code>duleo_consent</code>), para não perguntar de novo a cada visita. Você pode mudar essa escolha quando quiser:
          </p>
          <p>
            <button type="button" onClick={abrirPreferencias} className="rounded-full border border-brand-400/40 px-4 py-2 text-sm font-semibold text-brand-300 hover:bg-brand-500/10">
              Abrir preferências de cookies
            </button>
          </p>

          <h2 id="guarda" className={h2}>7. Por quanto tempo guardamos</h2>
          <p>
            Mantemos os dados do pedido pelo tempo necessário para o atendimento e para cumprir obrigações legais. Depois disso, eles são
            excluídos ou anonimizados. Você pode pedir a exclusão antes, salvo quando a lei exigir a guarda.
          </p>

          <h2 id="seguranca" className={h2}>8. Segurança</h2>
          <p>
            Adotamos medidas técnicas e administrativas para proteger os dados: conexão criptografada (HTTPS), acesso ao painel restrito e protegido
            por senha, limite de tentativas de acesso e acesso aos pedidos apenas pela equipe de atendimento.
          </p>

          <h2 id="direitos" className={h2}>9. Seus direitos</h2>
          <p>Pelo art. 18 da LGPD, você pode pedir a qualquer momento:</p>
          <ul>
            <li>confirmação de que tratamos seus dados e acesso a eles;</li>
            <li>correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>portabilidade dos dados;</li>
            <li>informação sobre com quem compartilhamos;</li>
            <li>revogação do consentimento.</li>
          </ul>
          <p>
            Se achar que seus direitos não foram atendidos, você também pode recorrer à Autoridade Nacional de Proteção de Dados (ANPD).
          </p>

          <h2 id="contato" className={h2}>10. Como falar com a gente</h2>
          <p>
            Para exercer seus direitos ou tirar dúvidas sobre esta política, fale com a gente pelo{' '}
            <a href={waLink('Olá! Tenho uma solicitação sobre meus dados pessoais (LGPD).')} target="_blank" rel="noopener noreferrer">
              WhatsApp {SITE.telefoneExibicao}
            </a>
            {SITE.email && <> ou pelo e-mail <a href={`mailto:${SITE.email}`}>{SITE.email}</a></>}. Respondemos no menor prazo possível.
          </p>
        </article>
      </div>
    </>
  );
}
