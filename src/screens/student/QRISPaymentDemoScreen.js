import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';

/**
 * QRIS Payment Screen (Midtrans + Demo Complete Button)
 * Uses beegrub-payments-api to create a Midtrans QRIS payment session
 * and shows the Snap payment page in a WebView.
 * The demo button calls /demo/payments/complete to mark as paid.
 */
export const QRISPaymentDemoScreen = ({ route, navigation }) => {
  const { orderId, orderNumber, total } = route.params || {};
  const [snapUrl, setSnapUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!orderId || !total) {
          Alert.alert('Error', 'Missing order information for payment');
          navigation.goBack();
          return;
        }

        const { data, error } = await apiService.paymentsApi.createQrisPayment({
          orderId: String(orderId),
          amount: total,
          customer: {
            first_name: 'Student',
            last_name: '',
          },
        });

        if (error || !data?.transaction?.redirect_url) {
          console.error('QRIS init error:', error || data);
          Alert.alert('Error', 'Failed to start QRIS payment.');
          navigation.goBack();
          return;
        }

        setSnapUrl(data.transaction.redirect_url);
      } catch (err) {
        console.error('QRIS init exception:', err);
        Alert.alert('Error', 'Failed to start QRIS payment.');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [orderId, total, navigation]);

  const handleDemoComplete = async () => {
    try {
      if (!orderId) return;
      setIsCompleting(true);

      const { error } = await apiService.paymentsApi.completePaymentDemo(orderId);
      if (error) {
        Alert.alert('Error', 'Failed to complete demo payment.');
        return;
      }

      navigation.replace('OrderConfirmation', {
        orderId,
        orderNumber,
        paymentMethod: 'qris',
        paymentStatus: 'completed',
        total,
      });
    } catch (err) {
      console.error('Demo complete exception:', err);
      Alert.alert('Error', 'Failed to complete demo payment.');
    } finally {
      setIsCompleting(false);
    }
  };

  const renderContent = () => (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>QRIS Payment</Text>
        <Text style={styles.subtitle}>
          Scan and pay using your e-wallet
        </Text>
      </View>

      <View style={styles.webviewContainer}>
        {snapUrl ? (
          <WebView
            source={{ uri: snapUrl }}
            startInLoadingState
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="always"
            thirdPartyCookiesEnabled={true}
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.webviewLoadingText}>Loading payment page...</Text>
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              Alert.alert('WebView Error', 'Failed to load payment page');
            }}
            onLoad={() => console.log('WebView loaded successfully')}
            onLoadStart={() => console.log('WebView loading started:', snapUrl)}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.webviewLoadingText}>Preparing payment...</Text>
          </View>
        )}
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Total Payment</Text>
        <Text style={styles.amountValue}>
          Rp {total?.toLocaleString() || '0'}
        </Text>
      </View>

      <View style={styles.demoNotice}>
        <Ionicons name="information-circle" size={18} color="#F59E0B" />
        <Text style={styles.demoNoticeText}>
          DEMO MODE: Use the button below to simulate successful payment
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Starting QRIS payment...</Text>
        </View>
      ) : (
        <>
          {renderContent()}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.demoButton,
                isCompleting && styles.demoButtonDisabled,
              ]}
              onPress={handleDemoComplete}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.demoButtonText}>
                  Simulate Payment Success (Demo)
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },

  webviewContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.cardBackground,
    marginBottom: SPACING.lg,
  },
  webviewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  webviewLoadingText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },

  // Amount
  amountContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  amountLabel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.buttonPrimary,
  },

  // Demo Notice
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9E6',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  demoNoticeText: {
    fontSize: FONTS.extraSmall,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
  },
  bottomContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  demoButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  demoButtonDisabled: {
    opacity: 0.6,
  },
  demoButtonText: {
    fontSize: FONTS.regular,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default QRISPaymentDemoScreen;
