import { useState, useMemo } from "react";
import { Search, ExternalLink, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import dashboardPreview from "@/assets/dashboard-preview.jpg";
import apiPreview from "@/assets/api-preview.jpg";
import supportPreview from "@/assets/support-preview.jpg";
import customConsultation from "@/assets/custom-consultation.jpg";

interface UseCase {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: "industry" | "team" | "integration";
  href: string;
}

const useCases: UseCase[] = [
  {
    id: "1",
    title: "The fastest way to build a UI on any REST API",
    description: "Drag and drop your UI on top of your REST API and save hundreds of hours.",
    image: apiPreview,
    tags: ["API"],
    category: "integration",
    href: "#"
  },
  {
    id: "2", 
    title: "Customer support dashboard with Airtable",
    description: "Build a customer support dashboard from scratch using Airtable as a data source.",
    image: supportPreview,
    tags: ["API", "Customer Support"],
    category: "team",
    href: "#"
  },
  {
    id: "3",
    title: "Build your Google Sheets frontend 10x faster", 
    description: "Connect to Google Sheets and easily build dashboards and other GUIs in minutes.",
    image: dashboardPreview,
    tags: ["Google Sheets"],
    category: "integration",
    href: "#"
  },
  {
    id: "4",
    title: "A fast and simple Elasticsearch GUI",
    description: "A simple admin panel GUI for all of your Elasticsearch queries: search, index, update, and create.",
    image: dashboardPreview,
    tags: ["PostgreSQL", "Elasticsearch"],
    category: "integration", 
    href: "#"
  },
  {
    id: "5",
    title: "Customer notification system",
    description: "Send helpful notifications to customers at just the right moments.",
    image: supportPreview,
    tags: ["Firestore"],
    category: "integration",
    href: "#"
  },
  {
    id: "6",
    title: "Aggregate and explore media assets",
    description: "Create a single dashboard for team members to sift through your entire media asset library in an instant.",
    image: dashboardPreview,
    tags: ["MySQL", "PostgreSQL", "BigQuery", "DynamoDB"],
    category: "integration",
    href: "#"
  },
  {
    id: "7",
    title: "Know Your Customer (KYC) user explorer",
    description: "Build a KYC user explorer and move new customers through the KYC compliance process faster than ever.",
    image: supportPreview,
    tags: ["Financial Services", "Analytics"],
    category: "industry",
    href: "#"
  },
  {
    id: "8",
    title: "Inventory management dashboard",
    description: "Build an app to see what's in stock, add SKUs, track the status of orders.",
    image: dashboardPreview,
    tags: ["MySQL", "Operations"],
    category: "team",
    href: "#"
  },
  {
    id: "9",
    title: "SLA dashboard",
    description: "Hold your team accountable with visibility into support metrics like time to response.",
    image: supportPreview,
    tags: ["MySQL", "Customer Support"],
    category: "team",
    href: "#"
  },
  {
    id: "10",
    title: "Food delivery tracker",
    description: "Build a customer support tool tailored to food delivery and two-sided marketplaces use cases.",
    image: dashboardPreview,
    tags: ["MongoDB", "Food and Beverage"],
    category: "industry",
    href: "#"
  },
  {
    id: "11",
    title: "Event management tool",
    description: "Build a custom app for managing both virtual and live events.",
    image: apiPreview,
    tags: ["Google Sheets", "MySQL", "PostgreSQL"],
    category: "integration",
    href: "#"
  },
  {
    id: "12",
    title: "A fast and simple MongoDB client",
    description: "A straightforward MongoDB client so you can quickly build apps on top of your MongoDB data.",
    image: dashboardPreview,
    tags: ["MongoDB"],
    category: "integration",
    href: "#"
  }
];

const filters = {
  industry: [
    "Ecommerce", "Education", "Financial Services", "Food and Beverage", 
    "Healthcare", "Hospitality", "Logistics", "Manufacturing and Construction",
    "Marketplaces", "Media", "Real Estate", "Software as a Service", "Startups", "Utilities and Telecoms"
  ],
  team: [
    "Admin", "Analytics", "Customer Success", "Customer Support", 
    "Engineering", "Marketing and Sales", "Mobile", "Operations"
  ],
  integration: [
    "API", "BigQuery", "DynamoDB", "Elasticsearch", "Firebase", "Firestore",
    "Google Sheets", "MongoDB", "MySQL", "PostgreSQL", "React", "Redis",
    "SQL Server", "Salesforce", "SendGrid", "Shopify", "Stripe"
  ]
};

export default function UseCasesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<{
    industry: string[];
    team: string[];
    integration: string[];
  }>({
    industry: [],
    team: [],
    integration: []
  });

  const filteredUseCases = useMemo(() => {
    return useCases.filter(useCase => {
      const matchesSearch = useCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           useCase.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           useCase.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const hasActiveFilters = Object.values(selectedFilters).some(filters => filters.length > 0);
      
      if (!hasActiveFilters) return matchesSearch;

      const matchesFilters = useCase.tags.some(tag => 
        selectedFilters.integration.includes(tag) ||
        selectedFilters.team.some(teamFilter => tag.toLowerCase().includes(teamFilter.toLowerCase())) ||
        selectedFilters.industry.some(industryFilter => tag.toLowerCase().includes(industryFilter.toLowerCase()))
      );

      return matchesSearch && matchesFilters;
    });
  }, [searchQuery, selectedFilters]);

  const toggleFilter = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({ industry: [], team: [], integration: [] });
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  return (
    <div className="min-h-screen bg-background">
      <Header repositoryUrl="https://github.com/your-username/your-repo" />
      {/* Hero Section */}
      <section className="hero-section py-20 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in">
            Use cases for Your SaaS
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-4xl mx-auto animate-fade-in delay-200">
            From customer support to fraud detection, our platform gives you a powerful set of 
            building blocks to develop internal apps that move your business forward.
          </p>
          
          <div className="relative max-w-2xl mx-auto animate-scale-in delay-400">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search use cases..."
              className="search-input pl-12 py-4 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Filters</h2>
                {activeFilterCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="text-primary hover:text-primary/80"
                  >
                    Clear all ({activeFilterCount})
                  </Button>
                )}
              </div>

              {Object.entries(filters).map(([category, items]) => (
                <div key={category} className="animate-slide-up">
                  <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleFilter(category as keyof typeof selectedFilters, item)}
                        className={`filter-button w-full text-left ${
                          selectedFilters[category as keyof typeof selectedFilters].includes(item) 
                            ? 'active' 
                            : ''
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-8">
              <p className="text-lg text-muted-foreground">
                Showing {filteredUseCases.length} of {useCases.length} use cases
              </p>
            </div>

            {/* Use Cases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {filteredUseCases.map((useCase, index) => (
                <Card 
                  key={useCase.id} 
                  className="use-case-card animate-fade-in group cursor-pointer" 
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => window.open(useCase.href, '_blank')}
                >
                  <div className="aspect-video overflow-hidden rounded-t-xl">
                    <img
                      src={useCase.image}
                      alt={useCase.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2">
                      {useCase.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {useCase.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {useCase.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full group" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(useCase.href, '_blank');
                      }}
                    >
                      Learn more 
                      <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Custom CTA Card */}
              <Card className="cta-card col-span-1 md:col-span-2 xl:col-span-3 animate-bounce-in delay-600">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <img
                      src={customConsultation}
                      alt="Custom consultation"
                      className="w-full max-w-md mx-auto rounded-xl opacity-80"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Have a custom use case for your SaaS?
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Let's discuss your specific requirements and build something amazing together.
                    Our engineering team is ready to help you create the perfect solution.
                  </p>
                  <Button size="lg" className="group">
                    <MessageSquare className="mr-2 w-5 h-5" />
                    Talk to our Engineering Team
                    <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}