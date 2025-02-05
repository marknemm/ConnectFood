import { Validators } from '@angular/forms';
import { Account, DateTimeRange } from '~shared';
import { TFormGroup } from '~web/forms';

export class AdminScheduleDeliveryForm extends TFormGroup<DeliveryFormT> {
  constructor() {
    super({
      volunteerAccount: [null, Validators.required],
      pickupWindow: [null, Validators.required]
    });
  }

  get volunteerAccount(): Account {
    return this.get('volunteerAccount').value;
  }

  get pickupWindow(): DateTimeRange {
    return this.get('pickupWindow').value;
  }
}

export interface DeliveryFormT {
  volunteerAccount: Account;
  pickupWindow: DateTimeRange;
}
