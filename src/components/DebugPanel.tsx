import { useState, useEffect, useRef } from 'react';
import { isLocalhost } from '@/utils/debugUtils';
import { X, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface DebugLogEntry {
  id: string;
  timestamp: number;
  message: string;
  data?: any;
  type: 'info' | 'error' | 'warn' | 'success';
}

interface DebugPanelProps {
  formId?: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ formId }) => {
  if (!import.meta.env.DEV) return null;

  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'network' | 'form'>('logs');
  const [formState, setFormState] = useState<any>(null);
  const [networkRequests, setNetworkRequests] = useState<any[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    try {
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      console.log = (...args) => {
        originalConsoleLog(...args);
        try {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          
          addLogEntry('info', message, args[1] || null);
        } catch (e) {
          originalConsoleError('Error in debug console.log override:', e);
        }
      };
      
      console.error = (...args) => {
        originalConsoleError(...args);
        try {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          
          addLogEntry('error', message, args[1] || null);
        } catch (e) {
          originalConsoleError('Error in debug console.error override:', e);
        }
      };
      
      console.warn = (...args) => {
        originalConsoleWarn(...args);
        try {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          
          addLogEntry('warn', message, args[1] || null);
        } catch (e) {
          originalConsoleError('Error in debug console.warn override:', e);
        }
      };
      
      if (formId) {
        setTimeout(() => {
          try {
            const formElement = document.getElementById(formId) as HTMLFormElement;
            if (formElement) {
              updateFormState(formElement);
              
              const formInputs = formElement.querySelectorAll('input, textarea, select');
              formInputs.forEach(input => {
                input.addEventListener('change', () => {
                  updateFormState(formElement);
                });
                input.addEventListener('input', () => {
                  updateFormState(formElement);
                });
              });
              
              formElement.addEventListener('submit', (e) => {
                addLogEntry('info', 'Form submission triggered', {
                  preventDefault: e.defaultPrevented,
                  timestamp: Date.now(),
                  scrollPosition: { x: window.scrollX, y: window.scrollY }
                });
              });
            } else {
              addLogEntry('warn', `Form with ID "${formId}" not found`);
            }
          } catch (e) {
            console.error('Error setting up form monitoring:', e);
          }
        }, 1000); 
      }
      
      return () => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
      };
    } catch (e) {
      console.error('Error in DebugPanel setup:', e);
      return () => {}; 
    }
  }, [formId]);
  
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  const addLogEntry = (type: 'info' | 'error' | 'warn' | 'success', message: string, data?: any) => {
    try {
      const entry: DebugLogEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        message,
        data,
        type
      };
      
      setLogs(prev => [...prev, entry]);
    } catch (e) {
      console.error('Error adding log entry:', e);
    }
  };
  
  const updateFormState = (form: HTMLFormElement) => {
    try {
      const formData = new FormData(form);
      const formValues: Record<string, string> = {};
      
      formData.forEach((value, key) => {
        formValues[key] = value.toString();
      });
      
      setFormState({
        values: formValues,
        validity: {
          formValid: form.checkValidity(),
          invalidElements: Array.from(form.elements)
            .filter((el: any) => el.validity && !el.validity.valid)
            .map((el: any) => ({
              name: el.name,
              id: el.id,
              validationMessage: el.validationMessage,
              validity: {
                valueMissing: el.validity.valueMissing,
                typeMismatch: el.validity.typeMismatch,
                patternMismatch: el.validity.patternMismatch,
                tooLong: el.validity.tooLong,
                tooShort: el.validity.tooShort,
                rangeUnderflow: el.validity.rangeUnderflow,
                rangeOverflow: el.validity.rangeOverflow,
                stepMismatch: el.validity.stepMismatch,
                badInput: el.validity.badInput,
                customError: el.validity.customError
              }
            }))
        }
      });
    } catch (e) {
      console.error('Error updating form state:', e);
    }
  };
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };
  
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <>
      {/* Debug toggle button */}
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 bg-[#083060] text-white p-2 rounded-full shadow-lg z-50 hover:bg-[#D4A017] transition-colors"
        aria-label="Toggle debug panel"
      >
        {isVisible ? <X size={20} /> : <span className="text-xs px-2">Debug</span>}
      </button>
      
      {/* Debug panel */}
      {isVisible && (
        <div 
          className={`fixed ${isExpanded ? 'inset-4' : 'bottom-16 right-4 w-96 h-96'} bg-[#083060] text-white rounded-lg shadow-2xl z-40 flex flex-col overflow-hidden border border-white/20`}
        >
          {/* Header */}
          <div className="bg-[#062040] p-2 flex items-center justify-between">
            <h3 className="font-bold text-sm">Debug Panel</h3>
            <div className="flex gap-2">
              <button 
                onClick={toggleExpanded} 
                className="text-white/80 hover:text-white"
                aria-label={isExpanded ? "Minimize" : "Maximize"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button 
                onClick={toggleVisibility} 
                className="text-white/80 hover:text-white"
                aria-label="Close debug panel"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-white/20">
            <button 
              className={`px-4 py-2 text-xs ${activeTab === 'logs' ? 'bg-[#062040] border-b-2 border-[#D4A017]' : 'hover:bg-[#062040]/50'}`}
              onClick={() => setActiveTab('logs')}
            >
              Logs
            </button>
            <button 
              className={`px-4 py-2 text-xs ${activeTab === 'network' ? 'bg-[#062040] border-b-2 border-[#D4A017]' : 'hover:bg-[#062040]/50'}`}
              onClick={() => setActiveTab('network')}
            >
              Network
            </button>
            {formId && (
              <button 
                className={`px-4 py-2 text-xs ${activeTab === 'form' ? 'bg-[#062040] border-b-2 border-[#D4A017]' : 'hover:bg-[#062040]/50'}`}
                onClick={() => setActiveTab('form')}
              >
                Form State
              </button>
            )}
            <div className="ml-auto pr-2 flex items-center">
              <button
                onClick={clearLogs}
                className="text-xs flex items-center gap-1 text-white/70 hover:text-white"
                title="Clear logs"
              >
                <RefreshCw size={12} /> Clear
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-2 text-xs font-mono bg-[#062040]/50">
            {activeTab === 'logs' && (
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="text-white/50 italic p-4 text-center">No logs yet</div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="border-b border-white/10 pb-2">
                      <div className={`
                        ${log.type === 'error' ? 'text-red-400' : ''}
                        ${log.type === 'warn' ? 'text-yellow-400' : ''}
                        ${log.type === 'success' ? 'text-green-400' : ''}
                        ${log.type === 'info' ? 'text-blue-400' : ''}
                      `}>
                        <span className="text-white/50">[{formatTimestamp(log.timestamp)}]</span> {log.message}
                      </div>
                      {log.data && (
                        <pre className="mt-1 text-white/70 text-[10px] overflow-x-auto">
                          {typeof log.data === 'object' 
                            ? JSON.stringify(log.data, null, 2) 
                            : log.data}
                        </pre>
                      )}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            )}
            
            {activeTab === 'network' && (
              <div className="space-y-2">
                {networkRequests.length === 0 ? (
                  <div className="text-white/50 italic p-4 text-center">No network requests captured</div>
                ) : (
                  networkRequests.map(request => (
                    <div key={request.id} className="border border-white/10 rounded p-2">
                      <div className="flex justify-between">
                        <span className={`font-bold ${
                          request.status === 'pending' ? 'text-yellow-400' :
                          request.status === 'error' ? 'text-red-400' :
                          request.statusCode >= 400 ? 'text-red-400' :
                          request.statusCode >= 300 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {request.method} {request.url.split('/').pop()}
                        </span>
                        <span className="text-white/50">
                          {request.status === 'pending' ? 'Pending' : 
                           request.status === 'error' ? 'Error' :
                           `${request.statusCode} ${request.statusText}`}
                        </span>
                      </div>
                      <div className="text-white/70 mt-1">
                        URL: {request.url}
                      </div>
                      {request.completedAt && (
                        <div className="text-white/50 text-[10px]">
                          Duration: {request.completedAt - request.timestamp}ms
                        </div>
                      )}
                      {request.responseData && (
                        <details className="mt-2">
                          <summary className="cursor-pointer hover:text-[#D4A017]">Response Data</summary>
                          <pre className="mt-1 text-white/70 text-[10px] overflow-x-auto p-2 bg-black/30 rounded">
                            {request.responseData}
                          </pre>
                        </details>
                      )}
                      {request.error && (
                        <div className="mt-2 text-red-400">
                          Error: {request.error.toString()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            
            {activeTab === 'form' && formState && (
              <div>
                <div className="mb-4">
                  <h4 className="font-bold border-b border-white/20 pb-1 mb-2">Form Validity</h4>
                  <div className={`text-${formState.validity.formValid ? 'green' : 'red'}-400`}>
                    Form is {formState.validity.formValid ? 'valid' : 'invalid'}
                  </div>
                  
                  {formState.validity.invalidElements.length > 0 && (
                    <div className="mt-2">
                      <h5 className="font-bold text-red-400">Invalid Fields:</h5>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {formState.validity.invalidElements.map((el: any, idx: number) => (
                          <li key={idx}>
                            <strong>{el.name || el.id || 'Unnamed field'}</strong>: {el.validationMessage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-bold border-b border-white/20 pb-1 mb-2">Form Values</h4>
                  <pre className="bg-black/30 p-2 rounded overflow-x-auto">
                    {JSON.stringify(formState.values, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
