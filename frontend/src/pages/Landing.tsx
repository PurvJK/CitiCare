import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  FileText,
  Map,
  BarChart3,
  Users,
  Phone,
  Mail,
  Clock,
  Building2,
  Search,
  Menu,
  ChevronDown,
  PlusCircle,
  ClipboardList,
  FolderOpen,
  HardHat,
  UserPlus,
} from 'lucide-react';

/* Hero background – India.gov.in style. Replace with /hero-bg.png for your image. */
const heroBgImage = 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1920&q=80';

const searchCategories = [
  'All Categories',
  'Complaints',
  'Documents',
  'Projects',
  'Roads & Infrastructure',
  'Water Supply',
  'Sanitation',
];

/* Working & functionality – quick links (like india.gov.in trending) */
const quickLinks = [
  { label: 'File a Complaint', href: '/complaints/new', icon: PlusCircle },
  { label: 'Track Complaint Status', href: '/complaints', icon: ClipboardList },
  { label: 'Public Documents', href: '/documents', icon: FolderOpen },
  { label: 'Ongoing Projects', href: '/projects', icon: HardHat },
  { label: 'New User Registration', href: '/register', icon: UserPlus },
];

const workSliderImages = [
  { src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80', title: 'Road & Infrastructure' },
  { src: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80', title: 'Water & Sanitation' },
  { src: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80', title: 'Street Lighting' },
  { src: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80', title: 'Waste Management' },
  { src: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80', title: 'Parks & Green Spaces' },
];

const features = [
  { icon: FileText, title: 'Easy Complaint Filing', description: 'Report civic issues with photos and location.' },
  { icon: Map, title: 'Real-time Tracking', description: 'Track complaint status on map and timeline.' },
  { icon: BarChart3, title: 'Transparent Analytics', description: 'City-wide statistics and resolution times.' },
  { icon: Users, title: 'Multi-role Access', description: 'Dashboards for citizens, officers, and admins.' },
];

const stats = [
  { value: '50K+', label: 'Complaints Resolved' },
  { value: '24hrs', label: 'Avg. Response Time' },
  { value: '95%', label: 'Citizen Satisfaction' },
  { value: '15+', label: 'City Departments' },
];

/* Instructions for users – how to use this website */
const howToUseSteps = [
  {
    step: 1,
    title: 'Register or Login',
    desc: 'Create an account with your email and mobile, or sign in if you already have one.',
    link: '/register',
    linkText: 'Register',
  },
  {
    step: 2,
    title: 'File a Complaint',
    desc: 'Go to "File a Complaint", choose category, add location and photos, and submit.',
    link: '/complaints/new',
    linkText: 'File Complaint',
  },
  {
    step: 3,
    title: 'Track Status',
    desc: 'View "My Complaints" or use the search bar to track your complaint status and updates.',
    link: '/complaints',
    linkText: 'Track Status',
  },
  {
    step: 4,
    title: 'Access Documents & Projects',
    desc: 'Download circulars and view ongoing municipal projects from Documents and Projects sections.',
    link: '/documents',
    linkText: 'Documents',
  },
];

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All Categories');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/complaints?search=${encodeURIComponent(searchQuery.trim())}`);
    else navigate('/complaints');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Tricolor strip */}
      <div className="tricolor-strip h-1.5 w-full" aria-hidden />

      {/* Top utility bar – india.gov.in style */}
      <div className="bg-[#06038D] text-white text-sm">
        <div className="container mx-auto px-4 flex items-center justify-between h-9">
          <a href="#main-content" className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded">
            Skip to main content
          </a>
          <div className="flex items-center gap-4">
            <Link to="/documents" className="hover:underline hidden sm:inline">Documents</Link>
            <Link to="/projects" className="hover:underline hidden sm:inline">Projects</Link>
            <div className="flex items-center gap-1 border-l border-white/30 pl-4">
              <span className="text-white/90">अ</span>
              <span className="text-white/70">|</span>
              <span className="text-white/90">Aa</span>
            </div>
            <button type="button" className="p-1 rounded hover:bg-white/10 flex items-center gap-0.5" aria-label="Menu">
              <span className="w-1 h-4 rounded-sm bg-[#FF671F]" />
              <span className="w-1 h-4 rounded-sm bg-white" />
              <span className="w-1 h-4 rounded-sm bg-[#046A38]" />
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/98 shadow-sm backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#06038D] bg-white">
                <Building2 className="h-4 w-4 text-[#06038D]" />
              </div>
              <span className="font-bold text-[#06038D]">CitiCare</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5">
              <Link to="#how-to-use" className="text-sm text-muted-foreground hover:text-foreground font-medium">How to Use</Link>
              <Link to="#working" className="text-sm text-muted-foreground hover:text-foreground font-medium">Services</Link>
              <Link to="#our-work" className="text-sm text-muted-foreground hover:text-foreground font-medium">Our Work</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-[#06038D] text-[#06038D] hover:bg-[#06038D]/5">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-[#FF671F] hover:bg-[#e55a15] text-white">Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero – full-width background image, india.gov.in style */}
      <section
        id="main-content"
        className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden px-4 py-12"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(6, 3, 141, 0.45) 0%, rgba(6, 3, 141, 0.25) 40%, rgba(0,0,0,0.5) 100%), url(${heroBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Emblem-style branding */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-white bg-white/10 backdrop-blur mb-4">
            <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            <span className="border-b-4 border-[#FF671F] pb-1">Citi</span>
            <span className="border-b-4 border-[#046A38] pb-1 ml-0.5">Care</span>
            <span className="text-[#FFE135] text-sm sm:text-base font-normal ml-2 align-top">BETA</span>
          </h1>
          <p className="text-white/95 font-medium mt-1 text-sm sm:text-base">Municipal Citizen Grievance Portal</p>
          <p className="text-white/80 text-sm mt-0.5">Where Civic Services Converge</p>
        </div>

        {/* Central search bar – india.gov.in style */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto mb-6">
          <div className="flex flex-col sm:flex-row gap-2 rounded-lg overflow-hidden bg-white/95 shadow-xl border border-white/20">
            <div className="flex flex-1 items-center gap-2 px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                type="text"
                placeholder="Search for complaints, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-auto py-0 text-base"
              />
            </div>
            <Select value={searchCategory} onValueChange={setSearchCategory}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-none border-0 border-l border-border bg-muted/50 h-auto py-3 font-medium">
                <SelectValue />
                <ChevronDown className="h-4 w-4 ml-1" />
              </SelectTrigger>
              <SelectContent>
                {searchCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="rounded-none bg-red-600 hover:bg-red-700 text-white font-semibold px-6 h-auto py-3">
              Search
            </Button>
          </div>
        </form>

        {/* Quick links – Working & functionality (like Trending on india.gov.in) */}
        <div className="w-full max-w-3xl mx-auto">
          <p className="text-white/90 text-sm font-medium mb-3 text-center sm:text-left">Popular Services:</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-white/60 bg-black/20 text-white text-sm font-medium hover:bg-white/20 hover:border-white transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Instructions for users – How to use this website */}
      <section id="how-to-use" className="py-16 bg-white border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#06038D] mb-2">How to Use This Website</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
              Follow these steps to file complaints, track status, and access municipal services.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {howToUseSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-full bg-[#06038D] text-white flex items-center justify-center font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                <Link to={item.link}>
                  <Button variant="outline" size="sm" className="border-[#06038D] text-[#06038D] hover:bg-[#06038D]/5">
                    {item.linkText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[#06038D]">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Work – sliding images */}
      <section id="our-work" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#06038D] mb-2">Our Work in Progress</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">Ongoing civic projects by the Municipal Corporation.</p>
          </div>
          <div className="max-w-5xl mx-auto">
            <Carousel opts={{ align: 'start', loop: true }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {workSliderImages.map((item, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="rounded-xl overflow-hidden border border-border bg-card shadow-md">
                      <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${item.src})` }} />
                      <div className="p-4">
                        <p className="font-semibold text-foreground">{item.title}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 border-2 border-primary text-primary bg-white hover:bg-primary/10" />
              <CarouselNext className="right-0 border-2 border-primary text-primary bg-white hover:bg-primary/10" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Working & functionality – features */}
      <section id="working" className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#06038D] mb-2">Working & Functionality</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
              What you can do on this portal: file complaints, track status, and access information.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-[#06038D]" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-[#06038D]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Report an Issue?</h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto font-medium">Register and file your first complaint in minutes.</p>
          <Link to="/register">
            <Button size="lg" className="bg-[#FF671F] hover:bg-[#e55a15] text-white">Get Started</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="tricolor-strip h-1 w-full" aria-hidden />
        <div className="container mx-auto px-4 py-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-8 w-8 text-[#06038D]" />
                <div>
                  <h3 className="font-bold text-[#06038D]">CitiCare</h3>
                  <p className="text-xs text-muted-foreground font-medium">Municipal Citizen Grievance Portal</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Where civic services converge. Report issues, track resolutions.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li><Link to="/login" className="hover:text-foreground">Login</Link></li>
                <li><Link to="/register" className="hover:text-foreground">Register</Link></li>
                <li><Link to="/documents" className="hover:text-foreground">Documents</Link></li>
                <li><Link to="/projects" className="hover:text-foreground">Projects</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li>Roads & Infrastructure</li>
                <li>Water Supply</li>
                <li>Sanitation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#06038D]" /> 1800-XXX-XXXX</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#06038D]" /> support@citicare.gov.in</li>
                <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#06038D]" /> Mon–Sat: 9:00 AM – 6:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} CitiCare – Municipal Corporation. All rights reserved.</p>
            <p className="mt-1 text-xs">This is the official citizen grievance portal.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
