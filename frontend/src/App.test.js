import { render, screen } from '@testing-library/react';
import App from './App';

test('renders expense tracker navbar', () => {
  render(<App />);
  const navbarElement = screen.getByText(/Expense Tracker/i);
  expect(navbarElement).toBeInTheDocument();
});
