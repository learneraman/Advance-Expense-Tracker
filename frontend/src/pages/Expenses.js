import React, { useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import ExpenseContext from '../context/ExpenseContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Shopping', 'Bills', 'Other'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const emptyForm = { title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], description: '' };

const Expenses = () => {
  const { expenses, getExpenses, addExpense, updateExpense, deleteExpense } = useContext(ExpenseContext);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    getExpenses();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateExpense(editId, formData);
    } else {
      await addExpense(formData);
    }
    setShowModal(false);
    setFormData(emptyForm);
    setEditId(null);
  };

  const handleEdit = (expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      description: expense.description || '',
    });
    setEditId(expense._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(emptyForm);
    setEditId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Add Expense
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Expense' : 'Add Expense'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} min="0" step="0.01" required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        {expenses.length === 0 ? (
          <p className="empty-msg">No expenses yet. Add your first expense!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{expense.title}</td>
                  <td><span className="category-badge">{expense.category}</span></td>
                  <td className="amount-expense">{formatCurrency(expense.amount)}</td>
                  <td>{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                  <td>{expense.description || '-'}</td>
                  <td className="actions">
                    <button className="btn-icon edit" onClick={() => handleEdit(expense)}><FaEdit /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(expense._id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Expenses;
