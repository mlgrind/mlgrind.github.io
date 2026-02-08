import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  type?: 'website' | 'article';
}

const BASE_URL = 'https://mlgrind.github.io';
const DEFAULT_TITLE = 'ML Coding Lab - Learn Machine Learning by Building';
const DEFAULT_DESCRIPTION = 'Practice hands-on machine learning coding problems. Implement NumPy, neural networks, CNNs, transformers, and more. Run Python code directly in your browser with instant feedback.';
const DEFAULT_KEYWORDS = 'machine learning, ML, deep learning, neural networks, Python, NumPy, transformers, CNN, PyTorch, coding practice, interview prep, AI';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  type = 'website',
}: SEOProps) {
  const fullTitle = title ? `${title} | ML Coding Lab` : DEFAULT_TITLE;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />

      {/* Twitter */}
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
    </Helmet>
  );
}
