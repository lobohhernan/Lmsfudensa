import { useEffect } from 'react';
import { trackingSEOEvents } from '../lib/seoConfig';

/**
 * Hook personalizado para rastrear eventos SEO
 * @example
 * const { trackPageView, trackCourseView } = useSEOTracking();
 * 
 * useEffect(() => {
 *   trackPageView('Catálogo de Cursos', '/catalog');
 * }, []);
 */
export const useSEOTracking = () => {
  // Rastrear scroll profundo automáticamente
  useEffect(() => {
    let maxScroll = 0;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentScrolled = Math.round((scrollTop / docHeight) * 100);

      if (percentScrolled > maxScroll) {
        maxScroll = percentScrolled;
        
        // Rastrear en hitos: 25%, 50%, 75%, 100%
        if (percentScrolled >= 25 && percentScrolled < 30) {
          trackingSEOEvents.trackScrollDepth(25);
        } else if (percentScrolled >= 50 && percentScrolled < 55) {
          trackingSEOEvents.trackScrollDepth(50);
        } else if (percentScrolled >= 75 && percentScrolled < 80) {
          trackingSEOEvents.trackScrollDepth(75);
        } else if (percentScrolled >= 95) {
          trackingSEOEvents.trackScrollDepth(100);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    trackPageView: trackingSEOEvents.trackPageView,
    trackCourseView: trackingSEOEvents.trackCourseView,
    trackEnrollment: trackingSEOEvents.trackEnrollment,
    trackSearch: trackingSEOEvents.trackSearch,
    trackContactSubmission: trackingSEOEvents.trackContactSubmission,
    trackScrollDepth: trackingSEOEvents.trackScrollDepth,
  };
};

/**
 * Hook para rastrear vista de página con pathname
 */
export const usePageView = (pageName: string) => {
  const { trackPageView } = useSEOTracking();

  useEffect(() => {
    trackPageView(pageName, window.location.pathname + window.location.hash);
  }, [pageName, trackPageView]);
};

/**
 * Hook para rastrear tiempo en página
 */
export const useTimeOnPage = (pageName: string, minSeconds: number = 30) => {
  useEffect(() => {
    const startTime = Date.now();

    const handleBeforeUnload = () => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      
      if (timeOnPage >= minSeconds) {
        // Aquí puedes enviar el evento a analytics
        console.log(`${pageName}: ${timeOnPage}s spent`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pageName, minSeconds]);
};

/**
 * Hook para rastrear intención de compra/inscripción
 */
export const useEnrollmentTracking = (courseId: string, courseTitle: string, price: number) => {
  const { trackEnrollment } = useSEOTracking();

  const handleEnroll = () => {
    trackEnrollment(courseId, courseTitle, price);
  };

  return { handleEnroll };
};

/**
 * Hook para rastrear búsquedas dentro del sitio
 */
export const useSearchTracking = () => {
  const { trackSearch } = useSEOTracking();

  const handleSearch = (query: string, resultsCount: number) => {
    if (query.length > 2) {
      trackSearch(query, resultsCount);
    }
  };

  return { handleSearch };
};
