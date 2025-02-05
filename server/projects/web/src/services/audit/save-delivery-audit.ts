import { AccountEntity, DonationEntity } from '~entity';
import { DeliveryScheduleRequest, DeliveryStateChangeRequest, DonationStatus } from '~shared';
import { UpdateDiff } from '~web/helpers/misc/update-diff';
import { AuditEventType, getAuditAccounts, saveAudit, saveUpdateAudit } from './save-audit';

export function saveDeliveryScheduleAudit(scheduleReq: DeliveryScheduleRequest, scheduledDelivery: DonationEntity): Promise<DonationEntity> {
  const auditAccounts: AccountEntity[] = getAuditAccounts(scheduledDelivery);
  return saveAudit(AuditEventType.ScheduleDelivery, auditAccounts, scheduledDelivery);
}

export function saveDeliveryAdvanceAudit(stateChangeReq: DeliveryStateChangeRequest, advancedDonation: DonationEntity): Promise<DonationEntity> {
  const auditAccounts: AccountEntity[] = getAuditAccounts(advancedDonation);
  return saveAudit(AuditEventType.DeliveryStateAdvance, auditAccounts, advancedDonation);
}

export function saveDeliveryUndoAudit(
  stateChangeReq: DeliveryStateChangeRequest,
  undoDiff: UpdateDiff<DonationEntity>
): Promise<UpdateDiff<DonationEntity>> {
  const auditAccounts: AccountEntity[] = getAuditAccounts(undoDiff.old);
  const eventType: AuditEventType = (undoDiff.new.donationStatus !== DonationStatus.Matched)
    ? AuditEventType.DeliveryStateUndo
    : AuditEventType.CancelDelivery;
  return saveUpdateAudit(eventType, auditAccounts, undoDiff);
}
