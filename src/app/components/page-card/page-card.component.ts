import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-page-card',
  imports: [],
  templateUrl: './page-card.component.html',
  styleUrl: './page-card.component.scss'
})
export class PageCardComponent {

 readonly pageNumber = input.required<number>();
  readonly thumbnailUrl = input.required<string>();
  readonly isSelected = input<boolean>(false);
  readonly isRendering = input<boolean>(false);
 
  readonly toggled = output<number>();
 
  protected readonly checkboxId = computed(() => `page-checkbox-${this.pageNumber()}`);
 
  protected onCardClick(): void {
    this.toggled.emit(this.pageNumber());
  }
 
  protected onCheckboxChange(event: Event): void {
    event.stopPropagation(); // Prevent double-fire from card click
    this.toggled.emit(this.pageNumber());
  }
 
  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggled.emit(this.pageNumber());
    }
  }

}
