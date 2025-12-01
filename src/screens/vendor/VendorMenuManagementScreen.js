import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { authService } from '../../services/supabase';

export const VendorMenuManagementScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', description: '' });
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const authUser = await authService.getCurrentUser();
      if (!authUser) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const { data: appUser, error: userError } = await apiService.users.getByAuthUserId(
        authUser.id,
      );

      if (userError || !appUser) {
        console.error('Error fetching vendor user:', userError);
        Alert.alert('Error', 'Failed to find vendor profile for this account.');
        return;
      }

      const { data, error } = await apiService.menuItems.getAllByVendor(appUser.id);
      if (error) {
        console.error('Error loading menu items:', error);
        Alert.alert('Error', 'Failed to load menu items');
        return;
      }

      setItems(data || []);
    } catch (err) {
      console.error('Error loading menu items:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setForm({ name: '', price: '', description: '' });
    setModalVisible(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      price: String(item.price || ''),
      description: item.description || '',
    });
    setModalVisible(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setForm({ name: '', price: '', description: '' });
    setModalVisible(true);
  };

  const handleToggleAvailability = async (item) => {
    try {
      const { error } = await apiService.menuItems.update(item.id, {
        is_available: !item.is_available,
      });
      if (error) {
        console.error('Error updating availability:', error);
        Alert.alert('Error', 'Failed to update item availability');
        return;
      }
      loadMenuItems();
    } catch (err) {
      console.error('Unexpected error updating availability:', err);
      Alert.alert('Error', 'Unexpected error updating availability');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      Alert.alert('Validation', 'Please enter a name and price');
      return;
    }

    try {
      const authUser = await authService.getCurrentUser();
      if (!authUser) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const { data: appUser, error: userError } = await apiService.users.getByAuthUserId(
        authUser.id,
      );

      if (userError || !appUser) {
        console.error('Error fetching vendor user:', userError);
        Alert.alert('Error', 'Failed to find vendor profile for this account.');
        return;
      }

      const payload = {
        name: form.name,
        price: Number(form.price),
        description: form.description || null,
        vendor_id: appUser.id,
      };

      if (editingItem) {
        const { error } = await apiService.menuItems.update(editingItem.id, payload);
        if (error) {
          console.error('Error updating menu item:', error);
          Alert.alert('Error', 'Failed to update menu item');
          return;
        }
      } else {
        const { error } = await apiService.menuItems.create(payload);
        if (error) {
          console.error('Error creating menu item:', error);
          Alert.alert('Error', 'Failed to create menu item');
          return;
        }
      }

      resetForm();
      loadMenuItems();
    } catch (err) {
      console.error('Unexpected error saving menu item:', err);
      Alert.alert('Error', 'Unexpected error saving menu item');
    }
  };

  const handleDeleteItem = async (item) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await apiService.menuItems.delete(item.id);
              if (error) {
                console.error('Error deleting menu item:', error);
                Alert.alert('Error', 'Failed to delete menu item');
                return;
              }
              Alert.alert('Success', 'Menu item deleted successfully');
              loadMenuItems();
            } catch (err) {
              console.error('Unexpected error deleting menu item:', err);
              Alert.alert('Error', 'Unexpected error deleting menu item');
            }
          },
        },
      ]
    );
  };

  const renderItemRow = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>Rp {(item.price || 0).toLocaleString()}</Text>
      </View>
      {item.description ? (
        <Text style={styles.itemDescription}>{item.description}</Text>
      ) : null}
      <View style={styles.itemFooter}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Available</Text>
          <Switch
            value={item.is_available}
            onValueChange={() => handleToggleAvailability(item)}
          />
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditItem(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItem(item)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Menu Management</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.subtitle}>Manage your canteen menu items</Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
        <Ionicons name="add-circle" size={18} color={COLORS.white} />
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>

      <FlatList
        data={items || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItemRow}
        contentContainerStyle={
          (items || []).length === 0 ? styles.emptyContainer : styles.listContainer
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No menu items</Text>
            <Text style={styles.emptyText}>Tap "Add new item" to create your first menu item.</Text>
          </View>
        }
      />

      {/* Modal for Add/Edit Form */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit menu item' : 'Add new item'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Item name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Nasi Goreng"
                value={form.name}
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
              />

              <Text style={styles.inputLabel}>Price (Rp) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 15000"
                keyboardType="numeric"
                value={form.price}
                onChangeText={(text) => setForm((prev) => ({ ...prev, price: text }))}
              />

              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your dish..."
                multiline
                numberOfLines={4}
                value={form.description}
                onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingItem ? 'Save changes' : 'Add item'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '400',
  },
  addButton: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.buttonPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.large,
    borderTopRightRadius: BORDER_RADIUS.large,
    maxHeight: '85%',
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.sm,
  },
  modalContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
    minHeight: 48,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelButtonText: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  saveButtonText: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xl,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.large,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  itemName: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    flexShrink: 1,
  },
  itemPrice: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  itemDescription: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  itemActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  editButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.info,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  deleteButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.error,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: FONTS.extraSmall,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default VendorMenuManagementScreen;
