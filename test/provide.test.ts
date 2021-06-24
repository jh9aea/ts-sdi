// @ts-ignore
import { pipe } from 'lodash/fp'

import { Container } from '../src/container'
import { provide } from '../src/provide'

describe('provider', () => {
  const provider1 = provide((c) => c.bind('1', () => 1))
  const provider2 = provide((c: Container<{ '1': number }>) =>
    c.bind('2', (c) => c.get('1') + 1)
  )
  const provider22 = provide(
    (c: ReturnType<typeof provider1> & ReturnType<typeof provider2>) =>
      c
        .factory('3', (c) => c.get('1') + 2)
        .bind('22', () => c.get('2') * (c.get('1') + 10))
  )
  const provider33 = <T extends { '2': number }>(c: Container<T>) =>
    c.bind('33', (c) => c.get('2') + 31)

  it('register separately', () => {
    const c0 = provider1(new Container())
    const c00 = provider2(c0)
    const c1 = provider22(c00)
    const c = provider33(c1)

    expect(c.get('1')).toBe(1)
    expect(c.get('3')).toBe(3)
    expect(c.get('22')).toBe(22)
    expect(c.get('33')).toBe(33)
  })

  it('register', () => {
    const c = provider33(provider22(provider2(provider1(new Container<{}>()))))

    expect(c.get('1')).toBe(1)
    expect(c.get('3')).toBe(3)
    expect(c.get('22')).toBe(22)
    expect(c.get('33')).toBe(33)
  })

  it('register with lodash pipe', () => {
    const c = pipe(
      provider1,
      provider2,
      provider22,
      provider33
    )(new Container())

    expect(c.get('1')).toBe(1)
    expect(c.get('3')).toBe(3)
    expect(c.get('22')).toBe(22)
    expect(c.get('33')).toBe(33)
  })
})
