import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { LayoutService } from '../../services/layout.service';
import { Column, Row } from '../../interfaces/row.interface';

interface SelectedElement {
  type: 'row' | 'column';
  rowId: number;
  colId?: string;
}

@Component({
  selector: 'app-layout-area',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ],
  template: `
    <div class="h-100 bg-white rounded p-4 text-dark overflow-hidden mb-5 pb-5" (click)="deselect()">
      @if (layoutService.rows().length === 0) {
        <div class="text-center text-muted py-5 px-3">
          <mat-icon style="font-size: 48px; width: 48px; height: 48px; opacity: 0.5;" class="mb-3">ads_click</mat-icon>
          <p class="fs-5">Agrega filas y columnas para comenzar tu layout</p>
          <small>Usa los presets de la izquierda o uno personalizado</small>
        </div>
      } @else {
        <div 
          cdkDropList 
          [cdkDropListData]="layoutService.rows()" 
          (cdkDropListDropped)="onRowDropped($event)"
          class="w-100">
          
          @for (row of layoutService.rows(); track row.id) {
            <div class="bg-warning bg-opacity-10 border border-warning rounded p-4 pt-4 pb-3 mb-4 position-relative" style="border-style: dashed !important; border-width: 2px !important;" cdkDrag>
              
              <div class="position-absolute top-0 start-0 translate-middle-y ms-3 badge bg-warning text-dark d-flex align-items-center shadow-sm z-3" style="cursor: pointer; font-size: 13px;" (click)="selectRow(row.id); $event.stopPropagation()">
                <mat-icon class="me-1" style="font-size: 16px; width: 16px; height: 16px; cursor: grab;" cdkDragHandle>drag_indicator</mat-icon> 
                Fila {{ $index + 1 }}
                <button mat-icon-button class="ms-1" style="width: 24px; height: 24px; line-height: 24px; padding: 0;" (click)="removeRow(row.id); $event.stopPropagation()">
                  <mat-icon style="font-size: 16px;">close</mat-icon>
                </button>
              </div>
              
              <div class="row flex-wrap align-items-stretch"
                   [class]="getRowClasses(row)"
                   [style.min-height]="row.customHeight"
                   cdkDropList
                   [id]="'row-list-' + row.id"
                   [cdkDropListConnectedTo]="getConnectedListIds()"
                   [cdkDropListData]="row.columns"
                   cdkDropListOrientation="horizontal"
                   (cdkDropListDropped)="onColumnDropped($event, row.id)">
                
                @for (col of row.columns; track col.id) {
                  <div [class]="getColClasses(col)" class="mb-3" cdkDrag>
                    <div class="h-100 rounded p-3 position-relative border border-primary border-opacity-75 transition-all" 
                         [ngClass]="isSelectedColumn(row.id, col.id) ? 'bg-success bg-opacity-10 border-success shadow-sm' : 'bg-primary bg-opacity-10'"
                         style="border-style: dashed !important; border-width: 2px !important; cursor: pointer; min-height: 100px;"
                         [style.min-height]="col.customHeight"
                         (click)="selectColumn(row.id, col.id); $event.stopPropagation()">
                         
                      <div class="bg-primary text-white position-absolute top-0 start-0 end-0 d-flex justify-content-between align-items-center px-2 py-1 shadow-sm" style="border-radius: 2px 2px 0 0; font-size: 12px; margin-top: -2px; margin-left: -2px; margin-right: -2px;" [ngClass]="isSelectedColumn(row.id, col.id) ? 'bg-success' : 'bg-primary'">
                        <div class="d-flex align-items-center gap-1">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px; cursor: grab;" cdkDragHandle>drag_indicator</mat-icon>
                          <span>Col (md-{{ col.sizes.md || 'auto' }})</span>
                        </div>
                        <button mat-icon-button class="text-white" style="width: 20px; height: 20px; line-height: 20px; padding: 0;" (click)="removeColumn(row.id, col.id); $event.stopPropagation()">
                          <mat-icon style="font-size: 14px;">close</mat-icon>
                        </button>
                      </div>
                      
                      <div class="h-100 mt-4 bg-dark bg-opacity-10 rounded d-flex align-items-center justify-content-center text-muted" style="min-height: 40px;">
                        Contenido
                      </div>
                    </div>
                  </div>
                }
                
                <div class="col-12 mt-2" cdkDrag [cdkDragDisabled]="true">
                  <div class="d-flex flex-wrap gap-2">
                    @for (size of availableSizes; track size) {
                      <button mat-stroked-button color="primary" class="rounded-pill" (click)="addColumn(row.id, size); $event.stopPropagation()" title="Agregar col-{{ size }}">
                        +{{ size }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (selectedElement()) {
      <div class="position-sticky bottom-0 w-100 bg-dark text-white shadow-lg border-top border-primary border-3 rounded-top mt-5" (click)="$event.stopPropagation()" style="z-index: 1050;">
        
        <div class="d-flex justify-content-between align-items-center bg-secondary bg-opacity-25 py-2 px-4 shadow-sm">
          <div class="d-flex align-items-center">
            <mat-icon class="me-2 text-primary">tune</mat-icon>
            <span class="fw-bold fs-5">Propiedades</span>
            <span class="badge bg-primary ms-3 fs-6">
              {{ selectedElement()?.type === 'row' ? 'Fila' : 'Columna' }}
            </span>
          </div>
          <button mat-icon-button color="warn" (click)="deselect()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <div class="row gx-4 p-4 mx-0 overflow-auto text-light" style="max-height: 40vh; background-color: #1e1e1e;">
          <!-- Common Properties -->
          <div class="col-12 mb-4 drop-shadow">
            <small class="text-info d-block mb-2 fw-medium">Clases de Bootstrap Aplicadas en tiempo real:</small>
            <div class="d-flex flex-wrap gap-2">
              @for (cls of appliedClasses(); track $index) {
                <span class="badge bg-primary fs-6">{{ cls }}</span>
              }
            </div>
          </div>
          
          @if (selectedElement()?.type === 'row') {
            <!-- ROW PROPERTIES -->
            <div class="col-md-4 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">Height (h-*)</mat-label>
                <mat-select [ngModel]="selectedRow()?.height || 'auto'" (ngModelChange)="updateRowProp('height', $event)">
                  <mat-option value="auto">Auto</mat-option>
                  <mat-option value="25">25%</mat-option>
                  <mat-option value="50">50%</mat-option>
                  <mat-option value="75">75%</mat-option>
                  <mat-option value="100">100%</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="col-md-4 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">Display (d-*)</mat-label>
                <mat-select [ngModel]="selectedRow()?.display || ''" (ngModelChange)="updateRowProp('display', $event)">
                  <mat-option value="">Default (flex)</mat-option>
                  <mat-option value="flex">Flex</mat-option>
                  <mat-option value="block">Block</mat-option>
                  <mat-option value="none">None</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="col-md-4 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">Align Items</mat-label>
                <mat-select [ngModel]="selectedRow()?.alignItems || ''" (ngModelChange)="updateRowProp('alignItems', $event)">
                  <mat-option value="">Default</mat-option>
                  <mat-option value="start">Start</mat-option>
                  <mat-option value="center">Center</mat-option>
                  <mat-option value="end">End</mat-option>
                  <mat-option value="baseline">Baseline</mat-option>
                  <mat-option value="stretch">Stretch</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            

          }
          
          @if (selectedElement()?.type === 'column') {
            <!-- COLUMN PROPERTIES -->
            <div class="col-12 mb-3">
              <h5 class="text-info fw-bold mb-3 pb-2 border-bottom border-secondary">Tamaños Responsivos (1-12)</h5>
            </div>
            <div class="col-md-2 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">Móvil (xs)</mat-label>
                <input matInput type="number" min="1" max="12" [ngModel]="selectedColumn()?.sizes?.xs" (ngModelChange)="updateColSize('xs', $event)">
              </mat-form-field>
            </div>
            <div class="col-md-2 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">Tablet (sm)</mat-label>
                <input matInput type="number" min="1" max="12" [ngModel]="selectedColumn()?.sizes?.sm" (ngModelChange)="updateColSize('sm', $event)">
              </mat-form-field>
            </div>
            <div class="col-md-3 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">Desktop (md)</mat-label>
                <input matInput type="number" min="1" max="12" [ngModel]="selectedColumn()?.sizes?.md" (ngModelChange)="updateColSize('md', $event)">
              </mat-form-field>
            </div>
            <div class="col-md-3 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">L. Desktop (lg)</mat-label>
                <input matInput type="number" min="1" max="12" [ngModel]="selectedColumn()?.sizes?.lg" (ngModelChange)="updateColSize('lg', $event)">
              </mat-form-field>
            </div>
            <div class="col-md-2 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">Monitor (xl)</mat-label>
                <input matInput type="number" min="1" max="12" [ngModel]="selectedColumn()?.sizes?.xl" (ngModelChange)="updateColSize('xl', $event)">
              </mat-form-field>
            </div>
            
            <div class="col-12 mt-2 mb-3">
              <h5 class="text-info fw-bold mb-3 pb-2 border-bottom border-secondary">Otras configuraciones</h5>
            </div>
            <div class="col-md-4 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">Height (h-*)</mat-label>
                <mat-select [ngModel]="selectedColumn()?.height || 'auto'" (ngModelChange)="updateColProp('height', $event)">
                  <mat-option value="auto">Auto</mat-option>
                  <mat-option value="25">25%</mat-option>
                  <mat-option value="50">50%</mat-option>
                  <mat-option value="75">75%</mat-option>
                  <mat-option value="100">100%</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            

            
            <div class="col-md-4 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">Display (d-*)</mat-label>
                <mat-select [ngModel]="selectedColumn()?.display || ''" (ngModelChange)="updateColProp('display', $event)">
                  <mat-option value="">Default</mat-option>
                  <mat-option value="flex">Flex</mat-option>
                  <mat-option value="block">Block</mat-option>
                  <mat-option value="none">None</mat-option>
                  <mat-option value="inline-block">Inline Block</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="col-md-4 mb-3">
              <mat-form-field appearance="outline" class="w-100" color="accent">
                <mat-label class="text-light">Align Self</mat-label>
                <mat-select [ngModel]="selectedColumn()?.alignSelf || ''" (ngModelChange)="updateColProp('alignSelf', $event)">
                  <mat-option value="">Default</mat-option>
                  <mat-option value="auto">Auto</mat-option>
                  <mat-option value="start">Start</mat-option>
                  <mat-option value="center">Center</mat-option>
                  <mat-option value="end">End</mat-option>
                  <mat-option value="stretch">Stretch</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class LayoutAreaComponent {
  readonly layoutService = inject(LayoutService);
  readonly availableSizes = [1, 2, 3, 4, 6, 12];
  
  readonly selectedElement = signal<SelectedElement | null>(null);
  
  readonly selectedRow = computed(() => {
    const sel = this.selectedElement();
    if (!sel) return null;
    return this.layoutService.rows().find(r => r.id === sel.rowId) ?? null;
  });

  readonly selectedColumn = computed(() => {
    const sel = this.selectedElement();
    if (sel?.type !== 'column' || !sel.colId) return null;
    const row = this.selectedRow();
    return row?.columns.find(c => c.id === sel.colId) ?? null;
  });

  readonly appliedClasses = computed(() => {
    const sel = this.selectedElement();
    if (!sel) return [];
    
    const row = this.selectedRow();
    if (!row) return [];
    
    if (sel.type === 'row') {
      const classes = ['row'];
      if (row.alignItems) classes.push(`align-items-${row.alignItems}`);
      if (row.justifyContent) classes.push(`justify-content-${row.justifyContent}`);
      if (row.height && row.height !== 'auto') classes.push(`h-${row.height}`);
      if (row.display) classes.push(`d-${row.display}`);
      return classes;
    }
    
    const col = this.selectedColumn();
    if (!col) return [];
    
    const classes = [];
    if (col.sizes.xs) classes.push(`col-${col.sizes.xs}`); else classes.push('col-12');
    if (col.sizes.sm) classes.push(`col-sm-${col.sizes.sm}`);
    if (col.sizes.md) classes.push(`col-md-${col.sizes.md}`);
    if (col.sizes.lg) classes.push(`col-lg-${col.sizes.lg}`);
    if (col.sizes.xl) classes.push(`col-xl-${col.sizes.xl}`);
    
    if (col.height && col.height !== 'auto') classes.push(`h-${col.height}`);
    if (col.display) classes.push(`d-${col.display}`);
    if (col.alignSelf) classes.push(`align-self-${col.alignSelf}`);
    
    return classes;
  });

  getConnectedListIds(): string[] {
    return this.layoutService.rows().map(r => 'row-list-' + r.id);
  }

  // Events & Methods
  selectRow(rowId: number): void {
    this.selectedElement.set({ type: 'row', rowId });
  }
  
  selectColumn(rowId: number, colId: string): void {
    this.selectedElement.set({ type: 'column', rowId, colId });
  }
  
  deselect(): void {
    this.selectedElement.set(null);
  }
  
  isSelectedColumn(rowId: number, colId: string): boolean {
    const sel = this.selectedElement();
    return sel?.type === 'column' && sel.rowId === rowId && sel.colId === colId;
  }

  addColumn(rowId: number, size: number): void {
    this.layoutService.addColumn(rowId, size);
  }

  removeColumn(rowId: number, colId: string): void {
    this.layoutService.removeColumn(rowId, colId);
    if (this.selectedElement()?.colId === colId) {
      this.deselect();
    }
  }

  removeRow(rowId: number): void {
    this.layoutService.removeRow(rowId);
    if (this.selectedElement()?.rowId === rowId) {
      this.deselect();
    }
  }

  // Update properties directly
  updateRowProp(prop: keyof Row, value: any): void {
    const row = this.selectedRow();
    if (!row) return;
    this.layoutService.updateRow(row.id, { [prop]: value || undefined });
  }

  updateColProp(prop: keyof Column, value: any): void {
    const row = this.selectedRow();
    const col = this.selectedColumn();
    if (!row || !col) return;
    this.layoutService.updateColumn(row.id, col.id, { [prop]: value || undefined });
  }

  updateColSize(breakpoint: keyof import('../../interfaces/row.interface').ColumnSizes, value: any): void {
    const row = this.selectedRow();
    const col = this.selectedColumn();
    if (!row || !col) return;
    const numValue = value ? parseInt(value, 10) : undefined;
    this.layoutService.updateColumn(row.id, col.id, { 
      sizes: { [breakpoint]: numValue } 
    });
  }

  // Helper classes
  getRowClasses(row: Row): string {
    const classes = [];
    if (row.alignItems) classes.push(`align-items-${row.alignItems}`);
    if (row.justifyContent) classes.push(`justify-content-${row.justifyContent}`);
    if (row.height && row.height !== 'auto') classes.push(`h-${row.height}`);
    if (row.display) classes.push(`d-${row.display}`);
    return classes.join(' ');
  }

  getColClasses(col: Column): string {
    const classes = [];
    if (col.sizes.xs) classes.push(`col-${col.sizes.xs}`); else classes.push('col-12');
    if (col.sizes.sm) classes.push(`col-sm-${col.sizes.sm}`);
    if (col.sizes.md) classes.push(`col-md-${col.sizes.md}`);
    if (col.sizes.lg) classes.push(`col-lg-${col.sizes.lg}`);
    if (col.sizes.xl) classes.push(`col-xl-${col.sizes.xl}`);
    
    if (col.height && col.height !== 'auto') classes.push(`h-${col.height}`);
    if (col.display) classes.push(`d-${col.display}`);
    if (col.alignSelf) classes.push(`align-self-${col.alignSelf}`);
    
    return classes.join(' ');
  }

  // Drag & Drop specific handlers
  onRowDropped(event: CdkDragDrop<Row[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.layoutService.moveRow(event.previousIndex, event.currentIndex);
  }

  onColumnDropped(event: CdkDragDrop<Column[]>, currRowId: number): void {
    const prevColumns = event.previousContainer.data;
    const prevRow = this.layoutService.rows().find(r => r.columns === prevColumns);
    if (!prevRow) return;

    this.layoutService.moveColumn(
      prevRow.id, 
      currRowId, 
      event.previousIndex, 
      event.currentIndex
    );
  }
}
