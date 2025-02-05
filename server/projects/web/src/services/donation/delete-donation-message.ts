import { AccountEntity, DonationEntity } from '~entity';
import { DonationHelper } from '~shared';
import { getMailClient, MailClient, MailTransporter } from '~web/helpers/messaging/email';
import { getNotificationClient, NotificationClient, NotificationType } from '~web/helpers/messaging/notification';

const _donationHelper = new DonationHelper();

export async function sendDonationDeleteMessages(donation: DonationEntity): Promise<void> {
  const mailClient: MailClient = await getMailClient();
  const notificationClient: NotificationClient = getNotificationClient();

  const messagePromises: Promise<any>[] = [];
  const emailAccounts: AccountEntity[] = [donation.donorAccount];
  const notificationAccounts: AccountEntity[] = [];
  const donorName: string = _donationHelper.donorName(donation);
  let receiverName = '';
  let delivererName = '';

  // If donation was claimed by a receiver, then we must also notify them.
  if (donation.claim) {
    emailAccounts.push(donation.claim.receiverAccount);
    notificationAccounts.push(donation.claim.receiverAccount);
    receiverName = _donationHelper.receiverName(donation);

    // If donation had a delivery lined up, we must also notify the deliverer.
    if (donation.claim.delivery) {
      emailAccounts.push(donation.claim.delivery.volunteerAccount);
      notificationAccounts.push(donation.claim.delivery.volunteerAccount);
      delivererName = _donationHelper.delivererName(donation);
    }
  }

  messagePromises.push(
    mailClient.broadcastEmail(
      MailTransporter.NOREPLY,
      emailAccounts,
      _donationHelper.genDonationEmailSubject(donation),
      'donation-deleted',
      { donation, donorName, receiverName, delivererName }
    ).catch(console.error)
  );

  if (notificationAccounts.length > 0) {
    messagePromises.push(
      notificationClient.sendNotification(
        notificationAccounts[0],
        {
          notificationType: NotificationType.RemoveDonation,
          title: `Donation Deleted`,
          icon: donation.donorAccount.profileImg,
          body: `
            Claimed Donation Deleted by <strong>${donorName}</strong>.<br>
            <i>${donation.description}</i>
          `
        }
      ).catch(console.error)
    );
  }

  if (notificationAccounts.length > 1) {
    messagePromises.push(
      notificationClient.sendNotification(
        notificationAccounts[1],
        {
          notificationType: NotificationType.RemoveDonation,
          title: `Donation Deleted`,
          icon: donation.donorAccount.profileImg,
          body: `
            Delivery Cancelled by <strong>${donorName}</strong>.<br>
            <i>${donation.description}</i>
          `
        }
      ).catch(console.error)
    );
  }

  await Promise.all(messagePromises);
}
