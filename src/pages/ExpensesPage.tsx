import React, { useEffect, useState } from 'react';
import { useExpenseStore } from '../stores/expenseStore';
import { usePropertyStore } from '../stores/propertyStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseSummary from '../components/expenses/ExpenseSummary';
import { useToast } from '../hooks/use-toast';

const ExpensesPage: React.FC = () => {
  const { 
    expenses, 
    expenseSummary, 
    isLoading, 
    fetchExpenses, 
    fetchExpenseSummary,
    createExpense,
    updateExpense,
    deleteExpense 
  } = useExpenseStore();
  
  const { properties, fetchProperties } = usePropertyStore();
  const { toast } = useToast();
  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      setIsInitialLoad(true);
      
      await Promise.all([
        fetchProperties(),
        fetchExpenses(1, 10),
        fetchExpenseSummary()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchExpenses(1, 10, filters);
    }
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    if (value === 'all' || value === '') {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  const handleCreateExpense = async (expenseData: any) => {
    try {
      await createExpense(expenseData);
      setShowExpenseForm(false);
      toast({
        title: 'Success',
        description: 'Expense created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create expense',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateExpense = async (expenseData: any) => {
    try {
      await updateExpense(selectedExpense.id, expenseData);
      setSelectedExpense(null);
      setShowExpenseForm(false);
      toast({
        title: 'Success',
        description: 'Expense updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update expense',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      toast({
        title: 'Success',
        description: 'Expense deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
    }
  };

  if (isInitialLoad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Expenses"
        description="Track and manage property expenses"
        action={
          <Button onClick={() => setShowExpenseForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        }
      />

      {/* Summary Cards */}
      {expenseSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-700">
                    ${expenseSummary.totalExpenses?.toLocaleString() || '0'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${expenseSummary.monthlyExpenses?.toLocaleString() || '0'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average</p>
                  <p className="text-2xl font-bold text-purple-700">
                    ${expenseSummary.averageExpense?.toLocaleString() || '0'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Growth</p>
                  <p className={`text-2xl font-bold ${(expenseSummary.growth || 0) >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {expenseSummary.growth?.toFixed(1) || '0'}%
                  </p>
                </div>
                {(expenseSummary.growth || 0) >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-red-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-green-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ExpenseSummary />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="UTILITIES">Utilities</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="PROPERTY_TAX">Property Tax</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Property</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={filters.propertyId || ''}
                    onChange={(e) => handleFilterChange('propertyId', e.target.value)}
                  >
                    <option value="">All Properties</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date Range</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={filters.dateRange || ''}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  >
                    <option value="">All Time</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="thisYear">This Year</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({})}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fetchExpenses(1, 10, filters)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Expense Records</span>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No expenses found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-gray-600">
                            {expense.property?.name} • {new Date(expense.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {expense.category.replace('_', ' ')}
                        </Badge>
                        <span className="font-semibold text-red-600">
                          ${expense.amount.toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowExpenseForm(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <ExpenseForm
              expense={selectedExpense}
              onSubmit={selectedExpense ? handleUpdateExpense : handleCreateExpense}
              onCancel={() => {
                setShowExpenseForm(false);
                setSelectedExpense(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;