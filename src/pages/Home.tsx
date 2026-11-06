import { SITE, enderecoCompleto, waLink } from '../config';
import { PRODUTOS } from '../produtos';
import { CtaBand, Eyebrow, FeatureCard, SectionHead, delay } from '../components/Blocks';
import { LiquidCanvas, useParallax } from '../components/Fx';
import { Social } from '../components/Footer';
import { Icon } from '../components/Icon';
import { LiquidLink } from '../components/LiquidLink';
import { MapEmbed } from '../components/MapEmbed';
import { ProductGrid } from '../components/ProductCard';
import { QuoteForm } from '../components/QuoteForm';

function Hero() {
  const foto = useParallax<HTMLDivElement>(0.16);
  return (
    <section aria-labelledby="hero-titulo" className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-16 pt-28 sm:items-center sm:pb-24">
      <div ref={foto} className="absolute inset-0 -z-20 will-change-transform" aria-hidden="true">
        <picture>
          <source srcSet="img/hero.webp" type="image/webp" />
          <img src="img/hero.jpg" alt="" width={720} height={1280} fetchPriority="high" decoding="async" className="size-full object-cover object-[center_40%] opacity-55" />
        </picture>
      </div>
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink-950 via-ink-950/80 to-ink-950/30" aria-hidden="true" />
      <LiquidCanvas className="absolute inset-0 -z-10 size-full mix-blend-screen" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-ink-900 to-transparent" aria-hidden="true" />

      <div className="container-x grid items-end gap-10 lg:grid-cols-[1fr_auto]">
        <div className="max-w-3xl 3xl:max-w-5xl">
          <div className="anim-rise"><Eyebrow>Desde {SITE.fundacao} · Curitiba e região</Eyebrow></div>
          <h1 id="hero-titulo" className="anim-rise text-balance font-display text-[2.3rem] font-semibold leading-[1.06] tracking-tight text-snow [animation-delay:90ms] sm:text-6xl lg:text-7xl 3xl:text-8xl">
            Especialistas em vidros e <span className="text-shine">esquadrias de alumínio</span>
          </h1>
          <p className="anim-rise mt-6 max-w-xl text-pretty text-lg leading-relaxed text-silver [animation-delay:180ms]">
            Fabricação própria, medição no local sem custo, instalação e garantia. Do projeto à entrega, sob medida para a sua obra.
          </p>
          <div className="anim-rise mt-9 flex flex-col gap-3 [animation-delay:270ms] sm:flex-row">
            <LiquidLink href="#contato" tamanho="lg">Pedir orçamento <Icon name="arrowRight" size={18} /></LiquidLink>
            <LiquidLink href="#produtos" variante="vidro" tamanho="lg">Ver produtos</LiquidLink>
          </div>
        </div>
        <div className="anim-rise glass max-w-xs rounded-3xl p-6 [animation-delay:360ms]">
          <p className="font-display text-lg font-semibold text-snow">Sofisticação que transparece.</p>
          <p className="mt-2 text-sm leading-relaxed text-mist">Durabilidade que permanece. Esquadrias e vidros sob medida, com instalação e garantia.</p>
        </div>
      </div>
    </section>
  );
}

function Atalhos() {
  const itens = [
    { icon: 'grid' as const, titulo: 'Nossas soluções', texto: 'Esquadrias, fachadas, vidro temperado e muito mais.', href: '#produtos', cta: 'Ver produtos' },
    { icon: 'file' as const, titulo: 'Orçamento sem custo', texto: 'Informe as medidas e receba o retorno pelo WhatsApp.', href: '#contato', cta: 'Pedir orçamento' },
    { icon: 'message' as const, titulo: 'Fale com a gente', texto: 'Atendimento em Curitiba e região.', href: '#contato', cta: 'Contato' },
  ];
  return (
    <section aria-label="Atalhos" className="container-x relative z-10 -mt-6 grid gap-4 md:grid-cols-3">
      {itens.map((a, i) => (
        <a key={a.titulo} href={a.href} data-reveal style={delay(i * 90)}
          className="glass group flex items-start gap-4 rounded-3xl p-5 transition-[border-color,translate] duration-500 ease-out-expo hover:-translate-y-1 hover:border-brand-400/30">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-500/15 text-brand-300"><Icon name={a.icon} size={20} /></span>
          <span className="flex-1">
            <span className="block font-display font-semibold text-snow">{a.titulo}</span>
            <span className="mt-1 block text-sm text-mist">{a.texto}</span>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
              {a.cta}<Icon name="arrowRight" size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </span>
        </a>
      ))}
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <Atalhos />

      <section id="produtos" aria-labelledby="produtos-titulo" className="container-x py-24 sm:py-32">
        <SectionHead id="produtos-titulo" eyebrow="Produtos" titulo="Nossos produtos">
          Escolha o produto e peça seu orçamento. Linha, cor e modelo a gente combina com você pelo WhatsApp.
        </SectionHead>
        <ProductGrid itens={PRODUTOS} page="home" />
      </section>

      <section aria-labelledby="beneficios-titulo" className="relative py-24 sm:py-32">
        <div className="aurora pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="container-x relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHead id="beneficios-titulo" eyebrow="Alumínio e vidro" titulo="Entenda os benefícios">
              Materiais que resistem ao tempo e valorizam o imóvel, com acabamento para cada estilo de projeto.
            </SectionHead>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            <FeatureCard icon="shield" titulo="Durabilidade e resistência à corrosão" i={0}>Resiste a chuva, sol e umidade, com vida útil longa e pouca manutenção.</FeatureCard>
            <FeatureCard icon="palette" titulo="Variedade de cores e acabamentos" i={1}>Preto, branco, natural fosca, amadeirada e outros, para combinar com qualquer projeto.</FeatureCard>
            <FeatureCard icon="droplet" titulo="Manutenção simplificada" i={2}>Fácil de limpar e sem pinturas frequentes ou tratamentos contra ferrugem.</FeatureCard>
            <FeatureCard icon="thermo" titulo="Eficiência energética" i={3}>Modelos com melhor isolamento térmico e acústico para mais conforto.</FeatureCard>
          </ul>
        </div>
      </section>

      <section aria-labelledby="aplicacoes-titulo" className="container-x py-24 sm:py-32">
        <SectionHead id="aplicacoes-titulo" eyebrow="Aplicações" titulo="Onde aplicamos" centro />
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FeatureCard icon="home" titulo="Residências" i={0}>Janelas, portas, varandas e sacadas que valorizam a casa.</FeatureCard>
          <FeatureCard icon="building" titulo="Edifícios comerciais" i={1}>Fachadas e divisórias práticas e elegantes para lojas e escritórios.</FeatureCard>
          <FeatureCard icon="waves" titulo="Áreas litorâneas" i={2}>O alumínio resiste à corrosão e é ideal perto do mar.</FeatureCard>
          <FeatureCard icon="gem" titulo="Projetos de alto padrão" i={3}>Personalização e acabamentos premium sob medida.</FeatureCard>
        </ul>
      </section>

      <section id="sobre" aria-labelledby="sobre-titulo" className="container-x grid gap-12 py-24 sm:py-32 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div data-reveal>
          <Eyebrow>Sobre nós</Eyebrow>
          <h2 id="sobre-titulo" className="text-balance font-display text-3xl font-semibold tracking-tight text-snow sm:text-4xl lg:text-5xl">Sobre a Duleo Vidros</h2>
          <p className="mt-5 text-pretty leading-relaxed text-mist sm:text-lg">
            Somos especialistas em esquadrias de alumínio em Curitiba e região, com fabricação própria desde {SITE.fundacao}. Produzimos portas,
            janelas, maxim-ar, fachadas e fechamentos de sacada sob medida, com instalação e pós-venda. Também trabalhamos com vidros temperados,
            box e guarda-corpos.
          </p>
          <a href="sobre.html" className="mt-6 inline-flex items-center gap-1.5 font-semibold text-brand-300 hover:text-brand-400">
            Conheça nossa história <Icon name="arrowRight" size={16} />
          </a>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          <FeatureCard icon="ruler" titulo="Medição no local" i={0}>Sem custo para orçar.</FeatureCard>
          <FeatureCard icon="factory" titulo="Fabricação própria" i={1}>Qualidade e prazo sob controle.</FeatureCard>
          <FeatureCard icon="wrench" titulo="Instalação" i={2}>Equipe treinada, obra limpa.</FeatureCard>
          <FeatureCard icon="shield" titulo="Garantia" i={3}>Suporte depois da entrega.</FeatureCard>
        </ul>
      </section>

      <CtaBand page="home" titulo="Precisa desta solução?" />

      <section id="contato" aria-labelledby="contato-titulo" className="container-x grid gap-10 pb-24 sm:pb-32 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div data-reveal className="space-y-8">
          <div>
            <Eyebrow>Contato e localização</Eyebrow>
            <h2 id="contato-titulo" className="font-display text-3xl font-semibold tracking-tight text-snow sm:text-4xl lg:text-5xl">Fale com a gente</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-mist">
              Peça seu orçamento pelo WhatsApp: informe o produto e as medidas, e combinamos linha, cor e modelo com você.
            </p>
          </div>
          <ul className="space-y-4 text-silver">
            <li className="flex gap-3"><Icon name="mapPin" size={20} className="mt-0.5 shrink-0 text-brand-400" /><span><b className="block text-sm text-snow">Endereço</b>{enderecoCompleto}</span></li>
            <li className="flex gap-3"><Icon name="whatsapp" size={20} className="mt-0.5 shrink-0 text-brand-400" /><span><b className="block text-sm text-snow">Telefone / WhatsApp</b>
              <a href={`tel:+${SITE.whatsapp}`} className="hover:text-snow">{SITE.telefoneExibicao}</a></span></li>
            {SITE.email && <li className="flex gap-3"><Icon name="mail" size={20} className="mt-0.5 shrink-0 text-brand-400" /><span><b className="block text-sm text-snow">E-mail</b>
              <a href={`mailto:${SITE.email}`} className="hover:text-snow">{SITE.email}</a></span></li>}
            <li className="flex gap-3"><Icon name="clock" size={20} className="mt-0.5 shrink-0 text-brand-400" /><span><b className="block text-sm text-snow">Atendimento</b>
              {SITE.horario.map((h) => <span key={h.dias} className="block">{h.dias}: {h.horas}</span>)}</span></li>
          </ul>
          <div className="flex flex-wrap items-center gap-4">
            <LiquidLink href={waLink()} target="_blank" rel="noopener noreferrer" variante="whatsapp">
              <Icon name="whatsapp" size={20} /> Falar agora no WhatsApp<span className="sr-only"> (abre em nova aba)</span>
            </LiquidLink>
            <Social />
          </div>
          <MapEmbed />
        </div>
        <div data-reveal style={delay(120)}>
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
