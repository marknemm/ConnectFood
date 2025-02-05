import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TableDataSource } from '~web/table/interfaces/table-data-source';
export { TableDataSource };

@Component({
  selector: 'foodweb-table-add',
  templateUrl: './table-add.component.html',
  styleUrls: ['./table-add.component.scss']
})
export class TableAddComponent<T = any> implements OnInit {

  @Input() dataSource: TableDataSource<T>;
  @Input() disabled = false;
  @Input() buttonText = 'Add Row';
  @Input() tooltip: string;
  @Input() responsive = false;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('attr.aria-label') ariaLabel: string;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('attr.aria-labelledby') ariaLabelledby: string;

  @Output() add = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {
    if (this.tooltip === undefined) {
      this.tooltip = (this.buttonText) ? this.buttonText : 'Add Row';
    }
    this.ariaLabel = (this.ariaLabel || this.ariaLabelledby) ? this.ariaLabel : this.tooltip;
  }

  /**
   * Handles the click of the add button.
   */
  _onClick(): void {
    if (this.dataSource) {
      this.dataSource.add$.next();
    }
    this.add.emit();
  }

}
