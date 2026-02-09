import '@testing-library/jest-dom/vitest'
import { expect, afterEach, vi, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock localStorage y sessionStorage para Supabase
class StorageMock {
  private store: Record<string, string> = {}

  getItem(key: string): string | null {
    return this.store[key] || null
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null
  }

  get length(): number {
    return Object.keys(this.store).length
  }
}

// Assign mocks to window
Object.defineProperty(window, 'localStorage', {
  value: new StorageMock(),
})

Object.defineProperty(window, 'sessionStorage', {
  value: new StorageMock(),
})

// Limpia DOM después de cada test
afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})

// Mock de window.matchMedia para tests con media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
