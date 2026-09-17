import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountAt } from '@/test/mount'
import ContactSection from './ContactSection.vue'
import { content } from '@/content'

/**
 * The section is the form and the map, which is how the original composed it.
 * The address moved to the footer, where the original also carried it, so the
 * "reachable without the form" guarantee is asserted in SiteFooter.spec.ts
 * rather than here. Form behaviour itself is covered in ContactForm.spec.ts.
 */

const KEY = '00000000-0000-0000-0000-000000000000'

afterEach(() => vi.unstubAllEnvs())

describe('with a configured form', () => {
  beforeEach(() => vi.stubEnv('VITE_WEB3FORMS_KEY', KEY))

  it('renders the form alongside the map', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('iframe').exists()).toBe(true)
  })
})

describe('with no configured form', () => {
  beforeEach(() => vi.stubEnv('VITE_WEB3FORMS_KEY', ''))

  it('still renders the map, so the section is not empty', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('iframe').exists()).toBe(true)
  })
})

describe('the map', () => {
  it('is lazy, so nothing reaches Google until it is scrolled to', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('iframe').attributes('loading')).toBe('lazy')
  })

  it('carries an accessible name in the active language', async () => {
    const { wrapper } = await mountAt(ContactSection, 'mk')
    expect(wrapper.find('iframe').attributes('title')).toBe(content.mk.contact.mapTitle)
  })

  it('points at the office, not an arbitrary place', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('iframe').attributes('src')).toContain('Aqua%20Engineering')
  })
})

describe('the section itself', () => {
  it('keeps the anchor the navigation links to', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('#contact').exists()).toBe(true)
  })

  it('heads the section in the active language', async () => {
    const { wrapper } = await mountAt(ContactSection, 'mk')
    expect(wrapper.find('h2').text()).toContain(content.mk.contact.heading)
  })
})
