export const API_ROUTES = {
  AUTH: {
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    OTP_SEND: '/api/auth/otp/send',
    OTP_VERIFY: '/api/auth/otp/verify',
  },
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (slug: string) => `/api/products/${slug}`,
    CREATE: '/api/admin/products',
    UPDATE: (id: string) => `/api/admin/products/${id}`,
    DELETE: (id: string) => `/api/admin/products/${id}`,
  },
  ORDERS: {
    LIST: '/api/orders',
    DETAIL: (id: string) => `/api/orders/${id}`,
    CREATE: '/api/razorpay/create-order',
  },
  RAZORPAY: {
    CREATE_ORDER: '/api/razorpay/create-order',
    WEBHOOK: '/api/razorpay/webhook',
  },
};

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string) => `/product/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  AUTH_SIGNIN: '/auth/signin',
  AUTH_CALLBACK: '/auth/callback',
};
