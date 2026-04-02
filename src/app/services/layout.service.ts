import { Injectable, signal, computed } from '@angular/core';
import { Row, Column, ColumnSizes } from '../interfaces/row.interface';
import { Preset } from '../interfaces/preset.interface';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private rowCounter = signal(0);
  
  readonly rows = signal<Row[]>([]);
  
  readonly presets: Preset[] = [
    { name: '1 Columna', cols: [12] },
    { name: '2 Columnas Iguales', cols: [6, 6] },
    { name: '3 Columnas Iguales', cols: [4, 4, 4] },
    { name: '4 Columnas Iguales', cols: [3, 3, 3, 3] },
    { name: '2 + 1', cols: [8, 4] },
    { name: '1 + 2', cols: [4, 8] },
    { name: '3 + 9', cols: [3, 9] },
    { name: 'Sidebar + Contenido', cols: [3, 9] },
  ];

  readonly generatedCode = computed(() => this.generateHtml());

  addRow(): void {
    const currentRows = this.rows();
    const rowId = this.rowCounter();
    this.rowCounter.update(c => c + 1);
    
    this.rows.set([...currentRows, { id: rowId, columns: [{ id: `${rowId}-0`, sizes: { xs: 12 }, content: '' }] }]);
  }

  addRowWithPreset(preset: Preset): void {
    const currentRows = this.rows();
    const rowId = this.rowCounter();
    this.rowCounter.update(c => c + 1);
    
    const columns: Column[] = preset.cols.map((mdSize, index) => ({
      id: `${rowId}-${index}`,
      sizes: { xs: 12, md: mdSize },
      content: ''
    }));
    
    this.rows.set([...currentRows, { id: rowId, columns }]);
  }

  addColumn(rowId: number, size: number): void {
    const currentRows = this.rows();
    const rowIndex = currentRows.findIndex(r => r.id === rowId);
    
    if (rowIndex === -1) return;
    
    const row = currentRows[rowIndex];
    const totalSize = row.columns.reduce((sum, col) => sum + (col.sizes.md || col.sizes.xs || 12), 0);
    
    if (totalSize + size > 12) {
      alert('La suma de columnas no debería exceder 12 en vista desktop (agregando de todas formas para flex-wrap)');
      // Allowing to exceed since CSS grid allows wrap but we alert the user initially.
    }
    
    const newColumn: Column = {
      id: `${rowId}-${new Date().getTime()}`,
      sizes: { xs: 12, md: size },
      content: ''
    };
    
    const updatedRow = { ...row, columns: [...row.columns, newColumn] };
    const updatedRows = [...currentRows];
    updatedRows[rowIndex] = updatedRow;
    
    this.rows.set(updatedRows);
  }

  removeColumn(rowId: number, colId: string): void {
    const currentRows = this.rows();
    const rowIndex = currentRows.findIndex(r => r.id === rowId);
    
    if (rowIndex === -1) return;
    
    const row = currentRows[rowIndex];
    const filteredColumns = row.columns.filter(col => col.id !== colId);
    
    if (filteredColumns.length === 0) {
      this.removeRow(rowId);
      return;
    }
    
    const updatedRow = { ...row, columns: filteredColumns };
    const updatedRows = [...currentRows];
    updatedRows[rowIndex] = updatedRow;
    
    this.rows.set(updatedRows);
  }

  removeRow(rowId: number): void {
    const filtered = this.rows().filter(r => r.id !== rowId);
    this.rows.set(filtered);
  }

  clearLayout(): void {
    this.rows.set([]);
    this.rowCounter.set(0);
  }

  updateRow(rowId: number, updates: Partial<Row>): void {
    const currentRows = this.rows();
    const rowIndex = currentRows.findIndex(r => r.id === rowId);
    if (rowIndex === -1) return;
    
    const updatedRows = [...currentRows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], ...updates };
    this.rows.set(updatedRows);
  }

  updateColumn(rowId: number, colId: string, updates: Partial<Column>): void {
    const currentRows = this.rows();
    const rowIndex = currentRows.findIndex(r => r.id === rowId);
    if (rowIndex === -1) return;
    
    const row = currentRows[rowIndex];
    const colIndex = row.columns.findIndex(c => c.id === colId);
    if (colIndex === -1) return;
    
    const updatedColumns = [...row.columns];
    const newCol = { ...updatedColumns[colIndex] };
    
    // Deep merge for sizes
    if (updates.sizes) {
      newCol.sizes = { ...newCol.sizes, ...updates.sizes };
      delete updates.sizes;
    }
    
    updatedColumns[colIndex] = { ...newCol, ...updates };
    
    const updatedRows = [...currentRows];
    updatedRows[rowIndex] = { ...row, columns: updatedColumns };
    this.rows.set(updatedRows);
  }

  // Drag and Drop support
  moveRow(previousIndex: number, currentIndex: number): void {
    const rows = [...this.rows()];
    moveItemInArray(rows, previousIndex, currentIndex);
    this.rows.set(rows);
  }

  moveColumn(prevRowId: number, currRowId: number, prevIndex: number, currIndex: number): void {
    const rows = [...this.rows()];
    const prevRowIdx = rows.findIndex(r => r.id === prevRowId);
    const currRowIdx = rows.findIndex(r => r.id === currRowId);
    
    if (prevRowIdx === -1 || currRowIdx === -1) return;

    if (prevRowId === currRowId) {
      // Move within same row
      const columns = [...rows[prevRowIdx].columns];
      moveItemInArray(columns, prevIndex, currIndex);
      rows[prevRowIdx] = { ...rows[prevRowIdx], columns };
    } else {
      // Transfer between rows
      const prevColumns = [...rows[prevRowIdx].columns];
      const currColumns = [...rows[currRowIdx].columns];
      transferArrayItem(prevColumns, currColumns, prevIndex, currIndex);
      rows[prevRowIdx] = { ...rows[prevRowIdx], columns: prevColumns };
      rows[currRowIdx] = { ...rows[currRowIdx], columns: currColumns };
      
      // Cleanup empty rows
      if (prevColumns.length === 0) {
        rows.splice(prevRowIdx, 1);
      }
    }
    
    this.rows.set(rows);
  }

  private generateHtml(): string {
    const rows = this.rows();
    if (rows.length === 0) {
      return '<!-- Agrega filas y columnas para generar código -->';
    }

    let html = '<div class="container">\n';
    
    rows.forEach(row => {
      const rowClasses = ['row'];
      if (row.alignItems) rowClasses.push(`align-items-${row.alignItems}`);
      if (row.justifyContent) rowClasses.push(`justify-content-${row.justifyContent}`);
      if (row.height && row.height !== 'auto') rowClasses.push(`h-${row.height}`);
      if (row.display) rowClasses.push(`d-${row.display}`);
      
      const rowClassStr = rowClasses.join(' ');
      html += `  <div class="${rowClassStr}">\n`;
      row.columns.forEach(col => {
        const colClasses = [];
        if (col.sizes.xs) colClasses.push(`col-${col.sizes.xs}`);
        else colClasses.push('col-12');
        if (col.sizes.sm) colClasses.push(`col-sm-${col.sizes.sm}`);
        if (col.sizes.md) colClasses.push(`col-md-${col.sizes.md}`);
        if (col.sizes.lg) colClasses.push(`col-lg-${col.sizes.lg}`);
        if (col.sizes.xl) colClasses.push(`col-xl-${col.sizes.xl}`);
        
        if (col.height && col.height !== 'auto') colClasses.push(`h-${col.height}`);
        if (col.display) colClasses.push(`d-${col.display}`);
        if (col.alignSelf) colClasses.push(`align-self-${col.alignSelf}`);

        const colClassStr = colClasses.join(' ');
        html += `    <div class="${colClassStr}">\n`;
        html += '      <div class="content-box">Contenido</div>\n';
        html += '    </div>\n';
      });
      html += '  </div>\n';
    });
    
    html += '</div>';
    
    return html;
  }
}
