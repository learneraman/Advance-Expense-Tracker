import React, { createContext, useReducer } from 'react';
import axios from 'axios';

const IncomeContext = createContext();

const initialState = {
  incomes: [],
  loading: true,
  error: null,
};

const incomeReducer = (state, action) => {
  switch (action.type) {
    case 'GET_INCOMES':
      return { ...state, incomes: action.payload, loading: false };
    case 'ADD_INCOME':
      return { ...state, incomes: [action.payload, ...state.incomes], loading: false };
    case 'UPDATE_INCOME':
      return {
        ...state,
        incomes: state.incomes.map((inc) => (inc._id === action.payload._id ? action.payload : inc)),
        loading: false,
      };
    case 'DELETE_INCOME':
      return { ...state, incomes: state.incomes.filter((inc) => inc._id !== action.payload), loading: false };
    case 'INCOME_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const IncomeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(incomeReducer, initialState);

  const getIncomes = async () => {
    try {
      const res = await axios.get('/api/incomes');
      dispatch({ type: 'GET_INCOMES', payload: res.data });
    } catch (err) {
      dispatch({ type: 'INCOME_ERROR', payload: err.response?.data?.message });
    }
  };

  const addIncome = async (incomeData) => {
    try {
      const res = await axios.post('/api/incomes', incomeData);
      dispatch({ type: 'ADD_INCOME', payload: res.data });
    } catch (err) {
      dispatch({ type: 'INCOME_ERROR', payload: err.response?.data?.message });
    }
  };

  const updateIncome = async (id, incomeData) => {
    try {
      const res = await axios.put(`/api/incomes/${id}`, incomeData);
      dispatch({ type: 'UPDATE_INCOME', payload: res.data });
    } catch (err) {
      dispatch({ type: 'INCOME_ERROR', payload: err.response?.data?.message });
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axios.delete(`/api/incomes/${id}`);
      dispatch({ type: 'DELETE_INCOME', payload: id });
    } catch (err) {
      dispatch({ type: 'INCOME_ERROR', payload: err.response?.data?.message });
    }
  };

  return (
    <IncomeContext.Provider value={{ ...state, getIncomes, addIncome, updateIncome, deleteIncome }}>
      {children}
    </IncomeContext.Provider>
  );
};

export default IncomeContext;
