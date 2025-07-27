// Progressive Web App utilities and service worker registration

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private isStandalone = false;

  constructor() {
    this.init();
  }

  private init() {
    // Check if app is running in standalone mode
    this.isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Check if app is already installed
    this.isInstalled = this.isStandalone;

    // Listen for beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallBanner();
    });

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      this.isInstalled = true;
      this.hideInstallBanner();
      this.showInstalledNotification();
    });

    // Register service worker
    this.registerServiceWorker();

    // Handle app updates
    this.handleAppUpdates();
  }

  /**
   * Register service worker for offline functionality
   */
  private async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        console.log("Service Worker registered successfully:", registration);

        // Handle service worker updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                this.showUpdateAvailableNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  }

  /**
   * Handle app updates
   */
  private handleAppUpdates() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }
  }

  /**
   * Show install banner
   */
  private showInstallBanner() {
    // Create install banner element
    const banner = document.createElement("div");
    banner.id = "pwa-install-banner";
    banner.className = `
      fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 z-50
      transform translate-y-full transition-transform duration-300
      lg:hidden
    `;

    banner.innerHTML = `
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1">
          <p class="font-medium">Install Property Manager</p>
          <p class="text-sm opacity-90">Add to your home screen for quick access</p>
        </div>
        <div class="flex gap-2">
          <button id="pwa-install-btn" class="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm">
            Install
          </button>
          <button id="pwa-dismiss-btn" class="text-white opacity-75 hover:opacity-100 p-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Animate banner in
    setTimeout(() => {
      banner.style.transform = "translateY(0)";
    }, 100);

    // Add event listeners
    const installBtn = banner.querySelector("#pwa-install-btn");
    const dismissBtn = banner.querySelector("#pwa-dismiss-btn");

    installBtn?.addEventListener("click", () => {
      this.installApp();
    });

    dismissBtn?.addEventListener("click", () => {
      this.hideInstallBanner();
    });
  }

  /**
   * Hide install banner
   */
  private hideInstallBanner() {
    const banner = document.getElementById("pwa-install-banner");
    if (banner) {
      banner.style.transform = "translateY(100%)";
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }

  /**
   * Install the app
   */
  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
        this.hideInstallBanner();
        return true;
      } else {
        console.log("User dismissed the install prompt");
        return false;
      }
    } catch (error) {
      console.error("Error during app installation:", error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  /**
   * Show installed notification
   */
  private showInstalledNotification() {
    this.showNotification(
      "App Installed Successfully!",
      "Property Manager has been added to your home screen.",
      "success"
    );
  }

  /**
   * Show update available notification
   */
  private showUpdateAvailableNotification() {
    const notification = this.showNotification(
      "Update Available",
      "A new version of Property Manager is available.",
      "info",
      [
        {
          text: "Update Now",
          action: () => {
            this.updateApp();
            notification.remove();
          },
        },
        {
          text: "Later",
          action: () => notification.remove(),
        },
      ]
    );
  }

  /**
   * Update the app
   */
  private updateApp() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      });
    }
  }

  /**
   * Show notification
   */
  private showNotification(
    title: string,
    message: string,
    type: "success" | "info" | "warning" | "error" = "info",
    actions?: Array<{ text: string; action: () => void }>
  ): HTMLElement {
    const notification = document.createElement("div");
    notification.className = `
      fixed top-4 right-4 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50
      transform translate-x-full transition-transform duration-300
    `;

    const colorClasses = {
      success: "border-green-200 bg-green-50",
      info: "border-blue-200 bg-blue-50",
      warning: "border-yellow-200 bg-yellow-50",
      error: "border-red-200 bg-red-50",
    };

    notification.className += ` ${colorClasses[type]}`;

    const actionsHtml = actions
      ? `
      <div class="flex gap-2 mt-3">
        ${actions
          .map(
            (action, index) => `
          <button class="pwa-notification-action-${index} px-3 py-1 text-sm font-medium rounded-md ${
              index === 0
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }">
            ${action.text}
          </button>
        `
          )
          .join("")}
      </div>
    `
      : "";

    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <h4 class="font-medium text-gray-900">${title}</h4>
          <p class="text-sm text-gray-600 mt-1">${message}</p>
          ${actionsHtml}
        </div>
        <button class="pwa-notification-close text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Add event listeners
    const closeBtn = notification.querySelector(".pwa-notification-close");
    closeBtn?.addEventListener("click", () => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => notification.remove(), 300);
    });

    // Add action listeners
    actions?.forEach((action, index) => {
      const btn = notification.querySelector(
        `.pwa-notification-action-${index}`
      );
      btn?.addEventListener("click", action.action);
    });

    // Auto remove after 5 seconds if no actions
    if (!actions) {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.transform = "translateX(100%)";
          setTimeout(() => notification.remove(), 300);
        }
      }, 5000);
    }

    return notification;
  }

  /**
   * Check if app can be installed
   */
  public canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  /**
   * Check if app is installed
   */
  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  /**
   * Check if app is running in standalone mode
   */
  public isRunningStandalone(): boolean {
    return this.isStandalone;
  }

  /**
   * Get device info for PWA optimization
   */
  public getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isMobile = /Mobi|Android/i.test(userAgent);
    const isTablet =
      /iPad/.test(userAgent) || (isAndroid && !/Mobile/.test(userAgent));

    return {
      isIOS,
      isAndroid,
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      supportsInstall: "beforeinstallprompt" in window,
      supportsServiceWorker: "serviceWorker" in navigator,
      supportsNotifications: "Notification" in window,
      supportsPushNotifications: "PushManager" in window,
    };
  }

  /**
   * Request notification permission
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied";
    }

    if (Notification.permission === "default") {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  /**
   * Show local notification
   */
  public showLocalNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission === "granted") {
      return new Notification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        ...options,
      });
    }
  }

  /**
   * Add to home screen instructions for iOS
   */
  public showIOSInstallInstructions() {
    if (this.getDeviceInfo().isIOS && !this.isStandalone) {
      this.showNotification(
        "Install Property Manager",
        'Tap the Share button and then "Add to Home Screen" to install this app.',
        "info"
      );
    }
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// Export utilities
export const PWAUtils = {
  isInstalled: () => pwaManager.isAppInstalled(),
  canInstall: () => pwaManager.canInstall(),
  install: () => pwaManager.installApp(),
  isStandalone: () => pwaManager.isRunningStandalone(),
  getDeviceInfo: () => pwaManager.getDeviceInfo(),
  requestNotifications: () => pwaManager.requestNotificationPermission(),
  showNotification: (title: string, options?: NotificationOptions) =>
    pwaManager.showLocalNotification(title, options),
  showIOSInstructions: () => pwaManager.showIOSInstallInstructions(),
};
