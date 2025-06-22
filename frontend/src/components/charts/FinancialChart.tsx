import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancialData {
    name: string;
    Revenue: number;
    Expenses: number;
}

const FinancialChart: React.FC<{ data: FinancialData[] }> = ({ data }) => {
    const { t } = useTranslation();
    const { currencyName } = useLang();

    const translatedData = data.map(item => ({
        name: item.name,
        [t('dashboard.financial_chart.revenue')]: item.Revenue,
        [t('dashboard.financial_chart.expenses')]: item.Expenses,
    }));

    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={translatedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencyName}${value/1000}k`} />
                <Tooltip 
                    cursor={{fill: 'rgba(229, 231, 235, 0.5)'}}
                    contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    formatter={(value: number) => `${currencyName}${value.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }}/>
                <Bar dataKey={t('dashboard.financial_chart.revenue')} fill="#7091E6" radius={[4, 4, 0, 0]} />
                <Bar dataKey={t('dashboard.financial_chart.expenses')} fill="#ADBBDA" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default FinancialChart;
