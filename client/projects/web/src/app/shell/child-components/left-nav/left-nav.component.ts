import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatSidenavContent } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { PageProgressService } from '~web/shared/services/page-progress/page-progress.service';
import { ScreenSizeService, ThresholdSide } from '~web/shared/services/screen-size/screen-size.service';
import { ShellService } from '~web/shell/services/shell/shell.service';

@Component({
  selector: 'foodweb-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.scss']
})
export class LeftNavComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('sidenavContent', { static: true }) sidenavContent: MatSidenavContent;

  @Input() navMenuId = '';
  /**
   * A maximum width in pixels. When set, determines that when the window width is equal to or lower,
   * the leftnav will be in over mode. Otherwise, it will be in side mode. Defaults to 991px.
   * If not set, then the leftnav will always be in over mode.
   */
  @Input() windowSizeThreshPx: number;

  private readonly _destroyThresholdObs$ = new Subject();

  constructor(
    public pageProgressService: PageProgressService,
    public shellService: ShellService,
    private _screenSizeService: ScreenSizeService
  ) {}

  get fixedTopGap(): number {
    return (this._screenSizeService.width > 990) ? 60 : 40;
  }

  ngOnInit(): void {
    this.shellService.setMainContent(this.sidenavContent.getElementRef().nativeElement);
    this._refreshScreenSizeListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.windowSizeThreshPx) {
      this._refreshScreenSizeListener();
    }
  }

  ngOnDestroy(): void {
    this._destroyThresholdObs$.next();
  }

  private _refreshScreenSizeListener(): void {
    this._destroyThresholdObs$.next();
    if (this.windowSizeThreshPx) {
      this.shellService.leftNavMode = (this._screenSizeService.width > this.windowSizeThreshPx) ? 'side' : 'over';
      this._screenSizeService.onWidthThresholdCross(this.windowSizeThreshPx, this._destroyThresholdObs$).subscribe(
        (side: ThresholdSide) => this.shellService.leftNavMode = (side === 'above') ? 'side' : 'over'
      );
    } else {
      this.shellService.leftNavMode = 'over';
      this._screenSizeService.onWidthThresholdCross(991, this._destroyThresholdObs$).subscribe(
        (side: ThresholdSide) => {
          if (side === 'above') {
            this.shellService.leftNavOpened = false;
          }
        }
      );
    }
  }
}
