import { BindingKeyType, TContainerBase } from './types'

export class AlreadyBoundError extends Error {
  // name = 'AlreadyBoundError';
}

export class HasNotBoundError extends Error {
  // name = 'HasNotBoundError';
}

/**
 * Simple di container
 *
 * @example
 * const c = new Container()
 *   .bind('a', () => new A())
 *   .factory('b', (c) => new B(c.get('a')));
 * c.get('b');
 */
export class Container<T extends TContainerBase> {
  private _bindings: Map<BindingKeyType, (c: this) => any> = new Map()

  private _resolved: Map<BindingKeyType, any> = new Map()

  private _factories: Set<BindingKeyType> = new Set()

  public isBound<K extends BindingKeyType>(key: K): boolean {
    return this._bindings.has(key)
  }

  public bind<K extends BindingKeyType, R>(
    key: K,
    binding: (c: this) => R
  ): Container<T & { [p in K]: R }> {
    if (this.isBound(key)) {
      throw new AlreadyBoundError(`${key} is bound to another service`)
    }

    this._bindings.set(key, binding)

    return this as any
  }

  public factory<K extends BindingKeyType, R>(
    key: K,
    binding: (c: this) => R
  ): Container<T & { [p in K]: R }> {
    const _bind = this.bind(key, binding)

    this._factories.add(key)

    return _bind
  }

  private _hasNotBoundError<K extends BindingKeyType>(key: K) {
    if (!this.isBound(key)) {
      throw new HasNotBoundError(`${key} is not bound to any service`)
    }
  }

  public unbind<K extends keyof T>(key: K): Container<Omit<T, K>> {
    this._hasNotBoundError(key as BindingKeyType)

    this._bindings.delete(key as BindingKeyType)
    this._resolved.delete(key as BindingKeyType)
    this._factories.delete(key as BindingKeyType)

    return this as any
  }

  private resolve<K extends keyof T>(key: K) {
    this._hasNotBoundError(key as BindingKeyType)

    return this._bindings.get(key as BindingKeyType)!(this)
  }

  public get<K extends keyof T, R = T[K]>(key: K): R {
    if (this._factories.has(key as BindingKeyType)) {
      return this.resolve(key)
    }

    if (!this._resolved.has(key as BindingKeyType)) {
      this._resolved.set(key as BindingKeyType, this.resolve(key))
    }

    return this._resolved.get(key as BindingKeyType)
  }
}
