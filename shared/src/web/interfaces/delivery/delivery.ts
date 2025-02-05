import { Account } from '../account/account';
import { MapRoute } from '../map/map-route';
export { Account, MapRoute };

/**
 * Delivery data for a donation.
 */
export interface Delivery {
  /**
   * The auto-generated database ID for the delivery.
   */
  id?: number;
  /**
   * The account of the volunteer driver.
   */
  volunteerAccount: Account;
  /**
   * The begin date-time of the estimated pickup window selected by the deliverer.
   */
  pickupWindowStart: Date;
  /**
   * The end date-time of the estimated pickup window selected by the deliverer.
   */
  pickupWindowEnd: Date;
  /**
   * The start date-time of the estimated drop-off window.
   */
  dropOffWindowStart: Date;
  /**
   * The end date-time of the estimated drop-off window.
   */
  dropOffWindowEnd: Date;
  /**
   * The driving route from the Deliverer home (address on record) to the Donor.
   */
  routeToDonor: MapRoute;
  /**
   * The time that the donation was started by the volunteer.
   */
  startTime?: Date;
  /**
   * The time that the donation was picked-up from the donor.
   */
  pickupTime?: Date;
  /**
   * The time that the donation was dropped-off at the receiver.
   */
  dropOffTime?: Date;
  /**
   * The time when the donation delivery was scheduled (created).
   */
  createTimestamp?: Date;
}
