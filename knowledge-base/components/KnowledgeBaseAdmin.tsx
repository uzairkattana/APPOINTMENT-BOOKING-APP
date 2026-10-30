"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search,
  BarChart3,
  Users,
  FileText,
  HelpCircle,
  Stethoscope,
  BookOpen,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Import types and utilities
import type { FAQItem, ServiceInfo, EducationContent } from '../types/index';
import { knowledgeBaseUtils } from '../index';

interface KnowledgeBaseAdminProps {
  className?: string;
  onUpdate?: (type: string, data: any) => void;
}

const KnowledgeBaseAdmin: React.FC<KnowledgeBaseAdminProps> = ({
  className = "",
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  // Load statistics on mount
  useEffect(() => {
    setStatistics(knowledgeBaseUtils.getStatistics());
  }, []);

  // Mock data management functions (in production, these would connect to your backend)
  const handleSaveItem = async (type: string, item: any) => {
    try {
      // In production, this would make API calls
      console.log(`Saving ${type}:`, item);
      
      if (onUpdate) {
        onUpdate(type, item);
      }
      
      setEditingItem(null);
      setShowAddForm(false);
      
      // Refresh statistics
      setStatistics(knowledgeBaseUtils.getStatistics());
      
      // Show success message
      alert(`${type} saved successfully!`);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item. Please try again.');
    }
  };

  const handleDeleteItem = async (type: string, id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        // In production, this would make API calls
        console.log(`Deleting ${type} with id:`, id);
        
        // Show success message
        alert(`${type} deleted successfully!`);
        
        // Refresh statistics
        setStatistics(knowledgeBaseUtils.getStatistics());
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
      }
    }
  };

  // FAQ Management Component
  const FAQManager = () => {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">FAQ Management</h3>
            <p className="text-gray-600 dark:text-gray-400">Manage frequently asked questions</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* FAQ List */}
        <div className="grid gap-4">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{faq.category}</Badge>
                      <Badge variant={faq.priority === 'high' ? 'default' : 'secondary'}>
                        {faq.priority}
                      </Badge>
                      {faq.isPopular && (
                        <Badge variant="secondary">Popular</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold mb-2">{faq.question}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingFAQ(faq)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteItem('FAQ', faq.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Service Management Component
  const ServiceManager = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Service Management</h3>
            <p className="text-gray-600 dark:text-gray-400">Manage clinic services and descriptions</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Services content would go here */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Service management interface would be implemented here
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Education Content Manager
  const EducationManager = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Education Content</h3>
            <p className="text-gray-600 dark:text-gray-400">Manage patient education articles</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Article
          </Button>
        </div>

        {/* Education content would go here */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Education content management interface would be implemented here
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold">Knowledge Base Dashboard</h3>
          <p className="text-gray-600 dark:text-gray-400">Overview and statistics</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                  <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total FAQs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics?.faqs || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                  <Stethoscope className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Services</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics?.services || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900">
                  <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Articles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics?.education || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900">
                  <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics?.total || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">FAQ "What is the Gonstead Technique?" updated</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                  <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New service "Emergency Care" added</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900">
                  <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Article "Understanding Your Spine" published</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Knowledge Base Version</span>
                <Badge variant="outline">{statistics?.version || '1.0.0'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Updated</span>
                <span className="text-sm text-gray-500">{statistics?.lastUpdated || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Knowledge Base Administration
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Manage and maintain your clinic's knowledge base content
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="faqs">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="services">
            <Stethoscope className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="education">
            <BookOpen className="h-4 w-4 mr-2" />
            Education
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Users className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <Dashboard />
        </TabsContent>

        <TabsContent value="faqs" className="mt-6">
          <FAQManager />
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <ServiceManager />
        </TabsContent>

        <TabsContent value="education" className="mt-6">
          <EducationManager />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">Settings</h3>
              <p className="text-gray-600 dark:text-gray-400">Configure knowledge base settings</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="enable-search">Enable Search</Label>
                    <p className="text-sm text-gray-500">Allow users to search the knowledge base</p>
                  </div>
                  <Switch id="enable-search" defaultChecked />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="show-popular">Show Popular Content</Label>
                    <p className="text-sm text-gray-500">Display popular items prominently</p>
                  </div>
                  <Switch id="show-popular" defaultChecked />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <Label htmlFor="enable-filters">Enable Filtering</Label>
                    <p className="text-sm text-gray-500">Allow users to filter content by tags</p>
                  </div>
                  <Switch id="enable-filters" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Cache
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeBaseAdmin;
