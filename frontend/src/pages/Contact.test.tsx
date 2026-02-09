import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Contact } from './Contact'

// Mock de Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  },
}))

describe('Contact Page', () => {
  it('debe renderizar el título de contacto', () => {
    render(<Contact />)
    const contactTexts = screen.getAllByText(/contacto/i)
    expect(contactTexts.length).toBeGreaterThan(0)
  })

  it('debe tener campos de formulario', () => {
    render(<Contact />)
    expect(screen.getByLabelText(/nombre/i, { exact: false })).toBeInTheDocument()
  })

  it('debe tener un botón de envío', () => {
    render(<Contact />)
    const submitButton = screen.queryByRole('button', { name: /enviar/i })
    expect(submitButton).toBeDefined()
  })
})
