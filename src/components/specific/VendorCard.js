import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { colors } from '../../constants/colors';

export default function VendorCard({ vendor, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.name}>{vendor.business_name}</Text>
        <Text style={styles.description}>{vendor.description}</Text>
        <Text style={styles.location}>📍 {vendor.location}</Text>
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 90,
    gap: 12,
  },
  content: {
    flex: 1,
    flexShrink: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    flexShrink: 1,
  },
  description: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  location: {
    fontSize: 12,
    color: colors.textLight,
    flexWrap: 'wrap',
  },
  arrow: {
    flexShrink: 0,
  },
  arrowText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
});
