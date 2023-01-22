import { Get } from 'type-fest'

declare module 'lodash-es' {
  function get<BaseType, Path extends string | readonly string[]>(object: BaseType, path: Path): Get<BaseType, Path>
}
