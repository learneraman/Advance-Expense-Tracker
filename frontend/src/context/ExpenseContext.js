import React, { createContext, useReducer } from 'react';
import axios from 'axios';

const ExpenseContext = createContext();

const initialState = {
  expenses: [],
  loading: true,
  error: null,
};

const expenseReducer = (state, action) => {
  switch (action.type) {
    case 'GET_EXPENSES':
      return { ...state, expenses: action.payload, loading: false };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses], loading: false };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((exp) => (exp._id === action.payload._id ? action.payload : exp)),
        loading: false,
      };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((exp) => exp._id !== action.payload), loading: false };
    case 'EXPENSE_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  const getExpenses = async () => {
    try {
      const res = await axios.get('/api/expenses');
      dispatch({ type: 'GET_EXPENSES', payload: res.data });
    } catch (err) {
      dispatch({ type: 'EXPENSE_ERROR', payload: err.response?.data?.message });
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const res = await axios.post('/api/expenses', expenseData);
      dispatch({ type: 'ADD_EXPENSE', payload: res.data });
    } catch (err) {
      dispatch({ type: 'EXPENSE_ERROR', payload: err.response?.data?.message });
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const res = await axios.put(`/api/expenses/${id}`, expenseData);
      dispatch({ type: 'UPDATE_EXPENSE', payload: res.data });
    } catch (err) {
      dispatch({ type: 'EXPENSE_ERROR', payload: err.response?.data?.message });
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    } catch (err) {
      dispatch({ type: 'EXPENSE_ERROR', payload: err.response?.data?.message });
    }
  };

  return (
    <ExpenseContext.Provider value={{ ...state, getExpenses, addExpense, updateExpense, deleteExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseContext;
