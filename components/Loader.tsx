import * as React from 'react';

const Loader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-t-4 border-t-cyan-500 border-slate-300 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-cyan-600 font-semibold">{message}</p>
    </div>
  );
};

export default Loader;