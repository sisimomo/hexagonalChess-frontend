export class GameCreateDto {
  constructor(public publicGame: boolean, public password?: string) {}
}
