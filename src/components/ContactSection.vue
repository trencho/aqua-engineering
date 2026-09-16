<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { EMAILS, PHONES } from '@/content'

const { c, locale } = useLocale()

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? ''
const formEnabled = computed(() => ACCESS_KEY.length > 0)

type FieldName = 'firstName' | 'lastName' | 'email' | 'message'
type Status = 'idle' | 'sending' | 'sent' | 'failed'

const values = reactive<Record<FieldName, string>>({
  firstName: '',
  lastName: '',
  email: '',
  message: '',
})

/** Bots fill hidden fields; people do not. Web3Forms also checks this name. */
const botcheck = ref('')

const errors = reactive<Partial<Record<FieldName, string>>>({})
const status = ref<Status>('idle')
const summary = useTemplateRef<HTMLDivElement>('summary')

const required = computed(() =>
  locale.value === 'mk' ? 'Ова поле е задолжително.' : 'This field is required.',
)
const badEmail = computed(() =>
  locale.value === 'mk' ? 'Внесете валидна е-пошта.' : 'Enter a valid email address.',
)

function validate(): boolean {
  for (const k of Object.keys(values) as FieldName[]) delete errors[k]

  for (const field of c.value.contact.fields) {
    if (!values[field.name].trim()) errors[field.name] = required.value
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = badEmail.value
  }
  return Object.keys(errors).length === 0
}

const errorList = computed(() =>
  c.value.contact.fields
    .filter((f) => errors[f.name])
    .map((f) => ({ name: f.name, label: f.label, message: errors[f.name] as string })),
)

async function submit() {
  if (botcheck.value) return // silently drop bots

  if (!validate()) {
    // Move the user to the summary so the failure is announced, not just painted.
    await Promise.resolve()
    summary.value?.focus()
    return
  }

  status.value = 'sending'
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `Website enquiry from ${values.firstName} ${values.lastName}`.trim(),
        from_name: 'aquaengineering.mk',
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
        language: locale.value,
        botcheck: '',
      }),
    })
    status.value = res.ok ? 'sent' : 'failed'
    if (res.ok) {
      for (const k of Object.keys(values) as FieldName[]) values[k] = ''
    }
  } catch {
    status.value = 'failed'
  }
}
</script>

<template>
  <section id="contact" class="contact">
    <div class="contact__inner container">
      <h2 class="contact__heading">{{ c.contact.heading }}</h2>

      <div class="contact__grid">
        <form v-if="formEnabled" class="contact__form" novalidate @submit.prevent="submit">
          <div
            v-if="errorList.length"
            ref="summary"
            class="contact__summary"
            role="alert"
            tabindex="-1"
          >
            <ul>
              <li v-for="e in errorList" :key="e.name">
                <a :href="`#field-${e.name}`">{{ e.label }}: {{ e.message }}</a>
              </li>
            </ul>
          </div>

          <p v-if="status === 'sent'" class="contact__note contact__note--ok" role="status">
            {{ c.contact.success }}
          </p>
          <p v-if="status === 'failed'" class="contact__note contact__note--bad" role="alert">
            {{ c.contact.error }}
          </p>

          <div v-for="field in c.contact.fields" :key="field.name" class="contact__field">
            <label :for="`field-${field.name}`">{{ field.label }}</label>

            <textarea
              v-if="field.name === 'message'"
              :id="`field-${field.name}`"
              v-model="values.message"
              rows="5"
              :aria-invalid="Boolean(errors.message)"
              :aria-describedby="errors.message ? `err-${field.name}` : undefined"
            ></textarea>

            <input
              v-else
              :id="`field-${field.name}`"
              v-model="values[field.name]"
              :type="field.name === 'email' ? 'email' : 'text'"
              :autocomplete="
                field.name === 'firstName'
                  ? 'given-name'
                  : field.name === 'lastName'
                    ? 'family-name'
                    : 'email'
              "
              :aria-invalid="Boolean(errors[field.name])"
              :aria-describedby="errors[field.name] ? `err-${field.name}` : undefined"
            />

            <span v-if="errors[field.name]" :id="`err-${field.name}`" class="contact__error">
              {{ errors[field.name] }}
            </span>
          </div>

          <input
            v-model="botcheck"
            class="contact__botcheck"
            type="checkbox"
            name="botcheck"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />

          <button class="contact__submit" type="submit" :disabled="status === 'sending'">
            {{ status === 'sending' ? c.contact.submitting : c.contact.submit }}
          </button>
        </form>

        <address class="contact__details">
          <p class="contact__office">{{ c.contact.office.label }}</p>
          <p class="contact__lines">
            <span v-for="line in c.contact.office.lines" :key="line">{{ line }}</span>
          </p>

          <p class="contact__phones">
            <span v-for="(phone, i) in PHONES" :key="phone.href">
              {{ i === 0 ? c.contact.phoneLabel : c.contact.mobileLabel }}:
              <a :href="phone.href">{{ phone.label }}</a>
            </span>
          </p>

          <p class="contact__emails">
            <a v-for="email in EMAILS" :key="email" :href="`mailto:${email}`">{{ email }}</a>
          </p>
        </address>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  display: flex;
  align-items: center;
  min-height: 90vh;
  background: var(--c-surface);
}

.contact__inner {
  padding-block: var(--s-5);
}

.contact__grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: var(--s-5);
  align-items: start;
}

.contact__field {
  display: grid;
  gap: var(--s-1);
  margin-bottom: var(--s-3);
}

.contact__field label {
  color: var(--c-primary);
  font-size: var(--fs-small);
  font-weight: var(--fw-semi);
}

.contact__field input,
.contact__field textarea {
  min-height: 44px;
  padding: var(--s-2);
  background: var(--c-surface);
  color: var(--c-text);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  font: inherit;
  font-size: var(--fs-small);
}

.contact__field textarea {
  resize: vertical;
}

.contact__field input[aria-invalid='true'],
.contact__field textarea[aria-invalid='true'] {
  border-color: var(--c-danger);
}

.contact__error {
  color: var(--c-danger);
  font-size: var(--fs-fine);
}

.contact__summary {
  margin-bottom: var(--s-3);
  padding: var(--s-2) var(--s-3);
  border-left: 4px solid var(--c-danger);
  background: var(--c-surface-alt);
}

.contact__summary ul {
  margin: 0;
  padding-left: var(--s-3);
  font-size: var(--fs-small);
}

.contact__summary a {
  color: var(--c-danger);
}

.contact__note {
  margin-bottom: var(--s-3);
  padding: var(--s-2) var(--s-3);
  border-radius: var(--radius);
  font-size: var(--fs-small);
}

.contact__note--ok {
  background: var(--c-surface-alt);
  border-left: 4px solid var(--c-primary);
  color: var(--c-primary);
}

.contact__note--bad {
  background: var(--c-surface-alt);
  border-left: 4px solid var(--c-danger);
  color: var(--c-danger);
}

/* Matches the original submit button: white, brand border, inverts on hover. */
.contact__submit {
  min-height: 44px;
  padding: var(--s-2) var(--s-4);
  background: var(--c-surface);
  color: var(--c-primary);
  border: 1px solid var(--c-primary);
  border-radius: var(--radius);
  font: inherit;
  font-weight: var(--fw-semi);
  cursor: pointer;
  transition:
    background var(--transition),
    color var(--transition);
}

.contact__submit:hover:not(:disabled) {
  background: var(--c-primary);
  color: var(--c-on-dark);
}

.contact__submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

.contact__botcheck {
  position: absolute;
  left: -9999px;
  opacity: 0;
}

.contact__details {
  font-style: normal;
}

.contact__office {
  margin-bottom: var(--s-2);
  color: var(--c-primary);
  font-weight: var(--fw-bold);
}

.contact__lines span,
.contact__phones span,
.contact__emails a {
  display: block;
}

.contact__phones a,
.contact__emails a {
  display: inline-block;
  min-height: 32px;
  color: var(--c-primary);
}

.contact__emails a {
  display: block;
  min-height: 44px;
  line-height: 44px;
}

@media (max-width: 1024px) {
  .contact__grid {
    grid-template-columns: 1fr;
    gap: var(--s-4);
  }
}

@media (max-width: 767px) {
  .contact {
    min-height: 0;
  }

  .contact__inner {
    padding-block: var(--s-4);
  }
}
</style>
