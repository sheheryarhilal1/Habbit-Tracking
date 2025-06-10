import React, { useState, useEffect, useCallback } from 'react';
import { View, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { Text, Button, useTheme, Divider } from 'react-native-paper';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { getHabits } from '../utils/storage';

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen() {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState('weekly');
  const [chartData, setChartData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({ total: 0, avg: 0, bestDay: 'N/A' });

  // Simulate completion count data
  const generateMockStats = (habits) => {
    const weekly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mockData = weekly.map(() => Math.floor(Math.random() * (habits.length + 2)));

    // Calculate summary
    const total = mockData.reduce((a, b) => a + b, 0);
    const avg = total / mockData.length;
    const bestIndex = mockData.indexOf(Math.max(...mockData));
    const bestDay = weekly[bestIndex];

    return {
      data: {
        labels: weekly,
        datasets: [{ data: mockData }],
      },
      summary: {
        total,
        avg: avg.toFixed(1),
        bestDay,
      },
    };
  };

  const loadData = useCallback(async () => {
    const habits = await getHabits();
    const { data, summary } = generateMockStats(habits || []);
    setChartData(data);
    setSummary(summary);
  }, []);

  useEffect(() => {
    loadData();
  }, [viewMode]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundColor: theme.colors.background,
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.primary + Math.floor(opacity * 255).toString(16),
    labelColor: () => theme.colors.onSurface,
    barPercentage: 0.6,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>
        Habit Analytics
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
        <Button
          mode={viewMode === 'weekly' ? 'contained' : 'outlined'}
          onPress={() => setViewMode('weekly')}
          style={{ marginRight: 8 }}
        >
          Weekly
        </Button>
        <Button
          mode={viewMode === 'monthly' ? 'contained' : 'outlined'}
          onPress={() => setViewMode('monthly')}
        >
          Monthly
        </Button>
      </View>

      {chartData && (
        <>
          <BarChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            yAxisLabel=""
            chartConfig={chartConfig}
            style={{ borderRadius: 12, marginBottom: 24 }}
          />

          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            Weekly Summary
          </Text>
          <Divider style={{ marginBottom: 8 }} />

          <View style={{ marginBottom: 8 }}>
            <Text>Total Completions: {summary.total}</Text>
            <Text>Average per Day: {summary.avg}</Text>
            <Text>Best Day: {summary.bestDay}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}
