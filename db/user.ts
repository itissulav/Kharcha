import { getDatabase } from "./index";
import { UserData } from "./types";

export const getUserPreference = async () => {
  const db = await getDatabase();

  try {
    const result = await db.getFirstAsync(
      `SELECT 
      monthly_budget as monthly_budget,
      spending_percentage as spending_percentage,
      lifeStyleLimit as lifeStyleLimit,
      showMonthlyLimitAlert as showMonthlyLimitAlert,
      showCategoryLimitAlert as showCategoryLimitAlert
      FROM  user_settings 
      WHERE  id = 1
      `
    );

    return result as UserData;
  } catch (error) {
    console.error(error);
    return;
  }
};

export const updateMonthlyCategoryLimitAlert = async (showAlert: boolean) => {
  const db = await getDatabase();

  try {
    const result = await db.getAllAsync(
      `
      UPDATE user_settings
        SET showMonthlyLimitAlert = ?
      WHERE id = 1
      `,
      [showAlert]
    );
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const saveUserData = async (
  spending_limit: number,
  lifeStyleLimit: number,
  showMonthlyLimitAlert: number
) => {
  const db = await getDatabase();

  try {
    const success = await db.getAllAsync(
      `UPDATE user_settings
            SET spending_percentage = ? , lifeStyleLimit = ?, showMonthlyLimitAlert = ?
            WHERE id = 1`,
      [spending_limit, lifeStyleLimit, showMonthlyLimitAlert]
    );

    return success;
  } catch (error) {
    console.error(error);
    return false;
  }
};
