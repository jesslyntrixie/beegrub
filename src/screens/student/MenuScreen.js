import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { CartContext } from '../../context/CartContext'; 

export const MenuScreen = ({ route, navigation }) => {
  const { vendor } = route.params;
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const { cart, addToCart, updateQuantity, getCartTotals } = useContext(CartContext);
  const cartItems = cart.items;
  const totals = getCartTotals();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const { data, error } = await apiService.menuItems.getByVendor(vendor.id);
      if (error) {
        Alert.alert('Error', 'Failed to load menu items');
        return;
      }
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantity = (itemId) => {
    const item = cartItems.find(cartItem => cartItem.menu_item_id === itemId);
    return item ? item.quantity : 0;
  };

  const openItemDetails = (item) => {
    setSelectedItem(item);
  };

  const closeItemDetails = () => {
    setSelectedItem(null);
  };

  const goToCheckout = () => {
    if (!cartItems.length) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }
    navigation.navigate('Checkout', { vendor, cartItems });
  };

  const renderMenuItem = ({ item }) => {
    const quantity = getItemQuantity(item.id);
    
    return (
      <View style={styles.menuItem}>
        <TouchableOpacity
          style={styles.itemInfo}
          activeOpacity={0.7}
          onPress={() => openItemDetails(item)}
        >
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPriceLarge}>Rp {item.price.toLocaleString()}</Text>
          <Text style={styles.detailsHint}>Tap for details</Text>
        </TouchableOpacity>
        
        <View style={styles.quantityContainer}>
          {quantity > 0 ? (
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, quantity - 1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => addToCart(item, vendor.id, vendor.business_name || vendor.canteen_name)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => addToCart(item, vendor.id, vendor.business_name || vendor.canteen_name)}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Menu Items</Text>
      <Text style={styles.emptyStateText}>
        This canteen hasn't added any menu items yet
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{vendor.business_name || vendor.canteen_name}</Text>
          <Text style={styles.vendorLocation}>{vendor.location || vendor.canteen_location}</Text>
        </View>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.menuList,
          cartItems.length ? styles.menuListWithCart : null
        ]}
        ListEmptyComponent={renderEmptyState}
      />

      {cartItems.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>
              {totals.itemCount} item{totals.itemCount !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.cartTotal}>
              Rp {totals.total.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={goToCheckout}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={closeItemDetails}
      >
        <TouchableWithoutFeedback onPress={closeItemDetails}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                <Text style={styles.modalPrice}>
                  Rp {selectedItem ? selectedItem.price.toLocaleString() : ''}
                </Text>
                {!!selectedItem?.description && (
                  <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                )}

                <View style={styles.modalActions}>
                  {selectedItem && getItemQuantity(selectedItem.id) > 0 ? (
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(
                          selectedItem.id,
                          getItemQuantity(selectedItem.id) - 1
                        )}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>
                        {getItemQuantity(selectedItem.id)}
                      </Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => addToCart(
                          selectedItem,
                          vendor.id,
                          vendor.business_name || vendor.canteen_name
                        )}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => {
                        if (selectedItem) {
                          addToCart(
                            selectedItem,
                            vendor.id,
                            vendor.business_name || vendor.canteen_name
                          );
                        }
                      }}
                    >
                      <Text style={styles.addButtonText}>Add to Cart</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={closeItemDetails}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xl,
    // paddingBottom: SPACING.xl
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    // fontSize: FONTS.medium
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
  },
  vendorInfo: {
    alignItems: 'center',
  },
  vendorName: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  vendorLocation: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },
  menuList: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  menuListWithCart: {
    paddingBottom: SPACING.xxl * 1.5,
  },
  menuItem: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.large,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  itemPriceLarge: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  detailsHint: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  quantityContainer: {
    marginLeft: SPACING.md,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  quantityText: {
    fontSize: FONTS.regular,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
  },
  addButtonText: {
    fontSize: FONTS.regular,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cartSummary: {
    // position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },
  cartTotal: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  checkoutButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
  },
  checkoutButtonText: {
    fontSize: FONTS.regular,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  modalTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalPrice: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  modalDescription: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
  },
  closeButtonText: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});