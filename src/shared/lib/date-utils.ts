/**
 * Get Month to Date (MTD) range formatted as YYYY-MM-DD
 */
export const getMonthToDateRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(now),
  };
};
