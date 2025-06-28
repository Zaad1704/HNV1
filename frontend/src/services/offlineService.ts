class OfflineService {
  private isOnline = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];
  private pendingRequests: Array<{ url: string; options: RequestInit; timestamp: number }> = [];

  constructor() {
    this.setupEventListeners();
    this.loadPendingRequests();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      this.processPendingRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  private notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online));
  }

  public onStatusChange(callback: (online: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public getStatus() {
    return this.isOnline;
  }

  public async queueRequest(url: string, options: RequestInit = {}) {
    if (this.isOnline) {
      return fetch(url, options);
    }

    // Queue for later
    const request = {
      url,
      options,
      timestamp: Date.now()
    };

    this.pendingRequests.push(request);
    this.savePendingRequests();
    
    throw new Error('Request queued for when online');
  }

  private async processPendingRequests() {
    if (!this.isOnline || this.pendingRequests.length === 0) return;

    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    for (const request of requests) {
      try {
        await fetch(request.url, request.options);
      } catch (error) {
        console.error('Failed to process pending request:', error);
        // Re-queue if still failing
        this.pendingRequests.push(request);
      }
    }

    this.savePendingRequests();
  }

  private savePendingRequests() {
    try {
      localStorage.setItem('pendingRequests', JSON.stringify(this.pendingRequests));
    } catch (error) {
      console.error('Failed to save pending requests:', error);
    }
  }

  private loadPendingRequests() {
    try {
      const saved = localStorage.getItem('pendingRequests');
      if (saved) {
        this.pendingRequests = JSON.parse(saved);
        // Remove old requests (older than 24 hours)
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        this.pendingRequests = this.pendingRequests.filter(req => req.timestamp > dayAgo);
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  }

  public clearPendingRequests() {
    this.pendingRequests = [];
    localStorage.removeItem('pendingRequests');
  }
}

export const offlineService = new OfflineService();