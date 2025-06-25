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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /> {/* Semantic border color */}
                <XAxis dataKey="name" stroke="var(--light-text)" fontSize={12} tickLine={false} axisLine={false} /> {/* Semantic text color */}
                <YAxis stroke="var(--light-text)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencyName}${value/1000}k`} /> {/* Semantic text color */}
                <Tooltip 
                    cursor={{fill: 'var(--light-bg)'}} // Semantic light background
                    contentStyle={{ background: 'var(--light-card)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', color: 'var(--dark-text)' }} // Semantic colors
                    formatter={(value: number) => `${currencyName}${value.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ fontSize: '14px', color: 'var(--dark-text)' }}/> {/* Semantic text color */}
                <Bar dataKey={t('dashboard.financial_chart.revenue')} fill="var(--brand-primary)" radius={[4, 4, 0, 0]} /> {/* Semantic brand color */}
                <Bar dataKey={t('dashboard.financial_chart.expenses')} fill="var(--brand-orange)" radius={[4, 4, 0, 0]} /> {/* Semantic brand orange */}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default FinancialChart;
