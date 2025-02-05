import { Component, OnInit } from '@angular/core';
import { Account } from '~shared';
import { AccountFiltersForm } from '~web/account/forms/account-filters.form';
import { AccountListLabelService } from '~web/account/services/account-list-label/account-list-label.service';
import { AccountReadService } from '~web/account/services/account-read/account-read.service';
import { ConstantsService } from '~web/shared/services/constants/constants.service';
import { ListQueryService } from '~web/shared/services/list-query/list-query.service';

@Component({
  selector: 'foodweb-admin-account-list',
  templateUrl: './admin-account-list.component.html',
  styleUrls: ['./admin-account-list.component.scss'],
  providers: [AccountListLabelService, ListQueryService]
})
export class AdminAccountListComponent implements OnInit {

  readonly filtersForm = new AccountFiltersForm();

  constructor(
    public accountListLabelService: AccountListLabelService,
    public constantsService: ConstantsService,
    public listQueryService: ListQueryService<Account>,
    private _accountReadService: AccountReadService,
  ) {}

  ngOnInit(): void {
    this.listQueryService.load(
      this._accountReadService.getAccounts.bind(this._accountReadService),
      this.filtersForm
    );
  }

}
