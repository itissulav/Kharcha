import { deleteAccount, getAllAccounts } from "@/db/accounts";
import { Account, TransactionWithCategory } from "@/db/types";
import * as Haptics from "expo-haptics";

export const handleLongPress = (
  account: Account,
  setSelectedAccount: (account: Account) => void,
  setOptionsVisible: (visible: boolean) => void
) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  setSelectedAccount(account);
  setOptionsVisible(true);
};

export const handleLongPressTransaction = (
  transaction: TransactionWithCategory,
  setSelectedTransaction: (transaction: TransactionWithCategory) => void,
  setOptionsVisible: (visible: boolean) => void
) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  setOptionsVisible(true);
  setSelectedTransaction(transaction);
};


export const handleDelete = async (
  account: Account | null,
  setAccounts: (accounts: Account[]) => void,
  setOptionsVisible: (visible: boolean) => void
) => {
  if (account) {
    await deleteAccount(account.id);
    const updated = await getAllAccounts();
    setAccounts(updated as Account[]);
    setOptionsVisible(false);
  }
};
