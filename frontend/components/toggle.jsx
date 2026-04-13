const API_BASE = import.meta.env.VITE_API_BASE;
const WS_BASE = import.meta.env.VITE_WS_BASE;

const Toggle = ({mode,setMode}) => {
 

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      
      <div className="relative flex w-64 items-center  bg-transparent  shadow-inner border-1 border-solid border-yellow-400 rounded-full">
        
        
        <div
          className={`
            absolute top-0 bottom-0 w-[calc(50%)] rounded-full bg-yellow-400 shadow-sm
            transition-all duration-300 ease-in-out transform
            ${mode === 0 ? 'translate-x-0' : 'translate-x-full'}
          `} />

        {/* Short Term Button */}
        <button
          onClick={() => setMode(0)}
          className={`
            relative z-10 w-1/2 py-2 text-sm font-bold transition-colors duration-300
            ${mode === 0 ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}
          `}
        >
          Short Term
        </button>

        {/* Long Term Button */}
        <button
          onClick={() => setMode(1)}
          className={`
            relative z-10 w-1/2 py-2 text-sm font-bold transition-colors duration-300
            ${mode === 1 ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}
          `}
        >
          Long Term
        </button>
      </div>

      
      <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">
        Showing {mode=== 0 ? 'post listing' : '1-year and 3-year'} Projections
      </p>
    </div>
  );
};

export default Toggle;