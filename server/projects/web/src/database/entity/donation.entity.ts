import { Column, CreateDateColumn, Index, JoinColumn, ManyToOne, OneToOne, UpdateDateColumn } from 'typeorm';
import { OrmAfterLoad, OrmEntity, OrmPrimaryGeneratedColumn } from '~orm';
import { Constants, Donation, DonationStatus } from '~shared';
import { AccountEntity } from './account.entity';
import { ContactInfoEntity } from './contact-info.entity';
import { DonationClaimEntity } from './donation-claim.entity';
import _ = require('lodash');
export { Donation, DonationStatus };

const _constants = new Constants();

@OrmEntity('Donation')
@Index('donorNameIdx', { synchronize: false })
export class DonationEntity implements Donation {

  @OrmPrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => AccountEntity, { eager: true })
  donorAccount: AccountEntity;

  @OneToOne((type) => ContactInfoEntity, { nullable: true, eager: true, cascade: true })
  @JoinColumn()
  donorContactOverride?: ContactInfoEntity;

  @OneToOne((type) => DonationClaimEntity, (donationClaim) => donationClaim.donation, { nullable: true, eager: true, cascade: true })
  claim?: DonationClaimEntity;

  @Column()
  donorLastName: string;

  @Column()
  donorFirstName: string;

  @Column()
  donationType: string;

  @Column()
  description: string;

  @Column({ type: 'numeric', nullable: true })
  estimatedValue?: number;

  @Column({ type: 'integer' })
  estimatedNumFeed: number;

  @Column({ type: 'timestamp with time zone' })
  pickupWindowStart: Date;

  @Column({ type: 'timestamp with time zone' })
  pickupWindowEnd: Date;

  @Column({ type: 'enum', enum: _constants.DONATION_STATUSES, default: _constants.DONATION_STATUSES[0] })
  donationStatus: DonationStatus;

  @Column({ default: false })
  complete: boolean;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updateTimestamp: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createTimestamp: Date;

  @OrmAfterLoad()
  private _fillDonorContactOverride(): void {
    if (!this.donorContactOverride && this.donorAccount?.contactInfo) {
      this.donorContactOverride = _.cloneDeep(this.donorAccount.contactInfo);
    }
  }
}
