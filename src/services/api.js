import { supabase } from './supabase';

export const apiService = {
  // Users related functions
  users: {
    // Create user record (linking auth_user_id to role)
    create: async (userData) => {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();
      return { data, error };
    },

    // Get user by auth_user_id
    getByAuthUserId: async (authUserId) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();
      return { data, error };
    }
  },

  // Vendor related functions
  vendors: {
    // Get all approved vendors
    getAll: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('status', 'approved');
      return { data, error };
    },

    // Get vendor by ID
    getById: async (id) => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    // Create new vendor
    create: async (vendorData) => {
      const { data, error } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select();
      return { data, error };
    },

    // Update vendor
    update: async (id, vendorData) => {
      const { data, error } = await supabase
        .from('vendors')
        .update(vendorData)
        .eq('id', id)
        .select();
      return { data, error };
    }
  },

  // Menu items related functions
  menuItems: {
    // Get menu items by vendor
    getByVendor: async (vendorId) => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('available', true);
      return { data, error };
    },

    // Create menu item
    create: async (itemData) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([itemData])
        .select();
      return { data, error };
    },

    // Update menu item
    update: async (id, itemData) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', id)
        .select();
      return { data, error };
    }
  },

  // Orders related functions
  orders: {
    // Create new order
    create: async (orderData) => {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();
      return { data, error };
    },

    // Get orders by student
    getByStudent: async (studentId) => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:vendors(*),
          order_items:order_items(*, menu_item:menu_items(*))
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Get orders by vendor
    getByVendor: async (vendorId) => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          student:students(*),
          order_items:order_items(*, menu_item:menu_items(*))
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Update order status
    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select();
      return { data, error };
    }
  },

  // Students related functions
  students: {
    // Create student profile
    create: async (studentData) => {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select();
      return { data, error };
    },

    // Get student by user ID
    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .single();
      return { data, error };
    },

    // Update student profile
    update: async (id, studentData) => {
      const { data, error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', id)
        .select();
      return { data, error };
    }
  }
};