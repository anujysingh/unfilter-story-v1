import { useParams, Link } from "react-router";
import { ArrowLeft, Building2, Calendar, MapPin, ExternalLink, TrendingUp, DollarSign } from "lucide-react";
import { mockCompanies } from "../data/mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function FundingDetail() {
  const { id } = useParams();
  const company = mockCompanies.find((c) => c.id === id);

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Company not found</h2>
          <Link to="/" className="text-[#FF4D8D] font-medium flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen pb-20">
      <section className="bg-white border-b border-[#EAEAEA] py-12">
        <div className="max-w-5xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[#6B6B6B] hover:text-[#FF4D8D] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Funding Rounds
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <ImageWithFallback
              src={company.logo}
              alt={company.name}
              className="w-24 h-24 rounded-2xl border border-[#EAEAEA] object-cover"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold text-[#111111]">{company.name}</h1>
                <span className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-4 py-1 rounded-full text-sm font-bold">
                  {company.stage}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[#6B6B6B]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{company.industry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Founded {company.founded}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Bangalore, India</span>
                </div>
              </div>
            </div>
            <button className="bg-[#111111] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-black transition-colors">
              Visit Website
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-[#EAEAEA]">
              <h2 className="text-xl font-bold mb-4">About the Company</h2>
              <p className="text-[#444444] leading-relaxed text-lg">
                {company.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-[#EAEAEA]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Funding Growth</h2>
                <div className="flex items-center gap-2 text-[#FF7A18]">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold">{company.amount} Total</span>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={company.fundingHistory}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7A18" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#FF7A18" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6B6B6B', fontSize: 12}} 
                    />
                    <YAxis 
                      hide={true} 
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      formatter={(value: number) => [`$${value}M`, 'Funding']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#FF7A18" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmt)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#EAEAEA]">
              <h3 className="font-bold text-[#111111] mb-6">Investment Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-[#F9F9F9]">
                  <span className="text-[#6B6B6B]">Last Round</span>
                  <span className="font-bold text-[#111111]">{company.amount}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#F9F9F9]">
                  <span className="text-[#6B6B6B]">Round Type</span>
                  <span className="font-bold text-[#111111]">{company.stage}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[#6B6B6B]">Lead Investor</span>
                  <span className="font-bold text-[#111111]">Nexus Venture Partners</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#111111] to-[#2A2A2A] rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4">Want more insights?</h3>
              <p className="text-gray-400 text-sm mb-6">Get access to deep-dive reports and funding trends across India.</p>
              <button className="w-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] py-3 rounded-xl font-bold">
                Join Unfilter Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
