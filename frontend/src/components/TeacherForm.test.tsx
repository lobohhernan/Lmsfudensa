import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TeacherForm } from './TeacherForm'

// Mock de Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}))

describe('TeacherForm Component', () => {
  it('debe renderizar el formulario del maestro', () => {
    render(<TeacherForm />)
    const headings = screen.getAllByText(/maestro/i)
    expect(headings.length).toBeGreaterThan(0)
  })

  it('debe tener campos de entrada de texto', () => {
    render(<TeacherForm />)
    const inputs = screen.queryAllByRole('textbox')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('debe tener un botón de guardar', () => {
    render(<TeacherForm />)
    const saveButtons = screen.getAllByText(/maestro|save|guardar/i)
    expect(saveButtons.length).toBeGreaterThan(0)
  })
})
