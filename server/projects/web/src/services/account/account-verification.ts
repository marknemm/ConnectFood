import { randomBytes } from 'crypto';
import { EntityManager, getManager, getRepository, Repository } from 'typeorm';
import { AccountEntity, UnverifiedAccountEntity } from '~entity';
import { AccountVerificationRequest } from '~shared';
import { FoodWebError } from '~web/helpers/response/foodweb-error';

export function createUnverifiedAccount(account: AccountEntity, manager: EntityManager = getManager()): Promise<UnverifiedAccountEntity> {
  const unverifiedAccount: UnverifiedAccountEntity = _genUnverifiedAccountEntity(account);
  return manager.getRepository(UnverifiedAccountEntity).save(unverifiedAccount);
}

export async function recreateUnverifiedAccount(myAccount: AccountEntity): Promise<UnverifiedAccountEntity> {
  const repo: Repository<UnverifiedAccountEntity> = getRepository(UnverifiedAccountEntity);
  const unverifiedAccount: UnverifiedAccountEntity = await repo.findOne({ where: { account: myAccount } });
  if (!unverifiedAccount) {
    throw new FoodWebError('Account already verified or account verification period expired.');
  }
  unverifiedAccount.verificationToken = _genVerificationToken();
  return repo.save(unverifiedAccount); // Simply overwrite existing entry.
}

export async function verifyAccount(account: AccountEntity, verificationReq: AccountVerificationRequest): Promise<AccountEntity> {
  const verificationToken: string = verificationReq.verificationToken;
  const repo: Repository<UnverifiedAccountEntity> = getRepository(UnverifiedAccountEntity);
  const unverifiedAccount: UnverifiedAccountEntity = await repo.findOne({
    where: { verificationToken }
  });

  if (!unverifiedAccount) {
    throw new FoodWebError('Signup verification was unsuccessful. Either the account does not exist or it has already been verified.');
  }

  repo.delete(unverifiedAccount);

  if (account && account.id === unverifiedAccount.account.id) {
    account.verified = true;
  }
  return account;
}

export async function isAccountVerified(account: AccountEntity): Promise<boolean> {
  const unverifiedCount: number = await getRepository(UnverifiedAccountEntity).count({
    account: { id: account.id }
  });
  return (unverifiedCount === 0);
}

function _genUnverifiedAccountEntity(account: AccountEntity): UnverifiedAccountEntity {
  const verificationToken: string = _genVerificationToken();
  const unverifiedAccountEntity = new UnverifiedAccountEntity();
  unverifiedAccountEntity.verificationToken = verificationToken;
  unverifiedAccountEntity.account = account;
  return unverifiedAccountEntity;
}

function _genVerificationToken(): string {
  return randomBytes(10).toString('hex'); // Gen 20 char token.
}
