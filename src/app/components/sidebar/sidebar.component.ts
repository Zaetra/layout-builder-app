import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="sidebar h-100 d-flex flex-column">
      <div class="d-flex justify-content-between align-items-center mb-4 d-md-none">
        <h5 class="mb-0">
          <i class="fas fa-th-large me-2"></i>Layout Builder
        </h5>
        <button class="btn btn-link text-white p-0" (click)="closeSidebar.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <div class="d-none d-md-block">
        <h4 class="mb-4">
          <i class="fas fa-th-large me-2"></i>Layout Builder
        </h4>
      </div>
      
      <h6 class="text-muted mb-3">Preset de Filas</h6>
      <div class="presets-container flex-grow-1">
        @for (preset of layoutService.presets; track preset.name; let i = $index) {
          <div class="preset-card" (click)="applyPreset(preset)">
            <div class="preset-content">
              <span>{{ preset.name }}</span>
              <button class="btn btn-sm btn-primary" (click)="applyPreset(preset); $event.stopPropagation()">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <div class="preset-grid">
              @for (size of preset.cols; track $index) {
                <div class="preset-cell" [style.grid-column]="'span ' + size"></div>
              }
            </div>
          </div>
        }
      </div>
      
      <hr class="my-4" style="border-color: #2d4a7c;">
      
      <h6 class="text-muted mb-3">Agregar Columna</h6>
      <div class="d-flex flex-wrap mb-3">
        @for (size of columnSizes; track size) {
          <button class="btn btn-primary btn-sm btn-column" (click)="addColumnToLast(size)">
            {{ size }}
          </button>
        }
      </div>
      
      <hr class="my-4" style="border-color: #2d4a7c;">
      
      <h6 class="text-muted mb-3">Herramientas</h6>
      <button class="btn btn-add-row w-100 mb-2" (click)="addNewRow()">
        <i class="fas fa-plus me-2"></i>Nueva Fila
      </button>
      <button class="btn btn-clear w-100 mb-2" (click)="clearAll()">
        <i class="fas fa-trash me-2"></i>Limpiar Todo
      </button>
    </div>
  `,
  styles: [`
    .sidebar {
      background: #16213e;
      padding: 20px;
      overflow-y: auto;
    }
    
    .presets-container {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .preset-card {
      background: #1f3460;
      border: 1px solid #2d4a7c;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .preset-card:hover {
      background: #2d4a7c;
      border-color: #3d5a8c;
    }
    
    .preset-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .preset-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 2px;
    }
    
    .preset-cell {
      background: #0d6efd;
      height: 8px;
      border-radius: 2px;
    }
    
    .btn-column {
      margin: 3px;
      min-width: 40px;
    }
    
    .btn-add-row {
      background: #198754;
      border: none;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .btn-add-row:hover {
      background: #157347;
    }
    
    .btn-clear {
      background: #dc3545;
      border: none;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .btn-clear:hover {
      background: #c82333;
    }
  `]
})
export class SidebarComponent {
  readonly layoutService = inject(LayoutService);
  readonly columnSizes = [1, 2, 3, 4, 6, 12];
  
  @Output() closeSidebar = new EventEmitter<void>();

  applyPreset(preset: { name: string; cols: number[] }): void {
    this.layoutService.addRowWithPreset(preset);
  }

  addNewRow(): void {
    this.layoutService.addRow();
  }

  addColumnToLast(size: number): void {
    const rows = this.layoutService.rows();
    if (rows.length === 0) {
      this.layoutService.addRowWithPreset({ name: 'Custom', cols: [size] });
    } else {
      const lastRow = rows[rows.length - 1];
      this.layoutService.addColumn(lastRow.id, size);
    }
  }

  clearAll(): void {
    if (confirm('¿Limpiar todo el diseño?')) {
      this.layoutService.clearLayout();
    }
  }
}
