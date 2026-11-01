import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Ship, User, CreditCard, ArrowRight, ArrowLeft, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { bookingService, scheduleService } from "../services/dataService";

export default function BookTicket({ addToast }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Wizard Steps: 1 = Select Ferry, 2 = Select Seats, 3 = Passenger Details, 4 = Review, 5 = Payment
  const [step, setStep] = useState(1);
  const [selectedFerry, setSelectedFerry] = useState(null);
  const [travelDate, setTravelDate] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [availableFerries, setAvailableFerries] = useState([]);
  
  // Passenger Form State
  const [passengers, setPassengers] = useState([]); // Array of { seat: string, name: string, age: string, gender: string }
  const [contactInfo, setContactInfo] = useState({
    email: "",
    mobile: "",
    emergencyMobile: ""
  });
  const [formErrors, setFormErrors] = useState({});

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState("upi_demo"); // all online methods are simulations
  const [paymentData, setPaymentData] = useState({
    upiId: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [offerCode, setOfferCode] = useState("");

  // Pre-booked seats list to show "already booked" seats
  const bookedSeats = selectedFerry?.bookedSeats || [];
  const seatIds = Array.from(
    { length: selectedFerry?.totalSeats || 0 },
    (_, index) => `S${index + 1}`
  );

  // Auto-detect ferry schedule from router navigation state (if passed from Schedules)
  useEffect(() => {
    if (!location.state?.schedule?.id) return;
    scheduleService.getById(location.state.schedule.id)
      .then((schedule) => {
        setSelectedFerry(schedule);
        setTravelDate(schedule.date);
        setSelectedSeats([]);
        setStep(2);
      })
      .catch((error) => addToast(error.message, "error"));
  }, [location.state, addToast]);

  useEffect(() => {
    if (location.state?.schedule) return;
    scheduleService.search()
      .then(setAvailableFerries)
      .catch((error) => addToast(error.message, "error"));
  }, [location.state, addToast]);

  // Adjust passengers list size dynamically as seats are selected/deselected
  useEffect(() => {
    setPassengers((currentPassengers) =>
      selectedSeats.map((seat) => {
        const existing = currentPassengers.find((passenger) => passenger.seat === seat);
        return existing || { seat, name: "", age: "", gender: "Male" };
      })
    );
  }, [selectedSeats]);

  const handleSelectFerry = async (ferry) => {
    try {
      const schedule = await scheduleService.getById(ferry.id);
      setSelectedFerry(schedule);
      setTravelDate(schedule.date);
      setSelectedSeats([]);
      setStep(2);
    } catch (error) {
      addToast(error.message, "error");
    }
  };

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return; // Can't select already booked seats
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= selectedFerry.seatsAvailable) {
        addToast("No more seats are available on this schedule.", "error");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Passenger Validation
  const validatePassengerDetails = () => {
    const errors = {};
    
    passengers.forEach((p) => {
      if (!p.name.trim()) {
        errors[`name-${p.seat}`] = "Name is required.";
      } else if (p.name.trim().length < 3) {
        errors[`name-${p.seat}`] = "Name must be at least 3 characters.";
      }

      if (!p.age) {
        errors[`age-${p.seat}`] = "Age is required.";
      } else {
        const ageNum = parseInt(p.age);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
          errors[`age-${p.seat}`] = "Enter a valid age (1-120).";
        }
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactInfo.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(contactInfo.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!contactInfo.mobile.trim()) {
      errors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(contactInfo.mobile)) {
      errors.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (!contactInfo.emergencyMobile.trim()) {
      errors.emergencyMobile = "Emergency contact is required.";
    } else if (!/^\d{10}$/.test(contactInfo.emergencyMobile)) {
      errors.emergencyMobile = "Enter a valid 10-digit mobile number.";
    } else if (contactInfo.emergencyMobile === contactInfo.mobile) {
      errors.emergencyMobile = "Emergency number must be different from primary mobile.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePassengerSubmit = (e) => {
    e.preventDefault();
    if (validatePassengerDetails()) {
      setStep(4);
    } else {
      addToast("Please correct the errors in the passenger form.", "error");
    }
  };

  // Pricing Calculations
  const calculateTotal = () => {
    if (!selectedFerry) return { base: 0, tax: 0, serviceCharge: 0, convenienceFee: 0, total: 0 };
    const base = selectedFerry.price * selectedSeats.length;
    const tax = Math.round(base * ((selectedFerry.taxPercent ?? 5) / 100));
    const serviceCharge = selectedFerry.serviceCharge ?? 0;
    const convenienceFee = selectedFerry.convenienceFee ?? 0;
    const discount = Math.round(base * ((selectedFerry.discountPercent ?? 0) / 100));
    return {
      base,
      tax,
      serviceCharge,
      convenienceFee,
      discount,
      total: Math.max(0, base + tax + serviceCharge + convenienceFee - discount)
    };
  };

  const { base, tax, serviceCharge, convenienceFee, total } = calculateTotal();
  const serviceAndConvenienceFee = serviceCharge + convenienceFee;

  // Payment Validation
  const validatePayment = () => {
    const errors = {};
    if (paymentMethod === "upi_demo") {
      if (!paymentData.upiId.trim()) {
        errors.upiId = "UPI ID is required.";
      } else if (!paymentData.upiId.includes("@")) {
        errors.upiId = "Enter a valid UPI ID (e.g. username@bank).";
      }
    } else if (paymentMethod === "card_demo") {
      if (!paymentData.cardName.trim()) {
        errors.cardName = "Cardholder name is required.";
      }
      if (!paymentData.cardNumber.trim()) {
        errors.cardNumber = "Card number is required.";
      } else if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ""))) {
        errors.cardNumber = "Enter a valid 16-digit card number.";
      }
      if (!paymentData.expiry.trim()) {
        errors.expiry = "Expiry date is required.";
      } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiry)) {
        errors.expiry = "Use MM/YY format.";
      }
      if (!paymentData.cvv.trim()) {
        errors.cvv = "CVV is required.";
      } else if (!/^\d{3}$/.test(paymentData.cvv)) {
        errors.cvv = "CVV must be 3 digits.";
      }
    }
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (paymentMethod !== "counter_demo" && paymentMethod !== "netbanking_demo" && !validatePayment()) {
      addToast("Please fill in the required payment fields correctly.", "error");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const pendingBooking = await bookingService.create({
        scheduleId: selectedFerry.id,
        passengers: passengers.map((passenger) => ({
          name: passenger.name,
          age: Number(passenger.age),
          gender: passenger.gender,
          seatNumber: passenger.seat
        })),
        contactName: passengers[0]?.name,
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.mobile,
        selectedSeats,
        offerCode: offerCode.trim() || undefined
      });
      const confirmedBooking = await bookingService.payDemo({
        bookingId: pendingBooking.bookingId,
        paymentResult: "success",
        paymentMethod
      });
      addToast("Payment successful! Your ticket is confirmed.", "success");
      navigate("/confirmation", { state: { booking: confirmedBooking } });
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Step renderer utility
  const stepsList = [
    { num: 1, label: "Select Vessel" },
    { num: 2, label: "Select Seats" },
    { num: 3, label: "Details" },
    { num: 4, label: "Review" },
    { num: 5, label: "Payment" }
  ];

  return (
    <div className="flex-1 bg-slate-50 pt-24 pb-20">
      {/* Loading Overlay for Payment */}
      <AnimatePresence>
        {isProcessingPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white"
          >
            <div className="relative w-20 h-20 mb-6">
              <svg className="animate-spin w-full h-full text-aqua-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <Ship className="w-8 h-8 text-white absolute inset-0 m-auto animate-bounce" />
            </div>
            <h2 className="text-xl font-bold tracking-wide">Processing Dummy Payment...</h2>
            <p className="text-sm text-slate-300 mt-2">Connecting to mock gateways. Please do not close this tab.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6 mb-8 text-center">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            {stepsList.map((s, index) => (
              <div key={s.num} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5 relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${
                      step >= s.num
                        ? "bg-ocean-600 border-ocean-600 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span className="text-[9px] sm:text-xs font-bold text-slate-500 hidden sm:block whitespace-nowrap">
                    {s.label}
                  </span>
                </div>
                {index < stepsList.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 bg-slate-100 relative">
                    <div
                      className="absolute left-0 top-0 h-full bg-ocean-600 transition-all duration-500"
                      style={{ width: step > s.num ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Select Ferry */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left">
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Select a Ferry Route</h2>
            <p className="text-xs text-slate-400 mb-6">Choose a ferry from our schedule directory to begin seat selection.</p>
            <div className="grid grid-cols-1 gap-4">
              {availableFerries.map((ferry) => (
                <div
                  key={ferry.id}
                  onClick={() => handleSelectFerry(ferry)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-ocean-500 hover:bg-ocean-50/10 transition-all duration-200 cursor-pointer flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-ocean-600">
                      <Ship className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{ferry.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{ferry.from} ➔ {ferry.to}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="block text-sm font-extrabold text-slate-800">₹{ferry.price}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">{ferry.type}</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-ocean-500 group-hover:text-white text-slate-400 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Select Seats */}
        {step === 2 && selectedFerry && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            {/* Seat selection panel */}
            <div className="md:col-span-8 bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col items-center">
              <h2 className="text-xl font-extrabold text-slate-900 self-start mb-2">Select Your Seats</h2>
              <p className="text-xs text-slate-400 self-start mb-8">Select one or more seats in the deck floor plan below.</p>
              
              {/* Ferry Deck Visual Container */}
              <div className="w-full max-w-sm border border-slate-200 rounded-3xl p-6 bg-slate-50/50 flex flex-col items-center relative overflow-hidden">
                <div className="w-full h-8 bg-ocean-500 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center uppercase tracking-wider mb-8 shadow-sm">
                  Deck Front / Captain's Cabin
                </div>

                {/* Capacity-based Seat Grid */}
                <div className="grid grid-cols-4 gap-3 w-full max-h-[430px] overflow-y-auto pr-1">
                  {seatIds.map((seatId) => {
                    const isBooked = bookedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        disabled={isBooked}
                        onClick={() => handleSeatClick(seatId)}
                        className={`h-10 rounded-xl font-semibold text-xs border flex items-center justify-center transition-all cursor-pointer ${
                          isBooked
                            ? "bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-gradient-to-br from-ocean-600 to-ocean-500 border-ocean-600 text-white shadow-md shadow-ocean-100"
                            : "bg-white border-slate-200 hover:border-ocean-500 hover:text-ocean-600 text-slate-700"
                        }`}
                      >
                        {seatId}
                      </button>
                    );
                  })}
                </div>

                <div className="w-full h-4 border-t-2 border-dashed border-slate-200 mt-8 mb-4" />

                {/* Seat Legends */}
                <div className="flex justify-between items-center w-full max-w-[280px] text-xs font-semibold text-slate-500 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 border border-slate-200 bg-white rounded-md" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-ocean-500 rounded-md" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-slate-200 rounded-md" />
                    <span>Booked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Breakdown sidebar */}
            <div className="md:col-span-4 bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="pb-4 mb-4 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-sm">Ferry Details</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-ocean-600 mt-2">
                    <Ship className="w-4 h-4" />
                    {selectedFerry.name}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{selectedFerry.from} to {selectedFerry.to}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{selectedFerry.departure}</p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Fare per Seat</span>
                    <span className="font-bold text-slate-800">₹{selectedFerry.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats Selected</span>
                    <span className="font-bold text-slate-800">
                      {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-50">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800">₹{base}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="font-bold text-slate-800">₹{tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service &amp; convenience fee</span>
                    <span className="font-bold text-slate-800">₹{serviceAndConvenienceFee}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500">Total Amount</span>
                  <span className="text-2xl font-black text-ocean-600 leading-none">₹{total}</span>
                </div>

                <Button
                  onClick={() => setStep(3)}
                  disabled={selectedSeats.length === 0}
                  className="w-full py-3"
                >
                  Confirm Seats
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Passenger Details */}
        {step === 3 && selectedFerry && (
          <form onSubmit={handlePassengerSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Passenger Details</h2>
            <p className="text-xs text-slate-400 mb-6">Provide traveler profile records matching government identity IDs.</p>
            
            {/* Dynamic passenger fields for each selected seat */}
            <div className="space-y-6">
              {passengers.map((passenger, index) => (
                <div key={`p-form-${passenger.seat}`} className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/60 relative">
                  <span className="absolute top-4 right-4 bg-ocean-50 text-ocean-700 text-xs font-bold px-3 py-1 rounded-full border border-ocean-100">
                    Seat: {passenger.seat}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-700 mb-4 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-ocean-500" />
                    Traveler {index + 1}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Name */}
                    <div className="md:col-span-6">
                      <InputField
                        label="Full Name"
                        name={`name-${passenger.seat}`}
                        value={passenger.name}
                        placeholder="Enter Passenger Name"
                        error={formErrors[`name-${passenger.seat}`]}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[index].name = e.target.value;
                          setPassengers(updated);
                          if (formErrors[`name-${passenger.seat}`]) {
                            setFormErrors({ ...formErrors, [`name-${passenger.seat}`]: "" });
                          }
                        }}
                      />
                    </div>
                    {/* Age */}
                    <div className="md:col-span-3">
                      <InputField
                        label="Age"
                        name={`age-${passenger.seat}`}
                        type="number"
                        min="1"
                        max="120"
                        value={passenger.age}
                        placeholder="Age"
                        error={formErrors[`age-${passenger.seat}`]}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[index].age = e.target.value;
                          setPassengers(updated);
                          if (formErrors[`age-${passenger.seat}`]) {
                            setFormErrors({ ...formErrors, [`age-${passenger.seat}`]: "" });
                          }
                        }}
                      />
                    </div>
                    {/* Gender */}
                    <div className="md:col-span-3 flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gender</label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => {
                          const updated = [...passengers];
                          updated[index].gender = e.target.value;
                          setPassengers(updated);
                        }}
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-ocean-500 text-sm font-medium cursor-pointer"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Email */}
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={contactInfo.email}
                    placeholder="name@email.com"
                    error={formErrors.email}
                    onChange={(e) => {
                      setContactInfo({ ...contactInfo, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                    }}
                  />
                  {/* Mobile */}
                  <InputField
                    label="Mobile Number"
                    name="mobile"
                    type="tel"
                    value={contactInfo.mobile}
                    placeholder="10-digit number"
                    error={formErrors.mobile}
                    onChange={(e) => {
                      setContactInfo({ ...contactInfo, mobile: e.target.value });
                      if (formErrors.mobile) setFormErrors({ ...formErrors, mobile: "" });
                    }}
                  />
                  {/* Emergency Contact */}
                  <InputField
                    label="Emergency Mobile"
                    name="emergencyMobile"
                    type="tel"
                    value={contactInfo.emergencyMobile}
                    placeholder="Emergency Contact"
                    error={formErrors.emergencyMobile}
                    onChange={(e) => {
                      setContactInfo({ ...contactInfo, emergencyMobile: e.target.value });
                      if (formErrors.emergencyMobile) setFormErrors({ ...formErrors, emergencyMobile: "" });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 mt-10 pt-6 border-t border-slate-100">
              <Button onClick={() => setStep(2)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Seat Selection
              </Button>
              <Button type="submit" variant="primary">
                Review Booking
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 4: Review Booking */}
        {step === 4 && selectedFerry && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left">
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Review Your Booking</h2>
            <p className="text-xs text-slate-400 mb-6">Please double check your travel itinerary and passengers before proceeding to payment.</p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Review Itinerary Details */}
              <div className="md:col-span-8 space-y-6">
                
                {/* Ferry Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                    <Ship className="w-4 h-4 text-ocean-600" />
                    Vessel Journey Details
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                      <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Ferry Name</span>
                      <span className="text-slate-800 font-bold text-sm">{selectedFerry.name}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Ferry Type</span>
                      <span className="text-slate-800 font-bold text-sm">{selectedFerry.type}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Route Route</span>
                      <span className="text-slate-800 font-bold">{selectedFerry.from} to {selectedFerry.to}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Travel Date</span>
                      <span className="text-slate-800 font-bold">{travelDate}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Departure Time</span>
                      <span className="text-slate-800 font-bold">{selectedFerry.departure}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Selected Seats</span>
                      <span className="text-slate-800 font-bold">{selectedSeats.join(", ")}</span>
                    </div>
                  </div>
                </div>

                {/* Passenger Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                    <Users className="w-4 h-4 text-ocean-600" />
                    Passenger Roster
                  </h3>
                  <div className="space-y-3">
                    {passengers.map((p, idx) => (
                      <div key={`review-p-${idx}`} className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/40 last:border-b-0 last:pb-0">
                        <div>
                          <span className="font-bold text-slate-800">{p.name}</span>
                          <span className="text-slate-500 ml-2">({p.gender}, {p.age} yrs)</span>
                        </div>
                        <span className="font-bold bg-white text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200 text-[10px]">
                          Seat: {p.seat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Contact */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
                    <User className="w-4 h-4 text-ocean-600" />
                    Billing & Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="block text-slate-400 font-semibold text-[10px] uppercase">Email</span>
                      <span className="text-slate-800 font-bold">{contactInfo.email}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold text-[10px] uppercase">Primary Mobile</span>
                      <span className="text-slate-800 font-bold">{contactInfo.mobile}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-semibold text-[10px] uppercase">Emergency Mobile</span>
                      <span className="text-slate-800 font-bold">{contactInfo.emergencyMobile}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Price Calculation sidebar */}
              <div className="md:col-span-4 bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm mb-4">Pricing Invoice</h3>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Base Fare ({selectedSeats.length} seats)</span>
                      <span className="font-bold text-slate-800">₹{base}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%)</span>
                      <span className="font-bold text-slate-800">₹{tax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service &amp; convenience fee</span>
                      <span className="font-bold text-slate-800">₹{serviceAndConvenienceFee}</span>
                    </div>
                    <div className="border-t border-slate-100 my-2 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                      <span>Grand Total</span>
                      <span className="text-ocean-600 text-lg font-black">₹{total}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Promotional offer code
                  </label>
                  <input
                    value={offerCode}
                    onChange={(event) => setOfferCode(event.target.value.toUpperCase())}
                    placeholder="Optional offer code"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold uppercase focus:outline-none focus:border-ocean-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    The server validates the offer and calculates the final discount during checkout.
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-2">
                  <Button onClick={() => setStep(5)} variant="primary" className="w-full py-3">
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button onClick={() => setStep(3)} variant="outline" className="w-full py-3">
                    Back to Passengers
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 5: Dummy Payment */}
        {step === 5 && selectedFerry && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left">
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Secure Online Payment</h2>
            <p className="text-xs text-slate-400 mb-6">Complete mock checkout. No real money or transactions are carried out.</p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Payment details panel */}
              <form onSubmit={handlePayNow} className="md:col-span-8 space-y-6">
                
                {/* Payment Selection tabs */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("upi_demo");
                      setPaymentErrors({});
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      paymentMethod === "upi_demo"
                        ? "bg-ocean-50 border-ocean-200 text-ocean-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    UPI (Demo)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("card_demo");
                      setPaymentErrors({});
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      paymentMethod === "card_demo"
                        ? "bg-ocean-50 border-ocean-200 text-ocean-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Card (Dummy)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("netbanking_demo");
                      setPaymentErrors({});
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      paymentMethod === "netbanking_demo"
                        ? "bg-ocean-50 border-ocean-200 text-ocean-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Net Banking
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("counter_demo");
                      setPaymentErrors({});
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      paymentMethod === "counter_demo"
                        ? "bg-ocean-50 border-ocean-200 text-ocean-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Cash at Counter
                  </button>
                </div>

                {/* UPI Fields */}
                {paymentMethod === "upi_demo" && (
                  <div className="space-y-4">
                    <InputField
                      label="UPI ID"
                      name="upiId"
                      value={paymentData.upiId}
                      placeholder="e.g. name@paytm / name@okaxis"
                      error={paymentErrors.upiId}
                      onChange={(e) => {
                        setPaymentData({ ...paymentData, upiId: e.target.value });
                        if (paymentErrors.upiId) setPaymentErrors({ ...paymentErrors, upiId: "" });
                      }}
                    />
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Demo only: entering a UPI ID will not send a collect request or move money. Real UPI requires a configured payment provider.
                    </p>
                  </div>
                )}

                {/* Credit Card Fields */}
                {paymentMethod === "card_demo" && (
                  <div className="space-y-4">
                    <InputField
                      label="Cardholder Name"
                      name="cardName"
                      value={paymentData.cardName}
                      placeholder="Name written on card front"
                      error={paymentErrors.cardName}
                      onChange={(e) => {
                        setPaymentData({ ...paymentData, cardName: e.target.value });
                        if (paymentErrors.cardName) setPaymentErrors({ ...paymentErrors, cardName: "" });
                      }}
                    />
                    
                    <InputField
                      label="Card Number"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength="16"
                      error={paymentErrors.cardNumber}
                      onChange={(e) => {
                        setPaymentData({ ...paymentData, cardNumber: e.target.value.replace(/\D/g, "") });
                        if (paymentErrors.cardNumber) setPaymentErrors({ ...paymentErrors, cardNumber: "" });
                      }}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Expiry Date"
                        name="expiry"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={paymentData.expiry}
                        error={paymentErrors.expiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 2) {
                            val = val.substring(0, 2) + "/" + val.substring(2, 4);
                          }
                          setPaymentData({ ...paymentData, expiry: val });
                          if (paymentErrors.expiry) setPaymentErrors({ ...paymentErrors, expiry: "" });
                        }}
                      />
                      <InputField
                        label="CVV"
                        name="cvv"
                        type="password"
                        placeholder="123"
                        maxLength="3"
                        value={paymentData.cvv}
                        error={paymentErrors.cvv}
                        onChange={(e) => {
                          setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, "") });
                          if (paymentErrors.cvv) setPaymentErrors({ ...paymentErrors, cvv: "" });
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Net Banking Fields */}
                {paymentMethod === "netbanking_demo" && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Popular Banks</label>
                    <select className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-ocean-500 text-sm font-medium cursor-pointer">
                      <option>State Bank of India (SBI)</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {/* Cash at Counter Fields */}
                {paymentMethod === "counter_demo" && (
                  <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl text-amber-900 text-xs leading-relaxed font-medium">
                    <h4 className="font-extrabold text-amber-800 mb-1.5">Cash Reservation Notice</h4>
                    Your seat will be reserved tentatively. You must check-in and complete physical cash payment at the port terminal ticketing desk at least 45 minutes prior to vessel departure to secure boarding passes.
                  </div>
                )}

                {/* College Project Disclaimer */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="disclaimer-check"
                    className="w-4 h-4 rounded mt-0.5 border-slate-300 text-ocean-600 focus:ring-ocean-500 cursor-pointer"
                  />
                  <label htmlFor="disclaimer-check" className="text-[11px] text-slate-500 font-semibold leading-relaxed cursor-pointer select-none">
                    <span className="text-ocean-600 font-extrabold block mb-0.5">COLLEGE DEMO DISCLAIMER</span>
                    I understand that this is a simulated payment system built for educational college project evaluations. No actual funds will be debited or transferred, and no real travel boarding pass will be dispatched.
                  </label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <Button onClick={() => setStep(4)} variant="outline" className="flex-1 py-3">
                    Back to Review
                  </Button>
                  <Button type="submit" variant="success" className="flex-1 py-3">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₹{total} Now
                  </Button>
                </div>
              </form>

              {/* Price Invoice sidebar */}
              <div className="md:col-span-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-6 self-start space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm">Payment Details</h3>
                
                <div className="space-y-2 text-xs text-slate-600 border-b border-slate-200 pb-3">
                  <div className="flex justify-between">
                    <span>Ferry</span>
                    <span className="font-bold text-slate-800">{selectedFerry.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span className="font-bold text-slate-800">{travelDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats ({selectedSeats.length})</span>
                    <span className="font-bold text-slate-800">{selectedSeats.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base fare</span>
                    <span className="font-bold text-slate-800">₹{base}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="font-bold text-slate-800">₹{tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service &amp; convenience fee</span>
                    <span className="font-bold text-slate-800">₹{serviceAndConvenienceFee}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Payable amount</span>
                  <span className="text-xl font-black text-ocean-600">₹{total}</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
