import { adminReadAccounts } from '~admin/services/admin-account/admin-read-accounts';
import { Account, AccountEntity } from '~entity';
import { AccountReadRequest, ListResponse, SendMessageRequest } from '~shared';
import { getMailClient, MailClient, MailTransporter } from '~web/helpers/messaging/email';

/**
 * Sends a given (custom) message to accounts specified by a given set of account filters.
 * @param sendMessageReq The message that is to be sent.
 * @param accountFilters The account filters.
 * @param myAccount The account of the admin user submitting the request.
 * @return A promise that resolves once the operation completes.
 */
export async function adminSendMessage(
  sendMessageReq: SendMessageRequest,
  accountFilters: AccountReadRequest,
  myAccount: Account
): Promise<void> {
  const limit = 300;
  let page = 1;
  let numQueried: number;

  do {
    const readRequest: AccountReadRequest = accountFilters;
    readRequest.page = page++;
    readRequest.limit = limit;
    const listRes: ListResponse<AccountEntity> = await adminReadAccounts(readRequest, myAccount);
    numQueried = listRes.list.length;
    await _messageTargetAccounts(sendMessageReq, listRes.list);
  } while (numQueried === limit);
}

/**
 * Sends a given message to a given list of accounts.
 * @param sendMessageReq The message to send.
 * @param accounts The accounts to send the message to.
 * @return A promise that resolves once the operation completes.
 */
async function _messageTargetAccounts(sendMessageReq: SendMessageRequest, accounts: AccountEntity[]): Promise<void> {
  const messageBodyHTML: string = _trimMessageBodyHTML(sendMessageReq.messageBodyHTML);
  const mailClient: MailClient = await getMailClient();
  await mailClient.broadcastEmail(
    MailTransporter.NOREPLY,
    accounts,
    sendMessageReq.messageSubject,
    'custom-message',
    { messageBodyHTML },
    true
  );
}

/**
 * Trims given message body HTML by removing excess leading and trailing space.
 * @param messageBodyHTML The message body HTML.
 * @return The trimmed message body HTML.
 */
function _trimMessageBodyHTML(messageBodyHTML: string): string {
  return messageBodyHTML.replace(/^(\s*<p>\s*<br>\s*<\/p>\s*)+/gi, '')
                        .replace(/(\s*<p>\s*<br>\s*<\/p>\s*)+$/gi, '');
}

/**
 * Sends a given (custom) test message to the current user's email.
 * @param sendMessageReq The send message request to test.
 * @param myAccount The account of the current user, which the test message will be sent to.
 * @return A promise that resolves once the operation completes.
 */
export async function adminTestMessage(sendMessageReq: SendMessageRequest, myAccount: Account): Promise<void> {
  const messageBodyHTML: string = _trimMessageBodyHTML(sendMessageReq.messageBodyHTML);
  const mailClient: MailClient = await getMailClient();
  return mailClient.sendEmail(
    MailTransporter.NOREPLY,
    myAccount,
    `Test Message: ${sendMessageReq.messageSubject}`,
    'custom-message',
    { messageBodyHTML },
    true
  );
}
