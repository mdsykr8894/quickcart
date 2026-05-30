import React, { useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Clock,
  GraduationCap,
  Send,
  CheckCircle2,
  User,
  ShoppingCart,
  ReceiptText
} from 'lucide-react';

import PageHeader from '../../components/PageHeader';

const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formState.name.trim()) e.name = 'Name is required.';
    if (!formState.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) e.email = 'Enter a valid email address.';
    if (!formState.subject.trim()) e.subject = 'Subject is required.';
    if (!formState.message.trim()) e.message = 'Message cannot be empty.';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[e.target.name];
        return n;
      });
    }
  };

  return (
    <div className="bg-slate-50 py-14">
      <div className="max-w-[1180px] mx-auto px-6 lg:px-10">
        <PageHeader
          label="CONTACT"
          title="Get in touch"
          subtitle="Need help with your cart, orders, or account? Send us a message."
        />

        {/* ─── Main Two-Column Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-10 items-stretch">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-base">Send us a message</CardTitle>
                <CardDescription>
                  Tell us what you need help with and we’ll guide you through the QuickCart demo flow.
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardBody className="pt-6 flex-1 flex flex-col justify-start">
                {submitted ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center my-auto">
                    <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-green-600" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Message Received!</h3>
                    <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                      Thank you for testing out our contact form. This is a local academic sandbox — your message was successfully validated but not dispatched to a mail server.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 font-medium"
                      onClick={() => {
                        setSubmitted(false);
                        setFormState({ name: '', email: '', subject: '', message: '' });
                      }}
                    >
                      Send another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-name" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact-name"
                        name="name"
                        placeholder="Jane Doe"
                        value={formState.name}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20"
                      />
                      {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-email" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={formState.email}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20"
                      />
                      {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-subject" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subject <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact-subject"
                        name="subject"
                        placeholder="Cart query, order assistance, profile issue..."
                        value={formState.subject}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-500/20"
                      />
                      {errors.subject && <p className="text-xs text-red-500 font-medium">{errors.subject}</p>}
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-message" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Message <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={3}
                        placeholder="Write your support inquiry here..."
                        value={formState.message}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all resize-none min-h-[85px]"
                      />
                      {errors.message && <p className="text-xs text-red-500 font-medium">{errors.message}</p>}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 shadow-sm rounded-lg"
                    >
                      <Send className="w-4 h-4" /> Send Message
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Support Info, Sandbox Alert, and Common Support Topics */}
          <div className="lg:col-span-2 flex flex-col gap-5 justify-between">
            
            {/* Support Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">QuickCart Support</CardTitle>
              </CardHeader>
              <Separator />
              <CardBody className="pt-4 space-y-4">
                {/* Email Support */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Support</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">support@quickcart.test</p>
                    <p className="text-xs text-gray-400 mt-0.5">For account, cart, and order questions.</p>
                  </div>
                </div>

                {/* Response Window */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Response Window</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">Demo support only</p>
                    <p className="text-xs text-gray-400 mt-0.5">This local project does not send real emails.</p>
                  </div>
                </div>

                {/* Project Context */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Project Context</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">Secure ecommerce sandbox</p>
                    <p className="text-xs text-gray-400 mt-0.5">Built for a university secure software development assignment.</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Common Support Topics Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Common support topics</CardTitle>
              </CardHeader>
              <Separator />
              <CardBody className="pt-4 space-y-4">
                {/* Topic A */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Account Help</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Login, profile, and account questions.</p>
                  </div>
                </div>

                {/* Topic B */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Cart & Checkout</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Cart items, quantities, and checkout flow.</p>
                  </div>
                </div>

                {/* Topic C */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <ReceiptText className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Order History</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Review orders and purchase status.</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
