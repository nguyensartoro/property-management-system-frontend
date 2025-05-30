export type Language = 'en' | 'vi';

export const LANGUAGES = {
  en: {
    name: 'English',
    code: 'en',
  },
  vi: {
    name: 'Tiếng Việt',
    code: 'vi',
  }
};

export const TEXT = {
  // Common UI elements
  common: {
    save: {
      en: 'Save',
      vi: 'Lưu',
    },
    cancel: {
      en: 'Cancel',
      vi: 'Hủy',
    },
    edit: {
      en: 'Edit',
      vi: 'Sửa',
    },
    delete: {
      en: 'Delete',
      vi: 'Xóa',
    },
    search: {
      en: 'Search',
      vi: 'Tìm kiếm',
    },
    filter: {
      en: 'Filter',
      vi: 'Lọc',
    },
    add: {
      en: 'Add',
      vi: 'Thêm',
    },
    close: {
      en: 'Close',
      vi: 'Đóng',
    },
    view: {
      en: 'View',
      vi: 'Xem',
    },
    update: {
      en: 'Update',
      vi: 'Cập nhật',
    },
    create: {
      en: 'Create',
      vi: 'Tạo mới',
    },
    active: {
      en: 'Active',
      vi: 'Đang hoạt động',
    },
    inactive: {
      en: 'Inactive',
      vi: 'Không hoạt động',
    },
    prev: {
      en: 'Prev',
      vi: 'Trước',
    },
    next: {
      en: 'Next',
      vi: 'Tiếp',
    },
    welcomeBack: {
      en: 'Welcome back, {name}!',
      vi: 'Chào mừng trở lại, {name}!',
    },
    noResults: {
      en: 'No results found',
      vi: 'Không tìm thấy kết quả',
    },
    noRoomsFound: {
      en: 'No rooms found',
      vi: 'Không tìm thấy phòng nào',
    },
    noRentersFound: {
      en: 'No renters found',
      vi: 'Không tìm thấy người thuê nào',
    },
    noServicesFound: {
      en: 'No services found',
      vi: 'Không tìm thấy dịch vụ nào',
    },
    noContractsFound: {
      en: 'No contracts found',
      vi: 'Không tìm thấy hợp đồng nào',
    },
    all: {
      en: 'All',
      vi: 'Tất cả',
    },
    allStatuses: {
      en: 'All Statuses',
      vi: 'Tất cả trạng thái',
    },
    min: {
      en: 'Min',
      vi: 'Tối thiểu',
    },
    max: {
      en: 'Max',
      vi: 'Tối đa',
    },
    status: {
      en: 'Status',
      vi: 'Trạng thái',
    },
    sortBy: {
      en: 'Sort By',
      vi: 'Sắp xếp theo',
    },
    price: {
      en: 'Price',
      vi: 'Giá',
    },
    confirmDelete: {
      en: 'Confirm Delete',
      vi: 'Xác nhận xóa',
    },
    newest: {
      en: 'Newest',
      vi: 'Mới nhất',
    },
    priceLowToHigh: {
      en: 'Price: Low to High',
      vi: 'Giá: Thấp đến cao',
    },
    priceHighToLow: {
      en: 'Price: High to Low',
      vi: 'Giá: Cao đến thấp',
    },
    showing: {
      en: 'Showing',
      vi: 'Hiển thị',
    },
    to: {
      en: 'to',
      vi: 'đến',
    },
    of: {
      en: 'of',
      vi: 'trong số',
    },
    loading: {
      en: 'Loading',
      vi: 'Đang tải',
    },
    errorLoading: {
      en: 'Error loading data',
      vi: 'Lỗi khi tải dữ liệu',
    },
    error: {
      en: 'Error',
      vi: 'Lỗi',
    },
    unknownError: {
      en: 'Unknown error',
      vi: 'Lỗi không xác định',
    },
  },

  // Auth related text
  auth: {
    createAccount: {
      en: 'Create your account',
      vi: 'Tạo tài khoản',
    },
    orSignIn: {
      en: 'Or',
      vi: 'Hoặc',
    },
    signInExisting: {
      en: 'sign in to your existing account',
      vi: 'đăng nhập vào tài khoản hiện có',
    },
    fullName: {
      en: 'Full name',
      vi: 'Họ và tên',
    },
    emailAddress: {
      en: 'Email address',
      vi: 'Địa chỉ email',
    },
    password: {
      en: 'Password',
      vi: 'Mật khẩu',
    },
    confirmPassword: {
      en: 'Confirm password',
      vi: 'Xác nhận mật khẩu',
    },
    creatingAccount: {
      en: 'Creating account...',
      vi: 'Đang tạo tài khoản...',
    },
    registerAsRenter: {
      en: 'Register as a renter',
      vi: 'Đăng ký với tư cách người thuê',
    },
    signIn: {
      en: 'Sign in to your account',
      vi: 'Đăng nhập vào tài khoản',
    },
    createNewAccount: {
      en: 'create a new account',
      vi: 'tạo tài khoản mới',
    },
    signingIn: {
      en: 'Signing in...',
      vi: 'Đang đăng nhập...',
    },
    logout: {
      en: 'Logout',
      vi: 'Đăng xuất',
    },
  },

  // Navigation menu
  navigation: {
    dashboard: {
      en: 'Dashboard',
      vi: 'Trang chính',
    },
    analytics: {
      en: 'Analytics',
      vi: 'Phân tích',
    },
    rooms: {
      en: 'Rooms',
      vi: 'Phòng',
    },
    renters: {
      en: 'Renters',
      vi: 'Người thuê',
    },
    contracts: {
      en: 'Contracts',
      vi: 'Hợp đồng',
    },
    services: {
      en: 'Services',
      vi: 'Dịch vụ',
    },
    settings: {
      en: 'Settings',
      vi: 'Cài đặt',
    },
  },

  // Dashboard
  dashboard: {
    totalRooms: {
      en: 'Total Rooms',
      vi: 'Tổng số phòng',
    },
    occupiedRooms: {
      en: 'Occupied Rooms',
      vi: 'Phòng đã thuê',
    },
    availableRooms: {
      en: 'Available Rooms',
      vi: 'Phòng trống',
    },
    reservedRooms: {
      en: 'Reserved Rooms',
      vi: 'Phòng đã đặt',
    },
    monthlyRevenue: {
      en: 'Monthly Revenue',
      vi: 'Doanh thu tháng',
    },
    pendingPayments: {
      en: 'Pending Payments',
      vi: 'Thanh toán đang chờ',
    },
    overduePayments: {
      en: 'Overdue Payments',
      vi: 'Thanh toán quá hạn',
    },
    revenue: {
      en: 'Revenue',
      vi: 'Doanh thu',
    },
    occupancy: {
      en: 'Occupancy',
      vi: 'Tỷ lệ lấp đầy',
    },
    contracts: {
      en: 'Contracts',
      vi: 'Hợp đồng',
    },
    recentPayments: {
      en: 'Recent Payments',
      vi: 'Thanh toán gần đây',
    },
    upcomingEvents: {
      en: 'Upcoming Events',
      vi: 'Sự kiện sắp tới',
    },
    alerts: {
      en: 'Alerts',
      vi: 'Cảnh báo',
    },
    paid: {
      en: 'Paid',
      vi: 'Đã thanh toán',
    },
    pending: {
      en: 'Pending',
      vi: 'Đang chờ',
    },
    paymentStatus: {
      en: 'Status',
      vi: 'Trạng thái',
    },
    contractExpiration: {
      en: 'Contract Expiration',
      vi: 'Hết hạn hợp đồng',
    },
    maintenance: {
      en: 'Maintenance',
      vi: 'Bảo trì',
    },
    newRenter: {
      en: 'New Renter',
      vi: 'Người thuê mới',
    },
    overduePayment: {
      en: 'Overdue Payment',
      vi: 'Thanh toán quá hạn',
    },
    contractExpiringSoon: {
      en: 'Contract Expiring Soon',
      vi: 'Hợp đồng sắp hết hạn',
    },
    occupancyRate: {
      en: 'Occupancy Rate',
      vi: 'Tỷ lệ lấp đầy',
    },
  },

  // Settings page
  settings: {
    profileInformation: {
      en: 'Profile Information',
      vi: 'Thông tin cá nhân',
    },
    editProfile: {
      en: 'Edit Profile',
      vi: 'Chỉnh sửa hồ sơ',
    },
    name: {
      en: 'Name',
      vi: 'Tên',
    },
    email: {
      en: 'Email',
      vi: 'Email',
    },
    phone: {
      en: 'Phone',
      vi: 'Điện thoại',
    },
    address: {
      en: 'Address',
      vi: 'Địa chỉ',
    },
    properties: {
      en: 'Properties',
      vi: 'Bất động sản',
    },
    addProperty: {
      en: 'Add Property',
      vi: 'Thêm bất động sản',
    },
    noPropertiesYet: {
      en: 'No properties added yet',
      vi: 'Chưa có bất động sản nào',
    },
    propertyName: {
      en: 'Property Name',
      vi: 'Tên bất động sản',
    },
    description: {
      en: 'Description',
      vi: 'Mô tả',
    },
    viewRooms: {
      en: 'View Rooms',
      vi: 'Xem phòng',
    },
    totalRooms: {
      en: 'Total Rooms',
      vi: 'Tổng số phòng',
    },
    available: {
      en: 'Available',
      vi: 'Trống',
    },
    occupied: {
      en: 'Occupied',
      vi: 'Đã thuê',
    },
    roomsIn: {
      en: 'Rooms in',
      vi: 'Phòng trong',
    },
    noRoomsFound: {
      en: 'No rooms found for this property',
      vi: 'Không tìm thấy phòng nào trong bất động sản này',
    },
    room: {
      en: 'Room',
      vi: 'Phòng',
    },
    number: {
      en: 'Number',
      vi: 'Số',
    },
    floor: {
      en: 'Floor',
      vi: 'Tầng',
    },
    size: {
      en: 'Size',
      vi: 'Kích thước',
    },
    status: {
      en: 'Status',
      vi: 'Trạng thái',
    },
    price: {
      en: 'Price',
      vi: 'Giá',
    },
    currentSubscription: {
      en: 'Current Subscription',
      vi: 'Gói đăng ký hiện tại',
    },
    plan: {
      en: 'Plan',
      vi: 'Gói',
    },
    upTo: {
      en: 'Up to',
      vi: 'Lên đến',
    },
    rooms: {
      en: 'rooms',
      vi: 'phòng',
    },
    month: {
      en: 'month',
      vi: 'tháng',
    },
    upgradePlan: {
      en: 'Upgrade Plan',
      vi: 'Nâng cấp gói',
    },
    paymentMethods: {
      en: 'Payment Methods',
      vi: 'Phương thức thanh toán',
    },
    addPaymentMethod: {
      en: 'Add Payment Method',
      vi: 'Thêm phương thức thanh toán',
    },
    noPaymentMethodsYet: {
      en: 'No payment methods added yet',
      vi: 'Chưa có phương thức thanh toán nào',
    },
    confirmDelete: {
      en: 'Are you sure you want to delete',
      vi: 'Bạn có chắc chắn muốn xóa',
    },
    cannotBeUndone: {
      en: 'This action cannot be undone',
      vi: 'Hành động này không thể hoàn tác',
    },
    deleteWarning: {
      en: 'This property has',
      vi: 'Bất động sản này có',
    },
    roomsDeleteWarning: {
      en: 'rooms. All rooms will be deleted along with the property',
      vi: 'phòng. Tất cả phòng sẽ bị xóa cùng với bất động sản',
    },
    deleteProperty: {
      en: 'Delete Property',
      vi: 'Xóa bất động sản',
    },
  },

  // Room status values
  roomStatus: {
    occupied: {
      en: 'Occupied',
      vi: 'Đã thuê',
    },
    available: {
      en: 'Available',
      vi: 'Trống',
    },
    reserved: {
      en: 'Reserved',
      vi: 'Đã đặt',
    },
    maintenance: {
      en: 'Maintenance',
      vi: 'Bảo trì',
    },
  },

  // Services
  services: {
    serviceName: {
      en: 'Service Name',
      vi: 'Tên dịch vụ',
    },
    fee: {
      en: 'Fee',
      vi: 'Phí',
    },
    feeType: {
      en: 'Fee Type',
      vi: 'Loại phí',
    },
    monthly: {
      en: 'Monthly',
      vi: 'Hàng tháng',
    },
    oneTime: {
      en: 'One-time',
      vi: 'Một lần',
    },
    yearly: {
      en: 'Yearly',
      vi: 'Hàng năm',
    },
    serviceIcon: {
      en: 'Service Icon',
      vi: 'Biểu tượng dịch vụ',
    },
    description: {
      en: 'Description',
      vi: 'Mô tả',
    },
    electricity: {
      en: 'Electricity',
      vi: 'Điện',
    },
    water: {
      en: 'Water',
      vi: 'Nước',
    },
    internet: {
      en: 'Internet',
      vi: 'Internet',
    },
    cleaning: {
      en: 'Cleaning',
      vi: 'Dọn dẹp',
    },
    maintenance: {
      en: 'Maintenance',
      vi: 'Bảo trì',
    },
    security: {
      en: 'Security',
      vi: 'An ninh',
    },
    laundry: {
      en: 'Laundry',
      vi: 'Giặt ủi',
    },
    tv: {
      en: 'TV/Cable',
      vi: 'TV/Cáp',
    },
    garbage: {
      en: 'Garbage',
      vi: 'Rác',
    },
  },

  // Renters
  renters: {
    name: {
      en: 'Name',
      vi: 'Tên',
    },
    email: {
      en: 'Email',
      vi: 'Email',
    },
    phone: {
      en: 'Phone',
      vi: 'Điện thoại',
    },
    emergencyContact: {
      en: 'Emergency Contact',
      vi: 'Liên hệ khẩn cấp',
    },
    identityNumber: {
      en: 'Identity Number',
      vi: 'Số CMND/CCCD',
    },
    room: {
      en: 'Room',
      vi: 'Phòng',
    },
    addRenter: {
      en: 'Add Renter',
      vi: 'Thêm người thuê',
    },
    editRenter: {
      en: 'Edit Renter',
      vi: 'Sửa thông tin người thuê',
    },
    renterDetails: {
      en: 'Renter Details',
      vi: 'Chi tiết người thuê',
    },
    documents: {
      en: 'Documents',
      vi: 'Tài liệu',
    },
    noDocuments: {
      en: 'No documents uploaded',
      vi: 'Chưa có tài liệu nào',
    },
    uploadDocument: {
      en: 'Upload Document',
      vi: 'Tải lên tài liệu',
    },
  },

  // Contracts
  contracts: {
    contractName: {
      en: 'Contract Name',
      vi: 'Tên hợp đồng',
    },
    contractType: {
      en: 'Contract Type',
      vi: 'Loại hợp đồng',
    },
    longTerm: {
      en: 'Long Term',
      vi: 'Dài hạn',
    },
    shortTerm: {
      en: 'Short Term',
      vi: 'Ngắn hạn',
    },
    status: {
      en: 'Status',
      vi: 'Trạng thái',
    },
    startDate: {
      en: 'Start Date',
      vi: 'Ngày bắt đầu',
    },
    endDate: {
      en: 'End Date',
      vi: 'Ngày kết thúc',
    },
    renters: {
      en: 'Renters',
      vi: 'Người thuê',
    },
    room: {
      en: 'Room',
      vi: 'Phòng',
    },
    amount: {
      en: 'Amount',
      vi: 'Số tiền',
    },
    deposit: {
      en: 'Security Deposit',
      vi: 'Đặt cọc',
    },
    active: {
      en: 'Active',
      vi: 'Đang hoạt động',
    },
    expired: {
      en: 'Expired',
      vi: 'Đã hết hạn',
    },
    terminated: {
      en: 'Terminated',
      vi: 'Đã chấm dứt',
    },
    draft: {
      en: 'Draft',
      vi: 'Nháp',
    },
    renewed: {
      en: 'Renewed',
      vi: 'Đã gia hạn',
    },
    addContract: {
      en: 'Add Contract',
      vi: 'Thêm hợp đồng',
    },
    editContract: {
      en: 'Edit Contract',
      vi: 'Sửa hợp đồng',
    },
  },

  // Month names
  months: {
    jan: {
      en: 'Jan',
      vi: 'Th.1',
    },
    feb: {
      en: 'Feb',
      vi: 'Th.2',
    },
    mar: {
      en: 'Mar',
      vi: 'Th.3',
    },
    apr: {
      en: 'Apr',
      vi: 'Th.4',
    },
    may: {
      en: 'May',
      vi: 'Th.5',
    },
    jun: {
      en: 'Jun',
      vi: 'Th.6',
    },
    jul: {
      en: 'Jul',
      vi: 'Th.7',
    },
    aug: {
      en: 'Aug',
      vi: 'Th.8',
    },
    sep: {
      en: 'Sep',
      vi: 'Th.9',
    },
    oct: {
      en: 'Oct',
      vi: 'Th.10',
    },
    nov: {
      en: 'Nov',
      vi: 'Th.11',
    },
    dec: {
      en: 'Dec',
      vi: 'Th.12',
    },
  },

  // Rooms page specific texts
  rooms: {
    type: {
      en: 'Type',
      vi: 'Loại phòng',
    },
    single: {
      en: 'Single',
      vi: 'Đơn',
    },
    double: {
      en: 'Double',
      vi: 'Đôi',
    },
    suite: {
      en: 'Suite',
      vi: 'Suite',
    },
    studio: {
      en: 'Studio',
      vi: 'Studio',
    },
    roomNumber: {
      en: 'Room Number',
      vi: 'Số phòng',
    },
    manageRooms: {
      en: 'Manage all your rental rooms',
      vi: 'Quản lý tất cả các phòng cho thuê của bạn',
    },
    addNewRoom: {
      en: 'Add New Room',
      vi: 'Thêm phòng mới',
    },
    searchPlaceholder: {
      en: 'Search by room number...',
      vi: 'Tìm kiếm theo số phòng...',
    },
    roomCreated: {
      en: 'Room {number} created!',
      vi: 'Phòng {number} đã được tạo!',
    },
    roomUpdated: {
      en: 'Room {number} updated!',
      vi: 'Phòng {number} đã được cập nhật!',
    },
    roomDeleted: {
      en: 'Room {number} deleted!',
      vi: 'Phòng {number} đã bị xóa!',
    },
    failedToDelete: {
      en: 'Failed to delete room',
      vi: 'Không thể xóa phòng',
    },
    confirmDeleteRoom: {
      en: 'Are you sure you want to delete room',
      vi: 'Bạn có chắc chắn muốn xóa phòng',
    },
  },
};

// Define types for translation objects
// Helper function to get text based on language
export const getText = (path: string, language: Language = 'en'): string => {
  const parts = path.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = TEXT;

  for (const part of parts) {
    if (result[part]) {
      result = result[part];
    } else {
      return path; // Return the path if text not found
    }
  }

  return result[language] || path;
};