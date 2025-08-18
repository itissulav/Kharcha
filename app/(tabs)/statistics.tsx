import { initDatabase } from "@/db";
import {
  getCategoryWithTransaction,
  getMonthlyEarning,
  getMonthlyExpenses,
  MonthlyExpense,
} from "@/db/transactions";
import { UserData } from "@/db/types";
import { getUserPreference } from "@/db/user";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

type ChartPressProps = {
  item: number | null;
  index: number | null;
};

const StatisticsScreen = () => {
  const [expenseByMonth, setExpenseByMonth] = useState<MonthlyExpense[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(
    null
  );
  const [selectedPieCategory, setSelectedPieCategory] = useState<string | null>(
    null
  );
  const [userData, setUserData] = useState<UserData>();
  const [earningByMonth, setEarningByMonth] = useState<MonthlyExpense[]>([]);
  const [lineSavedData, setLineSavedData] = useState<
    { value: number; label: string; fontColor: string }[]
  >([]);

  const PIE_CHART_COLORS = [
    "#6366F1",
    "#818CF8",
    "#A5B4FC",
    "#3B82F6",
    "#60A5FA",
    "#93C5FD",
    "#8B5CF6",
    "#A78BFA",
    "#C4B5FD",
    "#E0E7FF",
  ];
  const screenWidth = Dimensions.get("window").width;

  const fetchData = useCallback(async () => {
    console.log("Nothing Fetched! for Statistics");
    await initDatabase();
    console.log("Database Initialized!");

    const monthlyExpenses = await getMonthlyExpenses();
    setExpenseByMonth(monthlyExpenses);

    console.log("Monthly Expense Fetched");

    const userPreference = await getUserPreference();
    setUserData(userPreference);
    console.log("User Preference Fetched");

    const monthlyEarning = await getMonthlyEarning();
    setEarningByMonth(monthlyEarning);
    console.log("Monthly Earning Fetched");

    const categoriesWithTransactions = await getCategoryWithTransaction();
    const total = categoriesWithTransactions.reduce(
      (acc, cat) => acc + cat.total,
      0
    );
    setTotalExpenses(total);

    if (total > 0) {
      const formattedPieData = categoriesWithTransactions
        .filter((cat) => cat.total > 0)
        .map((cat, index) => {
          const percentage = (cat.total / total) * 100;
          return {
            value: percentage,
            fullValue: cat.total,
            text: `${percentage.toFixed(0)}%`,
            label: cat.category_name,
            color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
          };
        });
      setPieData(formattedPieData);
    } else {
      setPieData([]);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setLineSavedData(saveData(earningByMonth, expenseByMonth));
  }, [earningByMonth, expenseByMonth]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const formatMonth = (month: string): string | undefined => {
    if (!month) return undefined;
    const [year, monthNum] = month.split("-");
    const date = new Date(Number(year), Number(monthNum) - 1);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  const lineExpenseData = expenseByMonth
    .map((item) => ({
      value: Number(item.total_spent),
      label: formatMonth(item.month),
      frontColor: "#6366F1",
    }))
    .filter((item) => item.label && !isNaN(item.value));

  const lineEarningData = earningByMonth
    .map((item) => ({
      value: Number(item.total_spent),
      label: formatMonth(item.month),
      frontColor: "#6366F1",
    }))
    .filter((item) => item.label && !isNaN(item.value));

  const saveData = (earning: MonthlyExpense[], expense: MonthlyExpense[]) => {
    const savedEachMonth: {
      value: number;
      label: string;
      fontColor: string;
    }[] = [];

    earning.forEach((earn) => {
      const exp = expense.find((e) => e.month === earn.month);
      if (!exp) return; // skip if no matching expense month

      const savedThisMonth = earn.total_spent - exp.total_spent;

      savedEachMonth.push({
        value: savedThisMonth,
        label: formatMonth(earn.month) || "",
        fontColor: savedThisMonth > 0 ? "#00bfa" : "#ca3232",
      });
    });

    return savedEachMonth;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
      >
        <View className="p-5">
          {/* Header */}
          <Text className="text-3xl font-bold text-white mb-1 overflow-hidden">
            Statistics
          </Text>
          <Text className="text-sm text-gray-400 mb-6">
            Analyze your spending habits and track financial trends over time.
          </Text>

          {/* Line Chart Section */}
          {/**/}
          <Text className="text-lg font-semibold text-gray-200 mb-5">
            Monthly Expenses
          </Text>
          <ScrollView
            className="bg-primary rounded-2xl p-5 mb-6 border border-gray-800"
            horizontal
          >
            {lineExpenseData.length > 1 ? (
              <View
                style={{ width: screenWidth - 40 }}
                className="overflow-x-hidden w-full"
              >
                <LineChart
                  data={lineExpenseData}
                  isAnimated
                  areaChart
                  curved
                  height={250}
                  thickness={3}
                  color="#6366F1"
                  initialSpacing={20}
                  endSpacing={10}
                  spacing={60}
                  overScrollMode="never"
                  adjustToWidth
                  hideRules
                  noOfSections={6}
                  maxValue={
                    Math.max(...lineExpenseData.map((d) => d.value)) * 1.2
                  }
                  yAxisTextStyle={{ color: "#9CA3AF", width: 50 }}
                  xAxisLabelTextStyle={{ color: "#9CA3AF" }}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  onPress={({ index }: ChartPressProps) =>
                    setSelectedLineIndex(index)
                  }
                  dataPointLabelComponent={({ index }: any) => {
                    const point = lineExpenseData[index];
                    if (selectedLineIndex !== index || !point) return <></>;

                    return (
                      <View className="px-2.5 py-1.5 bg-gray-700 rounded-lg border border-gray-600">
                        <Text className="text-white text-xs font-bold">
                          {point.value.toFixed(2)}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
            ) : (
              <Text className="text-gray-500 italic text-center py-10">
                Not enough data to display the monthly chart.
              </Text>
            )}
          </ScrollView>

          <Text className="text-lg font-semibold text-gray-200 mb-5">
            Monthly Saved
          </Text>
          <ScrollView
            className="bg-primary rounded-2xl p-5 mb-6 border border-gray-800"
            horizontal
          >
            {lineSavedData.length > 1 ? (
              <View
                style={{ width: screenWidth - 40 }}
                className="overflow-x-hidden w-full"
              >
                <LineChart
                  data={lineSavedData}
                  isAnimated
                  areaChart
                  curved
                  height={250}
                  thickness={3}
                  color="#6366F1"
                  startFillColor="rgba(99, 102, 241, 0.3)"
                  endFillColor="rgba(99, 102, 241, 0.01)"
                  initialSpacing={20}
                  endSpacing={10}
                  spacing={60}
                  overScrollMode="never"
                  adjustToWidth
                  hideRules
                  noOfSections={6}
                  maxValue={
                    Math.max(...lineSavedData.map((d) => d.value)) * 1.2
                  }
                  yAxisTextStyle={{ color: "#9CA3AF", width: 50 }}
                  xAxisLabelTextStyle={{ color: "#9CA3AF" }}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  onPress={({ index }: ChartPressProps) =>
                    setSelectedLineIndex(index)
                  }
                  dataPointLabelComponent={({ index }: any) => {
                    const point = lineSavedData[index];
                    if (selectedLineIndex !== index || !point) return <></>;

                    return (
                      <View className="px-2.5 py-1.5 bg-gray-700 rounded-lg border border-gray-600">
                        <Text className="text-white text-xs font-bold">
                          {point.value.toFixed(2)}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
            ) : (
              <Text className="text-gray-500 italic text-center py-10">
                Not enough data to display the monthly chart.
              </Text>
            )}
          </ScrollView>

          <Text className="text-lg font-semibold text-gray-200 mb-5">
            Monthly Income
          </Text>
          <ScrollView
            className="bg-primary rounded-2xl p-5 mb-6 border border-gray-800"
            horizontal
          >
            {lineEarningData.length > 1 ? (
              <View
                style={{ width: screenWidth - 40 }}
                className="overflow-x-hidden w-full"
              >
                <LineChart
                  data={lineEarningData}
                  isAnimated
                  areaChart
                  curved
                  height={250}
                  thickness={3}
                  color="#6366F1"
                  startFillColor="rgba(99, 102, 241, 0.3)"
                  endFillColor="rgba(99, 102, 241, 0.01)"
                  initialSpacing={20}
                  endSpacing={10}
                  spacing={60}
                  overScrollMode="never"
                  adjustToWidth
                  hideRules
                  noOfSections={6}
                  maxValue={
                    Math.max(...lineEarningData.map((d) => d.value)) * 1.2
                  }
                  yAxisTextStyle={{ color: "#9CA3AF", width: 50 }}
                  xAxisLabelTextStyle={{ color: "#9CA3AF" }}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  onPress={({ index }: ChartPressProps) =>
                    setSelectedLineIndex(index)
                  }
                  dataPointLabelComponent={({ index }: any) => {
                    const point = lineEarningData[index];
                    if (selectedLineIndex !== index || !point) return <></>;

                    return (
                      <View className="px-2.5 py-1.5 bg-gray-700 rounded-lg border border-gray-600">
                        <Text className="text-white text-xs font-bold">
                          {point.value.toFixed(2)}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
            ) : (
              <Text className="text-gray-500 italic text-center py-10">
                Not enough data to display the monthly chart.
              </Text>
            )}
          </ScrollView>

          {/* Pie Chart Section */}
          <Text className="text-lg font-semibold text-white mb-1">
            Spending by Category
          </Text>
          <Text className="text-sm text-gray-400 mb-4">
            This pie chart shows where your money goes. The percentage is based
            on total expenses.
          </Text>

          <View className="bg-primary rounded-2xl p-5 mb-8 border border-gray-800">
            {pieData.length > 0 ? (
              <>
                <View className="items-center my-4">
                  <PieChart
                    data={pieData}
                    donut
                    showText={false}
                    focusOnPress
                    onPress={(item: any) => {
                      if (item && item.label) {
                        setSelectedPieCategory((prev) =>
                          prev === item.label ? null : item.label
                        );
                      }
                    }}
                    radius={120}
                    innerRadius={70}
                    textSize={14}
                    textColor="#FFFFFF"
                    strokeWidth={2}
                    strokeColor="#1F2937"
                    labelsPosition="outward"
                    centerLabelComponent={() => (
                      <View className="justify-center items-center">
                        <Text className="text-2xl font-bold text-primary">
                          Rs. {totalExpenses.toFixed(0)}
                        </Text>
                        <Text className="text-sm text-gray-400">
                          Total Spent
                        </Text>
                      </View>
                    )}
                  />
                </View>

                {/* Legend */}
                <View className="mt-6 border-t border-gray-700 pt-4">
                  {pieData.map((item) => {
                    if (!item) return <></>; // avoid undefined

                    return (
                      <View
                        key={item.label}
                        className="flex-row items-center mb-3"
                      >
                        <View
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: item.color }}
                        />
                        <Text
                          className={`flex-1 text-base ${
                            selectedPieCategory === item.label
                              ? "text-white font-bold"
                              : "text-gray-300"
                          }`}
                        >
                          {item.label}
                        </Text>
                        <Text className="text-base font-semibold text-gray-50">
                          Rs {item.fullValue?.toFixed(2) ?? "0.00"}
                        </Text>
                        {selectedPieCategory === item.label && (
                          <Text className="text-sm text-indigo-400 ml-2">
                            ← Selected
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </>
            ) : (
              <Text className="text-gray-500 italic text-center py-10">
                No category-wise spending data available yet.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatisticsScreen;
