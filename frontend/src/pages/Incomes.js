import React, { useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import IncomeContext from '../context/IncomeContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const SOURCES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const emptyForm = { title: '', amount: '', source: 'Salary', date: new Date().toISOString().split('T')[0], description: '' };

const Incomes = () => {
  const { incomes, getIncomes, addIncome, updateIncome, deleteIncome } = useContext(IncomeContext);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    getIncomes();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateIncome(editId, formData);
    } else {
      await addIncome(formData);
    }
    setShowModal(false);
    setFormData(emptyForm);
    setEditId(null);
  };

  const handleEdit = (income) => {
    setFormData({
      title: income.title,
      amount: income.amount,
      source: income.source,
      date: new Date(income.date).toISOString().split('T')[0],
      description: income.description || '',
    });
    setEditId(income._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this income?')) {
      await deleteIncome(id);
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
        <h1 className="page-title">Incomes</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Add Income
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Income' : 'Add Income'}</h2>
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
                  <label>Source</label>
                  <select name="source" value={formData.source} onChange={handleChange}>
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
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
        {incomes.length === 0 ? (
          <p className="empty-msg">No incomes yet. Add your first income!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((income) => (
                <tr key={income._id}>
                  <td>{income.title}</td>
                  <td><span className="source-badge">{income.source}</span></td>
                  <td className="amount-income">{formatCurrency(income.amount)}</td>
                  <td>{format(new Date(income.date), 'MMM dd, yyyy')}</td>
                  <td>{income.description || '-'}</td>
                  <td className="actions">
                    <button className="btn-icon edit" onClick={() => handleEdit(income)}><FaEdit /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(income._id)}><FaTrash /></button>
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

export default Incomes;
