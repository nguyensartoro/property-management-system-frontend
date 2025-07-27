import useAuthStore from '../stores/authStore';
import usePropertyStore from '../stores/propertyStore';
import useUIStore from '../stores/uiStore';

// This hook provides a convenient way to access all stores in one place
const useStore = () => {
  return {
    auth: useAuthStore(),
    property: usePropertyStore(),
    ui: useUIStore(),
  };
};

export default useStore;