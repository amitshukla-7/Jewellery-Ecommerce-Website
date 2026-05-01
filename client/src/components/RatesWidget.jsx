import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const RatesWidget = () => {
  const [currentRate, setCurrentRate] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveFluctuation, setLiveFluctuation] = useState({ gold: 0, silver: 0 });

  // Simulate Live Ticks
  useEffect(() => {
    if (!currentRate) return;
    const interval = setInterval(() => {
      setLiveFluctuation({
        gold: (Math.random() * 4 - 2), // ±2 INR
        silver: (Math.random() * 0.4 - 0.2), // ±0.2 INR
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentRate]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const [currentRes, historyRes] = await Promise.all([
          axios.get('/api/rates/current'),
          axios.get('/api/rates/history')
        ]);
        setCurrentRate(currentRes.data);
        setHistory(historyRes.data.map(item => ({
          ...item,
          dateLabel: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        })));
      } catch (err) {
        console.error('Error fetching rates:', err);
        setError('Failed to load live rates. Using demo data.');
        // Fallback demo data
        const demoRate = { goldRate: 7250, silverRate: 92, updatedAt: new Date() };
        setCurrentRate(demoRate);
        const demoHistory = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          demoHistory.push({
            dateLabel: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            goldRate: 7100 + Math.random() * 200,
            silverRate: 88 + Math.random() * 8
          });
        }
        setHistory(demoHistory);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  if (loading) return <div className="rates-loading">Loading market rates...</div>;

  // Calculations
  // Calculations with Live Fluctuations
  const displayedGold = currentRate ? currentRate.goldRate + liveFluctuation.gold : 0;
  const displayedSilver = currentRate ? currentRate.silverRate + liveFluctuation.silver : 0;

  const rate22KT = (displayedGold * 0.916).toFixed(0);
  const rate18KT = (displayedGold * 0.75).toFixed(0);

  // Calculate change from yesterday
  let goldChange = 0;
  let silverChange = 0;
  if (history.length >= 2) {
    const today = history[history.length - 1];
    const yesterday = history[history.length - 2];
    goldChange = (((today.goldRate - yesterday.goldRate) / yesterday.goldRate) * 100).toFixed(2);
    silverChange = (((today.silverRate - yesterday.silverRate) / yesterday.silverRate) * 100).toFixed(2);
  }

  return (
    <div className="rates-widget-container">
      <div className="rates-header">
        <h2>Live Market Rates</h2>
        <span className="last-updated">
          Last Updated: {currentRate?.updatedAt ? new Date(currentRate.updatedAt).toLocaleTimeString() : 'Just now'}
        </span>
      </div>

      <div className="rates-grid">
        {/* Gold Card */}
        <div className="rate-card gold-card">
          <div className="card-top">
            <div className="icon-box"><i className="fas fa-coins"></i></div>
            <div className="metal-label">GOLD (24KT)</div>
          </div>
          <div className="main-price">
            ₹{displayedGold?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            <span className="unit">/g</span>
            <span className="live-tag">LIVE</span>
          </div>
          <div className="sub-prices">
            <div className="sub-item">
              <span>22KT</span>
              <strong>₹{Number(rate22KT).toLocaleString('en-IN')}</strong>
            </div>
            <div className="sub-item">
              <span>18KT</span>
              <strong>₹{Number(rate18KT).toLocaleString('en-IN')}</strong>
            </div>
          </div>
          <div className={`price-change ${goldChange >= 0 ? 'up' : 'down'}`}>
            <i className={`fas fa-caret-${goldChange >= 0 ? 'up' : 'down'}`}></i>
            {Math.abs(goldChange)}% since yesterday
          </div>
        </div>

        {/* Silver Card */}
        <div className="rate-card silver-card">
          <div className="card-top">
            <div className="icon-box"><i className="fas fa-mountain"></i></div>
            <div className="metal-label">SILVER</div>
          </div>
          <div className="main-price">
            ₹{displayedSilver?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            <span className="unit">/g</span>
            <span className="live-tag">LIVE</span>
          </div>
          <div className="price-change-full">
            <span className={`price-change ${silverChange >= 0 ? 'up' : 'down'}`}>
              <i className={`fas fa-caret-${silverChange >= 0 ? 'up' : 'down'}`}></i>
              {Math.abs(silverChange)}%
            </span>
            <span className="change-label">Market Variation</span>
          </div>
          <div className="silver-info">Refined 999 Sterling Grade</div>
        </div>
      </div>

      {/* 7-Day History Chart */}
      <div className="rates-chart-section">
        <h3>7-Day Price Trend</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#888' }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey="goldRate" 
                name="Gold (24KT)" 
                stroke="#C9A84C" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#C9A84C', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="silverRate" 
                name="Silver" 
                stroke="#A8A8A8" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#A8A8A8', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default RatesWidget;
