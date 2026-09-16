import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountAt } from '@/test/mount'
import ContactSection from './ContactSection.vue'
import { content } from '@/content'

/**
 * The form is the only interactive logic on the site and the only place it
 * handles anyone's personal data, so it is the code most worth testing. These
 * cover the branches: what happens with empty fields, a malformed address, a
 * bot, a refusing endpoint and a network that drops.
 */

const KEY = '00000000-0000-0000-0000-000000000000'

function fill(wrapper: Awaited<ReturnType<typeof mountAt>>['wrapper'], over = {}) {
  const values = {
    firstName: 'Ana',
    lastName: 'Petrova',
    email: 'ana@example.com',
    message: 'Hello',
    ...over,
  }
  return Promise.all(
    Object.entries(values).map(([k, v]) => wrapper.find(`#field-${k}`).setValue(v)),
  )
}

describe('with no access key configured', () => {
  beforeEach(() => vi.stubEnv('VITE_WEB3FORMS_KEY', ''))
  afterEach(() => vi.unstubAllEnvs())

  it('hides the form rather than showing one that cannot submit', async () => {
    const { wrapper } = await mountAt(ContactSection)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('still publishes both email addresses, so the page remains usable', async () => {
    const { wrapper } = await mountAt(ContactSection)
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('mailto:contact@aquaengineering.mk')
    expect(hrefs).toContain('mailto:goran.trencevski@aquaengineering.mk')
  })
})

describe('validation', () => {
  beforeEach(() => vi.stubEnv('VITE_WEB3FORMS_KEY', KEY))
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('does not contact the endpoint when the form is empty', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { wrapper } = await mountAt(ContactSection)

    await wrapper.find('form').trigger('submit')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('reports every empty field, not just the first', async () => {
    const { wrapper } = await mountAt(ContactSection)
    await wrapper.find('form').trigger('submit')

    const listed = wrapper.findAll('.contact__summary a').length
    expect(listed).toBe(content.en.contact.fields.length)
  })

  it('marks each bad field for assistive tech, not only visually', async () => {
    const { wrapper } = await mountAt(ContactSection)
    await wrapper.find('form').trigger('submit')

    for (const field of content.en.contact.fields) {
      const input = wrapper.find(`#field-${field.name}`)
      expect(input.attributes('aria-invalid')).toBe('true')
      expect(input.attributes('aria-describedby')).toBe(`err-${field.name}`)
    }
  })

  it('announces the failure through a live region', async () => {
    const { wrapper } = await mountAt(ContactSection)
    await wrapper.find('form').trigger('submit')

    const summary = wrapper.find('.contact__summary')
    expect(summary.attributes('role')).toBe('alert')
    expect(summary.attributes('tabindex')).toBe('-1')
  })

  it('rejects a malformed email even when every field has something in it', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { wrapper } = await mountAt(ContactSection)

    await fill(wrapper, { email: 'ana@example' })
    await wrapper.find('form').trigger('submit')

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(wrapper.find('#err-email').exists()).toBe(true)
  })

  it('treats whitespace as empty', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { wrapper } = await mountAt(ContactSection)

    await fill(wrapper, { message: '   ' })
    await wrapper.find('form').trigger('submit')

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('clears an error once the field is corrected and resubmitted', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    const { wrapper } = await mountAt(ContactSection)

    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.contact__summary').exists()).toBe(true)

    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.find('.contact__summary').exists()).toBe(false)
  })
})

describe('submission', () => {
  beforeEach(() => vi.stubEnv('VITE_WEB3FORMS_KEY', KEY))
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('sends the access key and the entered values to Web3Forms', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }))
    const { wrapper } = await mountAt(ContactSection)

    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await new Promise((r) => setTimeout(r, 0))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.web3forms.com/submit')

    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.access_key).toBe(KEY)
    expect(body.name).toBe('Ana Petrova')
    expect(body.email).toBe('ana@example.com')
    expect(body.message).toBe('Hello')
  })

  it('tells the endpoint which language the enquiry came from', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }))
    const { wrapper } = await mountAt(ContactSection, 'mk')

    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await new Promise((r) => setTimeout(r, 0))

    expect(JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string).language).toBe(
      'mk',
    )
  })

  it('confirms success in the active language and empties the form', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    const { wrapper } = await mountAt(ContactSection, 'mk')

    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.find('.contact__note--ok').text()).toBe(content.mk.contact.success)
    expect((wrapper.find('#field-email').element as HTMLInputElement).value).toBe('')
  })

  it('reports a refusal from the endpoint instead of claiming success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }))
    const { wrapper } = await mountAt(ContactSection)

    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.find('.contact__note--bad').exists()).toBe(true)
    expect(wrapper.find('.contact__note--ok').exists()).toBe(false)
  })

  it('survives the network dropping rather than leaving the button stuck', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    const { wrapper } = await mountAt(ContactSection)

    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.find('.contact__note--bad').exists()).toBe(true)
    expect(wrapper.find('.contact__submit').attributes('disabled')).toBeUndefined()
  })

  it('drops a submission that filled the honeypot, without contacting anything', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { wrapper } = await mountAt(ContactSection)

    await fill(wrapper)
    await wrapper.find('.contact__botcheck').setValue(true)
    await wrapper.find('form').trigger('submit')

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
