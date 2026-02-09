import { describe, it, expect } from 'vitest'
import {
  ContactFormSchema,
  TeacherFormSchema,
  CourseFormSchema,
} from './validation'

describe('Validación de Esquemas', () => {
  describe('ContactFormSchema', () => {
    it('debe validar un contacto correcto', () => {
      const validData = {
        name: 'Juan Perez',
        email: 'juan@example.com',
        phone: '+54 9 11 1234-5678',
        subject: 'Consulta General',
        message: 'Este es un mensaje de prueba para testing',
      }
      const result = ContactFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('debe rechazar nombre vacío', () => {
      const invalidData = {
        name: '',
        email: 'juan@example.com',
        phone: '',
        subject: 'Consulta',
        message: 'Mensaje válido de prueba',
      }
      const result = ContactFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('debe rechazar email inválido', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'email-invalido',
        phone: '',
        subject: 'Consulta',
        message: 'Mensaje válido de prueba',
      }
      const result = ContactFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('debe aceptar teléfono opcional', () => {
      const validData = {
        name: 'Juan Perez',
        email: 'juan@example.com',
        phone: '',
        subject: 'Consulta',
        message: 'Mensaje valido para testing del formulario',
      }
      const result = ContactFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('TeacherFormSchema', () => {
    it('debe validar un profesor correcto', () => {
      const validData = {
        full_name: 'Dr. Carlos López',
        email: 'carlos@example.com',
        specialization: 'Medicina de Emergencias',
        years_of_experience: 15,
        hourly_rate: 75.5,
        is_active: true,
      }
      const result = TeacherFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('debe rechazar profesor sin nombre', () => {
      const invalidData = {
        full_name: '',
        email: 'carlos@example.com',
      }
      const result = TeacherFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('debe rechazar años de experiencia negativos', () => {
      const invalidData = {
        full_name: 'Dr. Carlos López',
        email: 'carlos@example.com',
        years_of_experience: -5,
      }
      const result = TeacherFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('debe aceptar datos parciales', () => {
      const validData = {
        full_name: 'Dr. Carlos López',
        email: 'carlos@example.com',
      }
      const result = TeacherFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('CourseFormSchema', () => {
    it('debe validar un curso correcto', () => {
      const validData = {
        title: 'RCP Adultos AHA 2020',
        slug: 'rcp-adultos-aha-2020',
        description: 'Curso completo de RCP para adultos',
        category: 'RCP',
        level: 'Básico',
        duration: '8 horas',
        instructorId: 'teacher-1',
      }
      const result = CourseFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('debe rechazar slug con espacios', () => {
      const invalidData = {
        title: 'RCP Adultos',
        slug: 'rcp adultos',
        description: 'Descripcion valida del curso',
        category: 'RCP',
        level: 'Básico',
        duration: '8 horas',
        instructorId: 'teacher-1',
      }
      const result = CourseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('debe aceptar datos mínimos requeridos', () => {
      const validData = {
        title: 'Mi Curso Nuevo',
        slug: 'mi-curso-nuevo',
        description: 'Descripcion valida del curso',
        category: 'Salud',
        level: 'Básico',
        duration: '4 horas',
        instructorId: 'teacher-2',
      }
      const result = CourseFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
