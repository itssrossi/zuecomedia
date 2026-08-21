
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronDown,
  Clock,
  Target,
  CheckCircle2,
  Star,
  ArrowRight,
  Calendar as CalendarIcon,
  Zap,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import link2payLogo from "@/assets/link2pay-logo.png";
import shechemLogo from "@/assets/shechem-logo.png";
import founderPhoto from "@/assets/founder.jpg.asset.json";

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
    storeUrl: "",
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
      !formData.businessName ||
      !formData.storeUrl
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
Store URL: ${formData.storeUrl}
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
Store URL: ${formData.storeUrl}
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
      storeUrl: "",
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

        <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl py-24">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Turn More Of Your Traffic Into <span className="text-primary">Paying Customers</span>.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Get more of the right people to your store — and give them more reasons to buy once they arrive.
          </p>

          <p className="text-md text-muted-foreground max-w-2xl mx-auto mb-8">
            We analyse your ads, offer, website and customer journey to identify what's preventing
            more visitors from becoming customers.
          </p>

          <div className="bg-card/70 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Get Your FREE E-Commerce Growth Audit
            </h2>
            <p className="text-muted-foreground mb-6">
              We'll show you where you're losing potential customers and what we'd fix first.
            </p>
            <Button
              onClick={scrollToBooking}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25 group w-full sm:w-auto"
            >
              Get My Free Audit
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Free. No obligation. No generic "10X your sales" promises.
            </p>
          </div>
        </div>

        <button
          onClick={scrollToBooking}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground"
        >
          <ChevronDown size={32} />
        </button>
      </section>

      {/* The Core Problem */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <p className="text-sm uppercase tracking-widest text-primary text-center mb-3">The Core Problem</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            More Traffic Isn't The Whole Answer.
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            There are two places an e-commerce business can lose money:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-primary font-bold mb-2">1. Before The Click</p>
              <p className="text-muted-foreground">
                Your ads may be bringing the wrong people, targeting too broadly, or failing to
                communicate a compelling reason to visit.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-primary font-bold mb-2">2. After The Click</p>
              <p className="text-muted-foreground">
                Your visitors may arrive — but your product pages, offer, trust signals, mobile
                experience or checkout may not give them enough reason to buy.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-foreground font-semibold">
            You need both sides working together.
          </p>
          <p className="mt-2 text-center text-primary font-bold">
            Better traffic → Better conversion → More customers
          </p>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-widest text-primary mb-3">The Opportunity</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            What If Your Store Could Get More From Every Rand You Spend On Marketing?
          </h2>
          <div className="space-y-4 text-muted-foreground max-w-2xl mx-auto">
            <p>Imagine you're paying to send 1,000 people to your store.</p>
            <p>If your ads aren't attracting the right customers, you're wasting money before they even arrive.</p>
            <p>If your store isn't converting those visitors, you're wasting money after they arrive.</p>
            <p className="text-foreground font-medium">That's why we look at the entire journey:</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2 my-8">
            {["Ad", "Landing Page", "Product", "Add To Cart", "Checkout", "Purchase"].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <span className="bg-card border border-border rounded-lg px-3 py-2 text-sm font-medium">
                  {step}
                </span>
                {i < arr.length - 1 && <ArrowRight size={14} className="text-primary" />}
              </div>
            ))}
          </div>

          <p className="text-foreground font-semibold">Our goal is simple:</p>
          <p className="text-muted-foreground">
            Get more qualified visitors in — and convert more of them into customers.
          </p>
        </div>
      </section>

      {/* What We Analyse */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">What We Analyse</p>
            <h2 className="text-3xl md:text-4xl font-bold">
              We Look At The Entire <span className="text-primary">E-Commerce Growth System</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Paid Advertising",
                desc: "Are your ads attracting people who are actually likely to buy? We look at targeting, offers, messaging, creative, hooks, calls-to-action and traffic quality.",
              },
              {
                icon: ShoppingBag,
                title: "Product Pages",
                desc: "Once someone arrives, does the page give them enough information and motivation to purchase?",
              },
              {
                icon: Zap,
                title: "Offer & Positioning",
                desc: "Is your value proposition clear? Does your offer give customers a compelling reason to choose you?",
              },
              {
                icon: Star,
                title: "Trust & Social Proof",
                desc: "Do visitors have enough confidence to hand over their money?",
              },
              {
                icon: Smartphone,
                title: "Mobile Experience",
                desc: "Can someone easily browse, evaluate and purchase from their phone?",
              },
              {
                icon: ShoppingCart,
                title: "Cart & Checkout",
                desc: "Where could friction or uncertainty be causing customers to drop off?",
              },
              {
                icon: RefreshCw,
                title: "Customer Journey",
                desc: "Does everything from the first ad impression through checkout work together?",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
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

      {/* The Mechanism */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">The Mechanism</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">We Don't Just Send More Traffic.</h2>
            <p className="text-muted-foreground">
              We focus on making the traffic work harder. That means building a system where:
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Your Ads Attract The Right People",
                desc: "Better hooks, offers and creative designed to reach potential buyers.",
              },
              {
                title: "Your Store Gives Them A Reason To Buy",
                desc: "Clear messaging, compelling product presentation and trust.",
              },
              {
                title: "Your Customer Journey Removes Friction",
                desc: "A smoother path from product discovery to checkout.",
              },
              {
                title: "Your Marketing Gets Better Over Time",
                desc: "We use performance data to identify what's working and continuously improve the system.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 flex gap-4">
                <span className="text-2xl font-black text-primary shrink-0">{i + 1}</span>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-foreground font-semibold">
            More qualified traffic + better conversion = more opportunities to generate sales.
          </p>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">What You Get</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Free E-Commerce Growth Audit
            </h2>
            <p className="text-muted-foreground">
              This isn't a generic PDF with "improve your website" written 15 different ways.
              We'll look at your actual business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { n: "01", title: "Ad & Traffic Review", desc: "We'll identify opportunities to improve the quality and effectiveness of the traffic you're generating." },
              { n: "02", title: "Conversion Review", desc: "We'll identify where visitors may be dropping off once they reach your store." },
              { n: "03", title: "Priority Recommendations", desc: "We'll show you the changes we'd prioritise first." },
              { n: "04", title: "Growth Strategy", desc: "We'll explain how we'd approach improving both customer acquisition and conversion." },
              { n: "05", title: "Clear Next Steps", desc: "You'll know what you can implement yourself and what we'd recommend having us handle." },
            ].map((item) => (
              <div key={item.n} className="bg-card border border-border rounded-xl p-6">
                <p className="text-primary font-black mb-2">{item.n}</p>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Value */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-widest text-primary mb-3">The Value</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            You Don't Need More Random Clicks.
          </h2>
          <p className="text-muted-foreground mb-8">
            You need more valuable customers from your marketing spend. We help you work on both sides:
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="bg-card border border-border rounded-xl px-6 py-5 font-semibold">
              Get More Of The Right People
            </div>
            <span className="text-primary text-2xl font-black">+</span>
            <div className="bg-card border border-border rounded-xl px-6 py-5 font-semibold">
              Convert More Of Them
            </div>
          </div>
          <p className="mt-8 text-lg font-bold text-primary">
            = More Opportunity To Grow Your E-Commerce Business
          </p>
        </div>
      </section>

      {/* Founder / Credibility */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-4xl grid md:grid-cols-[280px_1fr] gap-8 items-center">
          <img
            src={founderPhoto.url}
            alt="John Ross Snell, founder of Zue Co Media"
            className="w-full max-w-[280px] mx-auto rounded-2xl object-cover border border-border"
            loading="lazy"
          />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              You'll Be Speaking Directly With Me
            </h2>
            <p className="text-muted-foreground mb-4">
              I'm John Ross, founder of Zue Co Media. I personally run the audits — no junior
              account manager, no sales script. I'll look at your ads, your store and your customer
              journey and tell you honestly what I'd fix first.
            </p>
            <p className="text-muted-foreground">
              If I don't think there's a real opportunity to improve your results, I'll tell you that too.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Clients <span className="text-primary">Say</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-xl p-8">
              <img src={link2payLogo} alt="Link2Pay" className="h-20 object-contain mb-4 mx-auto" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <blockquote className="text-muted-foreground mb-4 italic">
                "Working with Zueco Media showed me what real performance marketing looks like. We
                launched with zero brand presence, no previous users, and no existing audience — yet
                within the first 30 days, Zueco Media acquired over 49 new trial users. The campaign
                was data-driven from the start. They tested multiple creatives, refined messaging,
                and optimized our sign-up funnel based on real user behavior."
              </blockquote>
              <p className="font-semibold text-foreground">— Link2Pay Team</p>
              <p className="text-sm text-primary">Ecommerce/SaaS • 49 New Customers in 30 Days</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8">
              <img src={shechemLogo} alt="Shechem Counselling" className="h-20 object-contain mb-4 mx-auto" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <blockquote className="text-muted-foreground mb-4 italic">
                "Within 7 days of launching, we generated 105 leads at an extremely low cost while
                maintaining a strong focus on lead quality. The campaigns achieved a 4.47× return on
                ad spend. Instead of chasing volume, Zueco Media intentionally increased funnel
                friction to ensure only emotionally ready and financially capable leads came through."
              </blockquote>
              <p className="font-semibold text-foreground">— Shechem Counselling</p>
              <p className="text-sm text-primary">Online Business • 4.47× ROAS in 7 Days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-primary text-center mb-3">Who This Is For</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            This Is For South African E-Commerce Businesses That:
          </h2>
          <div className="space-y-3">
            {[
              "Already have a functioning online store",
              "Are getting website traffic or running paid ads",
              "Want more purchases from their marketing",
              "Are willing to invest in improving their customer acquisition",
              "Believe their current marketing could perform better",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-card border border-border rounded-lg p-4">
                <CheckCircle2 size={20} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-muted-foreground text-center">
            This isn't designed for businesses with zero traffic, no validated product or no
            intention of investing in growth. We'd rather tell you that upfront than waste your time.
          </p>
        </div>
      </section>

      {/* Risk Reversal */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Risk Reversal</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              There's Nothing To Lose By Finding Out.
            </h2>
            <p className="text-3xl font-black text-primary mb-4">FREE</p>
            <p className="text-muted-foreground mb-6">
              No upfront payment. No long-term contract. No obligation to work with us.
            </p>
            <p className="text-muted-foreground mb-2">
              We'll show you what we find. If you want to implement the recommendations yourself,
              that's fine. If you want us to help with your ads, conversion optimisation or both,
              we'll explain what that would look like.
            </p>
            <p className="text-foreground font-semibold">
              You make the decision after you've seen the opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section ref={bookingRef} className="py-20 px-4 bg-secondary/30" id="book">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">Booking</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Let's Find Out What's Holding Your <span className="text-primary">E-Commerce Business</span> Back.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              We'll review your traffic, ads, store and customer journey and identify the biggest
              opportunities we see. Book your free 15–30 minute growth audit.
            </p>
            <div className="grid sm:grid-cols-5 gap-3 max-w-4xl mx-auto text-left">
              {[
                "Submit your store URL",
                "Answer a few quick questions",
                "Choose a time",
                "We review your business before the call",
                "We show you what we'd improve first",
              ].map((step, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-3">
                  <p className="text-xs text-primary font-bold mb-1">Step {i + 1}</p>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
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
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary",
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
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="John Smith"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="re-business">Business Name *</Label>
                  <Input
                    id="re-business"
                    value={formData.businessName}
                    onChange={(e) => setFormData((p) => ({ ...p, businessName: e.target.value }))}
                    placeholder="Acme Apparel"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="re-store">Store URL *</Label>
                  <Input
                    id="re-store"
                    value={formData.storeUrl}
                    onChange={(e) => setFormData((p) => ({ ...p, storeUrl: e.target.value }))}
                    placeholder="www.yourstore.co.za"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="re-email">Email Address *</Label>
                  <Input
                    id="re-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
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
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+27 xx xxx xxxx"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <Label>What Best Describes Your Store? *</Label>
                  <Select
                    value={formData.leadType}
                    onValueChange={(v) => setFormData((p) => ({ ...p, leadType: v }))}
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
                    onValueChange={(v) => setFormData((p) => ({ ...p, budget: v }))}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not running ads yet">Not running ads yet</SelectItem>
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
                    What would you most like to improve right now?
                  </Label>
                  <Textarea
                    id="re-goals"
                    value={formData.goals}
                    onChange={(e) => setFormData((p) => ({ ...p, goals: e.target.value }))}
                    placeholder="e.g. Our ads bring traffic but very few people check out..."
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
                    !formData.businessName ||
                    !formData.storeUrl
                  }
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 rounded-xl shadow-lg shadow-primary/25"
                >
                  {isSubmitting ? "Booking..." : "Book My Free Audit"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  No obligation. No pressure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* After Booking */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">After Booking</p>
            <h2 className="text-3xl md:text-4xl font-bold">What Happens On The Call?</h2>
          </div>
          <div className="space-y-4">
            {[
              { title: "We Look At Your Current Acquisition", desc: "Where are your visitors coming from? Are your ads attracting the right people?" },
              { title: "We Look At Your Conversion", desc: "What happens after they arrive? Where could potential customers be dropping off?" },
              { title: "We Identify The Biggest Opportunities", desc: "We'll prioritise the areas we believe could have the greatest impact." },
              { title: "We Show You The Strategy", desc: "We'll explain how we'd approach improving your ads + conversion journey." },
              { title: "You Decide", desc: "If you want to implement it yourself, you'll know where to start. If you'd like us to handle it, we'll explain how we can help." },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 flex gap-4">
                <span className="text-xl font-black text-primary shrink-0">{i + 1}</span>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Stop Thinking You Need More Traffic.
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start finding out if you're getting enough from the traffic you already have.
          </p>
          <Button
            onClick={scrollToBooking}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25 group"
          >
            Get My Free E-Commerce Growth Audit
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-sm text-primary font-medium mt-6">Ads + Conversion + Strategy</p>
          <p className="text-xs text-muted-foreground mt-1">
            Free audit. 15–30 minutes. No obligation.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "Do you only optimise websites?", a: "No. We look at the entire customer acquisition journey, including paid advertising, offers, landing pages, product pages and conversion." },
              { q: "Do you run Facebook and Instagram ads?", a: "Yes. If paid advertising is an appropriate growth channel for your business, we can help develop and optimise campaigns designed to attract more qualified potential customers." },
              { q: "What if my problem is actually my website?", a: "That's exactly what the audit is designed to identify. If your ads are working but your store is leaking conversions, we'll tell you." },
              { q: "What if my problem is my ads?", a: "We'll identify that too. If you're spending money attracting visitors who aren't a good fit, increasing website conversion alone won't solve the problem." },
              { q: "Do I need to be running ads already?", a: "Not necessarily. However, the audit is most valuable when your store is already receiving traffic or you're ready to invest in customer acquisition." },
              { q: "Is the audit really free?", a: "Yes. There is no payment required and no obligation to become a client." },
              { q: "Will you try to sell me something?", a: "We'll explain how we can help if we genuinely believe there's an opportunity. You decide whether you want to take the next step." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
