import { getRepository, SelectQueryBuilder } from 'typeorm';
import { AccountEntity, AccountType, AutoClaimHistoryEntity, DonationClaimEntity, DonationEntity } from '~entity';
import { AccountReadRequest, DateTimeHelper, DonationHelper, DonationReadRequest, DonationStatus, ListResponse, OperationHours, OperationHoursHelper } from '~shared';
import { getMailClient, MailClient, MailTransporter } from '~web/helpers/messaging/email';
import { getNotificationClient, NotificationClient, NotificationType } from '~web/helpers/messaging/notification';
import { queryAccounts } from '~web/services/account/read-accounts';
import { sendDeliveryAvailableMessages } from '~web/services/delivery/delivery-available-message';
import { claimDonation } from '~web/services/donation-claim/claim-donation';
import { queryDonations } from '~web/services/donation/read-donations';

const _dateTimeHelper = new DateTimeHelper();
const _donationHelper = new DonationHelper();
const _operationHoursHelper = new OperationHoursHelper();
const _runTimestamp = new Date();

// Entrypoint for AWS Lambda Function (see serverless.yml).
exports.handler = () => autoAssignDonations();

/**
 * Automatically claims all donations that are to occur within 1/6 of the duration of time between donation creation
 * and the start of the pickup window, or donations that have less than 1 hour left until the start of the pickup window.
 * @return A promise that resolves once the operation is finished.
 */
async function autoAssignDonations(): Promise<void> {
  const limit = 300;
  let page = 1;
  let totalDonations = (limit * page) + 1; // +1 to trigger first loop.

  while (page * limit < totalDonations) {
    const readRequest: DonationReadRequest = {
      page: page++,
      limit,
      donationStatus: DonationStatus.Unmatched
    };
    const listRes: ListResponse<DonationEntity> = await queryDonations(readRequest)
      .modQuery(_addElapsedTimeFilter).exec();
    await _autoAssignReceivers(listRes.list);
    totalDonations = listRes.totalCount;
  }
}

/**
 * Adds an elapsed time filter to a given DonationEntity select query builder.
 * The filter will only select donations that have a pickup window start time within one hour of the current time,
 * or have had 80% of the duration of time between donation creation and pickup window start elapsed.
 * The filter will also only target donations that must be delivered within a day and a half from now.
 * @param queryBuilder The select query builder to add the filter to.
 */
function _addElapsedTimeFilter(queryBuilder: SelectQueryBuilder<DonationEntity>): void {
  queryBuilder = queryBuilder.andWhere(
    `donation.pickupWindowStart <= (NOW() + INTERVAL '24 HOURS')`
  ).andWhere(`(
       donation.pickupWindowStart <= (NOW() + INTERVAL '1 HOURS')
    OR donation.pickupWindowStart >= TO_TIMESTAMP(
        (0.8 / EXTRACT(EPOCH FROM (NOW() - donation.createTimestamp))::DECIMAL)
      + EXTRACT(EPOCH FROM (donation.createTimestamp))::DECIMAL
    )
  )`);
}

/**
 * Auto-assigns given donations to available receivers.
 * @param donations The donations to auto-assign to receivers.
 * @return A promise that resolves to void once the operation finishes.
 */
async function _autoAssignReceivers(donations: DonationEntity[]): Promise<void> {
  const messagePromises: Promise<any>[] = [];
  for (let donation of donations) {
    if (_shouldDelayAutoMatch(donation)) { continue; } // Do not auto-assign when late-night to prevent notifications.
    const receiverAccount: AccountEntity = await _findAutoReceiver(donation);
    if (receiverAccount) {
      donation = await claimDonation({ donationId: donation.id }, receiverAccount);
      await _recordAutoAssignment(donation);
      messagePromises.push(sendDeliveryAvailableMessages(donation));
      messagePromises.push(_sendDonationAutoAssignMessages(donation));
    }
  }
  await Promise.all(messagePromises);
}

/**
 * Determines whether or not auto-matching should be delayed (until morning) for a given donation.
 * @param donation The donation to check if auto-matching should be delayed for.
 */
function _shouldDelayAutoMatch(donation: DonationEntity): boolean {
  const minHour = 8;
  const maxHour = 22;
  const donationTimezone: string = donation.donorAccount.contactInfo.timezone;
  const nowLocalHours: number = _dateTimeHelper.toLocalHours(new Date(), donationTimezone);
  const pickupLocalHours: number = _dateTimeHelper.toLocalHours(donation.pickupWindowStart, donationTimezone);
  return (nowLocalHours >= maxHour || nowLocalHours < minHour) && (pickupLocalHours < maxHour && pickupLocalHours > minHour);
}

/**
 * Finds an automatic receiver for a given donation.
 * @param donation The donation to find an automatic receiver for.
 * @return A promise that resolves to the found automatic receiver. Will return null/undefined if no receiver is found.
 */
async function _findAutoReceiver(donation: DonationEntity): Promise<AccountEntity> {
  const operationHours: OperationHours = _operationHoursHelper.dateTimeRangeToOperationHours({
    startDateTime: donation.pickupWindowStart,
    endDateTime: donation.pickupWindowEnd
  });
  const readRequest: AccountReadRequest = {
    page: 1,
    limit: 1,
    accountType: AccountType.Receiver,
    autoReceiver: true,
    distanceRangeMi: 20,
    lon: donation.donorContactOverride.location.coordinates[0],
    lat: donation.donorContactOverride.location.coordinates[1],
    operationHoursWeekday: operationHours.weekday,
    operationHoursStartTime: operationHours.startTime,
    operationHoursEndTime: operationHours.endTime
  };
  const listRes: ListResponse<AccountEntity> = await queryAccounts(readRequest, donation.donorAccount)
    .modQuery((queryBuilder: SelectQueryBuilder<AccountEntity>) => {
      // Override ORDER BY clause to sort receivers by the number of auto-claims that they have received in the past 2 days.
      // We want to auto-assign donations to receivers that have gotten the fewest auto receives in the past 2 days.
      queryBuilder.addSelect((subQueryBuilder: SelectQueryBuilder<DonationEntity>) => {
        subQueryBuilder.select('COUNT(autoClaimHistory.id)', 'auto_claim_count')
          .from(AutoClaimHistoryEntity, 'autoClaimHistory')
          .innerJoin(DonationClaimEntity, 'claim', '"autoClaimHistory"."claimId" = claim.id')
          .where('claim.receiverAccount = account.id')
          .andWhere(`autoClaimHistory.timestamp >= (NOW() - INTERVAL '48 HOURS')`);
        return subQueryBuilder;
      }, 'auto_claim_count'
      ).addSelect('RANDOM()', 'random')
        .orderBy('auto_claim_count', 'ASC')
        .addOrderBy('random');
    }).exec();
  return listRes.list[0];
}

/**
 * Records an auto-assignment record for a given donation.
 * NOTE: This record's primary use is to ensure that an associated receiver does not
 * get overwhelmed with auto-assigns during any single job run.
 * @param donation The donation that has been auto-assigned.
 * @return A promise that resolves once the operation completes.
 */
async function _recordAutoAssignment(donation: DonationEntity): Promise<void> {
  const autoClaimHistory: Partial<AutoClaimHistoryEntity> = {
    timestamp: _runTimestamp,
    claim: donation.claim
  };
  await getRepository(AutoClaimHistoryEntity).insert(autoClaimHistory);
}

/**
 * Sends donation auto-assign/claim messages to the donation's receiver and donor.
 * @param donation The donation that was auto-assigned.
 * @return A promise that resolves when the operation finishes.
 */
async function _sendDonationAutoAssignMessages(donation: DonationEntity): Promise<void> {
  const mailClient: MailClient = await getMailClient();
  const notificationClient: NotificationClient = getNotificationClient();

  const messagePromises: Promise<any>[] = [];
  const { donorName, receiverName } = _donationHelper.memberNames(donation);
  const extraVars: any = { donation, donorName, receiverName };
  const donationEmailSubject: string = _donationHelper.genDonationEmailSubject(donation);

  messagePromises.push(
    mailClient.sendEmail(
      MailTransporter.NOREPLY,
      donation.donorAccount,
      donationEmailSubject,
      'donation-claimed',
      extraVars
    ).catch(console.error)
  );

  messagePromises.push(
    mailClient.sendEmail(
      MailTransporter.NOREPLY,
      donation.claim.receiverAccount,
      donationEmailSubject,
      'donation-assigned',
      extraVars
    ).catch(console.error)
  );

  messagePromises.push(
    notificationClient.sendNotification(
      donation.donorAccount,
      {
        notificationType: NotificationType.ClaimDonation,
        notificationLink: `/donation/${donation.id}`,
        title: `Donation Claimed`,
        icon: donation.claim.receiverAccount.profileImg,
        body: `
          Donation claimed by <strong>${receiverName}</strong>.<br>
          <i>${donation.description}</i>
        `
      }
    ).catch(console.error)
  );

  messagePromises.push(
    notificationClient.sendNotification(
      donation.claim.receiverAccount,
      {
        notificationType: NotificationType.ClaimDonation,
        notificationLink: `/donation/${donation.id}`,
        title: `Auto-Assigned Donation`,
        icon: donation.donorAccount.profileImg,
        body: `
          Auto-Assigned Donation from <strong>${donorName}</strong>.<br>
          <i>${donation.description}</i>
        `
      }
    ).catch(console.error)
  );

  await Promise.all(messagePromises);
}
