import React from "react";
import { Zap, Clock, AlertCircle } from "lucide-react";

const MetricCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">
        {label}
      </p>
      <Icon size={18} className={colorClass} />
    </div>
    <h2 className="text-3xl font-black text-white">{value}</h2>
  </div>
);

const Dashboard = () => {
  return (
    <>
      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-xl">
        <div className="glass-card p-md rounded-lg">
          <p className="text-neutral-500 text-label-caps mb-xs">
            Active Orders
          </p>
          <h2 className="font-h2 text-primary">12</h2>
        </div>
        <div className="glass-card p-md rounded-lg">
          <p className="text-neutral-500 text-label-caps mb-xs">
            Avg. Prep Time
          </p>
          <h2 className="font-h2 text-white">14:20</h2>
        </div>
        <div className="glass-card p-md rounded-lg border-l-4 border-violet-600">
          <p className="text-neutral-500 text-label-caps mb-xs">Urgent items</p>
          <h2 className="font-h2 text-violet-500">3</h2>
        </div>
        <div className="glass-card p-md rounded-lg border-l-4 border-yellow-500">
          <p className="text-neutral-500 text-label-caps mb-xs">Delayed</p>
          <h2 className="font-h2 text-yellow-500">1</h2>
        </div>
      </div>

      {/* KDS Order Grid */}
      <div className="order-grid">
        {/* Order Card: Urgent */}
        <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full urgent-border">
          <div className="p-md bg-neutral-900/50 flex justify-between items-start border-b border-white/5">
            <div>
              <span className="text-label-caps text-violet-400 block mb-1">
                DINE IN
              </span>
              <h3 className="font-h3 text-white leading-none">Order #842</h3>
            </div>
            <div className="text-right">
              <span className="text-h3 font-bold text-violet-500">18:45</span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">
                Elapsed Time
              </p>
            </div>
          </div>
          <div className="p-md flex-1 space-y-4">
            <ul className="space-y-3">
              <li className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="bg-violet-600 text-white font-bold px-2 py-0.5 rounded text-sm">
                    2x
                  </span>
                  <div>
                    <p className="text-white font-bold">Pepperoni Pizza</p>
                    <p className="text-neutral-500 text-xs italic">
                      + Extra Cheese, Thin Crust
                    </p>
                  </div>
                </div>
              </li>
              <li className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="bg-surface-container-highest text-white font-bold px-2 py-0.5 rounded text-sm">
                    1x
                  </span>
                  <div>
                    <p className="text-white font-bold">Garlic Knots (6pc)</p>
                  </div>
                </div>
              </li>
              <li className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="bg-surface-container-highest text-white font-bold px-2 py-0.5 rounded text-sm">
                    3x
                  </span>
                  <div>
                    <p className="text-white font-bold">Coke Zero</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className="p-md pt-0">
            <button className="w-full bg-[#7c3aed] hover:bg-[#a78bfa] text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              MARK AS READY
            </button>
          </div>
        </div>

        {/* Order Card: Warning */}
        <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full warning-border">
          <div className="p-md bg-neutral-900/50 flex justify-between items-start border-b border-white/5">
            <div>
              <span className="text-label-caps text-yellow-500 block mb-1">
                TAKEOUT
              </span>
              <h3 className="font-h3 text-white leading-none">Order #845</h3>
            </div>
            <div className="text-right">
              <span className="text-h3 font-bold text-yellow-500">09:12</span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">
                Elapsed Time
              </p>
            </div>
          </div>
          <div className="p-md flex-1 space-y-4">
            <ul className="space-y-3">
              <li className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="bg-surface-container-highest text-white font-bold px-2 py-0.5 rounded text-sm">
                    1x
                  </span>
                  <div>
                    <p className="text-white font-bold">Truffle Burger</p>
                    <p className="text-neutral-500 text-xs italic">
                      Medium Well, No Onions
                    </p>
                  </div>
                </div>
              </li>
              <li className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="bg-surface-container-highest text-white font-bold px-2 py-0.5 rounded text-sm">
                    1x
                  </span>
                  <div>
                    <p className="text-white font-bold">Sweet Potato Fries</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className="p-md pt-0">
            <button className="w-full bg-[#7c3aed] hover:bg-[#a78bfa] text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              MARK AS READY
            </button>
          </div>
        </div>

        {/* Order Card: Normal */}
        <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full">
          <div className="p-md bg-neutral-900/50 flex justify-between items-start border-b border-white/5">
            <div>
              <span className="text-label-caps text-neutral-500 block mb-1">
                DELIVERY
              </span>
              <h3 className="font-h3 text-white leading-none">Order #847</h3>
            </div>
            <div className="text-right">
              <span className="text-h3 font-bold text-white">04:30</span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">
                Elapsed Time
              </p>
            </div>
          </div>
          <div className="p-md flex-1 space-y-4">
            <ul className="space-y-3">
              <li className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="bg-surface-container-highest text-white font-bold px-2 py-0.5 rounded text-sm">
                    4x
                  </span>
                  <div>
                    <p className="text-white font-bold">BBQ Chicken Wings</p>
                    <p className="text-neutral-500 text-xs italic">
                      Spicy BBQ Sauce
                    </p>
                  </div>
                </div>
              </li>
              <li className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="bg-surface-container-highest text-white font-bold px-2 py-0.5 rounded text-sm">
                    2x
                  </span>
                  <div>
                    <p className="text-white font-bold">Side Salad</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className="p-md pt-0">
            <button className="w-full bg-[#7c3aed] hover:bg-[#a78bfa] text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              MARK AS READY
            </button>
          </div>
        </div>

        {/* Order Card: Normal 2 */}
        <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full">
          <div className="p-md bg-neutral-900/50 flex justify-between items-start border-b border-white/5">
            <div>
              <span className="text-label-caps text-neutral-500 block mb-1">
                DINE IN
              </span>
              <h3 className="font-h3 text-white leading-none">Order #848</h3>
            </div>
            <div className="text-right">
              <span className="text-h3 font-bold text-white">02:15</span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">
                Elapsed Time
              </p>
            </div>
          </div>
          <div className="p-md flex-1 space-y-4">
            <ul className="space-y-3">
              <li className="flex justify-between items-start">
                <div className="flex gap-3">
                  <span className="bg-surface-container-highest text-white font-bold px-2 py-0.5 rounded text-sm">
                    1x
                  </span>
                  <div>
                    <p className="text-white font-bold">Margherita Pizza</p>
                    <p className="text-neutral-500 text-xs italic">
                      Fresh Basil
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className="p-md pt-0">
            <button className="w-full bg-[#7c3aed] hover:bg-[#a78bfa] text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              MARK AS READY
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
