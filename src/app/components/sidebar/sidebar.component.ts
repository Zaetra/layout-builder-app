import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="h-100 d-flex flex-column text-light p-4 overflow-auto border-end border-secondary">
      <div class="d-flex justify-content-between align-items-center mb-4 d-md-none">
        <h5 class="mb-0 d-flex align-items-center">
          <mat-icon class="me-2 text-primary">dashboard</mat-icon> Layout Builder
        </h5>
        <button mat-icon-button class="text-white" (click)="closeSidebar.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <div class="d-none d-md-block">
        <h4 class="mb-4 d-flex align-items-center">
          <mat-icon class="me-2 text-primary">dashboard</mat-icon> Layout Builder
        </h4>
      </div>
      
      <h6 class="text-secondary mb-3 text-uppercase small fw-bold">Preset de Filas</h6>
      <div class="flex-grow-1 overflow-auto">
        @for (preset of layoutService.presets; track preset.name; let i = $index) {
          <div class="card bg-secondary cursor-pointer bg-opacity-25 border-secondary mb-3" (click)="applyPreset(preset)">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-light fw-medium">{{ preset.name }}</span>
                <button mat-icon-button color="primary" class="align-self-center" (click)="applyPreset(preset); $event.stopPropagation()">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
      
      <hr class="my-4 border-secondary border-opacity-50">
      
      <h6 class="text-secondary mb-3 text-uppercase small fw-bold">Agregar Columna</h6>
      <div class="d-flex flex-wrap gap-2 mb-3">
        @for (size of columnSizes; track size) {
          <button mat-stroked-button color="primary" class="flex-grow-1" (click)="addColumnToLast(size)">
            {{ size }}
          </button>
        }
      </div>
      
      <hr class="my-4 border-secondary border-opacity-50">
      
      <h6 class="text-secondary mb-3 text-uppercase small fw-bold">Herramientas</h6>
      <button mat-flat-button color="accent" class="w-100 mb-3 py-4 d-flex justify-content-center" (click)="addNewRow()">
        <mat-icon class="me-2">add_to_queue</mat-icon> Nueva Fila
      </button>
      <button mat-flat-button color="warn" class="w-100 py-4 d-flex justify-content-center" (click)="clearAll()">
        <mat-icon class="me-2">delete_sweep</mat-icon> Limpiar Todo
      </button>
    </div>
  `
})
export class SidebarComponent {
  readonly layoutService = inject(LayoutService);
  readonly columnSizes = [1, 2, 3, 4, 6, 12];
  
  readonly closeSidebar = output<void>();

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
