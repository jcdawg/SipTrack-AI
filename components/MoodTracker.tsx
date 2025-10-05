import React, { useState, useEffect } from 'react';
import type { MoodEntry, MoodLevel } from '../types';
import { HeartIcon, PlusIcon } from './Icons';

interface MoodTrackerProps {
  moods: MoodEntry[];
  addMoodEntry: (mood: Omit<MoodEntry, 'id' | 'date'>) => Promise<void>;
}

const moodOptions = [
  { level: 1, emoji: '😢', label: 'Very Low', color: 'bg-red-100 text-red-700 border-red-200' },
  { level: 2, emoji: '😔', label: 'Low', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { level: 3, emoji: '😐', label: 'Neutral', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { level: 4, emoji: '😊', label: 'Good', color: 'bg-green-100 text-green-700 border-green-200' },
  { level: 5, emoji: '😄', label: 'Excellent', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

const commonTags = [
  'Work', 'Social', 'Exercise', 'Family', 'Friends', 'Stress', 'Relaxed', 
  'Tired', 'Energetic', 'Anxious', 'Happy', 'Sad', 'Excited', 'Bored'
];

const MoodTracker: React.FC<MoodTrackerProps> = ({ moods, addMoodEntry }) => {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  // Check if mood was already logged today
  const today = new Date().toDateString();
  const todayMood = moods.find(mood => new Date(mood.date).toDateString() === today);

  useEffect(() => {
    if (todayMood) {
      setSelectedMood(todayMood.mood);
      setNotes(todayMood.notes || '');
      setSelectedTags(todayMood.tags);
    }
  }, [todayMood]);

  const handleMoodSelect = (mood: MoodLevel) => {
    setSelectedMood(mood);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMood) {
      alert('Please select a mood level');
      return;
    }

    try {
      await addMoodEntry({
        mood: selectedMood,
        notes: notes.trim() || undefined,
        tags: selectedTags,
      });

      setNotes('');
      setSelectedTags([]);
      setCustomTag('');
    } catch (error) {
      console.error('Failed to save mood:', error);
      alert('Failed to save mood. Please try again.');
    }
  };

  const getMoodDescription = (mood: MoodLevel) => {
    const option = moodOptions.find(opt => opt.level === mood);
    return option ? `${option.emoji} ${option.label}` : '';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl">
      <div className="flex items-center mb-6">
        <HeartIcon className="w-6 h-6 text-pink-500 mr-2" />
        <h2 className="text-2xl font-bold text-slate-900">Mood Tracker</h2>
      </div>

      {todayMood ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">
            ✅ Today's mood: {getMoodDescription(todayMood.mood)}
          </p>
          {todayMood.notes && (
            <p className="text-green-600 text-sm mt-1">"{todayMood.notes}"</p>
          )}
          {todayMood.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {todayMood.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 font-medium">
            📝 How are you feeling today?
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-3">
            Select your mood level:
          </label>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map(option => (
              <button
                key={option.level}
                type="button"
                onClick={() => handleMoodSelect(option.level as MoodLevel)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedMood === option.level
                    ? `${option.color} border-current ring-2 ring-current ring-opacity-50`
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-xs font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Notes (optional):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? What's on your mind?"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
            rows={3}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Tags (optional):
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {commonTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          {/* Custom Tag Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Add custom tag..."
              className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedMood}
          className="w-full flex items-center justify-center py-3 px-4 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          {todayMood ? 'Update Today\'s Mood' : 'Log Today\'s Mood'}
        </button>
      </form>
    </div>
  );
};

export default MoodTracker;
