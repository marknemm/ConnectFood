import { FeaturedEvent, FeaturedEventEntity } from '~entity';
import { getOrmRepository, OrmEntityManager } from '~orm';
import { DateTimeHelper } from '~shared';
import { FoodWebError } from '~web/helpers/response/foodweb-error';

const _dateTimeHelper = new DateTimeHelper();

/**
 * Saves a given featured event.
 * @param featuredEvent The featured event that is to be saved.
 * @return A promise that resolves to the newly saved featured event.
 */
export async function adminSaveFeaturedEvent(featuredEvent: FeaturedEvent): Promise<FeaturedEventEntity> {
  if (featuredEvent.id == null) {
    await _ensureNotAlreadyCreated(featuredEvent);
  }
  featuredEvent.showUntil = _genShowUntil(featuredEvent);
  return OrmEntityManager.transaction((manager: OrmEntityManager) => {
    return manager.getRepository(FeaturedEventEntity).save(featuredEvent);
  });
}

/**
 * Prevents creation of duplicate featured events (same title & date).
 * @param featuredEvent The featured event that is to be searched for.
 * @return A promise that resolves to void if the given featured event was not found.
 * @throws FoodWebError if a duplicate featured event has been found.
 */
async function _ensureNotAlreadyCreated(featuredEvent: FeaturedEvent): Promise<void> {
  const foundRegistration: FeaturedEventEntity = await getOrmRepository(FeaturedEventEntity).findOne({
    title: featuredEvent.title,
    date: featuredEvent.date
  });
  if (foundRegistration) {
    throw new FoodWebError('This event already exists.');
  }
}

/**
 * Generates a 'showUntil' date for a given featured event.
 * @param featuredEvent The featured event to generate the 'showUntil' date for.
 * @return The 'showUntil' date.
 */
function _genShowUntil(featuredEvent: FeaturedEvent): Date {
  return (featuredEvent.durationMins)
    ? _dateTimeHelper.addMinutes(featuredEvent.date, featuredEvent.durationMins)
    : featuredEvent.date;
}
