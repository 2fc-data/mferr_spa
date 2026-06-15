import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  name?: string;
  robots?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  type = "website",
  name = "Marcell Ferreira - Advocacia",
  robots
}) => {
  const fullTitle = title ? `${title} | ${name}` : name;
  const defaultDescription = "Escritório de advocacia especializado em Direito Trabalhista e Previdenciário em Campinas, Guaxupé e Poços de Caldas.";
  const metaDescription = description || defaultDescription;
  const siteUrl = "https://marcellferreira.com.br";

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {robots && <meta name="robots" content={robots} />}
      {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}

      {/* Open Graph tags (Facebook) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content={name} />
      <meta property="og:image" content={`${siteUrl}/og-image.jpg`} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content="@marcellferreira" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
    </Helmet>
  );
};
