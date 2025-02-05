import { AccountEntity, DonationEntity } from '~entity';
import { DonationHelper } from '~shared';
import { getMailClient, MailClient, MailTransporter } from '~web/helpers/messaging/email';
import { getNotificationClient, NotificationClient, NotificationType } from '~web/helpers/messaging/notification';
import { UpdateDiff } from '~web/helpers/misc/update-diff';

const _donationHelper = new DonationHelper();

/**
 * Sends delivery cancelled messages to each user associated with a donation (donor, receiver, & volunteer).
 * @param unscheduleDiff The diff of unscheduled and scheduled donations.
 * @return A promise that resolves to the unscheduled (new) donation.
 */
export async function sendDeliveryCancelledMessages(unscheduleDiff: UpdateDiff<DonationEntity>): Promise<DonationEntity> {
  const mailClient: MailClient = await getMailClient();
  const notificationClient: NotificationClient = getNotificationClient();

  const messagePromises: Promise<any>[] = [];
  const volunteerAccount: AccountEntity = unscheduleDiff.old.claim.delivery.volunteerAccount;
  const emailAccounts: AccountEntity[] = [unscheduleDiff.new.donorAccount, unscheduleDiff.new.claim.receiverAccount, volunteerAccount];
  const notificationAccounts: AccountEntity[] = [unscheduleDiff.new.donorAccount, unscheduleDiff.new.claim.receiverAccount];
  const donorName: string = _donationHelper.donorName(unscheduleDiff.new);
  const receiverName: string = _donationHelper.receiverName(unscheduleDiff.new);
  const delivererName: string = _donationHelper.delivererName(unscheduleDiff.old);

  messagePromises.push(
    mailClient.broadcastEmail(
      MailTransporter.NOREPLY,
      emailAccounts,
      _donationHelper.genDonationEmailSubject(unscheduleDiff.new),
      'delivery-cancelled',
      { donation: unscheduleDiff.new, donorName, receiverName, delivererName }
    ).catch(console.error)
  );

  messagePromises.push(
    notificationClient.broadcastNotification(
      notificationAccounts,
      {
        notificationType: NotificationType.CancelDelivery,
        notificationLink: `donation/${unscheduleDiff.new.id}`,
        title: 'Delivery Cancelled',
        icon: volunteerAccount.profileImg,
        body: `
          Donation delivery cancelled by <strong>${delivererName}</strong>.<br>
          <i>${unscheduleDiff.new.description}</i>
        `
      }
    ).catch(console.error)
  );

  await Promise.all(messagePromises);
  return unscheduleDiff.new;
}
