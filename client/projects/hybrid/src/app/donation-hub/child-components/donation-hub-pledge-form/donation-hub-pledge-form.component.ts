import { Component } from '@angular/core';
import { DonationHubPledgeFormComponent as WebDonationHubPledgeFormComponent } from '~web/donation-hub/child-components/donation-hub-pledge-form/donation-hub-pledge-form.component';
import { FormFieldService } from '~web/forms';

@Component({
  selector: 'foodweb-hybrid-donation-hub-pledge-form',
  templateUrl: './donation-hub-pledge-form.component.html',
  styleUrls: ['./donation-hub-pledge-form.component.scss'],
  providers: [FormFieldService]
})
export class DonationHubPledgeFormComponent extends WebDonationHubPledgeFormComponent {}
