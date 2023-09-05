import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ErrorDto } from 'src/app/service/common/dto/errorDto';

export function onHttpError(toastr: ToastrService, httpErrorResponse: HttpErrorResponse, msg?: string) {
  console.error('error', httpErrorResponse);
  if (httpErrorResponse.error !== null) {
    if (httpErrorResponse.error instanceof ProgressEvent) {
      return showErrorToast(toastr, msg !== undefined ? msg : 'An error occurred');
    } else {
      return onError(toastr, httpErrorResponse.error as ErrorDto, msg);
    }
  } else {
    return showErrorToast(toastr, msg !== undefined ? msg : 'An error occurred');
  }
}

export function onError(toastr: ToastrService, errorDto: ErrorDto, msg?: string) {
  msg = (msg !== undefined ? msg + '<br><br>' : '') + errorDto.msg + '.';
  const title = errorDto.errorId !== undefined ? 'ERROR ID: ' + errorDto.errorId : undefined;
  return showErrorToast(toastr, msg, title);
}

export function showErrorToast(toastr: ToastrService, msg: string, title?: string, timeOut: number = 15000) {
  return toastr.error(msg, title, {
    closeButton: true,
    timeOut,
    enableHtml: true,
  });
}
