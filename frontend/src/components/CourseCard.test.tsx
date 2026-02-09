import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CourseCard, type CourseCardProps } from './CourseCard'

describe('CourseCard Snapshot Tests', () => {
  const mockCourse: Omit<CourseCardProps, 'onClick'> = {
    id: 'course-1',
    title: 'RCP Adultos AHA 2020',
    image: 'https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=400',
    duration: '8 horas',
    level: 'Básico',
    certified: true,
  }

  it('matches snapshot with all properties', () => {
    const { container } = render(
      <CourseCard
        id={mockCourse.id}
        title={mockCourse.title}
        image={mockCourse.image}
        duration={mockCourse.duration}
        level={mockCourse.level}
        certified={mockCourse.certified}
        onClick={() => {}}
      />
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot with minimal properties', () => {
    const minimalCourse = {
      id: 'course-2',
      title: 'Mi Curso',
      image: 'https://images.unsplash.com/photo-1759872138841-c342bd6410ae?w=400',
      duration: '4 horas',
      level: 'Intermedio' as const,
      certified: false,
    }

    const { container } = render(
      <CourseCard
        id={minimalCourse.id}
        title={minimalCourse.title}
        image={minimalCourse.image}
        duration={minimalCourse.duration}
        level={minimalCourse.level}
        certified={minimalCourse.certified}
        onClick={() => {}}
      />
    )

    expect(container.firstChild).toMatchSnapshot()
  })

  it('maintains snapshot consistency', () => {
    const { container: container1 } = render(
      <CourseCard
        id={mockCourse.id}
        title={mockCourse.title}
        image={mockCourse.image}
        duration={mockCourse.duration}
        level={mockCourse.level}
        certified={mockCourse.certified}
        onClick={() => {}}
      />
    )
    const { container: container2 } = render(
      <CourseCard
        id={mockCourse.id}
        title={mockCourse.title}
        image={mockCourse.image}
        duration={mockCourse.duration}
        level={mockCourse.level}
        certified={mockCourse.certified}
        onClick={() => {}}
      />
    )

    expect(container1.firstChild).toMatchSnapshot()
    expect(container2.firstChild).toMatchSnapshot()
  })
})
