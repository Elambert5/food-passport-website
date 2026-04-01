import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import Map from './Map';
import { supabase } from './supabaseClient';
import { Restaurant } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  Info, 
  Utensils, 
  Mail, 
  ChevronRight, 
  ChevronLeft,
  Menu, 
  X,
  Shield,
  FileText,
  Instagram,
  Music
} from 'lucide-react';

const TikTokIcon = ({ size }: { size: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
  </svg>
);

export default function App() {
      const [ownerFormStatus, setOwnerFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>("idle");
    // State for restaurant owner form
    const [ownerForm, setOwnerForm] = useState({
      firstName: '',
      lastName: '',
      restaurantName: '',
      email: '',
      message: ''
    });
    const isOwnerFormComplete = Object.values(ownerForm).every((v) => (v as string).trim() !== '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [supabaseRestaurants, setSupabaseRestaurants] = useState<Restaurant[]>([]);
  // Pick a random restaurant for About section
  const featuredRestaurant = supabaseRestaurants.length > 0 ? supabaseRestaurants[Math.floor(Math.random() * supabaseRestaurants.length)] : null;
  useEffect(() => {
    async function fetchRestaurants() {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, area, location, latitude, longitude, image, cost, rating, reviews, discount');
      if (error) {
        console.error('Error fetching restaurants:', error);
      } else if (data) {
        // Map to expected RestaurantCard shape
        const mapped = data.map((r: any) => {
          let location = r.location;
          if (typeof r.latitude === 'number' && typeof r.longitude === 'number') {
            location = { lat: r.latitude, lng: r.longitude };
          }
          return {
            id: String(r.id),
            name: r.name,
            area: r.area || '',
            location,
            image: r.image || '',
            priceLevel: r.cost || 1,
            rating: r.rating ?? null,
            reviewCount: r.reviews ?? null,
            distance: r.distance ?? null,
            discount: r.discount ?? null,
          };
        });
        console.log('Mapped restaurants:', mapped);
        setSupabaseRestaurants(mapped);
      }
    }
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'App', href: '#get-app' },
    { name: 'About', href: '#about' },
    { name: 'Map', href: '#map' },
    { name: 'Restaurant', href: '#restaurant' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.a 
            href="#home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-extrabold tracking-tighter"
          >
            FOOD PASSPORT
          </motion.a>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link, i) => {
              const isGetApp = link.name === 'Get App';
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={isGetApp ? { scale: 1.05 } : {}}
                  whileTap={isGetApp ? { scale: 0.95 } : {}}
                  className={isGetApp 
                    ? "bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm hover:bg-zinc-100 transition-all border border-zinc-200"
                    : "text-sm font-bold uppercase hover:text-zinc-500 transition-colors tracking-widest"
                  }
                >
                  {link.name}
                </motion.a>
              );
            })}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white dark:bg-black pt-12 px-6 md:hidden"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link, idx) => {
                const isGetApp = link.name === 'Get App';
                // Add extra top margin above the first option (Home) for mobile only
                const extraTop = idx === 0 ? 'mt-8' : '';
                // On mobile, make Get App match other options
                const mobileMenuStyle = "text-3xl font-black uppercase tracking-tighter";
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={mobileMenuStyle + ' ' + extraTop}
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {/* Section 1: Hero */}
        <section 
          id="home"
          className="relative h-[85vh] sm:h-screen flex items-center justify-center overflow-hidden pt-12"
          style={{ backgroundImage: 'url("/Hero.webp")', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* Dull and fade hero image overlays */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Dull the image with a semi-transparent black overlay */}
            <div className="w-full h-full bg-black opacity-50" />
            {/* Fade the bottom into black using a gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
          </div>

          {/* Section Content */}
          <div className="relative z-20 flex flex-col items-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-brand-orange font-bold uppercase tracking-[0.3em] text-sm mb-6"
              >
                Your Local Dining Companion
              </motion.span>
              
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-none text-white">
                FOOD<br className="sm:hidden" /> PASSPORT
              </h1>
              
              <p className="text-lg md:text-2xl text-zinc-300 max-w-2xl font-medium leading-relaxed">
                Discover something new and enjoy exclusive discounts at the best independent local restaurants.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Section 2: Get App */}
        <section id="get-app" className="py-12 bg-brand-bg-alt dark:bg-brand-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-black dark:bg-white text-white dark:text-black rounded-[3rem] overflow-hidden p-12 md:p-24 relative">
              <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                    >
                      <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
                        DOWNLOAD THE APP - DISCOUNTED DISHES IN YOUR POCKET
                      </h2>
                      <p className="text-lg md:text-xl opacity-70 mb-12 font-medium max-w-md">
                        Join thousands discovering the best independent restaurants and save on every meal.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <a 
                          href="https://www.apple.com/uk/app-store/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block text-black dark:text-white hover:opacity-90 transition-opacity m-0 p-0 w-auto h-auto border-0 bg-transparent rounded-none"
                        >
                          <img src="/Appstore.svg" alt="Download on the App Store" className="block w-[210px] h-[70px] object-contain m-0 p-0" />
                        </a>
                        <a 
                          href="https://play.google.com/store/apps"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-black dark:text-white hover:opacity-90 transition-opacity m-0 p-0 w-auto h-auto border-0 bg-transparent rounded-none"
                        >
                          <img src="/Googleplay.svg" alt="Get it on Google Play" className="block h-[70px] object-contain m-0 p-0" style={{ width: 'auto', aspectRatio: '238.96/70.87' }} />
                        </a>
                      </div>
                    </motion.div>
                    {/* Screenshot image for Get App section */}
                    <div className="hidden md:flex w-full h-full items-center justify-center">
                      <div
                        className="relative bg-zinc-900 dark:bg-zinc-100 rounded-[2.2rem] border-[0.5px] border-zinc-900 dark:border-zinc-100 shadow-2xl"
                        style={{ width: '284px', height: '602px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 32px 96px 0 rgba(0,0,0,0.65), 0 4px 16px 0 rgba(0,0,0,0.22)' }}
                      >
                        {/* Dynamic Island (optional, left for visual interest) */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-30 flex items-center justify-end px-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full blur-[1px] opacity-50" />
                        </div>
                        {/* Screenshot inside phone */}
                        <img 
                          src="/Screenshot.png" 
                          alt="App Screenshot" 
                          className="rounded-[2rem] w-[272px] h-[590px] object-cover"
                          style={{ display: 'block', margin: 0, padding: 0, background: 'none', border: 'none' }}
                        />
                      </div>
                    </div>
              </div>
              
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/20 blur-[100px] rounded-full -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -ml-48 -mb-48" />
            </div>
          </div>
        </section>

        {/* Section 3: About */}
        <section id="about" className="py-12 bg-brand-bg-alt dark:bg-brand-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid gap-8 md:grid-cols-2 md:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.9]">
                  DISCOVER MORE.<br />
                  EAT MORE.<br />
                  SPEND LESS.
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                  Food Passport is a subscription that unlocks exclusive deals at a curated selection of independent restaurants near you. Whether you're trying somewhere new or returning to a favourite, it’s a smarter way to explore local food while saving money.
                </p>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  Choose where to eat, enjoy your food and redeem your offer straight from your phone while you’re there. It’s quick, hassle-free, and designed to fit naturally into your dining experience.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-brand-bg-alt dark:bg-zinc-900 rounded-2xl">
                    <div className="text-3xl font-black mb-2">30+</div>
                    <div className="text-sm text-zinc-500 font-medium">Restaurants</div>
                  </div>
                  <div className="p-6 bg-brand-bg-alt dark:bg-zinc-900 rounded-2xl">
                    <div className="text-3xl font-black mb-2">1000+</div>
                    <div className="text-sm text-zinc-500 font-medium">Users</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-square rounded-3xl overflow-hidden shadow-custom"
              >
                {featuredRestaurant ? (
                  <>
                    <img
                      src={featuredRestaurant.image}
                      alt={featuredRestaurant.name}
                      className="object-cover w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white">
                      <div className="text-3xl md:text-4xl font-bold leading-tight">{featuredRestaurant.name}</div>
                      <div className="text-lg md:text-xl font-bold opacity-80 mt-1">{featuredRestaurant.area}</div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* No image or overlay before data loads */}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 3: Map */}
        <section id="map" className="pt-12 py-12 scroll-mt-24 bg-brand-bg-alt dark:bg-brand-dark">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 md:mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">EXPLORE OUR RESTAURANT MAP</h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
                View the map to see what is available near you.
              </p>
            </motion.div>

              {/* Interactive Map Component */}
              <div className="relative z-0 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-custom overflow-hidden w-full h-[400px] min-h-[300px]">
                <Map favoriteIds={new Set()} onToggleFavorite={() => {}} supabaseRestaurants={supabaseRestaurants} />
              </div>
          </div>
        </section>

        {/* Section 4: Restaurant Owner */}
        <section id="restaurant" className="py-12 bg-brand-bg-alt dark:bg-brand-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-[0.9]">
                  OWN A <br />
                  RESTAURANT?
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10 max-w-md leading-relaxed">
                  We’d love to work with you. Food Passport connects local diners with independent restaurants like yours, helping you get discovered, stay busy, and grow your customer base.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                  {[
                    { title: 'Engagement', desc: 'Connect with local diners actively looking to try new places.' },
                    { title: 'Visibility', desc: 'Get discovered by a wider audience in your area.' },
                    { title: 'Revenue', desc: 'Drive more bookings without heavy marketing costs.' },
                    { title: 'Loyalty', desc: 'Turn first-time visitors into repeat customers.' },
                    { title: 'Marketing', desc: 'Promote your restaurant with built-in exposure.' },
                    { title: 'Flexibility', desc: 'Create offers that work for your business.' }
                  ].map((item) => (
                    <div key={item.title} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                        <h4 className="font-bold text-sm uppercase tracking-tight">{item.title}</h4>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-tight">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-brand-bg-alt dark:bg-zinc-900/50 p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800"
              >
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!isOwnerFormComplete || ownerFormStatus === 'sending') return;
                    setOwnerFormStatus('sending');
                    try {
                      await emailjs.send(
                        'service_n8gahvk',
                        'template_kd7wo26',
                        {
                          first_name: ownerForm.firstName,
                          last_name: ownerForm.lastName,
                          restaurant_name: ownerForm.restaurantName,
                          email: ownerForm.email,
                          message: ownerForm.message
                        },
                        'hPz83OKdCwmIjcuj_'
                      );
                      setOwnerFormStatus('sent');
                      setOwnerForm({ firstName: '', lastName: '', restaurantName: '', email: '', message: '' });
                    } catch (err) {
                      // Log error details for debugging
                      console.error('EmailJS error:', err);
                      setOwnerFormStatus('error');
                    }
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">First Name</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all"
                        value={ownerForm.firstName}
                        onChange={e => setOwnerForm(f => ({ ...f, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Last Name</label>
                      <input
                        type="text"
                        className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all"
                        value={ownerForm.lastName}
                        onChange={e => setOwnerForm(f => ({ ...f, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Restaurant Name</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all"
                      value={ownerForm.restaurantName}
                      onChange={e => setOwnerForm(f => ({ ...f, restaurantName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all"
                      value={ownerForm.email}
                      onChange={e => setOwnerForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Message</label>
                    <textarea
                      rows={2}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all resize-none"
                      value={ownerForm.message}
                      onChange={e => setOwnerForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isOwnerFormComplete || ownerFormStatus === 'sending'}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2 text-sm tracking-wide uppercase transition-opacity ${isOwnerFormComplete && ownerFormStatus !== 'sending' ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'}`}
                    style={{ textAlign: 'center', textDecoration: 'none' }}
                    aria-disabled={!isOwnerFormComplete || ownerFormStatus === 'sending'}
                  >
                    <Mail size={16} />
                    <span>{ownerFormStatus === 'sending' ? 'Sending...' : ownerFormStatus === 'sent' ? 'Sent!' : 'Send Message'}</span>
                  </button>
                  {ownerFormStatus === 'error' && (
                    <div className="text-red-500 text-xs mt-2">There was an error sending your message. Please try again.</div>
                  )}
                  {ownerFormStatus === 'sent' && (
                    <div className="text-green-600 text-xs mt-2">Message sent successfully!</div>
                  )}
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Section 5: Footer */}
      <footer className="bg-brand-light dark:bg-brand-dark py-16 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="text-2xl font-black tracking-tighter mb-6">FOOD PASSPORT</div>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
                Discover something new and get discounts at top independent local restaurants with the Food Passport app.
              </p>
              <div className="flex space-x-4">
                <a
                  href="mailto:hello@foodpassportuk.co.uk"
                  className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  aria-label="Send Email"
                >
                  <Mail size={18} />
                </a>
                <a
                  href="https://www.instagram.com/foodpassportuk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.tiktok.com/@foodpassportuk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  aria-label="TikTok"
                >
                  <TikTokIcon size={18} />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-zinc-400">Legal</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li>
                  <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500 transition-colors flex items-center space-x-2">
                    <Shield size={14} /> <span>Privacy Policy</span>
                  </a>
                </li>
                <li>
                  <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500 transition-colors flex items-center space-x-2">
                    <FileText size={14} /> <span>Terms of Service</span>
                  </a>
                </li>
                <li>
                  <a href="/cookie-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500 transition-colors flex items-center space-x-2">
                    <FileText size={14} /> <span>Cookie Policy</span>
                  </a>
                </li>
                <li>
                  <a href="/accessibility-statement.html" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500 transition-colors flex items-center space-x-2">
                    <FileText size={14} /> <span>Accessibility Statement</span>
                  </a>
                </li>
                <li>
                  <a href="/disclaimer.html" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500 transition-colors flex items-center space-x-2">
                    <FileText size={14} /> <span>Disclaimer</span>
                  </a>
                </li>
                <li>
                  <a href="/eula.html" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-500 transition-colors flex items-center space-x-2">
                    <FileText size={14} /> <span>End-User License Agreement (EULA)</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-500 font-medium">
              © 2026 Food Passport Ltd. All rights reserved.
            </p>
            <div className="flex space-x-6 text-xs text-zinc-500 font-medium">
              <span>MADE WITH PASSION FOR FOOD.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
  // Debug: log Supabase data after render
  useEffect(() => {
    console.log("Supabase data:", supabaseRestaurants);
  }, [supabaseRestaurants]);
}
