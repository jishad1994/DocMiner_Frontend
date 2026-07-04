import { Component, inject } from '@angular/core';
import { Toast, ToastService } from '../../services/toast-service/toast.service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
 protected readonly toastService = inject(ToastService);
 
  protected iconFor(toast: Toast): string {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }
}
