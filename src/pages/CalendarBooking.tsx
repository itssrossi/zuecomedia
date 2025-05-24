
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { format, addDays, isWeekend, setHours, setMinutes } from "date-fns";
import { Clock, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";

const CalendarBooking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    message: ""
  });

  // Generate available time slots (8 AM to 5 PM EST/EDT)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const isDateAvailable = (date: Date) => {
    // Disable weekends and past dates
    return !isWeekend(date) && date >= new Date();
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !customerInfo.name || !customerInfo.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create Google Calendar link
    const [hour, minute] = selectedTime.split(':').map(Number);
    const startDateTime = setMinutes(setHours(selectedDate, hour), minute);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour meeting

    const formatForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting with ${customerInfo.name}&dates=${formatForGoogle(startDateTime)}/${formatForGoogle(endDateTime)}&details=${encodeURIComponent(`Name: ${customerInfo.name}\nEmail: ${customerInfo.email}\nMessage: ${customerInfo.message}`)}&add=johnrosspersonal@gmail.com`;

    // Open Google Calendar in new tab
    window.open(googleCalendarUrl, '_blank');
    
    toast.success("Booking request sent! Please check your calendar.");
    
    // Reset form
    setSelectedDate(undefined);
    setSelectedTime("");
    setCustomerInfo({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-zue-dark text-white">
      {/* Header */}
      <header className="bg-zue-dark-light shadow-md py-4 px-6">
        <div className="container mx-auto flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mr-4 text-white hover:bg-white/10"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Button>
          <img
            src="/lovable-uploads/7ae353e4-9833-4708-a345-e1195eaace46.png"
            alt="Zue Co Media Dark Logo"
            className="h-8 mr-3"
          />
          <h1 className="text-xl font-bold">
            Book a Meeting with <span className="text-zue-blue">ZueCo</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Schedule Your Consultation</h2>
          <p className="text-gray-300 text-lg">
            Choose a convenient time to discuss your digital marketing needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Calendar Selection */}
          <Card className="bg-zue-dark-light border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CalendarIcon size={20} />
                Select a Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => !isDateAvailable(date)}
                className="rounded-md border border-gray-700 bg-zue-dark p-3"
                classNames={{
                  day_selected: "bg-zue-blue text-white hover:bg-zue-blue",
                  day_today: "bg-gray-700 text-white",
                  day_disabled: "text-gray-500 opacity-50",
                }}
              />
              
              {selectedDate && (
                <div className="mt-4">
                  <p className="text-sm text-gray-300 mb-2">
                    Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Slots and Booking Form */}
          <div className="space-y-6">
            {/* Time Slots */}
            <Card className="bg-zue-dark-light border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock size={20} />
                  Available Times (EST/EDT)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className={`
                          ${selectedTime === time 
                            ? 'bg-zue-blue text-white' 
                            : 'border-gray-600 text-white hover:bg-zue-blue/20'}
                        `}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Please select a date first</p>
                )}
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="bg-zue-dark-light border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-zue-dark border-gray-600 text-white"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-white">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-zue-dark border-gray-600 text-white"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-white">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={customerInfo.message}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, message: e.target.value }))}
                    className="bg-zue-dark border-gray-600 text-white"
                    placeholder="Tell us about your project or goals..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || !customerInfo.name || !customerInfo.email}
                  className="w-full bg-zue-blue hover:bg-zue-blue-dark text-white"
                >
                  Book Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarBooking;
