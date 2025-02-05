import { Account, Directions, Waypoint } from '~shared';
export { Directions, Waypoint };

export type ClientWaypoint = 'My+Location' | GeolocationPosition | Waypoint;

export interface DeliveryMapOptions {
  useVolunteerCurrentPos?: boolean;
  displayRouteToDonor?: boolean;
  displayRouteToReceiver?: boolean;
}

export type LatLng = google.maps.LatLng;
export type LatLngBounds = google.maps.LatLngBounds;
export type LatLngLiteral = google.maps.LatLngLiteral;

export type MapAnchorType = 'Directions' | 'Location' | 'None';

export type MapOptions = google.maps.MapOptions & DeliveryMapOptions;

export type Polyline = google.maps.Polyline;

export interface WaypointMarker {
  account: Account;
  label: string;
  latLng: LatLngLiteral;
  latLngSrc: ClientWaypoint;
  title: string;
}
