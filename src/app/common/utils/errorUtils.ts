import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ErrorDto } from 'src/app/service/common/dto/errorDto';

export function onError(toastr: ToastrService, httpErrorResponse: HttpErrorResponse, msg?: string) {
  console.error('error', httpErrorResponse);
  if (httpErrorResponse.error !== null) {
    const error = httpErrorResponse.error as ErrorDto;
    msg = (msg !== undefined ? msg + '<br><br>' : '') + error.msg + '.';
    const title = error.errorId !== undefined ? 'ERROR ID: ' + error.errorId : undefined;
    showErrorToast(toastr, msg, title);
  } else {
    showErrorToast(toastr, msg !== undefined ? msg : 'An error occurred');
  }
}

export function showErrorToast(toastr: ToastrService, msg: string, title?: string, timeOut: number = 15000) {
  toastr.error(msg, title, {
    closeButton: true,
    timeOut,
    enableHtml: true,
  });
}
