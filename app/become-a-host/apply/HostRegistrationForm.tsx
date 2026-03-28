"use client";

import { useState, useEffect } from "react";
import { submitHostApplication } from "@/app/actions/host";
import { useRouter } from "next/navigation";

const AMENITIES = [
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "pool", label: "Pool", icon: "🏊" },
  { id: "tv", label: "TV", icon: "📺" },
  { id: "ac", label: "Air Conditioning", icon: "❄️" },
  { id: "parking", label: "Free Parking", icon: "🚗" },
  { id: "workspace", label: "Workspace", icon: "💻" },
  { id: "gym", label: "Gym", icon: "🏋️" },
];

const PROPERTY_TYPES = [
  { id: "apartment", label: "Apartment", icon: "🏢", desc: "A rented place within a multi-unit building" },
  { id: "hotel", label: "Hotel", icon: "🏨", desc: "A business offering private rooms" },
  { id: "resort", label: "Resort", icon: "🌴", desc: "A luxury facility perfect for vacations" },
  { id: "tour", label: "Tour", icon: "🗺️", desc: "An experience or guided trip" },
];

interface RegistrationData {
  // Personal Info
  fullName: string;
  phone: string;
  experience: string;
  // Property Info
  type: string;
  city: string;
  country: string;
  title: string;
  description: string;
  maxGuests: string;
  beds: string;
  baths: string;
  price: string;
  amenities: string[];
  duration?: string;
}

const DEFAULT_DATA: RegistrationData = {
  fullName: "",
  phone: "",
  experience: "",
  type: "apartment",
  city: "",
  country: "",
  title: "",
  description: "",
  maxGuests: "2",
  beds: "1",
  baths: "1",
  price: "",
  amenities: [],
  duration: "",
};

export default function HostRegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 7; // Added one step for personal info
  
  const [data, setData] = useState<RegistrationData>(DEFAULT_DATA);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateData = (field: keyof RegistrationData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMsg("");
    if (step > 1) setStep(step - 1);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "amenities") {
        (value as string[]).forEach((item) => formData.append("amenities", item));
      } else {
        formData.append(key, value as string);
      }
    });

    if (images.length === 0) {
      setErrorMsg("Please upload at least one image for your property.");
      setIsSubmitting(false);
      return;
    }

    images.forEach((file) => formData.append("images", file));

    const result = await submitHostApplication(formData);
    
    if (result && "error" in result) {
      setErrorMsg(result.error as string);
      setIsSubmitting(false);
    } else {
      router.push("/become-a-host");
      router.refresh();
    }
  };

  const canProceed = () => {
    if (step === 1) return !!data.fullName && !!data.phone;
    if (step === 2) return !!data.type;
    if (step === 3) return !!data.city && !!data.country;
    if (step === 4) return !!data.title && !!data.description && !!data.maxGuests;
    if (step === 5) return images.length > 0;
    if (step === 6) return !!data.price && Number(data.price) > 0;
    return true;
  };

  if (!isMounted) return null;

  return (
    <div className="neo-card p-6 md:p-10 rounded-[40px] max-w-4xl mx-auto min-h-[600px] flex flex-col relative bg-white/80 backdrop-blur-xl">
      
      {/* Progress Bar & Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 text-sm font-bold text-[#a0aec0] uppercase tracking-widest">
          <span>Step {step} of {totalSteps}</span>
          <span className="text-[#d32f2f] font-black">
            {step === 1 && "Personal Information"}
            {step === 2 && "Property Type"}
            {step === 3 && "Location"}
            {step === 4 && "Property Details"}
            {step === 5 && "Images"}
            {step === 6 && "Pricing"}
            {step === 7 && "Final Review"}
          </span>
        </div>
        <div className="w-full h-3 bg-[#e2e8f0] rounded-full overflow-hidden shadow-inner flex">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className="flex-1 h-full px-[1px]">
              <div 
                className={`w-full h-full transition-all duration-500 rounded-full ${i + 1 <= step ? "bg-gradient-to-r from-[#d32f2f] to-[#8bc1c1]" : "bg-transparent"}`}
              />
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold shadow-sm animate-shake">
          {errorMsg}
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div>
              <h2 className="text-4xl font-black text-[#1a202c] mb-3 tracking-tight">Tell us about yourself</h2>
              <p className="text-[#718096] font-medium text-lg">We use this information to verify your identity and experience as a host.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#a0aec0] mb-3">Full Business Name / Personal Name</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => updateData("fullName", e.target.value)}
                  placeholder="e.g. John Doe"
                  className="neo-inset w-full p-5 rounded-2xl text-lg font-bold text-[#1a202c] focus:outline-none focus:ring-4 focus:ring-[#d32f2f]/10 transition-all"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#a0aec0] mb-3">Phone Number</label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => updateData("phone", e.target.value)}
                    placeholder="e.g. +880 17XXXXXXXX"
                    className="neo-inset w-full p-5 rounded-2xl text-lg font-bold text-[#1a202c] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#a0aec0] mb-3">Hosting Experience (Optional)</label>
                  <select
                    value={data.experience}
                    onChange={(e) => updateData("experience", e.target.value)}
                    className="neo-inset w-full p-5 rounded-2xl text-lg font-bold text-[#1a202c] focus:outline-none transition-all appearance-none"
                  >
                    <option value="">Select Level</option>
                    <option value="new">New to hosting</option>
                    <option value="experienced">Have some experience</option>
                    <option value="pro">Professional property manager</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Property Type (from AddListingForm) */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-black text-[#1a202c] mb-2 tracking-tight">What kind of place will you host?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {PROPERTY_TYPES.map((pt) => {
                const isSelected = data.type === pt.id;
                return (
                  <div
                    key={pt.id}
                    onClick={() => updateData("type", pt.id)}
                    className={`cursor-pointer neo-card p-6 rounded-3xl transition-all duration-300 transform active:scale-95 ${
                      isSelected 
                        ? "shadow-[inset_4px_4px_10px_rgba(163,177,198,0.5),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] border-2 border-[#d32f2f]" 
                        : "hover:-translate-y-1 hover:border-[#cbd5e0] border-2 border-transparent"
                    }`}
                  >
                    <div className="text-4xl mb-4">{pt.icon}</div>
                    <h3 className={`text-xl font-bold mb-1 ${isSelected ? "text-[#d32f2f]" : "text-[#1a202c]"}`}>{pt.label}</h3>
                    <p className="text-sm text-[#718096] font-medium">{pt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-6 max-w-2xl mx-auto w-full animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-black text-[#1a202c] mb-2 tracking-tight">Where's your place located?</h2>
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  value={data.country}
                  onChange={(e) => updateData("country", e.target.value)}
                  placeholder="Country (e.g. Bangladesh)"
                  className="neo-inset w-full p-5 rounded-2xl text-lg font-bold text-[#2a6b78] focus:outline-none transition-all"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => updateData("city", e.target.value)}
                  placeholder="City / Area (e.g. Sylhet)"
                  className="neo-inset w-full p-5 rounded-2xl text-lg font-bold text-[#2a6b78] focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Property Details */}
        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div className="grid md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateData("title", e.target.value)}
                  placeholder="Listing Title"
                  className="neo-inset w-full p-4 rounded-2xl text-md font-bold text-[#1a202c] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <textarea
                  value={data.description}
                  onChange={(e) => updateData("description", e.target.value)}
                  placeholder="Describe your property..."
                  rows={3}
                  className="neo-inset w-full p-4 rounded-2xl text-md font-medium text-[#4a5568] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="neo-card p-4 rounded-2xl text-center">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#a0aec0] mb-2">Guests</label>
                <input
                  type="number"
                  min="1"
                  value={data.maxGuests}
                  onChange={(e) => updateData("maxGuests", e.target.value)}
                  className="neo-inset w-full p-3 rounded-xl text-lg font-black text-[#d32f2f] text-center focus:outline-none"
                />
              </div>
              <div className="neo-card p-4 rounded-2xl text-center">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#a0aec0] mb-2">Beds</label>
                <input
                  type="number"
                  min="1"
                  value={data.beds}
                  onChange={(e) => updateData("beds", e.target.value)}
                  className="neo-inset w-full p-3 rounded-xl text-lg font-black text-[#d32f2f] text-center focus:outline-none"
                />
              </div>
              <div className="neo-card p-4 rounded-2xl text-center">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#a0aec0] mb-2">Baths</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={data.baths}
                  onChange={(e) => updateData("baths", e.target.value)}
                  className="neo-inset w-full p-3 rounded-xl text-lg font-black text-[#d32f2f] text-center focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AMENITIES.map((item) => {
                const isChecked = data.amenities.includes(item.label);
                return (
                  <label key={item.id} className="cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) updateData("amenities", [...data.amenities, item.label]);
                        else updateData("amenities", data.amenities.filter((a) => a !== item.label));
                      }}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-2xl text-center transition-all ${
                      isChecked 
                        ? "neo-inset bg-[#f8f9fa] border border-[#d32f2f]/20" 
                        : "neo-card hover:shadow-inner bg-transparent"
                    }`}>
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className={`text-[10px] font-black uppercase ${isChecked ? "text-[#d32f2f]" : "text-[#718096]"}`}>{item.label}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Images */}
        {step === 5 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-black text-[#1a202c] mb-2 tracking-tight">Upload property photos</h2>
            <div className="neo-inset rounded-[32px] p-12 text-center border-2 border-dashed border-[#cbd5e0] hover:border-[#d32f2f] transition-colors relative">
              <span className="text-6xl mb-4 block">📸</span>
              <label className="cursor-pointer neo-btn px-8 py-4 rounded-full text-sm font-black inline-block shadow-sm">
                <span>Select Photos</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative aspect-square neo-card rounded-2xl overflow-hidden group">
                    <img src={src} alt="preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 6: Pricing */}
        {step === 6 && (
          <div className="space-y-6 max-w-md mx-auto text-center animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-black text-[#1a202c] mb-12 tracking-tight">Set your nightly price</h2>
            <div className="relative flex justify-center items-baseline">
              <span className="text-5xl font-black text-[#2a6b78] mr-2">৳</span>
              <input
                type="number"
                value={data.price}
                onChange={(e) => updateData("price", e.target.value)}
                placeholder="0"
                className="neo-inset w-full py-6 bg-transparent text-7xl font-black text-[#d32f2f] text-center rounded-[32px] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 7: Final Review */}
        {step === 7 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <div>
              <h2 className="text-3xl font-black text-[#1a202c] mb-2 tracking-tight">One last check!</h2>
              <p className="text-[#718096] font-medium">Review your application details. Once submitted, our team will review it.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="neo-card p-6 rounded-3xl bg-gray-50/50">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#a0aec0] mb-4">Applicant Profile</h3>
                <div className="space-y-3">
                  <p className="font-black text-xl text-[#1a202c]">{data.fullName}</p>
                  <p className="font-bold text-[#718096]">📞 {data.phone}</p>
                  <p className="font-medium text-[#718096]">Hosting Level: <span className="text-[#d32f2f] font-bold uppercase">{data.experience || "New"}</span></p>
                </div>
              </div>

              <div className="neo-card p-6 rounded-3xl bg-gray-50/50">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#a0aec0] mb-4">First Listing Preview</h3>
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shadow-inner flex-shrink-0">
                    {imagePreviews[0] && <img src={imagePreviews[0]} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-bold text-[#1a202c] line-clamp-1">{data.title}</p>
                    <p className="text-xs font-bold text-[#718096] uppercase">{data.city}, {data.type}</p>
                    <p className="text-sm font-black text-[#d32f2f] mt-1">৳{data.price} / night</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
              <span className="text-3xl">📝</span>
              <p className="text-sm text-amber-800 font-medium leading-relaxed">
                <strong>Manual Review Process:</strong> Your application will be reviewed by our administrators. If approved, your account will be upgraded to Host status and this listing will go live automatically.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-6 border-t border-[#e2e8f0]/50 flex justify-between items-center">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1 || isSubmitting}
          className="neo-btn px-8 py-3 rounded-full text-sm font-black text-[#718096] disabled:opacity-30 transition-all"
        >
          ← Back
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="neo-btn px-12 py-4 rounded-full text-sm font-black text-white disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(211,47,47,0.3)] hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg, #d32f2f, #a12c2c)" }}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !canProceed()}
            className="neo-btn px-12 py-4 rounded-full text-sm font-black text-white disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(67,233,123,0.3)] flex items-center gap-2 hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)" }}
          >
            {isSubmitting ? "Submitting..." : "Submit Application 🚀"}
          </button>
        )}
      </div>
    </div>
  );
}
