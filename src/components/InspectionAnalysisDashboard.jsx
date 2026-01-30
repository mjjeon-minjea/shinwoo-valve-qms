import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { api } from '../lib/api';

const InspectionAnalysisDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        byCategory: [],
        supplierQty: [],
        supplierFreq: [],
        worstSuppliers: [],
        defectReasons: []
    });

    const [selectedYear, setSelectedYear] = useState(2025);
    const [selectedMonth, setSelectedMonth] = useState('all'); // Default to all months to show full year data

    useEffect(() => {
        fetchData();
    }, []);

    // Re-process data when filter changes, but we need the raw data first.
    // So let's store raw data in state too.
    const [rawData, setRawData] = useState({ inspections: [], items: [] });

    useEffect(() => {
        if (rawData.inspections.length > 0) {
            processData(rawData.inspections, rawData.items);
        }
    }, [selectedYear, selectedMonth, rawData]);

    const fetchData = async () => {
        try {
            const [inspRes, itemRes] = await Promise.all([
                api.fetch('/inspections'),
                api.fetch('/item_master')
            ]);
            
            if (inspRes.ok) {
                const inspections = await inspRes.json();
                let items = [];
                if (itemRes.ok) {
                    items = await itemRes.json();
                }
                setRawData({ inspections, items });
                // processData is triggered by useEffect
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date safely
    const formatDate = (val) => {
        if (!val) return null;
        if (typeof val === 'number') {
            const date = new Date(Math.round((val - 25569) * 86400 * 1000));
            return date;
        }
        if (typeof val === 'string') {
            // Check if it's a numeric string (Excel serial)
            if (!isNaN(Number(val)) && !val.includes('-')) {
                 const date = new Date(Math.round((Number(val) - 25569) * 86400 * 1000));
                 return date;
            }
            return new Date(val);
        }
        return new Date(val);
    };

    const processData = (inspections, items) => {
        // Filter by Date
        const filteredInspections = inspections.filter(insp => {
            const dateVal = insp.date || insp.inspectionDate; // Handle both potential keys
            if (!dateVal) return false;
            
            const date = formatDate(dateVal);
            if (!date || isNaN(date.getTime())) return false;

            const yearMatch = date.getFullYear() === parseInt(selectedYear);
            const monthMatch = selectedMonth === 'all' || date.getMonth() + 1 === parseInt(selectedMonth);
            return yearMatch && monthMatch;
        });

        const itemMap = items.reduce((acc, curr) => {
            acc[curr.id] = curr; // Map by item code if possible, or name
            if (curr.name) acc[curr.name] = curr; // Fallback map by name
            return acc;
        }, {});

        // 1. Product Category Analysis
        const categoryMap = {};
        filteredInspections.forEach(insp => {
            const item = itemMap[insp.itemName];
            // Use 'itemType' from inspection data if available, otherwise fallback to item_master '대분류설명'
            const category = insp.itemType || item?.originalData?.['대분류설명'] || '미분류';
            categoryMap[category] = (categoryMap[category] || 0) + 1; // Count Frequency
        });
        const byCategory = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // 2. Supplier Analysis
        const supplierQtyMap = {};
        const supplierFreqMap = {};
        
        // 3. Worst Supplier (Defect Count)
        const defectCountMap = {};

        // 4. Defect Reasons for Worst Suppliers
        // We need to track defect types per supplier
        const supplierDefectTypeMap = {};

        filteredInspections.forEach(insp => {
            const supplier = insp.supplier || '알수없음';
            const qty = Number(insp.totalQuantity) || 0;
            const defectQty = Number(insp.defectQuantity) || 0;
            
            // Supplier Stats
            supplierQtyMap[supplier] = (supplierQtyMap[supplier] || 0) + qty;
            supplierFreqMap[supplier] = (supplierFreqMap[supplier] || 0) + 1;

            // Defect Stats
            // Consider defect text or defect quantity > 0
            if (defectQty > 0 || insp.result === '불합격') {
                defectCountMap[supplier] = (defectCountMap[supplier] || 0) + 1;
                
                if (insp.defectType) {
                    if (!supplierDefectTypeMap[supplier]) supplierDefectTypeMap[supplier] = {};
                    supplierDefectTypeMap[supplier][insp.defectType] = (supplierDefectTypeMap[supplier][insp.defectType] || 0) + 1;
                }
            }
        });

        const getTop5 = (map) => Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const supplierQty = getTop5(supplierQtyMap);
        const supplierFreq = getTop5(supplierFreqMap);
        const worstSuppliers = getTop5(defectCountMap);

        // Process Defect Reasons for the top 5 worst suppliers
        const defectReasons = worstSuppliers.map(ws => {
            const supplier = ws.name;
            const reasons = supplierDefectTypeMap[supplier] || {};
            // Flatten reasons to array
            const reasonList = Object.entries(reasons).map(([type, count]) => ({ type, count }));
            return {
                supplier,
                reasons: reasonList.sort((a, b) => b.count - a.count)
            };
        });

        setStats({ byCategory, supplierQty, supplierFreq, worstSuppliers, defectReasons });
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) return <div className="p-8 text-center text-slate-500">데이터 분석 중...</div>;

    return (
        <div className="space-y-8 animate-fade-in p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                     <h1 className="text-2xl font-bold text-slate-900">종합분석현황</h1>
                     <p className="text-slate-500">품목, 공급업체, 불량 현황 심층 분석</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                    종합 분석
                </div>
            </div>

            {/* Section 1: Category Analysis */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-sm"></span>
                    품목 카테고리 분석 (대분류별 입고 비중)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.byCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                    isAnimationActive={false}
                                >
                                    {stats.byCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend wrapperStyle={{ pointerEvents: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            {/* Section 2: Supplier Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 border-l-4 border-blue-600 pl-3">
                        입고 수량 기준 Top 5
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.supplierQty}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                    isAnimationActive={false}
                                >
                                     {stats.supplierQty.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 border-l-4 border-blue-600 pl-3">
                        입고 건수 기준 Top 5
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.supplierFreq}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                    isAnimationActive={false}
                                >
                                     {stats.supplierFreq.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
            </div>

            {/* Section 3: Worst Supplier Analysis */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 border-l-4 border-red-500 pl-3">
                        불량 건수 기준 워스트 Top 5
                    </h3>
                    <div className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full font-medium">
                        집중 관리 대상
                    </div>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.worstSuppliers} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fontWeight: 500 }} />
                            <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={30} name="불량 건수" isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Section 4: Defect Reason Analysis */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-lg text-slate-800 mb-6 border-l-4 border-slate-600 pl-3">
                    워스트 업체별 주요 부적합 사유
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.defectReasons.map((item, idx) => (
                        <div key={idx} className="border border-slate-100 p-4 rounded-lg">
                            <h4 className="font-bold text-slate-700 mb-3">{item.supplier}</h4>
                            <ul className="space-y-2">
                                {item.reasons.map((reason, rIdx) => (
                                    <li key={rIdx} className="flex justify-between text-sm">
                                        <span className="text-slate-500">{reason.type || '기타'}</span>
                                        <span className="font-medium text-slate-900">{reason.count}건</span>
                                    </li>
                                ))}
                                {item.reasons.length === 0 && <li className="text-xs text-slate-400">등록된 사유 없음</li>}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InspectionAnalysisDashboard;
