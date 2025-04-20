import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaywallScreen() {
  const router = useRouter();

  const subscriptionPlans = [
    {
      title: 'Annual Plan',
      price: '$108.00',
      originalPrice: '$216.00', // Fake original price
      period: 'year',
      popular: false,
      suggestion: 'Unlock the best value with 50% savings, perfect for long-term benefits.',
      dailyRate: '$0.33/day',
      icon: 'star', // Example icon name
    },
    {
      title: '6-Month Plan',
      price: '$72.00',
      originalPrice: '$108.00', // Fake original price
      period: '6 months',
      popular: true,
      suggestion: 'Get started with great savings and flexibility for half a year of premium sleep.',
      dailyRate: '$0.40/day',
      icon: 'gift', // Example icon name
    },
    {
      title: 'Monthly Plan',
      price: '$18.00',
      originalPrice: '$36.00', // Fake original price
      period: 'month',
      popular: false,
      suggestion: 'Explore the full benefits of SleepyAI with no long-term commitment.',
      dailyRate: '$0.60/day',
      icon: 'time', // Example icon name
    },
  ];

  const handleSubscribe = (plan) => {
    router.push('/(onboarding)/summary');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false} // Hide vertical scrollbar
        showsHorizontalScrollIndicator={false} // Hide horizontal scrollbar
      >
        <Text style={styles.title}>UNLOCK SLEEPYAI</Text>
        <Text style={styles.subheader}>
          Experience the Pinnacle of Sleep with Our Exclusive Intelligent System.
        </Text>

        {/* Founding Member Discount - Polished UI */}
        <View style={styles.discountContainer}>
          <Text style={styles.discountText}>Founding Member Discount: Limited Time Only</Text>
        </View>

        <View style={styles.plansContainer}>
          {subscriptionPlans.map((plan, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.planCard, plan.popular && styles.popularPlan]}
              onPress={() => handleSubscribe(plan)}
            >
              {/* Icon on the top right corner with extra space */}
              <Ionicons
                name={plan.icon}
                size={24}
                color="#4F46E5"
                style={styles.icon}
              />

              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              )}
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
                
                {/* Fake Price Comparison */}
                <Text style={styles.originalPrice}>{plan.originalPrice}</Text>

                <Text style={styles.planPeriod}>per {plan.period}</Text>
              </View>
              {/* Make sure the suggestion and daily rate are aligned */}
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionText}>{plan.suggestion}</Text>
                <Text style={styles.planDailyRate}>{plan.dailyRate}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Proof */}
        <View style={styles.socialProofContainer}>
          <Text style={styles.socialProofText}>47,392 people improved their sleep with SleepyAI and counting</Text>
        </View>

        <View style={styles.trustBadges}>
          <View style={styles.trustBadge}>
            <Ionicons name="shield-checkmark" size={18} color="#4F46E5" />
            <Text style={styles.trustText}>Secure Payment</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="refresh" size={18} color="#4F46E5" />
            <Text style={styles.trustText}>Cancel Anytime</Text>
          </View>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#7C3AED',
    marginBottom: 12,
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  subheader: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  discountContainer: {
    backgroundColor: '#E5D8FF', // Soft color for elegance
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C3AED', // Keep the same purple border
  },
  discountText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  plansContainer: {
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  icon: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 8,
  },
  popularPlan: {
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -20,
    right: 20,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planInfo: {
    flex: 1,
    paddingRight: 10,
    minWidth: 180,
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  planPrice: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  originalPrice: {
    color: '#B4B9BF', // Gray for original price
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  planPeriod: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  suggestionContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flex: 1,
    marginTop: 6,
    minWidth: 180,
  },
  suggestionText: {
    color: '#B4B9BF',
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  planDailyRate: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 6,
  },
  socialProofContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  socialProofText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  trustBadge: {
    alignItems: 'center',
  },
  trustText: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 0,
  },
  footer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  termsText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
});
