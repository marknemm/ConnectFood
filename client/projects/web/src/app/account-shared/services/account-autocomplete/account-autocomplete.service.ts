import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { debounce } from 'lodash-es';
import { Observable, Subscription } from 'rxjs';
import { AccountAutocompleteItem, AccountAutocompleteRequest, AccountType, DeepReadonly } from '~shared';
import { ImmutableStore } from '~web/shared/classes/immutable-store';
import { environment } from '~web-env/environment';
import { HttpResponseService } from '~web/shared/services/http-response/http-response.service';

@Injectable({
  providedIn: 'root'
})
export class AccountAutocompleteService {

  readonly accountAutocompleteStore = new ImmutableStore<AccountAutocompleteItem[]>([]);
  readonly url = `${environment.server}/account/autocomplete`;

  private _httpSubscription = new Subscription();

  constructor(
    private _httpClient: HttpClient,
    private _httpResponseService: HttpResponseService
  ) {
    this._getAccountAutocompleteItems = debounce(this._getAccountAutocompleteItems, 300);
  }

  get loading(): boolean {
    return this._httpResponseService.loading;
  }

  refreshAutocompleteItems(fullTextQuery: string, accountType?: AccountType): Observable<DeepReadonly<AccountAutocompleteItem[]>> {
    this._httpSubscription.unsubscribe();
    (fullTextQuery?.trim()?.length > 1)
      ? this._getAccountAutocompleteItems(fullTextQuery, accountType)
      : this.accountAutocompleteStore.setValue([]);
    return this.accountAutocompleteStore.nextUpdate$;
  }

  private _getAccountAutocompleteItems(fullTextQuery: string, accountType?: AccountType): void {
    const request: AccountAutocompleteRequest = { fullTextQuery };
    if (accountType) {
      request.accountType = accountType;
    }

    const params = new HttpParams({ fromObject: <any>request });
    this._httpSubscription = this._httpClient.get<AccountAutocompleteItem>(this.url, { withCredentials: true, params }).pipe(
      this._httpResponseService.handleHttpResponse({
        immutableStore: this.accountAutocompleteStore,
        showLoader: false
      })
    ).subscribe();
  }
}
