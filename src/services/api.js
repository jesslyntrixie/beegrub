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
    // Get menu items by vendor (for students - only available items)
    getByVendor: async (vendorId) => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('is_available', true);
      return { data, error };
    },

    // Get all menu items by vendor (for vendor management - includes unavailable)
    getAllByVendor: async (vendorId) => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
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
    },

    // Delete menu item
    delete: async (id) => {
      const { data, error } = await supabase
        .from('menu_items')
        .delete()
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
        .eq('id', userId)
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
  },

  // Admin related functions
  admin: {
    // Get all vendors with status filter
    getVendors: async (status = null) => {
      let query = supabase
        .from('vendors')
        .select(`
          *,
          user:users(email, created_at)
        `)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      return { data, error };
    },

    // Approve vendor
    approveVendor: async (vendorId) => {
      // First, check if vendor record exists
      const { data: existingVendor, error: checkError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      // If vendor doesn't exist, create it from user metadata
      if (checkError && checkError.code === 'PGRST116') {
        // Get user data to extract metadata
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('auth_user_id')
          .eq('id', vendorId)
          .single();

        if (userError || !user) {
          return { data: null, error: userError || new Error('User not found') };
        }

        // Get auth user metadata
        const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(user.auth_user_id);
        
        if (authError || !authUser) {
          return { data: null, error: authError || new Error('Auth user not found') };
        }

        // Create vendor record from metadata
        const vendorData = {
          id: vendorId,
          business_name: authUser.user_metadata?.canteenName || 'New Vendor',
          location: authUser.user_metadata?.canteenLocation || 'TBD',
          contact_phone: authUser.user_metadata?.phone || '',
          status: 'approved',
          approved_at: new Date().toISOString()
        };

        const { data: createdVendor, error: createError } = await supabase
          .from('vendors')
          .insert([vendorData])
          .select();

        return { data: createdVendor, error: createError };
      }

      // If vendor exists, just update the status
      const { data, error } = await supabase
        .from('vendors')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', vendorId)
        .select();
      return { data, error };
    },

    // Reject vendor
    rejectVendor: async (vendorId) => {
      const { data, error } = await supabase
        .from('vendors')
        .update({ status: 'rejected' })
        .eq('id', vendorId)
        .select();
      return { data, error };
    },

    // Suspend vendor
    suspendVendor: async (vendorId) => {
      const { data, error } = await supabase
        .from('vendors')
        .update({ status: 'suspended' })
        .eq('id', vendorId)
        .select();
      return { data, error };
    },

    // Get all users with role filter
    getUsers: async (role = null) => {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (role) {
        query = query.eq('role', role);
      }
      
      const { data, error } = await query;
      return { data, error };
    },

    // Get all orders (for admin overview)
    getAllOrders: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:vendors(business_name),
          pickup_location:pickup_locations(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      return { data, error };
    },

    // Get statistics
    getStats: async () => {
      try {
        // Count users by role
        const { data: users } = await supabase
          .from('users')
          .select('role');
        
        // Count vendors by status
        const { data: vendors } = await supabase
          .from('vendors')
          .select('status');
        
        // Count orders
        const { data: orders } = await supabase
          .from('orders')
          .select('id, total, status');
        
        const stats = {
          users: {
            total: users?.length || 0,
            students: users?.filter(u => u.role === 'student').length || 0,
            vendors: users?.filter(u => u.role === 'vendor').length || 0,
            admins: users?.filter(u => u.role === 'admin').length || 0,
          },
          vendors: {
            total: vendors?.length || 0,
            pending: vendors?.filter(v => v.status === 'pending').length || 0,
            approved: vendors?.filter(v => v.status === 'approved').length || 0,
            rejected: vendors?.filter(v => v.status === 'rejected').length || 0,
            suspended: vendors?.filter(v => v.status === 'suspended').length || 0,
          },
          orders: {
            total: orders?.length || 0,
            revenue: orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
            pending: orders?.filter(o => o.status === 'pending').length || 0,
            completed: orders?.filter(o => o.status === 'completed').length || 0,
          }
        };
        
        return { data: stats, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  },

  // Orders related functions
  orders: {
    // Create new order with items
    create: async (orderData) => {
      try {
        // 1. Insert order (WITHOUT items - items go to separate table)
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            order_number: orderData.order_number,
            student_id: orderData.student_id,
            vendor_id: orderData.vendor_id,
            pickup_location_id: orderData.pickup_location_id,
            order_type: orderData.order_type || 'pre_order',
            subtotal: orderData.subtotal,
            service_fee: orderData.service_fee,
            total: orderData.total,
            status: orderData.status || 'scheduled',
            scheduled_pickup_time: orderData.scheduled_pickup_time,
            time_slot: orderData.time_slot,
            special_instructions: orderData.special_instructions,
            // Note: payment info goes to payments table, not orders table
          }])
          .select()
          .single();

        if (orderError) {
          console.error('Order creation error:', orderError);
          return { data: null, error: orderError };
        }

        // 2. Insert order items to separate table
        const orderItems = orderData.items.map(item => ({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        }));

        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)
          .select();

        if (itemsError) {
          console.error('Order items creation error:', itemsError);
          // Rollback order if items fail
          await supabase.from('orders').delete().eq('id', order.id);
          return { data: null, error: itemsError };
        }

        // 3. Create payment record
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert([{
            order_id: order.id,
            amount: orderData.total,
            payment_method: orderData.payment_method || 'cash',
            status: orderData.payment_status || 'pending',
            paid_at: orderData.payment_status === 'completed' ? new Date().toISOString() : null,
          }])
          .select()
          .single();

        if (paymentError) {
          console.error('Payment creation error:', paymentError);
          // Don't rollback - payment can be added later
        }

        return { data: { ...order, items, payment }, error: null };
      } catch (error) {
        console.error('Order creation exception:', error);
        return { data: null, error };
      }
    },

    // Get orders for a student (new preferred name)
    getByStudentId: async (studentId) => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:vendors(business_name, location),
          pickup_location:pickup_locations(name, building),
          order_items(
            *,
            menu_item:menu_items(name, price)
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Backwards compatibility for older screens still calling getByStudent
    getByStudent: async (studentId) => {
      return apiService.orders.getByStudentId(studentId);
    },

    // Get orders for a vendor (new preferred name)
    getByVendorId: async (vendorId) => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          student:students(full_name, phone),
          pickup_location:pickup_locations(name, building),
          order_items(
            *,
            menu_item:menu_items(name, price)
          )
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // Backwards compatibility helper
    getByVendor: async (vendorId) => {
      return apiService.orders.getByVendorId(vendorId);
    },

    // Update order status
    updateStatus: async (orderId, status) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select();
      return { data, error };
    },
  }
};