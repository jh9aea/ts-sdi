import type { Container } from './container'
import type { TContainerBase } from './types'

interface IProvide {
  <R extends TContainerBase>(
    bindings: <B extends TContainerBase>(c: Container<B>) => Container<R>
  ): <T extends TContainerBase>(c: Container<T>) => Container<T & R>
}

/**
 * provide - is just helper function
 * made for using in separate modules
 *
 * @example
 * // --
 * // a.ts
 * export aProvider = provide(c => c.bind('a', () => new A()))
 * // b.ts
 * export bProvider = provide(c => c.bind('b', () => new B()))
 * // di.ts
 * import { aProvider } from 'a.ts'
 * import { bProvider } from 'a.ts'
 * const c = bProvider(aProvider(new Container))
 * // c == Container<{ a:A, b:B }>
 * c.get('a')
 * //--
 *
 * @see test/provide.test.ts
 */
export const provide: IProvide = (bindings) => (c) => bindings(c)
