import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-code-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="code-preview-container">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">
          <i class="fas fa-code me-2"></i>HTML Generado
        </h5>
        <button class="btn-copy" (click)="copyCode()">
          <i class="fas fa-copy me-2"></i>Copiar
        </button>
      </div>
      <div class="code-preview">
        <pre><code>{{ layoutService.generatedCode() }}</code></pre>
      </div>
    </div>
  `,
  styles: [`
    .code-preview-container {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      color: #333;
    }
    
    .btn-copy {
      background: #0d6efd;
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }
    
    .btn-copy:hover {
      background: #0b5ed7;
    }
    
    .code-preview {
      background: #0d1117;
      border-radius: 8px;
      padding: 20px;
      max-height: 400px;
      overflow: auto;
    }
    
    .code-preview pre {
      margin: 0;
      font-size: 13px;
    }
    
    .code-preview code {
      color: #c9d1d9;
      font-family: 'Consolas', 'Monaco', monospace;
      white-space: pre;
    }
  `]
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
