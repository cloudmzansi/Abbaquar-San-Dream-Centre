import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TimeWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, []);
  
  // Format time as 24-hour format (HH:MM)
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className="flex items-center text-white">
      <Clock className="h-5 w-5 text-[#4f7df9] mr-2" />
      <span className="font-medium">{formattedTime}</span>
    </div>
  );
};

export default TimeWidget;
