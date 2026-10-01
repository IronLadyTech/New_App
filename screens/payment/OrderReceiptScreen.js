import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPaymentOrder } from '../../services/firestore';
import { IL_BRAND } from '../../constants/ironLadyBrand';

function formatWhen(value) {
  const d = value?.toDate?.() || (value ? new Date(value) : null);
  if (!d || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: IL_BRAND.divider,
      }}
    >
      <Text style={{ flex: 0.42, fontSize: 12, color: IL_BRAND.forestMuted }}>{label}</Text>
      <Text
        selectable
        style={{ flex: 0.58, fontSize: 13, fontWeight: '600', color: IL_BRAND.forest, textAlign: 'right' }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function OrderReceiptScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState(route?.params?.order || null);
  const [loading, setLoading] = useState(!route?.params?.order);

  useEffect(() => {
    if (order || !orderId || orderId === 'registration-fee') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getPaymentOrder(orderId).then((row) => {
      if (!cancelled) {
        setOrder(row);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [order, orderId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: IL_BRAND.cream, justifyContent: 'center' }}>
        <ActivityIndicator color={IL_BRAND.red} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: IL_BRAND.cream }} edges={['top']}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 16 }}>
          <Text style={{ color: IL_BRAND.forest }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ padding: 16, color: IL_BRAND.forest }}>Receipt not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: IL_BRAND.cream }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={IL_BRAND.forest} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 20, fontWeight: '700', color: IL_BRAND.forest }}>
          Payment receipt
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: IL_BRAND.divider,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 11, fontWeight: '800', color: IL_BRAND.red, letterSpacing: 1 }}>
                IRON LADY
              </Text>
              <Text style={{ marginTop: 4, fontSize: 13, color: IL_BRAND.forestMuted }}>
                Official payment receipt
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#E8F5EE',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: IL_BRAND.paidGreen }}>PAID</Text>
            </View>
          </View>

          <Text style={{ marginTop: 22, fontSize: 36, fontWeight: '700', color: IL_BRAND.forest }}>
            ₹ {Number(order.amountRupees || 0).toLocaleString('en-IN')}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: IL_BRAND.forestMuted }}>
            {order.description || 'Programme balance'}
          </Text>

          <View style={{ marginTop: 22 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1, color: IL_BRAND.red }}>
              TRANSACTION
            </Text>
            <Row label="Transaction ID" value={order.transactionId} />
            <Row label="Receipt no." value={order.receiptNumber} />
            <Row label="Razorpay order" value={order.razorpayOrderId} />
            <Row label="Gateway" value="Razorpay" />
            <Row label="Status" value="Paid · captured" />
            <Row label="Paid on" value={formatWhen(order.paidAt || order.createdAt)} />
          </View>

          <View style={{ marginTop: 22 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1, color: IL_BRAND.red }}>
              PROGRAMME
            </Text>
            <Row label="Programme" value={order.programTitle} />
            <Row label="Programme ID" value={order.programId} />
            <Row label="Amount" value={`₹ ${Number(order.amountRupees || 0).toLocaleString('en-IN')}`} />
            <Row label="Currency" value={order.currency || 'INR'} />
          </View>

          <View style={{ marginTop: 22 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1, color: IL_BRAND.red }}>
              PAYER
            </Text>
            <Row label="Name" value={order.payerName} />
            <Row label="Email" value={order.payerEmail} />
            <Row label="Mobile" value={order.payerPhone} />
            <Row label="Learner ID" value={order.uid} />
          </View>

          <Text style={{ marginTop: 22, fontSize: 11, lineHeight: 16, color: IL_BRAND.forestMuted }}>
            This receipt is generated after Razorpay confirms the payment. Keep the
            transaction ID for support. Questions: support@ironlady.tech
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
