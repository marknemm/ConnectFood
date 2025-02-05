import { DistanceMatrixResponse, UnitSystem } from '@googlemaps/google-maps-services-js';
import { ContactInfo } from '~shared';
import { env } from '../globals/env';
import { FoodWebError } from '../response/foodweb-error';
import { googleMapsClient } from './client';

/**
 * Gets the driving distance and time between a list of orign to destination queries.
 * @param distanceTimeQueries The list of origin to destination queries.
 * @return A promise that resolves to an array of the computed driving distances and times.
 * @throws FoodWebError if the distance time query fails.
 */
export async function getDrivingDistTime(distanceTimeQueries: DistanceTimeQuery[]): Promise<DistanceTimeQueryResult[]> {
  if (env.OFFLINE_MODE) { return []; }
  const origins: string[] = _extractOrigins(distanceTimeQueries);
  const destinations: string[] = _extractDestinations(distanceTimeQueries);
  const matrix: any = await _getDistanceTimeMatrix(origins, destinations);
  return _extractQueryResultsFromMatrix(matrix, distanceTimeQueries);
}

/**
 * Gets the driving distance matrix between a given list of origins and destinations.
 * @param origins The list of origins that will form the row entries of the resulting distance matrix.
 * @param destinations The list of destinations that will form the column (element) entries of the resulting distance matrix.
 * @param numRetries The number of retries that have been taken so far (due to OVER_QUERY_LIMIT status). Starts (Defaults) at 0.
 * @return A promise that resolves to an array of the computed driving distances and times.
 * @throws FoodWebError if the distance time query fails.
 */
export async function _getDistanceTimeMatrix(origins: string[], destinations: string[], retryCnt = 0): Promise<DistanceMatrixResponse> {
  try {
    const response: DistanceMatrixResponse = await googleMapsClient.distancematrix({
      params: { key: env.DISTANCE_TIME_API_KEY, origins, destinations, units: UnitSystem.imperial }
    });
    switch (response.statusText) {
      case 'OK':                return response;
      case 'OVER_QUERY_LIMIT':  return _attemptRetry(origins, destinations, retryCnt);
      default:                  _handleGetDistanceTimeErr(new Error(response.statusText));
    }
  } catch (err) {
    _handleGetDistanceTimeErr(err);
  }
}

/**
 * Extracts origin GPS/Address strings form a given list of distance-time queries.
 * @param distanceTimeQueries The distance-time queries to extract origin GPS/Address strings from.
 * @return The extracted origin GPS/Address strings.
 */
function _extractOrigins(distanceTimeQueries: DistanceTimeQuery[]): string[] {
  return distanceTimeQueries.map((distancetimeQuery: DistanceTimeQuery) => {
    return (typeof distancetimeQuery.origin !== 'string')
      ? _contactInfoToQueryString(distancetimeQuery.origin)
      : distancetimeQuery.origin;
  });
}

/**
 * Extracts destination GPS/Address strings form a given list of distance-time queries.
 * @param distanceTimeQueries The distance-time queries to extract destination GPS/Address strings from.
 * @return The extracted destination GPS/Address strings.
 */
function _extractDestinations(distanceTimeQueries: DistanceTimeQuery[]): string[] {
  return distanceTimeQueries.map((distancetimeQuery: DistanceTimeQuery) => {
    return (typeof distancetimeQuery.destination !== 'string')
      ? _contactInfoToQueryString(distancetimeQuery.destination)
      : distancetimeQuery.destination;
  });
}

/**
 * Converts a ContactInfo object into a GPS '<latitude>,<longitude>' Coordinate or an Address string.
 * @param contactInfo The ContactInfo object to convert.
 * @return The GPS Coordinate or Address string.
 */
function _contactInfoToQueryString(contactInfo: ContactInfo): string {
  return (contactInfo.location)
    ? `${contactInfo.location.coordinates[1]},${contactInfo.location.coordinates[0]}`
    : `${contactInfo.streetAddress}, ${contactInfo.city}, ${contactInfo.stateProvince}, ${contactInfo.postalCode}`;
}

/**
 * Attempts to retry the distance-time matrix query. Will only retry a maximum of 5 times. Will addatively throttle each retry.
 * @param origins The list of origins that will form the row entries of the resulting distance matrix.
 * @param destinations The list of destinations that will form the column (element) entries of the resulting distance matrix.
 * @param retryCnt The number of retries that have happened previously.
 * @throws FoodWebError if the retry limit (5) has been exceeded or the distance-time query retry fails.
 */
function _attemptRetry(origins: string[], destinations: string[], retryCnt: number): Promise<DistanceMatrixResponse> {
  if (++retryCnt >= 5) {
    _handleGetDistanceTimeErr(new Error('OVER_QUERY_LIMIT'));
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(_getDistanceTimeMatrix(origins, destinations, retryCnt));
    }, 500 * retryCnt);
  });
}

/**
 * Handles a given error resulting from invoking the external distance-time calculation service.
 * @param err The initial error to handle.
 * @throws FoodWebError with a generic failure message for the distance-time calculation operation.
 */
function _handleGetDistanceTimeErr(err: Error): void {
  console.error(err);
  throw new FoodWebError('Unexpected failure when calculating driving distances & times');
}

/**
 * Extracts a distance-time query result list form a given distance-time matrix.
 * Basically, grabs all elements on the diagonal, which reflects the input query list's origin destination pairings.
 * @param matrix The resulting distance-time matrix from the 3rd party query.
 * @return The distance-time query result list correlating with the input queries.
 */
function _extractQueryResultsFromMatrix(matrix: any, distanceTimeQueries: DistanceTimeQuery[]): DistanceTimeQueryResult[] {
  const distanceTimeQueryResults: DistanceTimeQueryResult[] = [];
  for (let i = 0; i < distanceTimeQueries.length; i++) {
    const distanceTimeQuery: DistanceTimeQuery = distanceTimeQueries[i];
    const matrixEntry: any = matrix.rows[i].elements[i];
    distanceTimeQueryResults.push({
      origin: distanceTimeQuery.origin,
      destination: distanceTimeQuery.destination,
      distance: matrixEntry.distance.text,
      distanceMi: parseFloat(matrixEntry.distance.text),
      duration: matrixEntry.duration.text,
      durationMin: parseInt(matrixEntry.duration.text, 10)
    });
  }
  return distanceTimeQueryResults;
}

/**
 * A single distance-time query. Will get the distance and driving duration between the contained origin and destination.
 */
export interface DistanceTimeQuery {
  origin: ContactInfo | string;
  destination: ContactInfo | string;
}

/**
 * A distance-time query result.
 */
export interface DistanceTimeQueryResult {
  origin: ContactInfo | string;
  destination: ContactInfo | string;
  distance: string;
  distanceMi: number;
  duration: string;
  durationMin: number;
}
