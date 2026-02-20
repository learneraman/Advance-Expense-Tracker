import React, { useContext, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ExpenseContext from '../context/ExpenseContext';
import IncomeContext from '../context/IncomeContext';
import { FaArrowUp, FaArrowDown, FaBalanceScale } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CATEGORY_COLORS = {
  Food: '#FF6384',
  Transport: '#36A2EB',
  Entertainment: '#FFCE56',
  Healthcare: '#4BC0C0',
  Education: '#9966FF',
  Shopping: '#FF9F40',
  Bills: '#FF6384',
  Other: '#C9CBCF',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const Dashboard = () => {
  const { expenses, getExpenses } = useContext(ExpenseContext);
  const { incomes, getIncomes } = useContext(IncomeContext);

  useEffect(() => {
    getExpenses();
    getIncomes();
    // eslint-disable-next-line
  }, []);

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Recent transactions (last 5)
  const allTransactions = [
    ...expenses.map((e) => ({ ...e, type: 'expense' })),
    ...incomes.map((i) => ({ ...i, type: 'income' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // Pie chart data
  const categoryTotals = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map((cat) => CATEGORY_COLORS[cat] || '#C9CBCF'),
      },
    ],
  };

  // Bar chart - last 6 months
  const months = [];
  const monthlyIncome = [];
  const monthlyExpenses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthLabel = format(d, 'MMM yyyy');
    months.push(monthLabel);
    const mIncome = incomes
      .filter((inc) => format(new Date(inc.date), 'MMM yyyy') === monthLabel)
      .reduce((sum, inc) => sum + inc.amount, 0);
    const mExpense = expenses
      .filter((exp) => format(new Date(exp.date), 'MMM yyyy') === monthLabel)
      .reduce((sum, exp) => sum + exp.amount, 0);
    monthlyIncome.push(mIncome);
    monthlyExpenses.push(mExpense);
  }

  const barData = {
    labels: months,
    datasets: [
      { label: 'Income', data: monthlyIncome, backgroundColor: 'rgba(72, 187, 120, 0.8)' },
      { label: 'Expenses', data: monthlyExpenses, backgroundColor: 'rgba(245, 101, 101, 0.8)' },
    ],
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>

      <div className="summary-cards">
        <div className="summary-card income-card">
          <div className="card-icon"><FaArrowUp /></div>
          <div className="card-info">
            <p>Total Income</p>
            <h3>{formatCurrency(totalIncome)}</h3>
          </div>
        </div>
        <div className="summary-card expense-card">
          <div className="card-icon"><FaArrowDown /></div>
          <div className="card-info">
            <p>Total Expenses</p>
            <h3>{formatCurrency(totalExpenses)}</h3>
          </div>
        </div>
        <div className={`summary-card balance-card ${netBalance >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon"><FaBalanceScale /></div>
          <div className="card-info">
            <p>Net Balance</p>
            <h3>{formatCurrency(netBalance)}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Recent Transactions</h2>
          {allTransactions.length === 0 ? (
            <p className="empty-msg">No transactions yet.</p>
          ) : (
            <ul className="transaction-list">
              {allTransactions.map((t) => (
                <li key={t._id} className={`transaction-item ${t.type}`}>
                  <div className="t-info">
                    <span className="t-title">{t.title}</span>
                    <span className="t-date">{format(new Date(t.date), 'MMM dd, yyyy')}</span>
                  </div>
                  <span className={`t-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Expense by Category</h2>
          {Object.keys(categoryTotals).length > 0 ? (
            <div className="chart-container">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          ) : (
            <p className="empty-msg">No expense data available.</p>
          )}
        </div>

        <div className="dashboard-section full-width">
          <h2>Income vs Expenses (Last 6 Months)</h2>
          <div className="chart-container bar-chart">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
