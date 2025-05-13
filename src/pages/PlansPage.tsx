import * as React from 'react';
import { Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Plan {
  id: string;
  title: string;
  price: number;
  billing: 'monthly' | 'yearly';
  capacity: string;
  features: string[];
  popular?: boolean;
}

const PlansPage: React.FC = () => {
  const [billing, setBilling] = React.useState<'monthly' | 'yearly'>('monthly');

  const plans: Plan[] = [
    {
      id: 'basic',
      title: 'Basic',
      price: billing === 'monthly' ? 10 : 8 * 12,
      billing,
      capacity: 'Up to 10 rooms',
      features: [
        'Room Management',
        'Renter Management',
        'Basic Contract Management',
        'Mobile-friendly dashboard',
        'Email Support',
      ],
    },
    {
      id: 'standard',
      title: 'Standard',
      price: billing === 'monthly' ? 20 : 16 * 12,
      billing,
      capacity: '11-50 rooms',
      features: [
        'Room Management',
        'Renter Management',
        'Full Contract Management',
        'Mobile-friendly dashboard',
        'Service Management',
        'Email & Chat Support',
        'Basic Analytics',
      ],
      popular: true,
    },
    {
      id: 'professional',
      title: 'Professional',
      price: billing === 'monthly' ? 40 : 32 * 12,
      billing,
      capacity: '51-100 rooms',
      features: [
        'Room Management',
        'Renter Management',
        'Full Contract Management',
        'Mobile-friendly dashboard',
        'Service Management',
        'Priority Support',
        'Advanced Analytics',
        'Payment Processing',
        'Expense Tracking',
      ],
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      price: billing === 'monthly' ? 80 : 64 * 12,
      billing,
      capacity: 'Over 100 rooms',
      features: [
        'Room Management',
        'Renter Management',
        'Full Contract Management',
        'Mobile-friendly dashboard',
        'Service Management',
        '24/7 Support',
        'Advanced Analytics',
        'Payment Processing',
        'Expense Tracking',
        'Multi-property Management',
        'Custom Reporting',
        'API Access',
      ],
    },
  ];

  const handleSubscribe = (plan: Plan) => {
    toast.success(`You've selected the ${plan.title} plan. Redirecting to payment...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">Subscription Plans</h2>
        <p className="text-secondary-500">Choose the right plan for your property management needs</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="p-1 bg-gray-100 rounded-lg inline-flex">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billing === 'monthly'
                ? 'bg-white shadow-sm text-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billing === 'yearly'
                ? 'bg-white shadow-sm text-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Yearly <span className="text-xs text-green-500 ml-1">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border ${
              plan.popular ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'
            } bg-white p-6 shadow-sm relative flex flex-col`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
            )}

            <div className="mb-5">
              <h3 className="text-lg font-semibold text-secondary-900">{plan.title}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-secondary-900">${plan.price}</span>
                <span className="text-secondary-500">/{billing}</span>
              </div>
              <p className="mt-1 text-sm text-secondary-500">{plan.capacity}</p>
            </div>

            <div className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mr-2" />
                    <span className="text-secondary-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe(plan)}
              className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-medium ${
                plan.popular
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-white text-primary-500 border border-primary-500 hover:bg-primary-50'
              }`}
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Need a custom plan?</h3>
        <p className="text-secondary-600 mb-4">
          We offer custom solutions for large property management companies. Contact our sales team to learn more.
        </p>
        <button
          onClick={() => 
            toast.success('Our sales team will contact you shortly.')
          }
          className="inline-flex items-center px-4 py-2 border border-primary-500 text-primary-500 rounded-md hover:bg-primary-50 text-sm font-medium"
        >
          Contact Sales
        </button>
      </div>
    </div>
  );
};

export default PlansPage; 