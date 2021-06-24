# Very simple di container
Just another di container
- simple api
- good ts support
- lazy initialization
- async services


## install

```ts 
yarn add ts-sdi
``` 
or

```ts 
npm i ts-sdi
```


## Usage
```ts
  import { Container } from 'ts-sdi'

  const container = new Container()
    // creates ones
    .bind('serviceA', () => new A()) 
    // creates on every call
    .factory('serviceB', (c) => new B(c.get('serviceA')))
    .bind('serviceC', async () => new C())
    .bind('value', () => 42)
    .bind('const', () => 101 as const);

// with chaining you will get ts support
// container: Container<{serviceA: A, serviceB: B, serviceC: Promise<C>, value: number, 'const': 101 }>

const b = container.get('serviceB');
const c = await container.get('serviceC');

```

### Helper provide
provide - very simple function like (c: Container) => c.bind()...
but with ts typings
```ts
  // myModule/provider.ts
  import { provide } from 'ts-sdi'

  const myModuleProvider = provide(c => 
    c.bind('service', () => new A())
     .bind('serviceB', () => new B())
  )


  // di.ts
  import pipe from 'lodash/fp';
  
  export const createContainer = () => 
    pipe(
      myModuleProvider, 
      anotherModuleProvider
    )(new Container())

```


---
was used boilerplate TypeScript Package from https://github.com/tomchen/example-typescript-package