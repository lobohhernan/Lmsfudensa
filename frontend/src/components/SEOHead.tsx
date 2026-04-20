import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keyword?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'course';
  author?: string;
  publishedDate?: string;
  updatedDate?: string;
  noFollow?: boolean;
  noIndex?: boolean;
}

/**
 * Componente SEO para actualizar dinámicamente los meta tags de cada página
 * Mejora el posicionamiento en Google y la compartibilidad en redes sociales
 */
export const SEOHead = ({
  title,
  description,
  keyword = '',
  image = 'https://fudensa.pages.dev/og-image.jpg',
  url = 'https://fudensa.pages.dev',
  type = 'website',
  author = 'FUDENSA',
  publishedDate = '',
  updatedDate = '',
  noFollow = false,
  noIndex = false,
}: SEOProps) => {
  useEffect(() => {
    // Actualizar title
    document.title = `${title} | FUDENSA`;

    // Actualizar meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Actualizar meta keywords
    if (keyword) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keyword);
      }
    }

    // Actualizar canonical
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;

    // Robots meta
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    let robotsContent = 'index, follow';
    if (noIndex) robotsContent = 'noindex';
    if (noFollow) robotsContent = robotsContent.replace('follow', 'nofollow');
    robotsMeta.setAttribute('content', robotsContent);

    // Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOGTag('og:title', `${title} | FUDENSA`);
    updateOGTag('og:description', description);
    updateOGTag('og:url', url);
    updateOGTag('og:image', image);
    updateOGTag('og:type', type);

    // Article specific tags
    if (type === 'article') {
      if (publishedDate) {
        updateOGTag('article:published_time', publishedDate);
      }
      if (updatedDate) {
        updateOGTag('article:modified_time', updatedDate);
      }
      updateOGTag('article:author', author);
    }

    // Twitter Card
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateTwitterTag('twitter:title', `${title} | FUDENSA`);
    updateTwitterTag('twitter:description', description);
    updateTwitterTag('twitter:image', image);
    updateTwitterTag('twitter:card', 'summary_large_image');

  }, [title, description, keyword, image, url, type, author, publishedDate, updatedDate, noFollow, noIndex]);

  return null;
};

/**
 * Función auxiliar para generar JSON-LD para cursos
 */
export const generateCourseSchema = (course: {
  name: string;
  description: string;
  image?: string;
  instructor?: string;
  url: string;
  price?: number;
  currency?: string;
  ratingValue?: number;
  reviewCount?: number;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': course.name,
    'description': course.description,
    'url': course.url,
    'image': course.image || 'https://fudensa.pages.dev/course-default.jpg',
    'provider': {
      '@type': 'Organization',
      'name': 'FUDENSA',
      'url': 'https://fudensa.pages.dev'
    },
    ...(course.instructor && {
      'instructor': {
        '@type': 'Person',
        'name': course.instructor
      }
    }),
    ...(course.price && {
      'hasCourseInstance': {
        '@type': 'CourseInstance',
        'price': course.price,
        'priceCurrency': course.currency || 'ARS'
      }
    }),
    ...(course.ratingValue && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': course.ratingValue,
        'reviewCount': course.reviewCount || 0
      }
    })
  };
};

/**
 * Función auxiliar para generar BreadcrumbList schema
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
};
