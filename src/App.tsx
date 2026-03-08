import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Utensils, AlertCircle } from 'lucide-react';

interface Dish {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function App() {
  const [menu, setMenu] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Appetizers');

  const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages'];

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch menu');
      }
      const data = await response.json();
      setMenu(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || isNaN(Number(price))) {
      return alert('Please fill in all fields correctly.');
    }

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          category,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add dish');
      }

      const newDish = await response.json();
      setMenu([...menu, newDish]);
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setCategory('Appetizers');
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteDish = async (id: string) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete dish');
      }

      setMenu(menu.filter(dish => dish._id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <Utensils size={20} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Restaurant Menu Manager</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium">Error</h3>
              <p className="text-sm mt-1">{error}</p>
              {error.includes('MONGODB_URI') && (
                <p className="text-sm mt-2 font-medium">
                  Please configure the MONGODB_URI environment variable in the AI Studio Secrets panel.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Dish Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-24">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                <PlusCircle size={20} className="text-emerald-600" />
                Add New Dish
              </h2>
              
              <form onSubmit={handleAddDish} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Dish Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g. Margherita Pizza"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g. 14.99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-24"
                    placeholder="Brief description of the dish..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Add to Menu
                </button>
              </form>
            </div>
          </div>

          {/* Menu Display */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : menu.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 border-dashed p-12 text-center">
                <div className="mx-auto w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                  <Utensils size={24} className="text-stone-400" />
                </div>
                <h3 className="text-lg font-medium text-stone-900 mb-1">No dishes yet</h3>
                <p className="text-stone-500">Add your first dish using the form to get started.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map(cat => {
                  const categoryDishes = menu.filter(dish => dish.category === cat);
                  if (categoryDishes.length === 0) return null;

                  return (
                    <div key={cat}>
                      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-stone-200">{cat}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryDishes.map(dish => (
                          <div key={dish._id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative group">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-lg pr-8">{dish.name}</h3>
                              <span className="font-semibold text-emerald-600">${dish.price.toFixed(2)}</span>
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed">{dish.description}</p>
                            
                            <button
                              onClick={() => handleDeleteDish(dish._id)}
                              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                              aria-label="Delete dish"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
