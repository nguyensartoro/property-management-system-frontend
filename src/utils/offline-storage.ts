// Offline storage utilities for mobile app functionality

interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  expiry?: number;
}

interface OfflineAction {
  id: string;
  type: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class OfflineStorageManager {
  private dbName = 'PropertyManagerDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
          actionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('properties')) {
          db.createObjectStore('properties', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('tenants')) {
          db.createObjectStore('tenants', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('payments')) {
          db.createObjectStore('payments', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('maintenanceRequests')) {
          db.createObjectStore('maintenanceRequests', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Store data in cache
   */
  async setCache<T>(key: string, data: T, expiryMinutes?: number): Promise<void> {
    if (!this.db) await this.initDB();

    const item: StorageItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: expiryMinutes ? Date.now() + (expiryMinutes * 60 * 1000) : undefined,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({ key, ...item });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get data from cache
   */
  async getCache<T>(key: string): Promise<T | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if expired
        if (result.expiry && Date.now() > result.expiry) {
          this.deleteCache(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete cache entry
   */
  async deleteCache(key: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store offline action for later sync
   */
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    if (!this.db) await this.initDB();

    const actionWithId: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.add(actionWithId);

      request.onsuccess = () => resolve(actionWithId.id);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending offline actions
   */
  async getPendingActions(): Promise<OfflineAction[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove offline action
   */
  async removeOfflineAction(actionId: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.delete(actionId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update offline action retry count
   */
  async updateActionRetryCount(actionId: string, retryCount: number): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const getRequest = store.get(actionId);

      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.retryCount = retryCount;
          const putRequest = store.put(action);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Store entity data for offline access
   */
  async storeEntity<T>(storeName: string, entity: T): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(entity);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get entity data for offline access
   */
  async getEntity<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all entities for offline access
   */
  async getAllEntities<T>(storeName: string): Promise<T[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data (for logout)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) await this.initDB();

    const storeNames = ['cache', 'offlineActions', 'properties', 'tenants', 'payments', 'maintenanceRequests'];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite');
      let completed = 0;

      const checkComplete = () => {
        completed++;
        if (completed === storeNames.length) {
          resolve();
        }
      };

      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = checkComplete;
        request.onerror = () => reject(request.error);
      });
    });
  }
}

// Offline-aware API client
class OfflineAPIClient {
  private storage = new OfflineStorageManager();
  private baseURL = process.env.REACT_APP_API_URL || '/api/v1';

  /**
   * Make API request with offline support
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheMinutes?: number
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Try cache first for GET requests
    if (options.method === 'GET' || !options.method) {
      const cacheKeyToUse = cacheKey || `api_${endpoint}`;
      const cached = await this.storage.getCache<T>(cacheKeyToUse);
      if (cached) {
        // Return cached data and try to update in background
        this.backgroundUpdate(url, options, cacheKeyToUse, cacheMinutes);
        return cached;
      }
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful GET responses
      if ((options.method === 'GET' || !options.method) && cacheKey) {
        await this.storage.setCache(cacheKey, data, cacheMinutes);
      }

      return data;
    } catch (error) {
      // If offline and it's a GET request, try cache
      if (!navigator.onLine && (options.method === 'GET' || !options.method)) {
        const cacheKeyToUse = cacheKey || `api_${endpoint}`;
        const cached = await this.storage.getCache<T>(cacheKeyToUse);
        if (cached) {
          return cached;
        }
      }

      // For non-GET requests when offline, queue for later
      if (!navigator.onLine && options.method && options.method !== 'GET') {
        await this.storage.addOfflineAction({
          type: 'api_request',
          url,
          method: options.method,
          headers: options.headers as Record<string, string> || {},
          body: options.body as string,
          maxRetries: 3,
        });

        throw new Error('Request queued for when online');
      }

      throw error;
    }
  }

  /**
   * Background update for cached data
   */
  private async backgroundUpdate(
    url: string,
    options: RequestInit,
    cacheKey: string,
    cacheMinutes?: number
  ): Promise<void> {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        await this.storage.setCache(cacheKey, data, cacheMinutes);
      }
    } catch (error) {
      // Silently fail background updates
      console.log('Background update failed:', error);
    }
  }

  /**
   * Sync pending offline actions
   */
  async syncOfflineActions(): Promise<{ success: number; failed: number }> {
    const actions = await this.storage.getPendingActions();
    let success = 0;
    let failed = 0;

    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          await this.storage.removeOfflineAction(action.id);
          success++;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        if (action.retryCount < action.maxRetries) {
          await this.storage.updateActionRetryCount(action.id, action.retryCount + 1);
        } else {
          await this.storage.removeOfflineAction(action.id);
          failed++;
        }
      }
    }

    return { success, failed };
  }

  /**
   * Get properties with offline support
   */
  async getProperties(): Promise<any[]> {
    try {
      const properties = await this.request<any[]>('/properties', {}, 'properties', 30);
      
      // Store each property for offline access
      for (const property of properties) {
        await this.storage.storeEntity('properties', property);
      }
      
      return properties;
    } catch (error) {
      // Return cached properties if available
      return await this.storage.getAllEntities('properties');
    }
  }

  /**
   * Get tenants with offline support
   */
  async getTenants(): Promise<any[]> {
    try {
      const tenants = await this.request<any[]>('/tenants', {}, 'tenants', 30);
      
      // Store each tenant for offline access
      for (const tenant of tenants) {
        await this.storage.storeEntity('tenants', tenant);
      }
      
      return tenants;
    } catch (error) {
      // Return cached tenants if available
      return await this.storage.getAllEntities('tenants');
    }
  }

  /**
   * Get payments with offline support
   */
  async getPayments(): Promise<any[]> {
    try {
      const payments = await this.request<any[]>('/payments', {}, 'payments', 15);
      
      // Store each payment for offline access
      for (const payment of payments) {
        await this.storage.storeEntity('payments', payment);
      }
      
      return payments;
    } catch (error) {
      // Return cached payments if available
      return await this.storage.getAllEntities('payments');
    }
  }

  /**
   * Create maintenance request with offline support
   */
  async createMaintenanceRequest(data: any): Promise<any> {
    try {
      return await this.request('/maintenance', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (!navigator.onLine) {
        // Store locally and queue for sync
        const tempId = `temp_${Date.now()}`;
        const requestWithId = { ...data, id: tempId, status: 'PENDING_SYNC' };
        
        await this.storage.storeEntity('maintenanceRequests', requestWithId);
        await this.storage.addOfflineAction({
          type: 'create_maintenance_request',
          url: `${this.baseURL}/maintenance`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          maxRetries: 3,
        });

        return requestWithId;
      }
      throw error;
    }
  }
}

// Network status manager
class NetworkStatusManager {
  private listeners: Array<(online: boolean) => void> = [];
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.notifyListeners(true);
    
    // Trigger sync when coming back online
    this.triggerSync();
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.notifyListeners(false);
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }

  private async triggerSync(): Promise<void> {
    try {
      const apiClient = new OfflineAPIClient();
      const result = await apiClient.syncOfflineActions();
      
      if (result.success > 0 || result.failed > 0) {
        console.log(`Sync completed: ${result.success} success, ${result.failed} failed`);
        
        // Show notification to user
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Sync Complete', {
            body: `${result.success} actions synced successfully`,
            icon: '/icons/icon-192x192.png',
          });
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  public addListener(listener: (online: boolean) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (online: boolean) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  public getStatus(): boolean {
    return this.isOnline;
  }
}

// Export instances
export const offlineStorage = new OfflineStorageManager();
export const offlineAPI = new OfflineAPIClient();
export const networkStatus = new NetworkStatusManager();

// Export utilities
export const OfflineUtils = {
  isOnline: () => networkStatus.getStatus(),
  addNetworkListener: (listener: (online: boolean) => void) => networkStatus.addListener(listener),
  removeNetworkListener: (listener: (online: boolean) => void) => networkStatus.removeListener(listener),
  clearOfflineData: () => offlineStorage.clearAllData(),
  syncPendingActions: () => offlineAPI.syncOfflineActions(),
};