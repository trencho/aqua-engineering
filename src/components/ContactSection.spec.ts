import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountAt } from '@/test/mount'
import ContactSection from './ContactSection.vue'
import { content } from '@/content'

/**
 * The section composes the form and the address block. Its own behaviour is
 * small but load bearing: the address must survive whether or not the form can
 * submit, because without a key those addresses are the only way to reach
 * anyone. Form behaviour itself is covered in ContactForm.spec.ts.
 */

const KEY = '00000000-0000-0000-0000-000000000000'

afterEach(() => vi.unstubAllEnvs())

describe('with a configured form', () => {
  beforeEach(() => vi.stubEnv('VITE_WEB3FORMS_KEY', KEY))

  it('renders both the form and the address block', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('address').exists()).toBe(true)
  })

  it('lays them out in two columns', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('.contact__grid').classes()).not.toContain('contact__grid--details-only')
  })
})

describe('with no configured form', () => {
  beforeEach(() => vi.stubEnv('VITE_WEB3FORMS_KEY', ''))

  it('still renders the address block, which is then the only way to make contact', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('address').exists()).toBe(true)
  })

  it('publishes both email addresses', async () => {
    const { wrapper } = await mountAt(ContactSection)
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('mailto:contact@aquaengineering.mk')
    expect(hrefs).toContain('mailto:goran.trencevski@aquaengineering.mk')
  })

  it('collapses to one column, so the address does not sit in a gap', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('.contact__grid').classes()).toContain('contact__grid--details-only')
  })
})

describe('the section itself', () => {
  it('keeps the anchor the navigation links to', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('#contact').exists()).toBe(true)
  })

  it('heads the section in the active language', async () => {
    const { wrapper } = await mountAt(ContactSection, 'mk')
    expect(wrapper.find('h2').text()).toBe(content.mk.contact.heading)
  })

  it('lists all three published phone numbers with tel: links', async () => {
    const { wrapper } = await mountAt(ContactSection)
    const tel = wrapper.findAll('a').filter((a) => a.attributes('href')?.startsWith('tel:'))
    expect(tel).toHaveLength(3)
  })
})
