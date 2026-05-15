/**
 * 🎯 SEO Analytics y Monitoreo - FUDENSA
 * Este archivo contiene configuración para trackear SEO y performance
 */

// ==========================================
// CONFIGURACIÓN DE GOOGLE ANALYTICS 4
// ==========================================
// Copiar este código a public/index.html antes del cierre de </head>

export const googleAnalyticsCode = `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'page_path': window.location.pathname,
    'anonymize_ip': true
  });
</script>
`;

// ==========================================
// CONFIGURACIÓN DE GOOGLE SITE VERIFICATION
// ==========================================
// Obtener el código desde: https://search.google.com/search-console
// Luego copiar a public/index.html (line ~29)

export const googleVerificationCode = `
<meta name="google-site-verification" content="TU_CODIGO_AQUI" />
`;

// ==========================================
// CONFIGURACIÓN DE SITEMAP DINÁMICO
// ==========================================
// Este código puede ir en un handler/API endpoint
// para generar el sitemap dinámicamente desde la DB

export const sitemapXMLTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fudensa.pages.dev/</loc>
    <lastmod>\${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  \${courses.map(course => \`
  <url>
    <loc>https://fudensa.pages.dev/#/course/\${course.slug}</loc>
    <lastmod>\${course.updated_at.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  \`).join('')}
</urlset>`;

// ==========================================
// EVENTOS DE TRACKING PARA SEO
// ==========================================

export const trackingSEOEvents = {
  // Rastrear vista de página
  trackPageView: (pageName: string, path: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        'page_title': pageName,
        'page_path': path,
      });
    }
  },

  // Rastrear vista de curso
  trackCourseView: (courseId: string, courseTitle: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        'items': [
          {
            'item_id': courseId,
            'item_name': courseTitle,
            'item_category': 'course',
          }
        ],
      });
    }
  },

  // Rastrear inscripción (conversión importante)
  trackEnrollment: (courseId: string, courseTitle: string, price: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        'items': [
          {
            'item_id': courseId,
            'item_name': courseTitle,
            'price': price,
            'currency': 'ARS',
          }
        ],
        'value': price,
        'currency': 'ARS',
      });
    }
  },

  // Rastrear búsqueda dentro del sitio
  trackSearch: (searchQuery: string, resultsCount: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        'search_term': searchQuery,
        'results': resultsCount,
      });
    }
  },

  // Rastrear contacto
  trackContactSubmission: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_submission', {
        'form_name': 'contact',
      });
    }
  },

  // Rastrear scroll profundo
  trackScrollDepth: (percentScrolled: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'scroll_depth', {
        'scroll_depth': percentScrolled,
      });
    }
  },
};

// ==========================================
// FUNCIÓN PARA CREAR CANONICAL TAGS
// ==========================================

export const createCanonicalTag = (url: string): void => {
  if (typeof document === 'undefined') return;
  
  let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
};

// ==========================================
// FUNCIÓN PARA CREAR OG TAGS
// ==========================================

export const createOGTags = (data: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article';
}): void => {
  if (typeof document === 'undefined') return;

  const tags = [
    { property: 'og:title', content: data.title },
    { property: 'og:description', content: data.description },
    { property: 'og:image', content: data.image },
    { property: 'og:url', content: data.url },
    { property: 'og:type', content: data.type || 'website' },
  ];

  tags.forEach(({ property, content }) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  });
};

// ==========================================
// SCHEMA MARKUP HELPERS
// ==========================================

export const schemaMarkup = {
  // Schema para búsqueda en el sitio (para breadcrumbs en Google)
  breadcrumb: (items: { name: string; url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url,
    })),
  }),

  // Schema para ratings de cursos
  courseRating: (courseId: string, ratingValue: number, reviewCount: number) => ({
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    '@id': `https://fudensa.pages.dev/#/course/${courseId}`,
    'ratingValue': ratingValue,
    'reviewCount': reviewCount,
  }),

  // Schema para FAQ (si tienes sección de preguntas frecuentes)
  faqSchema: (questions: { question: string; answer: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(({ question, answer }) => ({
      '@type': 'Question',
      'name': question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': answer,
      },
    })),
  }),

  // Schema para evento (si tienes webinars o clases en vivo)
  eventSchema: (event: { name: string; startDate: string; endDate: string; location: string; image: string }) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': event.name,
    'startDate': event.startDate,
    'endDate': event.endDate,
    'location': {
      '@type': 'Place',
      'name': event.location,
    },
    'image': event.image,
    'organizer': {
      '@type': 'Organization',
      'name': 'FUDENSA',
      'url': 'https://fudensa.pages.dev',
    },
  }),
};

// ==========================================
// CHECKLIST DE SEO - verificar mensualmente
// ==========================================

export const seoMonthlyChecklist = {
  technicalSEO: [
    '✓ Sitemap.xml generado y enviado a Google Search Console',
    '✓ Robots.txt configurado correctamente',
    '✓ Core Web Vitals > 70 (Lighthouse)',
    '✓ HTTPS/SSL válido',
    '✓ Mobile-friendly (responsive)',
    '✓ No hay enlaces rotos (404)',
    '✓ Página de carga < 3 segundos',
  ],
  
  onPageSEO: [
    '✓ Titles únicos y descriptivos (50-60 caracteres)',
    '✓ Meta descriptions (140-160 caracteres)',
    '✓ H1 único por página',
    '✓ Keywords naturales en contenido',
    '✓ Estructura de heading coherente',
    '✓ Alt text en todas las imágenes',
    '✓ Internal links relevantes',
  ],

  contentSEO: [
    '✓ Contenido original y único',
    '✓ Palabras clave objetivo mencionadas',
    '✓ Información actualizada',
    '✓ Contenido útil para el usuario',
    '✓ Long-tail keywords incluidas',
  ],

  analyticsAndMonitoring: [
    '✓ Google Analytics correctamente instalado',
    '✓ Google Search Console monitoreado',
    '✓ Rankings de palabras clave verificados',
    '✓ Traffic y bounce rate analizados',
    '✓ Conversiones rastreadas',
  ],
};

// ==========================================
// EXPORTAR PARA USO EN OTROS ARCHIVOS
// ==========================================

export default {
  trackingSEOEvents,
  schemaMarkup,
  createCanonicalTag,
  createOGTags,
  seoMonthlyChecklist,
};
