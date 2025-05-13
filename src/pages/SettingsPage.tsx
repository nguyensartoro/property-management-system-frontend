import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { executeGraphQL } from '../utils/graphqlClient';
import { toast } from 'react-hot-toast';
import {
  User as UserIcon,
  Plus,
  Edit,
  Wallet,
  Copy,
  Send,
  Trash2,
  Check,
  Home
} from 'lucide-react';
import Modal from '../components/shared/Modal';
import { Property, Payment, Room, RoomStatus } from '../interface/interfaces';
import StatusBadge from '../components/shared/StatusBadge';
import { useLanguage } from '../utils/languageContext';

// Define User type to match backend schema
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

const SettingsPage = () => {
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPlan, setCurrentPlan] = useState<{ name: string; price: number; rooms: number; }>({
    name: 'Basic',
    price: 10,
    rooms: 10
  });

  // Modals state
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSendPaymentModalOpen, setIsSendPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Property management states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditPropertyMode, setIsEditPropertyMode] = useState(false);
  const [isPropertyRoomsModalOpen, setIsPropertyRoomsModalOpen] = useState(false);
  const [propertyRooms, setPropertyRooms] = useState<Room[]>([]);
  const [isDeletePropertyModalOpen, setIsDeletePropertyModalOpen] = useState(false);

  // Form data
  const [propertyForm, setPropertyForm] = useState({ name: '', address: '', description: '' });
  const [paymentForm, setPaymentForm] = useState({
    name: '',
    type: 'Bank Transfer',
    accountNumber: '',
    details: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch properties with rooms count
      const propertiesData = await executeGraphQL<{ properties: { nodes: Property[] } }>(
        `query GetUserProperties {
          properties {
            nodes {
              id
              name
              address
              description
              rooms {
                id
                name
                number
                status
              }
            }
          }
        }`
      );

      // Fetch payments
      const paymentsData = await executeGraphQL<{ payments: { nodes: Payment[] } }>(
        `query GetUserPayments {
          payments {
            nodes {
              id
              name
              type
              accountNumber
              details
            }
          }
        }`
      );

      // Fetch subscription plan
      const subscriptionData = await executeGraphQL<{
        subscription: { plan: { name: string; price: number; rooms: number } }
      }>(
        `query GetUserSubscription {
          subscription {
            plan {
              name
              price
              rooms
            }
          }
        }`
      );

      if (propertiesData?.properties?.nodes) {
        setProperties(propertiesData.properties.nodes);
      }

      if (paymentsData?.payments?.nodes) {
        setPayments(paymentsData.payments.nodes);
      }

      if (subscriptionData?.subscription?.plan) {
        setCurrentPlan(subscriptionData.subscription.plan);
      }
    } catch (error) {
      toast.error('Failed to load user data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!propertyForm.name.trim() || !propertyForm.address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await executeGraphQL<{ createProperty: { property: Property } }>(
        `mutation CreateProperty($input: CreatePropertyInput!) {
          createProperty(input: $input) {
            property {
              id
              name
              address
              description
            }
          }
        }`,
        {
          input: {
            name: propertyForm.name,
            address: propertyForm.address,
            description: propertyForm.description
          }
        }
      );

      if (result?.createProperty?.property) {
        setProperties((prev: Property[]) => [...prev, result.createProperty.property]);
        toast.success('Property added successfully');
        setIsPropertyModalOpen(false);
        setPropertyForm({ name: '', address: '', description: '' });
      }
    } catch (error) {
      toast.error('Failed to create property');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setPropertyForm({
      name: property.name,
      address: property.address,
      description: property.description || ''
    });
    setIsEditPropertyMode(true);
    setIsPropertyModalOpen(true);
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    if (!propertyForm.name.trim() || !propertyForm.address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await executeGraphQL<{ updateProperty: { property: Property } }>(
        `mutation UpdateProperty($id: ID!, $input: UpdatePropertyInput!) {
          updateProperty(id: $id, input: $input) {
            property {
              id
              name
              address
              description
            }
          }
        }`,
        {
          id: selectedProperty.id,
          input: {
            name: propertyForm.name,
            address: propertyForm.address,
            description: propertyForm.description
          }
        }
      );

      if (result?.updateProperty?.property) {
        setProperties((prev: Property[]) =>
          prev.map(p => p.id === selectedProperty.id ? result.updateProperty.property : p)
        );
        toast.success('Property updated successfully');
        setIsPropertyModalOpen(false);
        setPropertyForm({ name: '', address: '', description: '' });
        setSelectedProperty(null);
        setIsEditPropertyMode(false);
      }
    } catch (error) {
      toast.error('Failed to update property');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDeletePropertyModalOpen(true);
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;

    setLoading(true);
    try {
      await executeGraphQL(
        `mutation DeleteProperty($id: ID!) {
          deleteProperty(id: $id) {
            id
            success
            message
          }
        }`,
        { id: selectedProperty.id }
      );

      setProperties((prev: Property[]) => prev.filter(p => p.id !== selectedProperty.id));
      toast.success('Property deleted successfully');
      setIsDeletePropertyModalOpen(false);
      setSelectedProperty(null);
    } catch (error) {
      toast.error('Failed to delete property');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPropertyRooms = async (property: Property) => {
    setSelectedProperty(property);

    // If rooms are already fetched with the property
    if (property.rooms && property.rooms.length > 0) {
      setPropertyRooms(property.rooms);
      setIsPropertyRoomsModalOpen(true);
      return;
    }

    // Otherwise fetch rooms for this property
    setLoading(true);
    try {
      const result = await executeGraphQL<{ rooms: { nodes: Room[] } }>(
        `query GetPropertyRooms($propertyId: ID!) {
          rooms(propertyId: $propertyId) {
            nodes {
              id
              name
              number
              floor
              size
              status
              price
            }
          }
        }`,
        { propertyId: property.id }
      );

      if (result?.rooms?.nodes) {
        setPropertyRooms(result.rooms.nodes);
        setIsPropertyRoomsModalOpen(true);
      }
    } catch (error) {
      toast.error('Failed to load property rooms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentForm.name.trim() || !paymentForm.accountNumber.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await executeGraphQL<{ createPayment: { payment: Payment } }>(
        `mutation CreatePayment($input: CreatePaymentInput!) {
          createPayment(input: $input) {
            payment {
              id
              name
              type
              accountNumber
              details
            }
          }
        }`,
        {
          input: {
            name: paymentForm.name,
            type: paymentForm.type,
            accountNumber: paymentForm.accountNumber,
            details: paymentForm.details
          }
        }
      );

      if (result?.createPayment?.payment) {
        setPayments((prev: Payment[]) => [...prev, result.createPayment.payment]);
        toast.success('Payment method added successfully');
        setIsPaymentModalOpen(false);
        setPaymentForm({ name: '', type: 'Bank Transfer', accountNumber: '', details: '' });
      }
    } catch (error) {
      toast.error('Failed to create payment method');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    setLoading(true);
    try {
      await executeGraphQL(
        `mutation DeletePayment($id: ID!) {
          deletePayment(id: $id) {
            id
          }
        }`,
        { id }
      );

      setPayments((prev: Payment[]) => prev.filter(payment => payment.id !== id));
      toast.success('Payment method deleted successfully');
    } catch (error) {
      toast.error('Failed to delete payment method');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const openSendPaymentModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsSendPaymentModalOpen(true);
  };

  if (!user) {
    return <div className="mt-10 text-center">Please login to view settings</div>;
  }

  // Cast user to our User interface with avatar, phone, and address properties
  const typedUser = user as unknown as User;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">{t('settings.profileInformation')}</h2>

      {/* Part 1: User Information */}
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <h3 className="mb-4 text-xl font-semibold text-secondary-900 dark:text-white">{t('settings.profileInformation')}</h3>
          <button className="flex items-center text-primary-500 hover:text-primary-600">
            <Edit size={16} className="mr-1" />
            {t('settings.editProfile')}
          </button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-shrink-0">
            <div className="flex overflow-hidden justify-center items-center w-24 h-24 bg-gray-200 rounded-full dark:bg-gray-700">
              {typedUser.avatar ? (
                <img src={typedUser.avatar} alt={typedUser.name} className="object-cover w-full h-full" />
              ) : (
                <UserIcon size={32} className="text-gray-500 dark:text-gray-400" />
              )}
            </div>
          </div>

          <div className="flex-grow space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.name')}</p>
                <p className="font-medium text-secondary-900 dark:text-white">{typedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.email')}</p>
                <p className="font-medium text-secondary-900 dark:text-white">{typedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.phone')}</p>
                <p className="font-medium text-secondary-900 dark:text-white">{typedUser.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.address')}</p>
                <p className="font-medium text-secondary-900 dark:text-white">{typedUser.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-secondary-900 dark:text-white">{t('settings.properties')}</h4>
            <button
              className="flex items-center text-primary-500 hover:text-primary-600"
              onClick={() => {
                setPropertyForm({ name: '', address: '', description: '' });
                setIsEditPropertyMode(false);
                setSelectedProperty(null);
                setIsPropertyModalOpen(true);
              }}
            >
              <Plus size={16} className="mr-1" />
              {t('settings.addProperty')}
            </button>
          </div>

          {properties.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.noPropertiesYet')}</p>
          ) : (
            <div className="space-y-4">
              {properties.map((property: Property) => {
                // Calculate room statistics
                const totalRooms = property.rooms?.length || 0;
                const availableRooms = property.rooms?.filter((r: Room) => r.status === 'AVAILABLE').length || 0;
                const occupiedRooms = property.rooms?.filter((r: Room) => r.status === 'OCCUPIED').length || 0;

                return (
                  <div
                    key={property.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-750"
                  >
                    <div className="flex flex-col justify-between md:flex-row">
                      <div className="mb-3 md:mb-0">
                        <div className="flex items-center mb-2">
                          <Home size={18} className="mr-2 text-primary-500" />
                          <h5 className="text-lg font-semibold text-secondary-900 dark:text-white">{property.name}</h5>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{property.address}</p>
                        {property.description && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{property.description}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <button
                          onClick={() => handleViewPropertyRooms(property)}
                          className="flex items-center px-3 py-1.5 text-sm text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 dark:bg-gray-700 dark:text-primary-400 dark:hover:bg-gray-650"
                        >
                          <Check size={14} className="mr-1" />
                          {t('settings.viewRooms')}
                        </button>
                        <button
                          onClick={() => handleEditProperty(property)}
                          className="flex items-center px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-650"
                        >
                          <Edit size={14} className="mr-1" />
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDeletePropertyClick(property)}
                          className="flex items-center px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-650"
                        >
                          <Trash2 size={14} className="mr-1" />
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <span className="mr-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('settings.totalRooms')}:</span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 rounded dark:bg-gray-700 dark:text-white">{totalRooms}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('settings.available')}:</span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded dark:bg-green-900 dark:text-green-300">{availableRooms}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('settings.occupied')}:</span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-300">{occupiedRooms}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Part 2: Subscription Plan */}
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="mb-4 text-xl font-semibold text-secondary-900 dark:text-white">{t('settings.currentSubscription')}</h3>

        <div className="p-4 rounded-lg border bg-primary-50 dark:bg-gray-750 border-primary-100 dark:border-gray-700">
          <div className="flex flex-col justify-between md:flex-row">
            <div>
              <h4 className="text-lg font-bold text-primary-600 dark:text-primary-400">{currentPlan.name} {t('settings.plan')}</h4>
              <p className="mt-1 text-secondary-600 dark:text-gray-300">{t('settings.upTo')} {currentPlan.rooms} {t('settings.rooms')}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-3xl font-bold text-secondary-900 dark:text-white">${currentPlan.price}<span className="text-sm font-normal text-gray-500">/{t('common.month')}</span></p>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 rounded-md border transition-colors border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-gray-700">
              {t('settings.upgradePlan')}
            </button>
          </div>
        </div>
      </div>

      {/* Part 3: Payment Methods */}
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">{t('settings.paymentMethods')}</h3>
          <button
            className="flex items-center text-primary-500 hover:text-primary-600"
            onClick={() => setIsPaymentModalOpen(true)}
          >
            <Plus size={16} className="mr-1" />
            {t('settings.addPaymentMethod')}
          </button>
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.noPaymentMethodsYet')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {payments.map((payment: Payment) => (
              <div
                key={payment.id}
                className="flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <Wallet size={18} className="mr-2 text-primary-500" />
                    <h4 className="font-medium text-secondary-900 dark:text-white">{payment.name}</h4>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{payment.type}</p>
                <p className="mb-3 font-mono text-secondary-900 dark:text-white">{payment.accountNumber}</p>

                <div className="flex justify-between pt-3 mt-auto border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => copyToClipboard(payment.accountNumber)}
                    className="flex items-center text-sm text-primary-500 hover:text-primary-600"
                  >
                    <Copy size={14} className="mr-1" />
                    {t('common.copy')}
                  </button>
                  <button
                    onClick={() => openSendPaymentModal(payment)}
                    className="flex items-center text-sm text-primary-500 hover:text-primary-600"
                  >
                    <Send size={14} className="mr-1" />
                    {t('common.send')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Property Modal */}
      <Modal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setIsEditPropertyMode(false);
          setPropertyForm({ name: '', address: '', description: '' });
        }}
        title={isEditPropertyMode ? t('settings.editProperty') : t('settings.addProperty')}
        size="md"
      >
        <form onSubmit={isEditPropertyMode ? handleUpdateProperty : handleCreateProperty} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.propertyName')}*
              </label>
              <input
                type="text"
                id="name"
                value={propertyForm.name}
                onChange={(e) => setPropertyForm({...propertyForm, name: e.target.value})}
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.address')}*
              </label>
              <input
                type="text"
                id="address"
                value={propertyForm.address}
                onChange={(e) => setPropertyForm({...propertyForm, address: e.target.value})}
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.description')}
              </label>
              <textarea
                id="description"
                value={propertyForm.description}
                onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
                rows={3}
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsPropertyModalOpen(false);
                setIsEditPropertyMode(false);
                setPropertyForm({ name: '', address: '', description: '' });
              }}
              className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {loading ? (isEditPropertyMode ? t('common.updating') : t('common.adding')) : (isEditPropertyMode ? t('settings.updateProperty') : t('settings.addProperty'))}
            </button>
          </div>
        </form>
      </Modal>

      {/* Property Rooms Modal */}
      {selectedProperty && (
        <Modal
          isOpen={isPropertyRoomsModalOpen}
          onClose={() => setIsPropertyRoomsModalOpen(false)}
          title={`${t('rooms.roomsIn')} ${selectedProperty.name}`}
          size="lg"
        >
          <div className="p-4">
            <div className="mb-4">
              <h4 className="mb-2 text-lg font-medium text-secondary-900 dark:text-white">{selectedProperty.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProperty.address}</p>
            </div>

            {propertyRooms.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">{t('rooms.noRoomsFound')}</p>
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">{t('rooms.addRoomsFromManagement')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                        {t('rooms.name')}
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                        {t('rooms.number')}
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                        {t('rooms.floor')}
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                        {t('rooms.size')}
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                        {t('rooms.status')}
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                        {t('rooms.price')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {propertyRooms.map((room: Room) => (
                      <tr key={room.id}>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-secondary-900 dark:text-white">
                          {room.name}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-secondary-700 dark:text-gray-300">
                          {room.number}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-secondary-700 dark:text-gray-300">
                          {room.floor}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-secondary-700 dark:text-gray-300">
                          {room.size} m²
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={room.status} />
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-secondary-700 dark:text-gray-300">
                          ${room.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setIsPropertyRoomsModalOpen(false)}
                className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Property Confirmation Modal */}
      {selectedProperty && (
        <Modal
          isOpen={isDeletePropertyModalOpen}
          onClose={() => setIsDeletePropertyModalOpen(false)}
          title={t('settings.deleteProperty')}
          size="sm"
        >
          <div className="p-4">
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              {t('settings.deletePropertyConfirm')} <span className="font-medium">{selectedProperty.name}</span>?
            </p>
            <p className="mb-2 text-sm text-red-600 dark:text-red-400">
              {t('common.actionCannotBeUndone')}
            </p>
            {(selectedProperty.rooms?.length || 0) > 0 && (
              <p className="p-2 mb-4 text-sm text-yellow-700 bg-yellow-50 rounded dark:bg-yellow-900/30 dark:text-yellow-500">
                {t('settings.propertyHasRooms', { count: selectedProperty.rooms?.length || 0 })}
              </p>
            )}

            <div className="flex justify-end mt-6 space-x-4">
              <button
                type="button"
                onClick={() => setIsDeletePropertyModalOpen(false)}
                className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteProperty}
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {loading ? t('common.deleting') : t('common.delete')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Payment Method Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={t('settings.addPaymentMethod')}
        size="md"
      >
        <form onSubmit={handleCreatePayment} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="paymentName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('common.name')}*
              </label>
              <input
                type="text"
                id="paymentName"
                value={paymentForm.name}
                onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})}
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="paymentType" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.type')}*
              </label>
              <select
                id="paymentType"
                value={paymentForm.type}
                onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Bank Transfer">{t('settings.bankTransfer')}</option>
                <option value="MoMo">MoMo</option>
                <option value="ZaloPay">ZaloPay</option>
                <option value="Cash">{t('settings.cash')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="accountNumber" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.accountNumber')}*
              </label>
              <input
                type="text"
                id="accountNumber"
                value={paymentForm.accountNumber}
                onChange={(e) => setPaymentForm({...paymentForm, accountNumber: e.target.value})}
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="details" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.additionalDetails')}
              </label>
              <textarea
                id="details"
                value={paymentForm.details}
                onChange={(e) => setPaymentForm({...paymentForm, details: e.target.value})}
                rows={3}
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {loading ? t('common.adding') : t('settings.addPaymentMethod')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Send Payment Modal */}
      {selectedPayment && (
        <Modal
          isOpen={isSendPaymentModalOpen}
          onClose={() => setIsSendPaymentModalOpen(false)}
          title={t('settings.sendPaymentInformation')}
          size="md"
        >
          <div className="p-4">
            <div className="p-4 mb-6 bg-gray-50 rounded-lg dark:bg-gray-750">
              <h4 className="mb-2 font-medium text-secondary-900 dark:text-white">{selectedPayment.name}</h4>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">{t('settings.type')}: {selectedPayment.type}</p>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{t('settings.account')}: {selectedPayment.accountNumber}</p>
              {selectedPayment.details && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.details')}: {selectedPayment.details}</p>
              )}
            </div>

            {/* Form to select renters would go here */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.selectRenters')}
              </label>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                {t('settings.chooseRentersForPayment')}
              </p>

              {/* This would be populated with actual renters data */}
              <div className="overflow-y-auto p-2 max-h-60 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-750">
                  <input type="checkbox" id="renter1" className="mr-2" />
                  <label htmlFor="renter1" className="text-secondary-900 dark:text-white">John Doe (Room 101)</label>
                </div>
                <div className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-750">
                  <input type="checkbox" id="renter2" className="mr-2" />
                  <label htmlFor="renter2" className="text-secondary-900 dark:text-white">Jane Smith (Room A5)</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsSendPaymentModalOpen(false)}
                className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="px-4 py-2 text-white rounded-md bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={() => {
                  toast.success(t('settings.paymentInformationSent'));
                  setIsSendPaymentModalOpen(false);
                }}
              >
                {t('settings.sendInformation')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SettingsPage;