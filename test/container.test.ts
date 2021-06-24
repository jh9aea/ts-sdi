import {
  AlreadyBoundError,
  Container,
  HasNotBoundError,
} from '../src/container'

abstract class Base {}

class ServiceA extends Base {
  readonly name = 'ServiceA'
}

class ServiceB extends Base {
  readonly name = 'ServiceB'
}

class ServiceC extends Base {
  readonly name = 'ServiceC'

  constructor(public readonly a: ServiceA, public readonly b: ServiceB) {
    super()
  }
}

const symbol1 = Symbol()

const symbolAsync = Symbol()

const createContainer = () =>
  new Container()
    .bind('serviceA', () => new ServiceA())
    .bind('serviceB', () => new ServiceB())
    .bind('constant', () => 1)
    .factory(
      'serviceC',
      (c) => new ServiceC(c.get('serviceA'), c.get('serviceB'))
    )

describe('container', () => {
  it('binds', () => {
    const c = new Container().bind('serviceA', () => new ServiceA())

    expect(c.get('serviceA')).toBe(c.get('serviceA'))
    expect(c.isBound('serviceA')).toBe(true)
    expect(c.get('serviceA')).toBeInstanceOf(ServiceA)
    expect(c.get('serviceA').name).toBe('ServiceA')
  })

  it('binds once', () => {
    const c = createContainer()
    expect(c.isBound('serviceA')).toBe(true)

    expect(() => c.bind('serviceA', () => new ServiceB())).toThrow(
      new AlreadyBoundError(`serviceA is bound to another service`)
    )
  })

  it('factory', () => {
    const c = createContainer()
    expect(c.isBound('serviceC')).toBe(true)

    expect(c.get('serviceC')).not.toBe(c.get('serviceC'))
    expect(c.get('serviceA')).toBe(c.get('serviceC').a)
    expect(c.get('serviceB')).toBe(c.get('serviceC').b)

    expect(() => c.bind('serviceC', () => new ServiceB())).toThrow(
      new AlreadyBoundError(`serviceC is bound to another service`)
    )
  })

  it('unbind', () => {
    const c = createContainer()
    // will be cached
    c.get('serviceA')
    c.unbind('serviceA')

    expect(() => c.get('serviceA' as any)).toThrow(
      new HasNotBoundError('serviceA is not bound to any service')
    )
    expect(() => c.get('serviceC')).toThrow(
      new HasNotBoundError('serviceA is not bound to any service')
    )

    c.bind('serviceA', () => new ServiceB())
    const serviceC = c.get('serviceC')
    expect(serviceC.a).toBeInstanceOf(ServiceB)
  })

  it('binds async', () => {
    let serv = 1;
    let fact = 1;
    const c = new Container()
      .bind('async', () => Promise.resolve(serv++))
      .factory('asyncFactory', () => Promise.resolve(fact++));

    expect(c.get('async')).resolves.toBe(1);
    expect(c.get('async')).resolves.toBe(1);

    expect(c.get('asyncFactory')).resolves.toBe(1);
    expect(c.get('asyncFactory')).resolves.toBe(2);
  })

  it('__', () => {
    const container = new Container()
      .bind('service1' as const, () => new ServiceA())
      .bind('service2', () => new ServiceA())
      .bind('service3', () => new ServiceB())
      .bind(symbol1, () => new ServiceB())
      .factory('factory.1', () => new ServiceB())
      .bind(symbolAsync, async () => new ServiceA())
    const r1 = container.get('service1')
    const r2 = container.get('service2')
    const r3 = container.get('service3')
    const r4 = container.get(symbol1)
    const r5 = container.get(symbolAsync)
    expect(container.get('service1')).toBeInstanceOf(ServiceA)
  })
})
