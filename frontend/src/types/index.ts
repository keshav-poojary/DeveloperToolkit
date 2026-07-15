export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
  component: React.LazyExoticComponent<React.FC>;
  popular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}
