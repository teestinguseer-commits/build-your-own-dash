-- Create use_cases table for admin to manage use cases
CREATE TABLE public.use_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  href TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (everyone can view use cases)
CREATE POLICY "Anyone can view use cases" 
ON public.use_cases 
FOR SELECT 
USING (true);

-- Create policies for admin write access (only authenticated users can manage)
CREATE POLICY "Authenticated users can create use cases" 
ON public.use_cases 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update use cases" 
ON public.use_cases 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete use cases" 
ON public.use_cases 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_use_cases_updated_at
BEFORE UPDATE ON public.use_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample Sprinklr-based use cases
INSERT INTO public.use_cases (title, description, category, tags, href, image) VALUES
('Social Media Customer Service', 'Handle customer inquiries across all social media platforms with unified agent desktop and AI-powered routing.', 'customer-service', ARRAY['social-media', 'customer-support', 'ai-routing'], '#', '/src/assets/support-preview.jpg'),
('Conversational AI Platform', 'Deploy intelligent chatbots and virtual assistants to automate customer interactions and reduce response times.', 'automation', ARRAY['ai', 'chatbots', 'automation', 'customer-experience'], '#', '/src/assets/api-preview.jpg'),
('Unified Agent Desktop', 'Empower agents with a single interface to manage customer interactions across all channels and touchpoints.', 'customer-service', ARRAY['agent-tools', 'productivity', 'omnichannel'], '#', '/src/assets/dashboard-preview.jpg'),
('Social Listening & Analytics', 'Monitor brand mentions, track sentiment, and gain insights from social media conversations at scale.', 'analytics', ARRAY['social-listening', 'analytics', 'brand-monitoring'], '#', '/src/assets/support-preview.jpg'),
('Campaign Management', 'Plan, execute, and optimize marketing campaigns across multiple social media platforms from one dashboard.', 'marketing', ARRAY['campaigns', 'social-media', 'marketing-automation'], '#', '/src/assets/api-preview.jpg'),
('Content Calendar & Publishing', 'Schedule and publish content across all social channels with approval workflows and collaboration tools.', 'marketing', ARRAY['content-management', 'publishing', 'collaboration'], '#', '/src/assets/dashboard-preview.jpg'),
('Crisis Management', 'Respond quickly to brand crises with real-time monitoring, escalation workflows, and coordinated response teams.', 'customer-service', ARRAY['crisis-management', 'real-time', 'brand-protection'], '#', '/src/assets/support-preview.jpg'),
('Community Forum Management', 'Build and moderate online communities with advanced moderation tools and engagement analytics.', 'engagement', ARRAY['community', 'moderation', 'engagement'], '#', '/src/assets/api-preview.jpg');