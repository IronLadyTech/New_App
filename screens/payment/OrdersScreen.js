import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/EmptyState';
import { useMyReceipts } from '../../hooks/useMyReceipts';
import { IL_BRAND } from '../../constants/ironLadyBrand';

function formatWhen(value) {
  const d = value?.toDate?.() || (value ? new Date(value) : null);
  if (!d || Number.isNaN(d.getTime())) return 'Just now';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersScreen({ navigation }) {
  const { exitToLogin } = useAuth();
  const { orders, error, signedIn } = useMyReceipts();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: IL_BRAND.cream }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={IL_BRAND.forest} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 22, fontWeight: '700', color: IL_BRAND.forest }}>
          Orders & receipts
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={error ? 'Could not load orders' : signedIn ? 'No payments yet' : 'Sign in to see your receipt'}
            message={
              error ||
              (signedIn
                ? 'When you complete a Razorpay payment, the receipt appears here with transaction ID and full details.'
                : 'Your old Razorpay receipt is saved on the phone number you paid with. Sign in to load it.')
            }
            actionLabel={signedIn ? undefined : 'Sign in'}
            onAction={signedIn ? undefined : exitToLogin}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('OrderReceipt', { orderId: item.id, order: item })
            }
            activeOpacity={0.85}
            style={{
              marginBottom: 12,
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: IL_BRAND.divider,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: IL_BRAND.red, letterSpacing: 0.8 }}>
                PAID
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: IL_BRAND.forest }}>
                ₹ {Number(item.amountRupees || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <Text style={{ marginTop: 8, fontSize: 16, fontWeight: '600', color: IL_BRAND.forest }}>
              {item.programTitle || item.description || 'Programme payment'}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 12, color: IL_BRAND.forestMuted }}>
              Txn {item.transactionId}
            </Text>
            <Text style={{ marginTop: 2, fontSize: 12, color: IL_BRAND.forestMuted }}>
              {item.receiptNumber} · {formatWhen(item.paidAt || item.createdAt)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
