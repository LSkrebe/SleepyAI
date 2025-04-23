import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaywallScreen() {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideUpAnim = React.useRef(new Animated.Value(100)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const subscriptionPlans = [
    {
      title: 'Annual Plan',
      price: '$108.00',
      originalPrice: '$216.00',
      period: 'year',
      popular: false,
      suggestion: 'Unlock the best value with 50% savings, perfect for long-term benefits.',
      dailyRate: '$0.33/day',
      icon: 'star',
    },
    {
      title: '6-Month Plan',
      price: '$72.00',
      originalPrice: '$108.00',
      period: '6 months',
      popular: true,
      suggestion: 'Get started with great savings and flexibility for half a year of premium sleep.',
      dailyRate: '$0.40/day',
      icon: 'gift',
    },
    {
      title: 'Monthly Plan',
      price: '$18.00',
      originalPrice: '$36.00',
      period: 'month',
      popular: false,
      suggestion: 'Explore the full benefits of SleepyAI with no long-term commitment.',
      dailyRate: '$0.60/day',
      icon: 'time',
    },
  ];

  const handleSubscribe = (plan) => {
    router.replace('/(app)');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }
          ]}
        >
          <Text style={styles.title}>UNLOCK SLEEPYAI</Text>
          <View style={styles.titleDecoration} />
          <Text style={styles.subheader}>
            Experience the Pinnacle of Sleep with Our Exclusive Intelligent System.
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.discountContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }
          ]}
        >
          <Text style={styles.discountText}>Founding Member Discount: Limited Time Only</Text>
        </Animated.View>

        <View style={styles.plansContainer}>
          {subscriptionPlans.map((plan, index) => (
            <Animated.View 
              key={index}
              style={[
                styles.planCard,
                plan.popular && styles.popularPlan,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }],
                }
              ]}
            >
              <TouchableOpacity onPress={() => handleSubscribe(plan)}>
                <Ionicons
                  name={plan.icon}
                  size={24}
                  color="#3B82F6"
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
                  <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                  <Text style={styles.planPeriod}>per {plan.period}</Text>
                </View>
                <View style={styles.suggestionContainer}>
                  <Text style={styles.suggestionText}>{plan.suggestion}</Text>
                  <Text style={styles.planDailyRate}>{plan.dailyRate}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View 
          style={[
            styles.socialProofContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }
          ]}
        >
          <Text style={styles.socialProofText}>47,392 people improved their sleep with SleepyAI and counting</Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.trustBadges,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }
          ]}
        >
          <View style={styles.trustBadge}>
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <Text style={styles.trustText}>Secure Payment</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="refresh" size={20} color="#3B82F6" />
            <Text style={styles.trustText}>Cancel Anytime</Text>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }
          ]}
        >
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0F172A',
  },
  header: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    borderRadius: 2,
    marginTop: 20,
  },
  progress: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  titleDecoration: {
    width: 40,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  discountContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  discountText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '700',
  },
  plansContainer: {
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  popularPlan: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  icon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: -35,
    right: 20,
    backgroundColor: '#3B82F6',
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
    color: '#E2E8F0',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  planPrice: {
    color: '#E2E8F0',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  originalPrice: {
    color: '#94A3B8',
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  planPeriod: {
    color: '#94A3B8',
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
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  planDailyRate: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  socialProofContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  socialProofText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  footer: {
    marginBottom: 20,
  },
  termsText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
