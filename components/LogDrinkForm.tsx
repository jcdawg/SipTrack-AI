import * as React from 'react';
import { analyzeDrinkImage } from '../services/geminiService';
import type { DrinkLog } from '../types';
import { CameraIcon, PlusIcon } from './Icons';
import Loader from './Loader';

interface LogDrinkFormProps {
  addDrinkLog: (drink: Omit<DrinkLog, 'id' | 'date'>) => void;
}

const initialDrinkState = {
  brand: '',
  name: '',
  volume: 0,
  abv: 0,
  calories: 0,
  carbs: 0,
  sugar: 0,
  price: 0,
  quantity: 1,
};

const LogDrinkForm: React.FC<LogDrinkFormProps> = ({ addDrinkLog }) => {
  const [drink, setDrink] = React.useState(initialDrinkState);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDrink(prev => ({ ...prev, [name]: parseFloat(value) >= 0 ? parseFloat(value) : value }));
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const result = await analyzeDrinkImage(base64String, file.type);
        setDrink(prev => ({...prev, ...result, quantity: 1}));
      };
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      // Reset file input value to allow re-uploading the same file
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drink.name || drink.quantity <= 0) {
      setError("Please fill in at least the drink name and a valid quantity.");
      return;
    }
    addDrinkLog(drink);
    setDrink(initialDrinkState);
    setError(null);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
      {isLoading && <Loader message="Analyzing Image..." />}
      <h2 className="text-2xl font-bold mb-4 text-slate-900">Log a Drink</h2>
      {error && <p className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column 1 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Brand</label>
            <input type="text" name="brand" value={drink.brand} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Name*</label>
            <input type="text" name="name" value={drink.name} onChange={handleChange} required className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Volume (ml)</label>
              <input type="number" name="volume" value={drink.volume} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">ABV (%)</label>
              <input type="number" step="0.1" name="abv" value={drink.abv} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Calories</label>
              <input type="number" name="calories" value={drink.calories} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Carbs (g)</label>
              <input type="number" name="carbs" value={drink.carbs} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600">Sugar (g)</label>
              <input type="number" name="sugar" value={drink.sugar} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Price ($)</label>
              <input type="number" step="0.01" name="price" value={drink.price} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
              {/* Fix: Corrected typo in closing label tag */}
              <label className="block text-sm font-medium text-slate-600">Quantity*</label>
              <input type="number" name="quantity" min="1" value={drink.quantity} onChange={handleChange} required className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 mt-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <button
                type="button"
                onClick={triggerFileInput}
                className="flex-1 w-full flex items-center justify-center py-3 px-4 border border-cyan-500 text-cyan-600 font-semibold rounded-lg shadow-md hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition duration-300"
            >
                <CameraIcon className="w-5 h-5 mr-2" />
                Log with AI Photo
            </button>
            <button
                type="submit"
                className="flex-1 w-full flex items-center justify-center py-3 px-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 transition duration-300"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Drink
            </button>
        </div>
      </form>
    </div>
  );
};

export default LogDrinkForm;