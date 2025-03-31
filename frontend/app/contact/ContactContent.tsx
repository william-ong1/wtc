"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";

// Contact form component
const ContactContent = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/send-contact-email/`;
      const response = await axios.post(backendUrl, {
        name,
        email,
        message
      });

      if (response.data.success) {
        setSubmitSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        throw new Error(response.data.error || 'Failed to send message');
      }
    } catch (error) {
      setSubmitError("Failed to send your message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col flex-1 w-full max-w-5xl px-6 py-4 mb-8 lg:py-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="relative mb-6 md:mb-4">
          <h1 className="text-2xl font-bold text-custom-blue mb-0 md:mb-0 text-left">Contact Us</h1>
          <div className="absolute -bottom-2 left-0 w-20 h-0.5 bg-gradient-to-r from-custom-blue to-custom-blue/30 rounded-full"></div>
        </div>
      </div>

      <p className="text-gray-300 leading-relaxed mb-2 text-left text-sm md:text-base">
        Bugs? Suggestions? Feedback? We'd love to hear from you! Please fill out the form below.
      </p>

      <p className="text-gray-500 leading-relaxed mb-6 text-left text-xs md:text-sm">
        Note: If you include your email, we can get back to you directly. However, we will take everything into consideration. Thank you!
      </p>

      {submitSuccess ? (
        <div className="bg-gray-950/90 backdrop-blur-sm border border-gray-900 rounded-2xl p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-gray-300 mb-6">Thank you for your feedback. We'll review your message and get back to you if needed.</p>
          <Link href="/" className="px-4 py-2 bg-primary-blue hover:bg-primary-blue-hover rounded-xl text-white transition-all duration-300">
            Return to Home
          </Link>
        </div>
      ) : (

        // Form fields
        <form onSubmit={handleSubmit} className="bg-gray-950/90 backdrop-blur-sm border border-gray-900 rounded-2xl p-6 shadow-md shadow-blue-300/10">
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs md:text-sm text-left font-medium text-custom-blue mb-1">Your Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-900/90 border text-sm md:text-base border-gray-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-custom-blue/60"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-xs md:text-sm text-left font-medium text-custom-blue mb-1">Your Email (Optional)</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900/90 border border-gray-800 text-sm md:text-base rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-custom-blue/60"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-xs md:text-sm text-left font-medium text-custom-blue mb-1">Your Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full px-3 py-2 bg-gray-900/90 border border-gray-800 text-sm md:text-base rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-custom-blue/60 resize-none"
                placeholder="Tell us your ideas or feedback..."
              ></textarea>
            </div>
          </div>
          
          {/* Error message */}
          {submitError && (
            <div className="mt-4 text-red-400 text-sm text-left">
              {submitError}
            </div>
          )}
          
          {/* Submission button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-primary-blue hover:bg-primary-blue-hover text-sm md:text-base text-white rounded-xl transition-all duration-300 flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContactContent; 