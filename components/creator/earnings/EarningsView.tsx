import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { DollarSign, Users, Clock, Lock, CheckCircle2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { api } from '@/services/api';

// Micro Components
import MonetizationProgress from '../micro/MonetizationProgress';

// --- CONSTANTS & TYPES (Move these to types/index.ts eventually) ---
const TARGET_SUBS = 1000;
const TARGET_WATCH_HOURS = 4000;

interface EarningsViewProps {
    channel: any;
    earnings: any;
    isMonetized: boolean;
    availableEarnings: number;
    currentSubs: number;
    currentWatchHours: number;
    canWithdraw: boolean;
    handleApplyMonetization: () => void;
}

export default function EarningsView({ 
    channel, 
    earnings, 
    isMonetized, 
    availableEarnings, 
    currentSubs, 
    currentWatchHours, 
    canWithdraw,
    handleApplyMonetization 
}: EarningsViewProps) {
    
    // Handler for withdrawal (Assuming mutation is in parent or managed here)
    const handleWithdraw = () => {
        Alert.alert("Withdrawal", "Request sent successfully! Processing will take 1-3 days.");
        // Future: Add useMutation here for api.earnings.withdraw()
    };

    if (isMonetized) {
        /* --- STATE 1: MONETIZED DASHBOARD --- */
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Total Earnings</Text>
                <View style={styles.earningsCard}>
                    <DollarSign color={Colors.success} size={32} />
                    <Text style={styles.totalEarnings}>
                      ${earnings?.total_earnings?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </Text>
                    <Text style={styles.earningsSubtext}>This {earnings?.period || 'month'}</Text>
                </View>
                
                {/* Breakdown */}
                <View style={styles.earningsBreakdown}>
                    <View style={styles.earningsRow}>
                        <Text style={styles.earningsLabel}>Available:</Text>
                        <Text style={styles.earningsValue}>${availableEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.earningsRow}>
                        <Text style={styles.earningsLabel}>Pending:</Text>
                        <Text style={[styles.earningsValue, { color: Colors.warning }]}>${earnings?.pending_earnings?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</Text>
                    </View>
                    <View style={styles.earningsRow}>
                        <Text style={styles.earningsLabel}>Paid Out:</Text>
                        <Text style={[styles.earningsValue, { color: Colors.success }]}>${earnings?.paid_earnings?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</Text>
                    </View>
                </View>

                {/* Withdrawal */}
                <View style={styles.section}>
                    <TouchableOpacity style={[styles.withdrawButton, !canWithdraw && styles.disabled]} onPress={handleWithdraw} disabled={!canWithdraw}>
                        <Text style={styles.withdrawButtonText}>Request Withdrawal</Text>
                    </TouchableOpacity>
                    <Text style={styles.withdrawNote}>Min withdrawal $100.</Text>
                </View>
            </View>
        );
    } 
    
    /* --- STATE 2: NOT MONETIZED CRITERIA --- */
    const isEligible = currentSubs >= TARGET_SUBS && currentWatchHours >= TARGET_WATCH_HOURS;

    return (
        <View style={[styles.section, styles.notMonetizedContainer]}>
            <View style={styles.monetizationHeader}>
                <DollarSign color={Colors.primary} size={48} style={styles.monetizationIcon} />
                <Text style={styles.monetizationTitle}>Become a Partner</Text>
                <Text style={styles.monetizationSubtitle}>
                    Join the Partner Program to earn money, get creator support, and more.
                </Text>
            </View>

            <View style={styles.criteriaContainer}>
                <Text style={styles.criteriaTitle}>Eligibility Requirements</Text>
                
                <MonetizationProgress icon={<Users color={Colors.text} size={20} />} title="Reach 1,000 Subscribers" current={currentSubs} target={TARGET_SUBS} />
                <MonetizationProgress icon={<Clock color={Colors.text} size={20} />} title="4,000 Watch hours (Last 365 days)" current={currentWatchHours} target={TARGET_WATCH_HOURS} suffix="hours" />
            </View>

            <View style={styles.monetizationFooter}>
                <View style={styles.lockContainer}>
                    <Lock color={Colors.textSecondary} size={16} />
                    <Text style={styles.lockText}>
                        {isEligible ? "You are eligible to apply!" : "Keep growing to unlock monetization"}
                    </Text>
                </View>
                
                <TouchableOpacity 
                    style={[styles.applyButton, !isEligible && styles.disabled]} 
                    disabled={!isEligible}
                    onPress={handleApplyMonetization}
                >
                    <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// NOTE: Styles are moved from the main file.
const styles = StyleSheet.create({
    section: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 },
    earningsCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 32, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
    totalEarnings: { fontSize: 48, fontWeight: '700', color: Colors.success },
    earningsSubtext: { fontSize: 16, color: Colors.textSecondary },
    earningsBreakdown: { marginTop: 16, gap: 12 },
    earningsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    earningsLabel: { fontSize: 15, color: Colors.textSecondary },
    earningsValue: { fontSize: 16, fontWeight: '600', color: Colors.text },
    
    withdrawButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
    withdrawButtonText: { fontSize: 16, fontWeight: '700', color: Colors.text },
    withdrawNote: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
    disabled: { opacity: 0.4 },

    // Monetization Styles
    notMonetizedContainer: { paddingBottom: 40 },
    monetizationHeader: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20 },
    monetizationIcon: { marginBottom: 16 },
    monetizationTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8, textAlign: 'center' },
    monetizationSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    criteriaContainer: { marginBottom: 30, gap: 24 },
    criteriaTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 },
    monetizationFooter: { gap: 16 },
    lockContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    lockText: { fontSize: 13, color: Colors.textSecondary },
    applyButton: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    applyButtonText: { fontSize: 16, fontWeight: '700', color: Colors.text },
});
