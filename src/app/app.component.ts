import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    SidebarComponent,
    LayoutAreaComponent,
    CodePreviewComponent
  ],
  templateUrl: './app.component.html',
  styles: [`
    .main-content {
      padding: 20px;
    }
    
    .nav-tabs {
      border-bottom: 1px solid #2d4a7c;
    }
    
    .nav-tabs .nav-link {
      color: #aaa;
      border: none;
      background: transparent;
      cursor: pointer;
    }
    
    .nav-tabs .nav-link.active {
      color: #fff;
      border-bottom: 2px solid #0d6efd;
    }
    
    .nav-tabs .nav-link:hover {
      color: #fff;
    }
  `]
})
export class AppComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  readonly currentView = signal<ViewMode>('design');

  switchView(view: ViewMode): void {
    this.currentView.set(view);
  }
}
