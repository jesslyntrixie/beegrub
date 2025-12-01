import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { apiService } from '../../services/api';
import { authService } from '../../services/supabase';

export const StudentProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    student_id: '',
    phone: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const authUser = await authService.getCurrentUser();
      if (!authUser) {
        Alert.alert('Error', 'Please login again');
        return;
      }
      setUser(authUser);

      const { data: appUser, error: userError } = await apiService.users.getByAuthUserId(
        authUser.id,
      );

      if (userError || !appUser) {
        console.error('Error fetching user:', userError);
        return;
      }

      const { data: studentData, error: studentError } = await apiService.students.getByUserId(
        appUser.id,
      );

      if (studentError || !studentData) {
        console.error('Error fetching student:', studentError);
        return;
      }

      setStudent(studentData);
      setForm({
        full_name: studentData.full_name || '',
        student_id: studentData.student_id || '',
        phone: studentData.phone || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!student) return;

    try {
      const { error } = await apiService.students.update(student.id, {
        full_name: form.full_name,
        student_id: form.student_id,
        phone: form.phone,
      });

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile');
        return;
      }

      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      loadProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: student?.full_name || '',
      student_id: student?.student_id || '',
      phone: student?.phone || '',
    });
    setEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await authService.signOut();
            if (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
              return;
            }
          } catch (err) {
            console.error('Logout catch error:', err);
            Alert.alert('Error', 'An error occurred during logout');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={80} color={COLORS.textMuted} />
          </View>
          <Text style={styles.userName}>{user?.email || 'Student'}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
                <Ionicons name="create-outline" size={20} color={COLORS.buttonPrimary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={form.full_name}
                  onChangeText={(text) => setForm({ ...form, full_name: text })}
                  placeholder="Enter your full name"
                />
              ) : (
                <Text style={styles.infoValue}>{student?.full_name || '-'}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Student ID</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={form.student_id}
                  onChangeText={(text) => setForm({ ...form, student_id: text })}
                  placeholder="Enter your student ID"
                />
              ) : (
                <Text style={styles.infoValue}>{student?.student_id || '-'}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(text) => setForm({ ...form, phone: text })}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{student?.phone || '-'}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || '-'}</Text>
            </View>
          </View>

          {editing && (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionCard}>
            <TouchableOpacity onPress={handleLogout} style={styles.actionButton}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={styles.actionButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatarContainer: {
    marginBottom: SPACING.sm,
  },
  userName: {
    fontSize: FONTS.regular,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  editButton: {
    padding: SPACING.xs,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  infoRow: {
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.small,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.buttonPrimary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONTS.regular,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  actionButtonText: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.error,
  },
});
