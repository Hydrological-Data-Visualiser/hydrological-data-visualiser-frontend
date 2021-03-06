import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DataProviderService} from '../../services/data-provider.service';
import {SidePanelService} from '../side-panel/side-panel-service';
import {DataType} from '../../model/data-type';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit {
  visibleStations = false;
  blockModelButton = false;

  constructor(private dataProvider: DataProviderService, private sidePanelService: SidePanelService, private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.sidePanelService.modelEmitter.subscribe(model => {
      this.visibleStations = this.dataProvider.getActualService().info.dataType === DataType.POINTS;
    });

    this.sidePanelService.finishEmitter.subscribe(value => this.blockModelButton = value);
  }


  ngAfterViewInit(): void {
    // @ts-ignore
    document.getElementById('modelsButton').click();
  }

  openSnackBar(): void {
    this.snackBar.open('There are no stations in this dataModel - select another with "Points" dataType', 'Ok', {
      duration: 5000,
      panelClass: ['mat-toolbar', 'mat-primary']
    }).onAction().subscribe(() =>
      // @ts-ignore
      document.getElementById('modelsButton').click());
  }


  openSnackBarModelChange(): void {
    this.snackBar.open('You cannot change model during downloading data', 'Ok', {
      duration: 5000,
      panelClass: ['mat-toolbar', 'mat-primary']
    });
  }
}
