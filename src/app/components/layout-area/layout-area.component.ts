import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
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
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
    <div class="layout-area min-vh-100" (click)="deselect()">
      @if (layoutService.rows().length === 0) {
        <div class="empty-state">
          <i class="fas fa-mouse-pointer fa-2x mb-3"></i>
          <p>Agrega filas y columnas para comenzar tu layout</p>
          <small>Usa los presets de la izquierda o crea personalizado</small>
        </div>
      } @else {
        <div 
          cdkDropList 
          [cdkDropListData]="layoutService.rows()" 
          (cdkDropListDropped)="onRowDropped($event)"
          class="rows-list">
          
          @for (row of layoutService.rows(); track row.id) {
            <div class="row-container" cdkDrag>
              
              <div class="row-label" (click)="selectRow(row.id); $event.stopPropagation()">
                <i class="fas fa-grip-vertical me-1 drag-handle" cdkDragHandle></i> 
                Fila {{ $index + 1 }}
                <button class="btn-delete-sm ms-2" (click)="removeRow(row.id); $event.stopPropagation()">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
              <div class="row custom-row flex-wrap"
                   [class]="getRowClasses(row)"
                   [style.min-height]="row.customHeight"
                   cdkDropList
                   [id]="'row-list-' + row.id"
                   [cdkDropListConnectedTo]="getConnectedListIds()"
                   [cdkDropListData]="row.columns"
                   cdkDropListOrientation="horizontal"
                   (cdkDropListDropped)="onColumnDropped($event, row.id)">
                
                @for (col of row.columns; track col.id) {
                  <div [class]="getColClasses(col)" cdkDrag>
                    <div class="column" 
                         [class.selected]="isSelectedColumn(row.id, col.id)"
                         [style.min-height]="col.customHeight"
                         (click)="selectColumn(row.id, col.id); $event.stopPropagation()">
                         
                      <div class="column-header">
                        <div class="d-flex align-items-center gap-2">
                          <i class="fas fa-grip-vertical drag-handle" cdkDragHandle></i>
                          <span>Col (md-{{ col.sizes.md || 'auto' }})</span>
                        </div>
                        <button class="btn-delete" (click)="removeColumn(row.id, col.id); $event.stopPropagation()">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                      
                      <div class="column-content">
                        Contenido
                      </div>
                    </div>
                  </div>
                }
                
                <div class="col-12 mt-2" cdkDrag [cdkDragDisabled]="true">
                  <div class="d-flex flex-wrap gap-1">
                    @for (size of availableSizes; track size) {
                      <button 
                        class="btn btn-outline-primary btn-sm" 
                        (click)="addColumn(row.id, size); $event.stopPropagation()"
                        title="Agregar col-{{ size }}">
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
      <div class="properties-drawer" [class.open]="selectedElement()" (click)="$event.stopPropagation()">
        <div class="properties-header d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <i class="fas fa-sliders-h me-2"></i>
            <span class="fw-bold">Propiedades</span>
            <span class="badge bg-primary ms-2">
              {{ selectedElement()?.type === 'row' ? 'Fila' : 'Columna' }}
            </span>
          </div>
          <button class="btn-close-drawer" (click)="deselect()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="properties-body row gx-3">
          <!-- Common Properties -->
          <div class="col-12 mb-3">
            <small class="text-info d-block mb-1">Clases aplicadas:</small>
            <div class="d-flex flex-wrap gap-1">
              @for (cls of appliedClasses(); track $index) {
                <code class="badge bg-dark">{{ cls }}</code>
              }
            </div>
          </div>
          
          @if (selectedElement()?.type === 'row') {
            <!-- ROW PROPERTIES -->
            <div class="col-md-3 mb-3">
              <label class="form-label">Height (h-*)</label>
              <select class="form-select form-select-sm" [ngModel]="selectedRow()?.height || 'auto'" (ngModelChange)="updateRowProp('height', $event)">
                <option value="auto">Auto</option>
                <option value="25">25%</option>
                <option value="50">50%</option>
                <option value="75">75%</option>
                <option value="100">100%</option>
              </select>
            </div>
            
            <div class="col-md-3 mb-3">
              <label class="form-label">Min Height (px, vh)</label>
              <input type="text" class="form-control form-control-sm" placeholder="ej. 200px"
                     [ngModel]="selectedRow()?.customHeight || ''"
                     (ngModelChange)="updateRowProp('customHeight', $event)">
            </div>
            
            <div class="col-md-3 mb-3">
              <label class="form-label">Display (d-*)</label>
              <select class="form-select form-select-sm" [ngModel]="selectedRow()?.display || ''" (ngModelChange)="updateRowProp('display', $event)">
                <option value="">Default</option>
                <option value="flex">Flex</option>
                <option value="block">Block</option>
                <option value="none">None</option>
              </select>
            </div>
            
            <div class="col-md-3 mb-3">
              <label class="form-label">Align Items</label>
              <select class="form-select form-select-sm" [ngModel]="selectedRow()?.alignItems || ''" (ngModelChange)="updateRowProp('alignItems', $event)">
                <option value="">Default</option>
                <option value="start">Start</option>
                <option value="center">Center</option>
                <option value="end">End</option>
                <option value="baseline">Baseline</option>
                <option value="stretch">Stretch</option>
              </select>
            </div>
            
            <div class="col-md-3 mb-3">
              <label class="form-label">Justify Content</label>
              <select class="form-select form-select-sm" [ngModel]="selectedRow()?.justifyContent || ''" (ngModelChange)="updateRowProp('justifyContent', $event)">
                <option value="">Default</option>
                <option value="start">Start</option>
                <option value="center">Center</option>
                <option value="end">End</option>
                <option value="between">Between</option>
                <option value="around">Around</option>
                <option value="evenly">Evenly</option>
              </select>
            </div>
          }
          
          @if (selectedElement()?.type === 'column') {
            <!-- COLUMN PROPERTIES -->
            <div class="col-12 mb-2">
              <h6 class="text-white mb-2 pb-1 border-bottom border-secondary">Tamaños Responsivos (1-12)</h6>
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Móvil (col-xs)</label>
              <input type="number" class="form-control form-control-sm" min="1" max="12"
                     [ngModel]="selectedColumn()?.sizes?.xs" 
                     (ngModelChange)="updateColSize('xs', $event)">
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Tablet (col-sm)</label>
              <input type="number" class="form-control form-control-sm" min="1" max="12"
                     [ngModel]="selectedColumn()?.sizes?.sm" 
                     (ngModelChange)="updateColSize('sm', $event)">
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Desktop (col-md)</label>
              <input type="number" class="form-control form-control-sm" min="1" max="12"
                     [ngModel]="selectedColumn()?.sizes?.md" 
                     (ngModelChange)="updateColSize('md', $event)">
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">L. Desktop (col-lg)</label>
              <input type="number" class="form-control form-control-sm" min="1" max="12"
                     [ngModel]="selectedColumn()?.sizes?.lg" 
                     (ngModelChange)="updateColSize('lg', $event)">
            </div>
            <div class="col-md-3 mb-3">
              <label class="form-label">Monitor (col-xl)</label>
              <input type="number" class="form-control form-control-sm" min="1" max="12"
                     [ngModel]="selectedColumn()?.sizes?.xl" 
                     (ngModelChange)="updateColSize('xl', $event)">
            </div>
            
            <div class="col-12 mb-2">
              <h6 class="text-white mb-2 pb-1 border-bottom border-secondary">Otras clases</h6>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Height (h-*)</label>
              <select class="form-select form-select-sm" [ngModel]="selectedColumn()?.height || 'auto'" (ngModelChange)="updateColProp('height', $event)">
                <option value="auto">Auto</option>
                <option value="25">25%</option>
                <option value="50">50%</option>
                <option value="75">75%</option>
                <option value="100">100%</option>
              </select>
            </div>
            
            <div class="col-md-4 mb-3">
              <label class="form-label">Min Height (px, vh)</label>
              <input type="text" class="form-control form-control-sm" placeholder="ej. 200px"
                     [ngModel]="selectedColumn()?.customHeight || ''"
                     (ngModelChange)="updateColProp('customHeight', $event)">
            </div>
            
            <div class="col-md-4 mb-3">
              <label class="form-label">Display (d-*)</label>
              <select class="form-select form-select-sm" [ngModel]="selectedColumn()?.display || ''" (ngModelChange)="updateColProp('display', $event)">
                <option value="">Default</option>
                <option value="flex">Flex</option>
                <option value="block">Block</option>
                <option value="none">None</option>
                <option value="inline-block">Inline Block</option>
              </select>
            </div>
            
            <div class="col-md-4 mb-3">
              <label class="form-label">Align Self</label>
              <select class="form-select form-select-sm" [ngModel]="selectedColumn()?.alignSelf || ''" (ngModelChange)="updateColProp('alignSelf', $event)">
                <option value="">Default</option>
                <option value="auto">Auto</option>
                <option value="start">Start</option>
                <option value="center">Center</option>
                <option value="end">End</option>
                <option value="stretch">Stretch</option>
              </select>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .layout-area {
      background: #fff;
      min-height: 500px;
      border-radius: 8px;
      padding: 20px;
      color: #333;
      overflow-x: hidden;
    }
    
    .empty-state {
      text-align: center;
      color: #999;
      padding: 100px 20px;
    }
    
    .row-container {
      background: rgba(255, 193, 7, 0.05);
      border: 2px dashed #ffc107;
      border-radius: 8px;
      padding: 25px 15px 15px;
      margin-bottom: 20px;
      position: relative;
    }
    
    .row-label {
      position: absolute;
      top: -12px;
      left: 10px;
      background: #ffc107;
      color: #000;
      padding: 4px 12px;
      font-size: 12px;
      border-radius: 4px;
      font-weight: bold;
      display: flex;
      align-items: center;
      cursor: pointer;
      z-index: 10;
    }
    
    .row-label:hover {
      background: #ffca2c;
    }
    
    .drag-handle {
      cursor: grab;
      color: rgba(0,0,0,0.5);
    }
    
    .drag-handle:active {
      cursor: grabbing;
    }
    
    .column {
      border: 2px dashed #0d6efd;
      background: rgba(13, 110, 253, 0.05);
      padding: 15px;
      min-height: 100px;
      border-radius: 4px;
      transition: all 0.2s;
      cursor: pointer;
      margin-bottom: 10px;
    }
    
    .column:hover {
      border-color: #0b5ed7;
      background: rgba(13, 110, 253, 0.1);
    }
    
    .column.selected {
      border-color: #198754;
      background: rgba(25, 135, 84, 0.1);
      box-shadow: 0 0 0 3px rgba(25, 135, 84, 0.2);
    }
    
    .column-header {
      background: #0d6efd;
      color: white;
      padding: 5px 10px;
      font-size: 12px;
      border-radius: 4px 4px 0 0;
      margin: -15px -15px 10px -15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .column-content {
      min-height: 40px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      padding: 10px;
      text-align: center;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-delete {
      background: #dc3545;
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-delete:hover {
      background: #c82333;
    }
    
    .btn-delete-sm {
      background: transparent;
      border: none;
      color: #000;
      width: 20px;
      height: 20px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-delete-sm:hover {
      color: #dc3545;
    }
    
    /* CDK Drag & Drop styles */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 15px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px -5px rgba(0, 0, 0, 0.14);
      opacity: 0.9;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .rows-list.cdk-drop-list-dragging .row-container:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .custom-row.cdk-drop-list-dragging > div:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    /* Drawer */
    .properties-drawer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #1e1e1e;
      border-top: 3px solid #0d6efd;
      z-index: 9999; 
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
    }
    
    @media (min-width: 768px) {
      .properties-drawer {
        left: 300px; /* offset sidebar exact width */
        width: calc(100vw - 300px);
      }
    }
    
    .properties-drawer.open {
      transform: translateY(0);
    }
    
    .properties-header {
      padding: 12px 20px;
      background: #252525;
      border-bottom: 1px solid #333;
      color: #fff;
    }
    
    .properties-body {
      padding: 20px;
      color: #eee;
      max-height: 40vh;
      overflow-y: auto;
    }
    
    .btn-close-drawer {
      background: transparent;
      border: none;
      color: #aaa;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
    }
    
    .btn-close-drawer:hover {
      color: #fff;
    }
    
    .form-label {
      font-size: 12px;
      color: #aaa;
      margin-bottom: 4px;
    }
    
    .form-select, .form-control {
      background-color: #333;
      color: #fff;
      border-color: #444;
    }
    
    .form-select:focus, .form-control:focus {
      background-color: #444;
      color: #fff;
      border-color: #0d6efd;
      box-shadow: none;
    }
  `]
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
