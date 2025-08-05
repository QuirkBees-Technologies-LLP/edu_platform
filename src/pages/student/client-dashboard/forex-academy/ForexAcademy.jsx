import { ArrowUp } from 'lucide-react';
import React from 'react'

const ForexAcademy = () => {
    const trades = [
  {
    id: 1,
    pair: "EUR/USD",
    date: "WED, FEB 16, 12:30 CET",
    status: "Partial Win",
    statusColor: "green",
    entry: 3639.234,
    stopLoss: 3323.989,
    exit1: 3639.234,
    exit2: 3639.234,
    image: "/media/images/2600x1600/chart.jpg",
  },
  {
    id: 2,
    pair: "GBP/USD",
    date: "THU, FEB 17, 14:00 CET",
    status: "Full Win",
    statusColor: "blue",
    entry: 4450.5,
    stopLoss: 4300.25,
    exit1: 4500.0,
    exit2: 4550.0,
    image: "/media/images/2600x1600/chart.jpg",
  },
  {
    id: 3,
    pair: "USD/JPY",
    date: "FRI, FEB 18, 09:15 CET",
    status: "Loss",
    statusColor: "red",
    entry: 115.35,
    stopLoss: 116.00,
    exit1: 114.90,
    exit2: 114.70,
    image: "/media/images/2600x1600/chart.jpg",
  },
  {
    id: 4,
    pair: "AUD/USD",
    date: "MON, FEB 21, 10:00 CET",
    status: "Full Win",
    statusColor: "blue",
    entry: 0.725,
    stopLoss: 0.720,
    exit1: 0.730,
    exit2: 0.735,
    image: "/media/images/2600x1600/chart.jpg",
  },
  {
    id: 5,
    pair: "USD/CAD",
    date: "TUE, FEB 22, 11:45 CET",
    status: "Partial Win",
    statusColor: "green",
    entry: 1.275,
    stopLoss: 1.270,
    exit1: 1.280,
    exit2: 1.285,
    image: "/media/images/2600x1600/chart.jpg",
  },
  {
    id: 6,
    pair: "EUR/JPY",
    date: "WED, FEB 23, 15:00 CET",
    status: "Loss",
    statusColor: "red",
    entry: 131.45,
    stopLoss: 132.00,
    exit1: 131.20,
    exit2: 131.00,
    image: "/media/images/2600x1600/chart.jpg",
  },
  {
    id: 7,
    pair: "GBP/JPY",
    date: "THU, FEB 24, 13:30 CET",
    status: "Full Win",
    statusColor: "blue",
    entry: 156.20,
    stopLoss: 155.50,
    exit1: 156.80,
    exit2: 157.10,
    image: "/media/images/2600x1600/chart.jpg",
  },
  {
    id: 8,
    pair: "NZD/USD",
    date: "FRI, FEB 25, 08:45 CET",
    status: "Partial Win",
    statusColor: "green",
    entry: 0.670,
    stopLoss: 0.665,
    exit1: 0.675,
    exit2: 0.678,
    image: "/media/images/2600x1600/chart.jpg",
  },
  {
    id: 9,
    pair: "EUR/GBP",
    date: "MON, FEB 28, 16:00 CET",
    status: "Loss",
    statusColor: "red",
    entry: 0.838,
    stopLoss: 0.842,
    exit1: 0.836,
    exit2: 0.834,
    image: "/media/images/2600x1600/chart.jpg",
  },
];

  return (
    <div className="container-fluid pb-10">
        <h1 class="text-xl font-medium leading-none text-gray-900 mb-6">24 Works</h1>
        <div className="grid grid-cols-12 gap-5 md:gap-6">
            {trades.map((trade) => (
                <div 
                key={trade.id} 
                className="col-span-12 sm:col-span-6 lg:col-span-4 card rounded-2xl overflow-hidden"
                >
                <img src={trade.image} alt={trade.pair} className="w-full h-40 object-cover" />
                <div className="p-4">
                    <div className="flex justify-between items-start sm:flex-row flex-col sm:gap-0 gap-3">
                    <div className="flex items-center gap-2">
                        <ArrowUp className="text-green-500 w-8 h-8 shrink-0" />
                        <div>
                        <h3 className="font-medium text-gray-800 text-sm mb-1">{trade.pair}</h3>
                        <p className="text-2xs font-normal text-gray-500 line-clamp-1">{trade.date}</p>
                        </div>
                    </div>
                    <span
                        className={`bg-${trade.statusColor}-100 dark:bg-${trade.statusColor}-700 text-${trade.statusColor}-700 dark:text-${trade.statusColor}-300 text-3xs font-normal px-2 py-2 truncate rounded-lg`}
                    >
                        {trade.status}
                    </span>
                    </div>

                    <div className="mt-6 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-normal text-sm">Entry</span>
                        <span className="font-medium text-gray-800">{trade.entry}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-normal text-sm">Stop Loss</span>
                        <span className="font-medium text-gray-800">{trade.stopLoss}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-normal text-sm">Exit 1</span>
                        <span className="font-medium text-gray-800">{trade.exit1}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-normal text-sm">Exit 2</span>
                        <span className="font-medium text-gray-800">{trade.exit2}</span>
                    </div>
                    </div>
                </div>
                </div>
            ))}
        </div>
        <div class="text-center mt-4"><button class="text-primary pb-3 text-sm border-b-2 border-dashed border-primary">Show more Connections</button></div>
    </div>

  )
}

export default ForexAcademy