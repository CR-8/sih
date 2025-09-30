import { ComponentType } from 'react';

// Component imports
import { Hero } from '@/components/trial/hero1';
import { About } from '@/components/trial/about';
import { Gallery4 } from '@/components/trial/gallery';
import { Feature as Features1 } from '@/components/trial/features1';
import { Feature as Features2 } from '@/components/trial/features2';
import { Services } from '@/components/trial/services';
import { Stats } from '@/components/trial/stats';
import { Contact2 } from '@/components/trial/contact';
import { Signup } from '@/components/trial/signup';
import { Casestudies } from '@/components/trial/casestudy';
import { Compliance } from '@/components/trial/compliance';

export interface ComponentInfo {
  id: string;
  name: string;
  description: string;
  category: 'hero' | 'content' | 'features' | 'gallery' | 'contact' | 'other';
  component: ComponentType<any>;
  thumbnail?: string;
  defaultProps?: Record<string, any>;
}

export const componentRegistry: ComponentInfo[] = [
  {
    id: 'hero1',
    name: 'Hero Section',
    description: 'Modern hero section with reviews and call-to-action buttons',
    category: 'hero',
    component: Hero,
    thumbnail: '/thumbnails/hero1.jpg',
    defaultProps: {
      heading: 'AI-Powered Design Solutions',
      description: 'Transform your vision into reality with our intelligent design recommendations.',
    },
  },
  {
    id: 'about',
    name: 'About Us',
    description: 'Comprehensive about section with achievements and company info',
    category: 'content',
    component: About,
    thumbnail: '/thumbnails/about.jpg',
    defaultProps: {
      title: 'About Our Platform',
      description: 'We leverage AI to create stunning, personalized design experiences.',
    },
  },
  {
    id: 'gallery',
    name: 'Image Gallery',
    description: 'Interactive image gallery with grid layout',
    category: 'gallery',
    component: Gallery4,
    thumbnail: '/thumbnails/gallery.jpg',
  },
  {
    id: 'features1',
    name: 'Features Grid',
    description: 'Feature showcase with icons and descriptions',
    category: 'features',
    component: Features1,
    thumbnail: '/thumbnails/features1.jpg',
  },
  {
    id: 'features2',
    name: 'Features List',
    description: 'Alternative feature layout with detailed descriptions',
    category: 'features',
    component: Features2,
    thumbnail: '/thumbnails/features2.jpg',
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Service offerings with pricing and details',
    category: 'content',
    component: Services,
    thumbnail: '/thumbnails/services.jpg',
  },
  {
    id: 'stats',
    name: 'Statistics',
    description: 'Key metrics and achievement numbers',
    category: 'content',
    component: Stats,
    thumbnail: '/thumbnails/stats.jpg',
  },
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Contact form with validation and multiple contact methods',
    category: 'contact',
    component: Contact2,
    thumbnail: '/thumbnails/contact.jpg',
  },
  {
    id: 'signup',
    name: 'Sign Up',
    description: 'User registration form with modern design',
    category: 'contact',
    component: Signup,
    thumbnail: '/thumbnails/signup.jpg',
  },
  {
    id: 'casestudy',
    name: 'Case Study',
    description: 'Detailed case study presentation',
    category: 'content',
    component: Casestudies,
    thumbnail: '/thumbnails/casestudy.jpg',
  },
  {
    id: 'compliance',
    name: 'Compliance',
    description: 'Legal and compliance information section',
    category: 'other',
    component: Compliance,
    thumbnail: '/thumbnails/compliance.jpg',
  },
];

export const getComponentById = (id: string): ComponentInfo | undefined => {
  return componentRegistry.find(comp => comp.id === id);
};

export const getComponentsByCategory = (category: ComponentInfo['category']): ComponentInfo[] => {
  return componentRegistry.filter(comp => comp.category === category);
};

export const getAllCategories = (): ComponentInfo['category'][] => {
  return Array.from(new Set(componentRegistry.map(comp => comp.category)));
};