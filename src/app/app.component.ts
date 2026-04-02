import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LayoutAreaComponent } from './components/layout-area/layout-area.component';
import { CodePreviewComponent } from './components/code-preview/code-preview.component';

type ViewMode = 'design' | 'code';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    SidebarComponent,
    LayoutAreaComponent,
    CodePreviewComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  readonly currentView = signal<ViewMode>('design');

  switchView(view: ViewMode): void {
    this.currentView.set(view);
  }
}
