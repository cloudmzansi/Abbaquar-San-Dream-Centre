import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Event } from '@/types/supabase';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Format a date string as 'DD/MM/YYYY'.
 * Returns '-' if invalid.
 */
function formatEventDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return '-';
  }
}

/**
 * Format time to display as "start_time - end_time"
 */
function formatEventTime(event: Event): string {
  return event.start_time && event.end_time ? 
    `${event.start_time} - ${event.end_time}` : 
    event.start_time || 'Time TBD';
}

const EventModal = ({ event, isOpen, onClose }: EventModalProps) => {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#073366]">
            {event.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Event details for {event.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Image */}
          {event.image_path && (
            <div className="relative">
              <img
                src={event.image_path}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg"
                loading="lazy"
              />
            </div>
          )}
          
          {/* Event Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-5 w-5 text-[#8A4BA3]" />
                <span className="font-medium">{formatEventDate(event.date)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-5 w-5 text-[#8A4BA3]" />
                <span className="font-medium">{formatEventTime(event)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-5 w-5 text-[#8A4BA3]" />
                <span className="font-medium">{event.venue}</span>
              </div>
            </div>
            
            {/* Event Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#073366]">About This Event</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
            
            {/* Additional Information */}
            {event.item_description && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#073366]">Additional Details</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.item_description}
                </p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              className="flex-1 bg-[#073366] hover:bg-[#052548] text-white"
            >
              Close
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-[#8A4BA3] text-[#8A4BA3] hover:bg-[#8A4BA3] hover:text-white"
              onClick={() => {
                // Add to calendar functionality could be added here
                console.log('Add to calendar clicked');
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
