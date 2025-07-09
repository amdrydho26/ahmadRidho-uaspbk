import { mount } from '@vue/test-utils'
import { describe, test, expect, vi } from 'vitest'
import Login from '../components/Login.vue'

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

describe('Login.vue', () => {
  test('renders login form', () => {
    const wrapper = mount(Login)
    expect(wrapper.find('h2').text()).toBe('Login ke AturKuy')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  test('shows error if email or password is empty', async () => {
    const wrapper = mount(Login)
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.html()).toContain('Email dan password wajib diisi.')
  })
}) 