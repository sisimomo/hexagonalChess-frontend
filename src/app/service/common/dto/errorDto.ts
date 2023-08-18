export class ErrorDto {
  constructor(
    public msg: string,
    public errorId?: string,
    public fieldErrors?: FieldErrorDto[],
    public globalErrors?: GlobalErrorDto[]
  ) {}
}

export class FieldErrorDto {
  constructor(public objectName: string, public fieldName: string, public errorCode: string) {}
}

export class GlobalErrorDto {
  constructor(public objectName: string, public errorCode: string) {}
}
