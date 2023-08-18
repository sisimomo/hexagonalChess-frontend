export class WindowDto<T> {
  constructor(public content: T[], public hasNextPage: boolean, public startCursor: string, public endCursor: string) {}
}
