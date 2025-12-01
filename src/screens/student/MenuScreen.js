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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { CartContext } from '../../context/CartContext'; 

export const MenuScreen = ({ route, navigation }) => {
  const { vendor } = route.params;
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const { cart, addToCart, updateQuantity, clearCart, getCartTotals } = useContext(CartContext);
  const cartItems = cart.items;
  const totals = getCartTotals();

  useEffect(() => {
    // Check if cart has items from a different vendor
    if (cart.vendor_id && cart.vendor_id !== vendor.id && cartItems.length > 0) {
      Alert.alert(
        'Different Vendor',
        `You have items from ${cart.vendor_name} in your cart. Would you like to clear your cart and start a new order from ${vendor.business_name || vendor.canteen_name}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Clear Cart',
            style: 'destructive',
            onPress: () => {
              clearCart();
              loadMenuItems();
            }
          }
        ]
      );
    } else {
      loadMenuItems();
    }
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
    
    // Use cart's vendor info, not the current screen's vendor
    const cartVendor = {
      id: cart.vendor_id,
      business_name: cart.vendor_name,
      canteen_name: cart.vendor_name
    };
    
    navigation.navigate('Checkout', { vendor: cartVendor, cartItems });
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
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.vendorName} numberOfLines={1}>{vendor.business_name || vendor.canteen_name}</Text>
            <Text style={styles.vendorLocation} numberOfLines={1}>{vendor.location || vendor.canteen_location}</Text>
          </View>
          <View style={styles.headerSpacer} />
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
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
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
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  headerSpacer: {
    width: 40,
  },
  vendorName: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  vendorLocation: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  menuList: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  menuListWithCart: {
    paddingBottom: 100,
  },
  menuItem: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 70,
    gap: SPACING.sm,
  },
  itemInfo: {
    flex: 1,
    flexShrink: 1,
  },
  itemName: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
    flexShrink: 1,
  },
  itemPriceLarge: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 2,
  },
  detailsHint: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textMuted,
  },
  quantityContainer: {
    flexShrink: 0,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.small,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    gap: SPACING.xs,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: FONTS.regular,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  quantityText: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.small,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cartSummary: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.md,
    minHeight: 64,
  },
  cartInfo: {
    flex: 1,
    flexShrink: 1,
  },
  cartItemCount: {
    fontSize: FONTS.extraSmall,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  cartTotal: {
    fontSize: FONTS.regular,
    fontWeight: 'bold',
    color: COLORS.text,
    flexShrink: 1,
  },
  checkoutButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
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
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    flexShrink: 1,
  },
  modalPrice: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SPACING.md,
  },
  modalDescription: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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