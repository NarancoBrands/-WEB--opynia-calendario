import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-app-header",
  templateUrl: "./app-header.component.html",
  styleUrl: "./app-header.component.scss",
})
export class AppHeaderComponent {
  @Input() isGoogleConnected: boolean = false;
  @Input() isLoading: boolean = false;

  @Output() connectToGoogle = new EventEmitter<void>();
  @Output() disconnectFromGoogle = new EventEmitter<void>();
  @Output() showLogoutModal = new EventEmitter<void>();

  onConnectToGoogle(): void {
    this.connectToGoogle.emit();
  }

  onDisconnectFromGoogle(): void {
    this.disconnectFromGoogle.emit();
  }

  onShowLogoutModal(): void {
    this.showLogoutModal.emit();
  }
}
