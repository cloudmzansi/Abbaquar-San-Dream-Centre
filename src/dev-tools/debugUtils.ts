/**
 * Debug utilities for development environments
 * These utilities are only active in localhost environments
 */

/**
 * Check if the current environment is localhost
 */
export const isLocalhost = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.includes('.local')
  );
};

/**
 * Debug logger that only logs in localhost environments
 */
export const debugLog = (message: string, data?: any): void => {
  if (!isLocalhost()) return;
  
  console.log(`%c[DEBUG] ${message}`, 'background: #083060; color: #D4A017; padding: 2px 4px; border-radius: 2px;', data || '');
};

/**
 * Create a debug event listener that logs all events of a specific type on an element
 */
export const createDebugEventListener = (
  element: HTMLElement | Document | Window,
  eventType: string,
  listenerName: string
): () => void => {
  if (!isLocalhost()) return () => {};
  
  const handler = (event: Event) => {
    debugLog(`${listenerName} - ${eventType} event triggered`, {
      event,
      target: event.target,
      currentTarget: event.currentTarget,
      defaultPrevented: event.defaultPrevented,
      eventPhase: event.eventPhase,
      timeStamp: event.timeStamp,
    });
  };
  
  element.addEventListener(eventType, handler);
  return () => element.removeEventListener(eventType, handler);
};

/**
 * Capture and log network requests (fetch/XHR)
 */
export const setupNetworkDebugger = (): void => {
  if (!isLocalhost()) return;
  
  // Intercept fetch requests
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    debugLog(`Fetch request initiated`, { url, method: init?.method || 'GET', headers: init?.headers });
    
    try {
      const response = await originalFetch.apply(this, [input, init]);
      const responseClone = response.clone();
      
      try {
        const responseData = await responseClone.text();
        debugLog(`Fetch response received`, { 
          url, 
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData.substring(0, 500) + (responseData.length > 500 ? '...' : '')
        });
      } catch (e) {
        debugLog(`Couldn't parse fetch response`, { url, error: e });
      }
      
      return response;
    } catch (error) {
      debugLog(`Fetch request failed`, { url, error });
      throw error;
    }
  };
  
  // Intercept XMLHttpRequest
  const XHROpen = XMLHttpRequest.prototype.open;
  const XHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._debugData = { method, url };
    return XHROpen.apply(this, [method, url, ...args]);
  };
  
  XMLHttpRequest.prototype.send = function(...args) {
    if (this._debugData) {
      debugLog(`XHR request initiated`, this._debugData);
      
      this.addEventListener('load', () => {
        debugLog(`XHR response received`, {
          ...this._debugData,
          status: this.status,
          statusText: this.statusText,
          responseType: this.responseType,
          responseText: this.responseText?.substring(0, 500) + (this.responseText?.length > 500 ? '...' : '') || '[binary data]'
        });
      });
      
      this.addEventListener('error', () => {
        debugLog(`XHR request failed`, this._debugData);
      });
    }
    
    return XHRSend.apply(this, args);
  };
};

/**
 * Form submission debugger
 */
export const debugFormSubmission = (
  formElement: HTMLFormElement,
  formData: any,
  errors: any
): void => {
  if (!isLocalhost()) return;
  
  debugLog('Form submission attempt', {
    formElement,
    formId: formElement.id,
    formAction: formElement.action,
    formMethod: formElement.method,
    formEnctype: formElement.enctype,
    formData,
    validationErrors: errors,
    formValidity: formElement.checkValidity(),
    activeElement: document.activeElement,
    scrollPosition: { x: window.scrollX, y: window.scrollY }
  });
};
