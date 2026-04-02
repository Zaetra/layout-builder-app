import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-code-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="bg-white rounded p-4 text-dark shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0 d-flex align-items-center">
          <mat-icon class="me-2 text-primary">html</mat-icon> HTML Generado
        </h5>
        <button mat-flat-button color="primary" (click)="copyCode()">
          <mat-icon class="me-2">content_copy</mat-icon> Copiar
        </button>
      </div>
      <div class="bg-dark rounded p-4 text-light overflow-auto" style="max-height: 400px;">
        <pre class="m-0" style="font-size: 13px;"><code class="text-light" style="font-family: 'Consolas', 'Monaco', monospace; white-space: pre;">{{ layoutService.generatedCode() }}</code></pre>
      </div>
    </div>
  `
})
export class CodePreviewComponent {
  readonly layoutService = inject(LayoutService);

  copyCode(): void {
    const code = this.layoutService.generatedCode();
    navigator.clipboard.writeText(code).then(() => {
      alert('¡Código copiado al portapapeles!');
    });
  }
}
