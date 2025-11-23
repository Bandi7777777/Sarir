import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as TooltipChart,
  Legend as LegendChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
} from "recharts";

export function ReportsCharts({
  trendData,
  barData,
  pieData,
  radarData,
}: {
  trendData: any[];
  barData: any[];
  pieData: any[];
  radarData: any[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="glass p-4 text-white">
        <h3 className="mb-2 text-sm">روند گزارش‌ها</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <TooltipChart />
            <LegendChart />
            <Line type="monotone" dataKey="count" name="گزارش اول" stroke="#4DA8FF" strokeWidth={2} />
            <Line type="monotone" dataKey="secondary" name="گزارش دوم" stroke="#F2991F" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass p-4 text-white">
        <h3 className="mb-2 text-sm">گزارش بر اساس دسته</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <TooltipChart />
            <Bar dataKey="count" fill="#7ad7f0" name="تعداد" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass flex flex-col items-center p-4 text-white">
        <h3 className="mb-2 text-sm">سهم هر دسته</h3>
        <PieChart width={220} height={220}>
          <TooltipChart />
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#F2991F" label />
        </PieChart>
      </div>

      <div className="glass p-4 text-white">
        <h3 className="mb-2 text-sm">مقایسه شاخص‌ها</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#ccc" />
            <PolarAngleAxis dataKey="subject" stroke="#ccc" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#ccc" />
            <Radar name="شاخص A" dataKey="A" stroke="#4DA8FF" fill="#4DA8FF" fillOpacity={0.6} />
            <Radar name="شاخص B" dataKey="B" stroke="#F2991F" fill="#F2991F" fillOpacity={0.4} />
            <LegendChart />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
