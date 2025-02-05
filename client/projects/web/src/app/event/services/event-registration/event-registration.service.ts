import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EventRegistration, EventRegistrationCreateRequest, FeaturedEvent } from '~shared';
import { environment } from '~web-env/environment';
import { HttpResponseService } from '~web/shared/services/http-response/http-response.service';

@Injectable({
  providedIn: 'root'
})
export class EventRegistrationService {

  readonly url = `${environment.server}/featured-event/registration`;

  private _loading = false;

  constructor(
    private _httpClient: HttpClient,
    private _httpResponseService: HttpResponseService
  ) {}

  get loading(): boolean {
    return this._loading;
  }

  register(event: FeaturedEvent, eventRegistration: Partial<EventRegistration>): Observable<any> {
    eventRegistration.featuredEvent = event;
    const eventRegistrationReq: EventRegistrationCreateRequest = { eventRegistration: <EventRegistration>eventRegistration };
    this._loading = true;
    return this._httpClient.post(this.url, eventRegistrationReq, { withCredentials: true }).pipe(
      this._httpResponseService.handleHttpResponse({ loaderBlocking: false }),
      finalize(() => this._loading = false)
    );
  }
}
