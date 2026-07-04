import { Injectable, signal } from "@angular/core";

export type ToastType = "success" | "error" | "info";

export interface Toast {
    readonly id: string;
    readonly message: string;
    readonly type: ToastType;
}

@Injectable({
    providedIn: "root",
})
export class ToastService {
    private readonly _toasts = signal<readonly Toast[]>([]);

    readonly toasts = this._toasts.asReadonly();

    show(message: string, type: ToastType = "info", duration = 4000): void {
        const id = crypto.randomUUID();
        this._toasts.update((current) => [...current, { id, message, type }]);
        setTimeout(() => this.dismiss(id), duration);
    }

    success(message: string): void {
        this.show(message, "success");
    }

    error(message: string): void {
        this.show(message, "error", 6000);
    }

    dismiss(id: string): void {
        this._toasts.update((current) => current.filter((t) => t.id !== id));
    }
}
