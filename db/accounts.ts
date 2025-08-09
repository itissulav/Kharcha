// database/accounts.ts
import { getDatabase } from './index';
import { Account } from './types';

export const getAllAccounts = async (): Promise<Account[]> => {
  const db = await getDatabase();

  const accounts: Account[] = await db.getAllAsync('SELECT * FROM accounts');

  return accounts;
};

export const getAccountById = async (id: number) => {
  const db = await getDatabase();
  return await db.getFirstAsync('SELECT * FROM accounts WHERE id = ?', id);
};

export const insertAccount = async (name: string, balance: number) => {
  const db = await getDatabase();
  return await db.runAsync(
    'INSERT INTO accounts (name, balance) VALUES (?, ?)',
    name,
    balance
  );
};

export const updateAccount = async (id: number, name: string, balance: number) => {
  const db = await getDatabase();
  return await db.runAsync(
    'UPDATE accounts SET name = ?, balance = ? WHERE id = ?',
    name,
    balance,
    id
  );
};

export const updateAccountBalance = async (accountId: number, newBalance: number) => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE accounts SET balance = ? WHERE id = ?`,
    newBalance,
    accountId
  );
};

export const deleteAccount = async (id: number) => {
  const db = await getDatabase();
  return await db.runAsync('DELETE FROM accounts WHERE id = ?', id);
};

export const getTotalBalance = async (): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(balance) as total FROM accounts'
  );
  return result?.total || 0;
};
