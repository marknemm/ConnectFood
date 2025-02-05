import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account, AccountReadRequest, ListResponse } from '~shared';
import { environment } from '~web-env/environment';
import { HttpResponseHandlerOptions, HttpResponseService } from '~web/shared/services/http-response/http-response.service';

/**
 * A service responsible for reading accounts from the server.
 */
@Injectable({
  providedIn: 'root'
})
export class AccountReadService {

  /**
   * The REST endpoint URL for an account resource.
   */
  readonly url = `${environment.server}/account`;

  constructor(
    private _httpResponseService: HttpResponseService,
    private _httpClient: HttpClient
  ) {}

  /**
   * Whether or not an account read request is loading.
   */
  get loading(): boolean {
    return this._httpResponseService.loading;
  }

  /**
   * Gets an account based off of a given account ID.
   * @param id The ID of the account to retrieve.
   * @return An observable that emits the retrieved account from the server.
   */
  getAccount(id: number): Observable<Account> {
    const url = `${this.url}/${id}`;
    return this._httpClient.get<Account>(url, { withCredentials: true }).pipe(
      this._httpResponseService.handleHttpResponse()
    );
  }

  /**
   * Gets accounts based off of given filter and paging parameters.
   * @param request The account read request.
   * @param opts Options for the HTTP response handler.
   * @return An observable that emits the account list that was retrieved from the server.
   */
  getAccounts(filters: AccountReadRequest, opts: HttpResponseHandlerOptions = {}): Observable<ListResponse<Account>> {
    const request = <AccountReadRequest>filters;
    request.page = request.page ?? 1;
    request.limit = request.limit ?? 10;
    const params = new HttpParams({ fromObject: <any>request });
    return this._httpClient.get<ListResponse<Account>>(this.url, { params, withCredentials: true }).pipe(
      this._httpResponseService.handleHttpResponse(opts)
    );
  }
}
