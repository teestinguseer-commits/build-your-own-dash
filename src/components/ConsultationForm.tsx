import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ExternalLink, Send, User, Mail, Building, MessageCircle, Lightbulb, Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface ConsultationFormProps {
  trigger?: React.ReactNode;
}

export default function ConsultationForm({ trigger }: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: "",
    useCaseTitle: "",
    description: "",
    currentChallenges: "",
    expectedOutcome: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const inquiryTypes = [
    { value: "new-use-case", label: "Request New Use Case", icon: Plus },
    { value: "existing-question", label: "Question about Existing Use Case", icon: MessageCircle },
    { value: "custom-solution", label: "Custom Solution Consultation", icon: Lightbulb },
    { value: "implementation", label: "Implementation Support", icon: Building }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Thank you! We'll get back to you within 24 hours.");
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        company: "",
        inquiryType: "",
        useCaseTitle: "",
        description: "",
        currentChallenges: "",
        expectedOutcome: ""
      });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button 
      size="lg" 
      className="group bg-white text-primary hover:bg-white/90 shadow-lg cursor-pointer z-10 relative"
      type="button"
    >
      <MessageSquare className="mr-2 w-5 h-5" />
      Start Your Journey
      <ExternalLink className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">Let's Build Something Amazing Together</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            Tell us about your requirements and we'll help you find the perfect solution or create a custom use case.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Contact Information */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@company.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Inquiry Type */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                What can we help you with?
              </h3>
              <div className="space-y-3">
                {inquiryTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.value}
                      onClick={() => setFormData({ ...formData, inquiryType: type.value })}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.inquiryType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{type.label}</span>
                        {formData.inquiryType === type.value && (
                          <Badge variant="secondary" className="ml-auto">Selected</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Project Details
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="useCaseTitle">
                    {formData.inquiryType === 'existing-question' ? 'Which use case?' : 'Project Title'}
                  </Label>
                  <Input
                    id="useCaseTitle"
                    value={formData.useCaseTitle}
                    onChange={(e) => setFormData({ ...formData, useCaseTitle: e.target.value })}
                    placeholder={
                      formData.inquiryType === 'existing-question' 
                        ? 'e.g., AI Chatbot for Customer Service'
                        : 'e.g., Advanced Analytics Dashboard'
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your requirements, goals, or questions in detail..."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentChallenges">Current Challenges</Label>
                  <Textarea
                    id="currentChallenges"
                    value={formData.currentChallenges}
                    onChange={(e) => setFormData({ ...formData, currentChallenges: e.target.value })}
                    placeholder="What challenges are you facing with your current solution?"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedOutcome">Expected Outcome</Label>
                  <Textarea
                    id="expectedOutcome"
                    value={formData.expectedOutcome}
                    onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                    placeholder="What results are you hoping to achieve?"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email || !formData.description}
              className="flex-1 glow-button"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Request
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}