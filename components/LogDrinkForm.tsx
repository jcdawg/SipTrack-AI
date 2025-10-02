import React, { useState, useRef, useEffect } from 'react';
import { analyzeDrinkImage } from '../services/geminiService';
import type { DrinkLog } from '../types';
import { CameraIcon, PlusIcon } from './Icons';
import Loader from './Loader';

interface LogDrinkFormProps {
  addDrinkLog: (drink: Omit<DrinkLog, 'id' | 'date'>) => void;
}

// State now holds strings for better form UX, conversion to number happens on submit.
const initialDrinkState = {
  brand: '',
  name: '',
  volume: '',
  abv: '',
  calories: '',
  carbs: '',
  sugar: '',
  price: '',
  quantity: '1',
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const LogDrinkForm: React.FC<LogDrinkFormProps> = ({ addDrinkLog }) => {
  const [drink, setDrink] = useState(initialDrinkState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericFields = ['volume', 'abv', 'calories', 'carbs', 'sugar', 'price', 'quantity'];

    // For numeric fields, allow only valid numeric-style input (e.g., "123", "12.3", "")
    if (numericFields.includes(name)) {
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
            setDrink(prev => ({ ...prev, [name]: value }));
        }
    } else {
        // For non-numeric fields, allow any text
        setDrink(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const base64String = await fileToBase64(file);
      const result = await analyzeDrinkImage(base64String, file.type);
      
      if (!isMounted.current) return;

      // Sanitize AI response and set state as strings
      setDrink({
        brand: String(result.brand || ''),
        name: String(result.name || ''),
        volume: String(Number(result.volume) || ''),
        abv: String(Number(result.abv) || ''),
        calories: String(Number(result.calories) || ''),
        carbs: String(Number(result.carbs) || ''),
        sugar: String(Number(result.sugar) || ''),
        price: String(Number(result.price) || ''),
        quantity: '1',
      });

    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || 'An unknown error occurred while analyzing the image.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        // Reset file input value to allow re-uploading the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Coerce state strings to numbers for validation and logging
    const numericDrinkData = {
        quantity: Number(drink.quantity) || 0,
        price: Number(drink.price) || 0,
        volume: Number(drink.volume) || 0,
        abv: Number(drink.abv) || 0,
        calories: Number(drink.calories) || 0,
        carbs: Number(drink.carbs) || 0,
        sugar: Number(drink.sugar) || 0,
    };

    if (!drink.name || numericDrinkData.quantity <= 0) {
      setError("Please fill in at least the drink name and a valid quantity.");
      return;
    }

    addDrinkLog({
        brand: drink.brand,
        name: drink.name,
        ...numericDrinkData
    });

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
              <input type="text" pattern="[0-9]*\.?[0-9]*" inputMode="decimal" name="volume" value={drink.volume} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">ABV (%)</label>
              <input type="text" pattern="[0-9]*\.?[0-9]*" inputMode="decimal" step="0.1" name="abv" value={drink.abv} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Calories</label>
              <input type="text" pattern="[0-9]*" inputMode="numeric" name="calories" value={drink.calories} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Carbs (g)</label>
              <input type="text" pattern="[0-9]*\.?[0-9]*" inputMode="decimal" name="carbs" value={drink.carbs} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600">Sugar (g)</label>
              <input type="text" pattern="[0-9]*\.?[0-9]*" inputMode="decimal" name="sugar" value={drink.sugar} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Price ($)</label>
              <input type="text" pattern="[0-9]*\.?[0-9]*" inputMode="decimal" step="0.01" name="price" value={drink.price} onChange={handleChange} className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
              {/* Fix: Corrected typo in closing label tag */}
              <label className="block text-sm font-medium text-slate-600">Quantity*</label>
              <input type="text" pattern="[0-9]*" inputMode="numeric" name="quantity" min="1" value={drink.quantity} onChange={handleChange} required className="mt-1 block w-full bg-slate-50 border border-slate-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
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