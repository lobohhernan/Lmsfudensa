import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CourseCard } from './CourseCard'

describe('CourseCard Snapshot Tests', () => {
  const mockCourse = {
    id: 'course-1',
    title: 'RCP Adultos AHA 2020',
    description: 'Curso completo de RCP para adultos',
    category: 'RCP',
    level: 'Básico',
    duration: '8 horas',
    price: 150,
    slug: 'rcp-adultos-aha-2020',
    certified: true,
  }

  it('matches snapshot with all properties', () => {
    const { container } = render(
      <CourseCard course={mockCourse} onClick={() => {}} />
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot with minimal properties', () => {
    const minimalCourse = {
      id: 'course-2',
      title: 'Mi Curso',
      description: 'Descripción del curso',
      category: 'General',
      level: 'Intermedio',
      duration: '4 horas',
      slug: 'mi-curso',
    }

    const { container } = render(
      <CourseCard course={minimalCourse} onClick={() => {}} />
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  it('maintains snapshot consistency', () => {
    const { container: container1 } = render(
      <CourseCard course={mockCourse} onClick={() => {}} />
    )
    const { container: container2 } = render(
      <CourseCard course={mockCourse} onClick={() => {}} />
    )

    expect(container1.firstChild).toMatchSnapshot()
    expect(container2.firstChild).toMatchSnapshot()
  })
})
