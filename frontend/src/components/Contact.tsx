import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  PartyPopper, 
  MessageSquare, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Navigation, 
  Facebook, 
  Instagram, 
  MessageCircle,
  ShieldCheck,
  Utensils,
  Trash2,
  Search,
  RefreshCw,
  Eye,
  User as UserIcon,
  Inbox,
  Check,
  CheckCheck,
  MailOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ContactMessage, User } from '../types';

interface ContactProps {
  currentUser?: User | null;
}

export const Contact: React.FC<ContactProps> = ({ currentUser }) => {
  const isAdmin = currentUser?.role === 'admin';
  const [activeView, setActiveView] = useState<'form' | 'inbox'>('form');

  // Contact Form State
  const [inquiryType, setInquiryType] = useState<string>('General Inquiry');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Admin Inquiries State
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [viewingContact, setViewingContact] = useState<ContactMessage | null>(null);

  // FAQ Accordion open state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const fetchContacts = async () => {
    if (!isAdmin) return;
    setIsLoadingContacts(true);
    try {
      const res = await fetch('/api/fetch_contacts.php');
      const data = await res.json();
      if (Array.isArray(data)) {
        setContacts(data);
      }
    } catch (err) {
      console.error('Failed to fetch contact inquiries:', err);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchContacts();
    }
  }, [isAdmin]);

  // Mark single message as read/unread
  const handleToggleRead = async (id: number, currentReadState: boolean) => {
    const nextReadState = !currentReadState;
    // Optimistic UI update
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_read: nextReadState } : c))
    );
    if (viewingContact && viewingContact.id === id) {
      setViewingContact({ ...viewingContact, is_read: nextReadState });
    }

    try {
      await fetch('/api/mark_contact_read.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: nextReadState }),
      });
    } catch (err) {
      console.error('Failed to update read status:', err);
    }
  };

  // Mark all messages as read
  const handleMarkAllRead = async () => {
    setContacts((prev) => prev.map((c) => ({ ...c, is_read: true })));
    if (viewingContact) {
      setViewingContact({ ...viewingContact, is_read: true });
    }

    try {
      await fetch('/api/mark_contact_read.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true }),
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleOpenInspection = (contact: ContactMessage) => {
    setViewingContact(contact);
    if (!contact.is_read) {
      handleToggleRead(contact.id, false);
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!window.confirm(`Delete contact message #${id}?`)) return;
    try {
      const res = await fetch('/api/delete_contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        if (viewingContact?.id === id) setViewingContact(null);
      } else {
        alert(data.message || 'Failed to delete message.');
      }
    } catch (err) {
      alert('Error deleting message.');
    }
  };

  const unreadCount = contacts.filter((c) => !c.is_read).length;
  const readCount = contacts.filter((c) => c.is_read).length;

  const filteredContacts = contacts.filter((c) => {
    const isRead = Boolean(c.is_read);
    const filterMatch =
      inboxFilter === 'all' ||
      (inboxFilter === 'unread' && !isRead) ||
      (inboxFilter === 'read' && isRead);

    const q = contactSearch.toLowerCase();
    const searchMatch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q);

    return filterMatch && searchMatch;
  });

  const inquiryOptions = [
    { id: 'general', label: 'General Inquiry', icon: MessageSquare },
    { id: 'catering', label: 'Bulk & Party Catering', icon: PartyPopper },
    { id: 'feedback', label: 'Customer Feedback', icon: Sparkles },
    { id: 'business', label: 'Franchise & Partner', icon: Utensils },
  ];

  const faqs = [
    {
      q: 'Do you accept bulk or party orders for school and corporate events?',
      a: 'Yes! We cater for birthdays, school events, sports festivals, and corporate meetings. We offer discounted bulk pricing for orders of 20 cups or more with customized cup stickers upon request.'
    },
    {
      q: 'Can I customize sugar levels and ice for my drinks?',
      a: 'Absolutely. You can request customized sweetness (0%, 25%, 50%, 75%, 100%) and ice preference upon ordering.'
    },
    {
      q: 'What are your operating hours and exact store location?',
      a: 'We are open 7 days a week from 9:00 AM to 10:00 PM. We are located at Dela Costa Homes V, Burgos, Montalban, Rodriguez, Rizal (near the Phase 1 Clubhouse).'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept GCash, Maya, Cash on Counter, and Online Bank Transfers for both in-store and advance pre-orders.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const fullMessage = `[Type: ${inquiryType}] ${formData.subject ? `Subject: ${formData.subject} - ` : ''}${formData.message}`;

      const res = await fetch('/api/save_contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          message: fullMessage
        })
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setSuccess(true);
        setFormData({ name: '', email: '', contact: '', subject: '', message: '' });
        if (isAdmin) fetchContacts();
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please make sure the backend server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-12 animate-in fade-in duration-300">
      
      {/* Admin Mode Switcher Header if logged in as Admin */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-coffee text-white p-4 rounded-3xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold">Admin Contact Control</h2>
                <Badge variant="brand" className="text-[10px] uppercase font-bold">
                  Administrator
                </Badge>
              </div>
              <p className="text-xs text-amber-100/80">
                Switch between viewing customer submissions and testing the contact form
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-2xl bg-black/30 p-1.5 backdrop-blur border border-white/10">
            <button
              type="button"
              onClick={() => setActiveView('form')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeView === 'form'
                  ? 'bg-brand-amber text-brand-brown shadow-sm'
                  : 'text-amber-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Contact Form</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView('inbox');
                fetchContacts();
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeView === 'inbox'
                  ? 'bg-brand-amber text-brand-brown shadow-sm'
                  : 'text-amber-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Inbox className="h-3.5 w-3.5" />
              <span>Customer Inquiries Inbox</span>
              {contacts.length > 0 && (
                <span className="ml-1 rounded-full bg-brand-orange px-1.5 py-0.2 text-[10px] font-black text-white shadow-xs">
                  {contacts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ADMIN INBOX VIEW */}
      {isAdmin && activeView === 'inbox' ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-brown/10 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-brand-brown flex items-center gap-2">
                  <Inbox className="h-6 w-6 text-brand-orange" />
                  Customer Inquiries Inbox
                </h2>
                {unreadCount > 0 && (
                  <Badge className="bg-blue-600 text-white font-bold text-xs px-2 py-0.5 animate-pulse">
                    {unreadCount} New Unread
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground pt-0.5">
                Manage feedback, catering requests, and customer questions
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sender, email, message..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="pl-9 text-xs rounded-xl"
                />
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="gap-1 text-xs font-bold rounded-xl text-blue-700 border-blue-200 hover:bg-blue-50"
                  title="Mark all messages as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark All Read</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={fetchContacts}
                disabled={isLoadingContacts}
                className="gap-1.5 text-xs font-semibold rounded-xl shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingContacts ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <Button
              variant={inboxFilter === 'all' ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setInboxFilter('all')}
              className="text-xs font-bold rounded-xl"
            >
              All Inquiries ({contacts.length})
            </Button>

            <Button
              variant={inboxFilter === 'unread' ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setInboxFilter('unread')}
              className="text-xs font-bold rounded-xl text-blue-700"
            >
              🔵 Unread ({unreadCount})
            </Button>

            <Button
              variant={inboxFilter === 'read' ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setInboxFilter('read')}
              className="text-xs font-bold rounded-xl text-green-700"
            >
              ✓ Read ({readCount})
            </Button>
          </div>

          {/* Contact Messages List */}
          {filteredContacts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-brand-brown/10 p-8 space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-brand-coffee">
                <Inbox className="h-8 w-8 text-brand-orange" />
              </div>
              <h3 className="text-lg font-bold text-brand-brown">No inquiries match filter</h3>
              <p className="text-xs text-muted-foreground">
                {contactSearch ? 'No messages match your search query.' : 'No messages found in this category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContacts.map((c) => {
                const isRead = Boolean(c.is_read);

                return (
                  <Card 
                    key={c.id} 
                    className={`border shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-white flex flex-col justify-between ${
                      !isRead 
                        ? 'border-blue-300 ring-2 ring-blue-500/15 bg-blue-50/10' 
                        : 'border-brand-brown/10'
                    }`}
                  >
                    <CardHeader className={`p-5 pb-3 border-b ${!isRead ? 'bg-blue-50/40' : 'bg-brand-cream/30'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-display font-bold text-sm shadow ${
                            !isRead ? 'bg-blue-600' : 'bg-brand-coffee'
                          }`}>
                            {c.name ? c.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base font-bold text-brand-brown">
                                {c.name}
                              </CardTitle>
                              {!isRead ? (
                                <Badge className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0">
                                  New Unread
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                                  <Check className="h-3 w-3 text-green-600" /> Read
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-0.5">
                              <span className="flex items-center gap-1 font-mono">
                                <Mail className="h-3 w-3 text-brand-orange" />
                                <a href={`mailto:${c.email}`} className="hover:underline text-brand-brown">
                                  {c.email}
                                </a>
                              </span>
                              {c.contact && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone className="h-3 w-3 text-brand-coffee" />
                                  <a href={`tel:${c.contact}`} className="hover:underline text-brand-brown">
                                    {c.contact}
                                  </a>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                          #{c.id}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 py-4 flex-1">
                      <div className={`rounded-xl p-3.5 border text-xs text-brand-brown/90 leading-relaxed font-sans whitespace-pre-wrap line-clamp-4 ${
                        !isRead ? 'bg-white border-blue-200' : 'bg-slate-50 border-slate-200/70'
                      }`}>
                        {c.message}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{new Date(c.created_at).toLocaleString()}</span>
                        </span>

                        {/* Quick Mark as Read / Unread toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleRead(c.id, isRead)}
                          className="text-xs font-semibold text-brand-coffee hover:text-brand-orange transition-colors flex items-center gap-1 cursor-pointer"
                          title={isRead ? 'Mark as unread' : 'Mark as read'}
                        >
                          {isRead ? (
                            <>
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span>Mark Unread</span>
                            </>
                          ) : (
                            <>
                              <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
                              <span className="text-blue-700 font-bold">Mark as Read</span>
                            </>
                          )}
                        </button>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                      <div>
                        {c.contact && (
                          <a 
                            href={`tel:${c.contact}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-200/80 text-brand-brown hover:bg-slate-300 px-3 py-1.5 text-xs font-bold transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 text-brand-coffee" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenInspection(c)}
                          className="h-8 px-2.5 text-xs font-semibold hover:bg-brand-cream text-brand-brown"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Read Full
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteContact(c.id)}
                          className="h-8 px-2 text-xs"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Full Message Modal */}
          {viewingContact && (
            <Dialog open={!!viewingContact} onOpenChange={() => setViewingContact(null)}>
              <DialogContent className="max-w-lg bg-white p-6 rounded-3xl shadow-2xl">
                <DialogHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand" className="text-xs uppercase font-bold">
                      Inquiry #{viewingContact.id}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(viewingContact.created_at).toLocaleString()}
                    </span>
                  </div>
                  <DialogTitle className="font-display text-xl font-bold text-brand-brown">
                    From: {viewingContact.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Customer contact details and full message text
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-brand-cream/50 p-3.5 rounded-2xl border border-brand-brown/10">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Email:</span>
                      <a href={`mailto:${viewingContact.email}`} className="font-bold text-brand-brown hover:underline">
                        {viewingContact.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Phone / Contact:</span>
                      <a href={`tel:${viewingContact.contact}`} className="font-bold text-brand-brown hover:underline">
                        {viewingContact.contact || 'None provided'}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-brown">Message Content:</span>
                      <button
                        type="button"
                        onClick={() => handleToggleRead(viewingContact.id, Boolean(viewingContact.is_read))}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {viewingContact.is_read ? 'Mark as Unread' : '✓ Marked as Read'}
                      </button>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-brand-brown leading-relaxed font-sans whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {viewingContact.message}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        handleDeleteContact(viewingContact.id);
                      }}
                      className="text-xs gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingContact(null)}
                      className="text-xs rounded-xl"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      ) : (
        /* STANDARD CUSTOMER CONTACT FORM VIEW */
        <>
          {/* Header Banner */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-brand-coffee shadow-xs">
              <MessageCircle className="h-4 w-4 text-brand-orange" />
              <span>We'd Love to Hear From You</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-brown">
              Get in Touch with Mr. Boy
            </h1>
            <p className="text-xs sm:text-sm text-brand-brown/70 leading-relaxed">
              Have questions regarding party catering, customized boba orders, store feedback, or franchising? Drop us a message below or visit our Montalban store!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form (7 cols) */}
            <div className="lg:col-span-7">
              <Card className="border border-brand-brown/10 shadow-xl rounded-3xl bg-white overflow-hidden">
                <CardHeader className="bg-brand-coffee text-white p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-2xl font-bold tracking-tight text-white">
                        Send an Inquiry
                      </CardTitle>
                      <CardDescription className="text-xs text-amber-100/80">
                        Fill out the form and our team will get back to you within 24 hours.
                      </CardDescription>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                      <Send className="h-5 w-5 text-amber-200" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-8 space-y-6">
                  {/* Inquiry Type Chips */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-brand-brown">
                      What are you reaching out for?
                    </Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {inquiryOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = inquiryType === opt.label;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setInquiryType(opt.label)}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                              isSelected
                                ? 'border-brand-coffee bg-brand-cream/80 text-brand-brown font-bold shadow-xs scale-102 ring-2 ring-brand-coffee/20'
                                : 'border-slate-200 bg-white hover:border-brand-coffee/40 text-muted-foreground hover:text-brand-brown'
                            }`}
                          >
                            <Icon className={`h-4 w-4 mb-1.5 ${isSelected ? 'text-brand-orange' : 'text-slate-400'}`} />
                            <span className="text-[11px] leading-tight">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Banners */}
                  {success && (
                    <div className="rounded-2xl bg-green-50 p-4 border border-green-200 flex items-start gap-3 animate-in fade-in">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-green-900">Message Delivered Successfully!</h4>
                        <p className="text-xs text-green-700">
                          Thank you for reaching out to Mr. Boy SpecialTea. We have received your inquiry and will contact you shortly.
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-xs text-red-700 animate-in fade-in">
                      {error}
                    </div>
                  )}

                  {/* The Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-name" className="text-xs font-bold text-brand-brown">
                          Your Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="contact-name"
                          required
                          placeholder="e.g. Juan Dela Cruz"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="text-xs rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="contact-phone" className="text-xs font-bold text-brand-brown">
                          Contact / Mobile Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="contact-phone"
                          required
                          placeholder="e.g. 0917 123 4567"
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          className="text-xs rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-email" className="text-xs font-bold text-brand-brown">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="text-xs rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-subject" className="text-xs font-bold text-brand-brown">
                        Subject / Event Date (Optional)
                      </Label>
                      <Input
                        id="contact-subject"
                        placeholder="e.g. Birthday Party 30 cups on Oct 12"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="text-xs rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-msg" className="text-xs font-bold text-brand-brown">
                        Your Detailed Message <span className="text-red-500">*</span>
                      </Label>
                      <textarea
                        id="contact-msg"
                        required
                        rows={4}
                        placeholder="Tell us about your questions, flavor requests, or preferred delivery timing..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="brand"
                      disabled={isSubmitting}
                      className="w-full gap-2 font-bold py-3 rounded-xl shadow-md text-sm mt-2"
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Submitting Inquiry...' : 'Submit Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Store Info, Hours & Location (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Store Details Card */}
              <Card className="border border-brand-brown/10 shadow-lg rounded-3xl bg-white overflow-hidden">
                <CardHeader className="bg-brand-cream/60 p-6 pb-4 border-b border-brand-brown/10">
                  <CardTitle className="font-display text-xl font-bold text-brand-brown flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-brand-orange" />
                    Store Location &amp; Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5 text-xs text-brand-brown">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-brand-coffee shadow-xs">
                      <MapPin className="h-4 w-4 text-brand-orange" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-brown">Main Montalban Branch</h4>
                      <p className="text-muted-foreground pt-0.5 leading-relaxed">
                        Dela Costa Homes V, Burgos, Montalban, Rodriguez, Rizal
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-brand-orange">
                        📍 Beside Phase 1 Clubhouse
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-brand-coffee shadow-xs">
                      <Clock className="h-4 w-4 text-brand-orange" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-brown">Operating Hours</h4>
                      <p className="text-muted-foreground pt-0.5">
                        Monday &ndash; Sunday: <strong>9:00 AM &ndash; 10:00 PM</strong>
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        <CheckCircle2 className="h-3 w-3" /> Open Daily for Orders
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-brand-coffee shadow-xs">
                      <Phone className="h-4 w-4 text-brand-orange" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-brown">Direct Hotline &amp; GCash</h4>
                      <p className="text-muted-foreground pt-0.5 font-mono">
                        0917-XXX-XXXX / 0928-XXX-XXXX
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-brand-coffee shadow-xs">
                      <Mail className="h-4 w-4 text-brand-orange" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-brown">Customer Support Email</h4>
                      <p className="text-muted-foreground pt-0.5 font-mono">
                        support@mrboyspecialtea.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Channels Card */}
              <div className="rounded-3xl bg-gradient-to-br from-brand-coffee to-brand-brown p-6 text-white shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-amber" />
                  <h3 className="font-display font-bold text-base text-white">Connect on Socials</h3>
                </div>
                <p className="text-xs text-amber-100/80 leading-relaxed">
                  Follow us for promo drops, buy-1-take-1 boba alerts, and new seasonal flavor announcements!
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5 text-xs font-bold rounded-xl"
                    onClick={() => window.open('https://facebook.com', '_blank')}
                  >
                    <Facebook className="h-4 w-4 text-amber-200" />
                    <span>Facebook</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5 text-xs font-bold rounded-xl"
                    onClick={() => window.open('https://instagram.com', '_blank')}
                  >
                    <Instagram className="h-4 w-4 text-amber-200" />
                    <span>Instagram</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="space-y-6 pt-6 border-t border-brand-brown/10">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-cream px-3 py-1 text-xs font-bold text-brand-coffee">
                <HelpCircle className="h-4 w-4" />
                <span>Got Questions?</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-brown">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-muted-foreground">
                Quick answers to the most common customer questions.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="rounded-2xl border border-brand-brown/10 bg-white overflow-hidden shadow-xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm text-brand-brown hover:text-brand-orange transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-brand-coffee">
                          {idx + 1}
                        </span>
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-brand-orange" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-slate-100 animate-in fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
