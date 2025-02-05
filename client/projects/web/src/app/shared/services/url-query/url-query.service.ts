import { Injectable } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, NavigationExtras, ParamMap, Params, Router } from '@angular/router';
import { cloneDeep } from 'lodash-es';
import { NEVER, Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { ReadRequest } from '~shared';

/**
 * A helper service used for querying and modifying parts of the URL.
 */
@Injectable({
  providedIn: 'root'
})
export class UrlQueryService {

  private _prevUrl = '';

  constructor(
    private _router: Router
  ) {
    // Track the previous URL to ensure that any query param change is not caused by a route change.
    this._prevUrl = this._router.url.split(/\?|#/g)[0];
    this._router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this._prevUrl = event.url.split(/\?|#/g)[0];
      }
    });
  }

  /**
   * Listens for a change in URL query parameters and maps the params to a read request on change.
   * Will always emit the current query param snapshot upon initial setup.
   * @param activatedRoute The activated route service used to monitor changes to the URL.
   * @param defaultParams The optional default parameter values to assign when not explicitly set via URL query params.
   * @return An observable that emits the `ReadRequest` generated from an update to the URL query params.
   */
  listenQueryParamsChange<T extends ReadRequest>(activatedRoute: ActivatedRoute, defaultParams: Partial<T> = {}): Observable<T> {
    const initUrl: string = this._router.url.split(/\?|#/g)[0];
    let first = true;
    return activatedRoute.queryParams.pipe(
      switchMap((params: Params) => {
        // Check if this is triggered by a query param change and not a route change.
        if (first || this._prevUrl === initUrl) {
          first = false;
          return of(this.queryParamsToReadRequest<T>(params, defaultParams));
        }
        return NEVER; // Do not emit a value (and do not terminate); the queryParams emission was due to a route change.
      })
    );
  }

  /**
   * Listens for changes to a given URL path parameter, attempts to convert it to a number if possible, and emits its value on change.
   * @param param The URL (path) parameter to listen for a change to.
   * @param activatedRoute The activated route service used to monitor changes to the URL.
   * @return An observable that emits the updated param value (converts it to a number if possible).
   */
  listenUrlParamChange<T extends number | string = string>(
    param: string,
    activatedRoute: ActivatedRoute
  ): Observable<T> {
    return activatedRoute.paramMap.pipe(
      filter((paramMap: ParamMap) => paramMap.has(param)),
      map((paramMap: ParamMap) => {
        const paramStr: string = paramMap.get(param);
        const paramNum: number = parseInt(paramStr, 10);
        return <T>(isNaN(paramNum) ? paramStr : paramNum);
      })
    );
  }

  /**
   * Converts (URL) query params to a generic ReadRequest.
   * @param params The query params that are to be converted.
   * @param defaultParams The default query param values that shall be assigned to any missing URL query params.
   * @return The `ReadRequest` result of the conversion.
   */
  queryParamsToReadRequest<T extends ReadRequest>(params: Params, defaultParams: any): T {
    const request: T = Object.assign(<any>cloneDeep(params), defaultParams);
    if (typeof params.page === 'string') {
      request.page = parseInt(params.page, 10);
    }
    if (typeof params.limit === 'string') {
      request.limit = parseInt(params.limit, 10);
    }
    return request;
  }

  /**
   * Updates the URL query string to contain given donation filter values.
   * @param queryParams An object containing members that construct URL query string key-value pairs.
   * @param activatedRoute The activated route service used to complete query string modification on the current route.
   * @param extras Optional {@link NavigationExtras} options used when navigating with the built-in Angular Router.
   */
  updateUrlQueryString(queryParams: any, activatedRoute: ActivatedRoute, extras: NavigationExtras = {}): void {
    // Convert dates into raw ISO strings, and remove empty strings.
    for (const filterKey in queryParams) {
      if (queryParams[filterKey] instanceof Date) {
        queryParams[filterKey] = (<Date>queryParams[filterKey]).toISOString();
      }
      if (queryParams[filterKey] === '') {
        delete queryParams[filterKey];
      }
    }

    extras.relativeTo = extras.relativeTo ?? activatedRoute;
    extras.queryParams = extras.queryParams ?? queryParams;
    this._router.navigate([], extras);
  }
}
