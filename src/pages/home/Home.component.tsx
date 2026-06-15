import { Hero } from "../../components/hero";
import { SEO } from "../../components/SEO/SEO";

export const Home = () => {
  return (
    <>
      <SEO
        title="Advocacia Trabalhista e Previdenciária"
        description="Escritório de advocacia Marcell Ferreira. Especialista em Direito Trabalhista e Previdenciário com sedes em Campinas, Guaxupé e Poços de Caldas."
        canonical="/"
      />
      <Hero />
    </>
  );
};
