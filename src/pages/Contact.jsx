import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, Compass } from "lucide-react";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { contactService } from "../services/dataService";

export default function Contact({ addToast }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: ""
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const err = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      err.name = "Full name is required.";
    } else if (formData.name.trim().length < 3) {
      err.name = "Name must be at least 3 characters.";
    }

    if (!formData.email.trim()) {
      err.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      err.email = "Enter a valid email address.";
    }

    if (!formData.mobile.trim()) {
      err.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      err.mobile = "Enter a valid 10-digit number.";
    }

    if (!formData.subject.trim()) {
      err.subject = "Subject is required.";
    }

    if (!formData.message.trim()) {
      err.message = "Message content is required.";
    } else if (formData.message.trim().length < 10) {
      err.message = "Message must be at least 10 characters long.";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await contactService.submit({
          name: formData.name,
          email: formData.email,
          phone: formData.mobile,
          subject: formData.subject,
          message: formData.message
        });
        addToast("Your inquiry has been submitted. We will contact you soon!", "success");
        setFormData({ name: "", email: "", mobile: "", subject: "", message: "" });
        setErrors({});
      } catch (error) {
        addToast(error.message, "error");
      }
    } else {
      addToast("Please fill in the required contact fields correctly.", "error");
    }
  };

  return (
    <div className="flex-1 bg-slate-50 pt-28 pb-20 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact Us</h1>
          <p className="text-sm text-slate-500 mt-1">
            Get in touch with our coastal support centre or leave us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Contact Details & Map */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Support Directory */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3 mb-2">Support Centre</h3>
              
              <div className="flex items-start gap-3.5 text-xs text-slate-600">
                <MapPin className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-700">Office Location</span>
                  <span className="block mt-1 leading-relaxed">FerryPort Support Centre, Gateway Boulevard, Mumbai, Maharashtra, India</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-slate-600">
                <Phone className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-700">Telephone Contact</span>
                  <span className="block mt-1">+91 98765 43210</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-slate-600">
                <Mail className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-700">Email Address</span>
                  <a href="mailto:support@ferryport.demo" className="block mt-1 hover:text-ocean-600 transition-colors">
                    support@ferryport.demo
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-slate-600">
                <Clock className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-700">Operating Hours</span>
                  <span className="block mt-1">Monday to Saturday: 9:00 AM - 6:00 PM</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">(Sundays and National Holidays Closed)</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Coastal Radar Map Placeholder */}
            <div className="bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-800 text-center relative overflow-hidden h-[240px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-aqua-600/5 rounded-full blur-2xl" />
              
              <div className="flex justify-between items-center text-white/80 z-10">
                <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-aqua-400 animate-spin" style={{ animationDuration: "10s" }} />
                  COASTAL CORRIDOR RADAR
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Vector Grid & Routes representation */}
              <div className="flex-1 w-full flex items-center justify-center relative mt-2 opacity-80">
                <svg className="w-full h-full max-h-[140px] text-slate-700" viewBox="0 0 200 100">
                  {/* Grid lines */}
                  <line x1="0" y1="25" x2="200" y2="25" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="75" x2="200" y2="75" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="100" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="150" y1="0" x2="150" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                  
                  {/* Radials */}
                  <circle cx="100" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="100" cy="50" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />

                  {/* Route Paths */}
                  <path d="M 40 80 Q 70 50 110 30" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4,2" className="animate-pulse" />
                  <path d="M 110 30 Q 150 40 170 70" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4,2" />

                  {/* Coastal Glowing Nodes */}
                  <circle cx="40" cy="80" r="3" fill="#34d399" />
                  <text x="35" y="92" fill="#94a3b8" fontSize="6" fontWeight="bold">Mumbai</text>
                  
                  <circle cx="110" cy="30" r="3" fill="#34d399" />
                  <text x="100" y="24" fill="#94a3b8" fontSize="6" fontWeight="bold">Goa</text>

                  <circle cx="170" cy="70" r="3" fill="#38bdf8" />
                  <text x="160" y="80" fill="#94a3b8" fontSize="6" fontWeight="bold">Kochi</text>
                </svg>
              </div>

              <span className="text-[9px] text-slate-500 font-semibold block z-10">
                Interactive simulator map representing western seaboards (Mumbai ↔ Goa ↔ Kochi).
              </span>
            </div>

          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3 mb-6">Send Message</h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <InputField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    placeholder="Enter Name"
                    error={errors.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  
                  {/* Mobile */}
                  <InputField
                    label="Mobile Number"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    placeholder="10-digit number"
                    error={errors.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                {/* Email */}
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  placeholder="name@email.com"
                  error={errors.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                {/* Subject */}
                <InputField
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  placeholder="Reason for contact"
                  error={errors.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />

                {/* Message */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Message Content</label>
                  <textarea
                    rows="4"
                    value={formData.message}
                    placeholder="Type your inquiries here..."
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border bg-white/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                      errors.message
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                        : "border-slate-200 focus:border-ocean-500 focus:ring-ocean-100"
                    }`}
                  />
                  {errors.message && <span className="text-xs text-rose-600 font-medium pl-1">{errors.message}</span>}
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" className="w-full sm:w-auto py-3">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
