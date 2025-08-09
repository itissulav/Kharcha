import { getCreditCategoriesThisMonth, getCreditTransactionsThisMonth, getSalary } from '@/db/transactions'
import { CreditTransaction, TopSpendingCategory } from '@/db/types'
import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import CategoryCard from './CategoryCard'
import TransactionCard from './TransactionCard'

type Props = {
  onAdd?: (category: TopSpendingCategory) => void;
}

const IncomeTab = ({onAdd}: Props) => {

    const [creditTransaction, setCreditTransaction] = useState<CreditTransaction[]>([])
    const [creditCategory, setCreditCategory] = useState<TopSpendingCategory[]>([]);

    const fetchData = async () => {
      const data = await getCreditTransactionsThisMonth();
      const creditCategories = await getCreditCategoriesThisMonth();
      const salaryCategory = await getSalary();

      setCreditTransaction(data);

      if (creditCategories.length === 0) {
        setCreditCategory(salaryCategory);
      } else {
        setCreditCategory(creditCategories);
      }
    };
    useEffect(() => {
        fetchData();
    }, [])

  return (
    <View>
      <View className='flex-row flex-wrap gap-4 items-center justify-center w-full'>
        {creditCategory!.map((category) => (
          <CategoryCard
            key={category.category_id}
            category={category}
            onAdd={(category) => {onAdd && onAdd(category)}}
          />
        ))}
      </View>
      <Text className="text-light-200 text-lg font-semibold mb-3 px-4">Income for this month</Text>
      {creditTransaction.map((transaction) => (
        <TransactionCard
            key={transaction.id}
            recentTransaction={transaction}
            onLongPress={() => {}}
        />
      ))}
      <View>

      </View>
    </View>
  )
}

export default IncomeTab