
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/sonner";
import { format, isWeekend, setHours, setMinutes } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  Clock,
  TrendingUp,
  Users,
  Target,
  Shield,
  CheckCircle2,
  Star,
  ArrowRight,
  Phone,
  Calendar as CalendarIcon,
  Zap,
} from "lucide-react";
import link2payLogo from "@/assets/link2pay-logo.png";
import shechemLogo from "@/assets/shechem-logo.png";

const RealEstateLanding = () => {
  const heroRef = useRef<HTMLElement>(null);
  const bookingRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY * 0.3);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    leadType: "",
    budget: "",
    goals: "",
  });

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const timeSlots = (() => {
    const slots = [];
    for (let hour = 8; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  })();

  const handleSubmit = () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.leadType ||
      !formData.budget ||
      !formData.businessName
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    const [hour, minute] = selectedTime.split(":").map(Number);
    const startDateTime = setMinutes(setHours(selectedDate, hour), minute);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

    const formatForGoogle = (date: Date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const details = `
Ecommerce Growth Strategy Call

Store Type: ${formData.leadType}
Monthly Ad Budget: ${formData.budget}
Business: ${formData.businessName}
Phone: ${formData.phone}
Email: ${formData.email}

Goals:
${formData.goals}
    `.trim();

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Ecommerce Growth Strategy Call - ${encodeURIComponent(formData.businessName)}&dates=${formatForGoogle(startDateTime)}/${formatForGoogle(endDateTime)}&details=${encodeURIComponent(details)}&add=itssrossi@icloud.com&location=Zoom (link will be sent via email)`;

    // Send email notification
    const emailSubject = `New Ecommerce Strategy Call Booking - ${formData.businessName}`;
    const emailBody = `
New booking from Ecommerce Landing Page:

Name: ${formData.name}
Business: ${formData.businessName}
Email: ${formData.email}
Phone: ${formData.phone}
Store Type: ${formData.leadType}
Monthly Budget: ${formData.budget}
Date: ${format(selectedDate, "EEEE, MMMM d, yyyy")}
Time: ${selectedTime} GMT+2

Goals:
${formData.goals}
    `.trim();

    const mailtoUrl = `mailto:itssrossi@icloud.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    window.open(googleCalendarUrl, "_blank");

    // Also open mailto as backup
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 1000);

    toast.success(
      "Booking created! Check your calendar and email for confirmation."
    );

    setIsSubmitting(false);
    setSelectedDate(undefined);
    setSelectedTime("");
    setFormData({
      name: "",
      businessName: "",
      email: "",
      phone: "",
      leadType: "",
      budget: "",
      goals: "",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Spline 3D Background with Parallax */}
        <div 
          className="absolute inset-0 z-0 opacity-50 will-change-transform"
          style={{ transform: `translateY(${scrollY}px)` }}
        >
          <iframe 
            src='https://my.spline.design/animatedpaperboat-pbhbytudkYfJXVCFAislvOH9/' 
            frameBorder='0' 
            width='100%' 
            height='100%'
            className="pointer-events-none"
            loading="eager"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-secondary/70 to-background/80 z-[1]" />
        <div className="absolute inset-0 z-[1]" style={{
          backgroundImage: "radial-gradient(circle at 25% 10%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)"
        }} />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Zap size={16} className="text-primary" />
            <span className="text-sm text-primary font-medium">
              Only 3 Store Slots Left This Month
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Scale Your Store Without the Guesswork:
            <br />
            Paid Ads That Deliver <span className="text-primary">Customers, Revenue & Clarity</span>.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            We build the paid ad systems, creative, and funnel strategy that turn your
            store into a{" "}
            <strong className="text-foreground">
              profitable, predictable revenue machine
            </strong>{" "}
            — so you stop guessing what's working and start scaling on real numbers.
          </p>

          <p className="text-md text-muted-foreground max-w-2xl mx-auto mb-8 italic">
            You don't have a traffic problem. You have a targeting, creative, and conversion problem. We fix all three.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={scrollToBooking}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25 group"
            >
              Get My Free Store Growth Plan
              <ArrowRight
                size={20}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              Data-Driven Ad Strategy
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              Creative Built for Conversion
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              Transparent Reporting on Real Metrics
            </div>
          </div>
        </div>

        <button
          onClick={scrollToBooking}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground"
        >
          <ChevronDown size={32} />
        </button>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            If This Is Your Store, Keep Reading
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              "You're burning ad spend and your ROAS still won't stay above breakeven",
              "Traffic goes up, sales don't — your product pages leak buyers",
              "Revenue swings wildly: one month R300k, the next R80k",
              "Your CAC keeps climbing while your AOV stays flat",
              "You're sitting on an email/SMS list that makes you almost nothing",
              "The last agency sent pretty reports and zero profit",
            ].map((problem, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-card p-4 rounded-lg border border-border"
              >
                <span className="text-destructive text-xl mt-0.5">✗</span>
                <p className="text-muted-foreground">{problem}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-lg text-foreground font-semibold">
            None of that is a you problem. It's an offer, creative, and follow-up problem — and all three are fixable.
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Here's How We <span className="text-primary">Scale Your Store</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We don't "manage ads." We build the full profit engine: offer,
              creative, funnel, and retention — measured in cash, not clicks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Offer Engineering",
                desc: "We rebuild your offer, bundles and pricing so it's a no-brainer. Same traffic, more buyers, higher AOV.",
              },
              {
                icon: Users,
                title: "Scroll-Stopping Creative",
                desc: "New ad angles and UGC-style creative tested weekly. Creative is the new targeting — we treat it that way.",
              },
              {
                icon: TrendingUp,
                title: "Profitable Paid Media",
                desc: "Meta, Google, TikTok managed to blended MER and contribution margin — not vanity platform ROAS.",
              },
              {
                icon: Phone,
                title: "Email & SMS Retention",
                desc: "Abandoned cart, post-purchase, winback and campaigns that add 25-40% of revenue you're already leaving behind.",
              },
              {
                icon: Shield,
                title: "CRO That Converts",
                desc: "Product page, cart and checkout fixes that lift conversion rate — so every rand of ad spend goes further.",
              },
              {
                icon: Zap,
                title: "Numbers You Can Trust",
                desc: "One dashboard: spend, MER, AOV, LTV, contribution profit. Weekly. No fluff, no 90-day 'ramp up' excuses.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <item.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results / Social Proof */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real Spend. Real Revenue. <span className="text-primary">Real Profit.</span>
            </h2>
            <p className="text-muted-foreground">
              Numbers, not promises. Here's what we've actually delivered.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { stat: "4.47×", label: "Return on Ad Spend" },
              { stat: "105+", label: "Buyers & Leads Generated" },
              { stat: "7 Days", label: "To First Profitable Ads" },
              { stat: "49+", label: "New Customers in 30 Days" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <p className="text-3xl md:text-4xl font-black text-primary">
                  {item.stat}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-xl p-8">
              <img src={link2payLogo} alt="Link2Pay" className="h-20 object-contain mb-4 mx-auto" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
              <blockquote className="text-muted-foreground mb-4 italic">
                "Working with Zueco Media showed me what real performance
                marketing looks like. We launched with zero brand presence, no
                previous users, and no existing audience — yet within the first
                30 days, Zueco Media acquired over 49 new trial users. The
                campaign was data-driven from the start. They tested multiple
                creatives, refined messaging, and optimized our sign-up funnel
                based on real user behavior."
              </blockquote>
              <p className="font-semibold text-foreground">— Link2Pay Team</p>
              <p className="text-sm text-primary">
                Ecommerce/SaaS • 49 New Customers in 30 Days
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8">
              <img src={shechemLogo} alt="Shechem Counselling" className="h-20 object-contain mb-4 mx-auto" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
              <blockquote className="text-muted-foreground mb-4 italic">
                "Within 7 days of launching, we generated 105 leads at an
                extremely low cost while maintaining a strong focus on lead
                quality. The campaigns achieved a 4.47× return on ad spend.
                Instead of chasing volume, Zueco Media intentionally increased
                funnel friction to ensure only emotionally ready and financially
                capable leads came through."
              </blockquote>
              <p className="font-semibold text-foreground">
                — Shechem Counselling
              </p>
              <p className="text-sm text-primary">
                Online Business • 4.47× ROAS in 7 Days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency / Scarcity Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why We Only Take 3 New Stores Per Month
            </h2>
            <p className="text-muted-foreground mb-6">
              We're not a volume agency. Every store gets its own offer rebuild,
              creative pipeline and retention flows. That takes real bandwidth.
              Take on everyone, and results drop. Results are the only thing we sell.
            </p>
            <p className="text-foreground font-semibold mb-6">
              If you're doing R50k+/month and want to scale profitably, grab a
              slot below before they're gone.
            </p>
            <Button
              onClick={scrollToBooking}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25"
            >
              Claim My Store Slot
            </Button>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section ref={bookingRef} className="py-20 px-4 bg-secondary/30" id="book">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Your Free <span className="text-primary">Store Growth Plan</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              30 minutes. No pitch-fest. We'll audit your ads, offer and funnel,
              show you exactly where the profit is leaking, and hand you the plan
              to fix it — whether you hire us or not.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calendar + Time */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CalendarIcon size={20} className="text-primary" />
                  Select a Date & Time
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isWeekend(date) || date < new Date()}
                  className="rounded-md border border-border p-3 pointer-events-auto"
                  classNames={{
                    day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary",
                    day_today: "bg-accent text-accent-foreground",
                  }}
                />
                {selectedDate && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                )}
              </div>

              {selectedDate && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    Available Times (GMT+2)
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className={
                          selectedTime === time
                            ? "bg-primary text-primary-foreground"
                            : "border-border hover:bg-primary/10"
                        }
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-6">Your Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="re-name">Full Name *</Label>
                  <Input
                    id="re-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="John Smith"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="re-business">Business Name *</Label>
                  <Input
                    id="re-business"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, businessName: e.target.value }))
                    }
                    placeholder="Acme Apparel"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="re-email">Email Address *</Label>
                  <Input
                    id="re-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="john@acmeapparel.com"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="re-phone">Mobile Number *</Label>
                  <Input
                    id="re-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+27 xx xxx xxxx"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label>What Best Describes Your Store? *</Label>
                  <Select
                    value={formData.leadType}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, leadType: v }))
                    }
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select store type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under R50k/month">Doing under R50k/month</SelectItem>
                      <SelectItem value="R50k - R250k/month">Doing R50k – R250k/month</SelectItem>
                      <SelectItem value="R250k - R1m/month">Doing R250k – R1m/month</SelectItem>
                      <SelectItem value="R1m+/month">Doing R1m+/month</SelectItem>
                      <SelectItem value="Pre-launch">Pre-launch / just started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Monthly Ad Budget *</Label>
                  <Select
                    value={formData.budget}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, budget: v }))
                    }
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="R2,000 - R5,000">R2,000 – R5,000</SelectItem>
                      <SelectItem value="R5,000 - R10,000">R5,000 – R10,000</SelectItem>
                      <SelectItem value="R10,000 - R25,000">R10,000 – R25,000</SelectItem>
                      <SelectItem value="R25,000 - R50,000">R25,000 – R50,000</SelectItem>
                      <SelectItem value="R50,000+">R50,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="re-goals">
                    What's your revenue goal for the next 12 months?
                  </Label>
                  <Textarea
                    id="re-goals"
                    value={formData.goals}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, goals: e.target.value }))
                    }
                    placeholder="e.g. Scale from R150k to R500k/month, launch a new product line, fix our ROAS..."
                    rows={4}
                    className="bg-background border-border"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !selectedDate ||
                    !selectedTime ||
                    !formData.name ||
                    !formData.email ||
                    !formData.phone ||
                    !formData.leadType ||
                    !formData.budget ||
                    !formData.businessName
                  }
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-xl shadow-lg shadow-primary/25"
                >
                  {isSubmitting ? "Booking..." : "Get My Free Store Growth Plan"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  🔒 100% private. No spam, no sales pressure — just the plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Your Competitors Are Buying Your Customers Right Now.
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Every day you run break-even ads is a day someone else buys the
            customer, keeps the lifetime value, and outbids you tomorrow. The
            question isn't what this costs — it's what another flat quarter costs.
          </p>
          <Button
            onClick={scrollToBooking}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25"
          >
            Get My Free Growth Plan
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl text-center">
          <img
            src="/lovable-uploads/7ae353e4-9833-4708-a345-e1195eaace46.png"
            alt="Zue Co Media"
            className="h-8 mx-auto mb-4"
          />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zue Co Media. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RealEstateLanding;
