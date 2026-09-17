import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountAt } from '@/test/mount'
import SiteFooter from './SiteFooter.vue'
import { content } from '@/content'

/**
 * The footer carries the address and the phone and email links, as the original
 * did. That makes it the guarantee that the company stays reachable when the
 * contact form cannot submit — without a Web3Forms key the form renders
 * nothing, and these links are then the only way through. Asserted with the key
 * absent for exactly that reason.
 */

afterEach(() => vi.unstubAllEnvs())

describe('with no configured form', () => {
  beforeEach(() => vi.stubEnv('VITE_WEB3FORMS_KEY', ''))

  it('publishes both email addresses', async () => {
    const { wrapper } = await mountAt(SiteFooter)
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('mailto:contact@aquaengineering.mk')
    expect(hrefs).toContain('mailto:goran.trencevski@aquaengineering.mk')
  })

  it('lists all three published phone numbers as tel: links', async () => {
    const { wrapper } = await mountAt(SiteFooter)
    const tel = wrapper.findAll('a').filter((a) => a.attributes('href')?.startsWith('tel:'))
    expect(tel).toHaveLength(3)
  })

  it('gives the office address in a semantic address element', async () => {
    const { wrapper } = await mountAt(SiteFooter)
    const address = wrapper.find('address')
    expect(address.exists()).toBe(true)
    for (const line of content.en.contact.office.lines) {
      expect(address.text()).toContain(line)
    }
  })
})

describe('the footer itself', () => {
  it('links to the privacy notice, which the original had nowhere', async () => {
    const { wrapper } = await mountAt(SiteFooter)
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('/privacy')
  })

  it('links to the Macedonian notice from the Macedonian page', async () => {
    const { wrapper } = await mountAt(SiteFooter, 'mk')
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('/mk/privacy')
  })

  it('labels the office in the active language', async () => {
    const { wrapper } = await mountAt(SiteFooter, 'mk')
    expect(wrapper.text()).toContain(content.mk.contact.office.label)
  })
})
