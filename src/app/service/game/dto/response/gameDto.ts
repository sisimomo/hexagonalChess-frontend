import { GameSaveDto } from './gameSaveDto';

export class GameDto {
  constructor(
    public friendlyId: string,
    public whiteUserUuid: string,
    public blackUserUuid: string,
    public publicGame: boolean,
    public createDate: string,
    public updateDate: string,
    public gameSave?: GameSaveDto
  ) {}
}
