import { supabase } from './supabase';
import { debug, error as logError } from './logger';

/**
 * Resuelve un courseSlug a courseId desde la base de datos
 * Útil para cuando navegamos mediante URL y solo tenemos el slug
 */
export async function resolveCourseSlugToId(slug: string): Promise<string | null> {
  try {
    debug(`🔍 [CourseResolver] Resolviendo slug: ${slug}`);
    
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (error) {
      logError('Error resolviendo slug:', error);
      return null;
    }
    
    if (data) {
      debug(`✅ [CourseResolver] Slug "${slug}" → ID: ${data.id}`);
      return data.id;
    }
    
    logError(`❌ [CourseResolver] No se encontró curso con slug: ${slug}`);
    return null;
  } catch (err) {
    logError('Error en resolveCourseSlugToId:', err);
    return null;
  }
}

/**
 * Resuelve un courseId a slug desde la base de datos
 */
export async function resolveCourseIdToSlug(id: string): Promise<string | null> {
  try {
    debug(`🔍 [CourseResolver] Resolviendo ID: ${id}`);
    
    const { data, error } = await supabase
      .from('courses')
      .select('slug')
      .eq('id', id)
      .single();
    
    if (error) {
      logError('Error resolviendo ID:', error);
      return null;
    }
    
    if (data) {
      debug(`✅ [CourseResolver] ID "${id}" → Slug: ${data.slug}`);
      return data.slug;
    }
    
    return null;
  } catch (err) {
    logError('Error en resolveCourseIdToSlug:', err);
    return null;
  }
}
