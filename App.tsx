import React, { useState, useEffect } from 'react';
import { Quotation, EMPTY_CUSTOMER } from './types';
import QuoteEditor from './components/QuoteEditor';
import QuotePreview from './components/QuotePreview';
import { PlusIcon, PrinterIcon, EditIcon, SparklesIcon, ArrowLeftIcon } from './components/ui/Icons';
import { generateCoverLetter } from './services/geminiService';

const STORAGE_KEY = 'moduquote_data_v1';

function App() {
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quotation | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'edit' | 'preview'>('dashboard');
  const [aiCoverLetter, setAiCoverLetter] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setQuotes(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored quotes");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  }, [quotes]);

  const createNewQuote = () => {
    const newQuote: Quotation = {
      id: Date.now().toString(),
      number: `MQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toLocaleDateString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      customer: { ...EMPTY_CUSTOMER },
      items: [],
      subtotal: 0,
      taxRate: 10,
      taxAmount: 0,
      discount: 0,
      total: 0,
      notes: "1. 50% Advance payment required.\n2. Delivery within 4-6 weeks.\n3. Goods once sold cannot be returned.",
      status: 'Draft'
    };
    setQuotes([newQuote, ...quotes]);
    setCurrentQuote(newQuote);
    setViewMode('edit');
  };

  const handleUpdateQuote = (updated: Quotation) => {
    setCurrentQuote(updated);
    setQuotes(quotes.map(q => q.id === updated.id ? updated : q));
  };

  const handleEdit = (quote: Quotation) => {
    setCurrentQuote(quote);
    setViewMode('edit');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this quote?')) {
      setQuotes(quotes.filter(q => q.id !== id));
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!currentQuote) return;
    setGeneratingLetter(true);
    const letter = await generateCoverLetter(currentQuote);
    setAiCoverLetter(letter);
    setGeneratingLetter(false);
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('quote-preview-content');
    if (!element) return;

    // Use specific options to ensure correct rendering without weird offsets
    const opt = {
      margin: 0,
      filename: `Quote_${currentQuote?.number || 'Draft'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      // scrollY: 0 is crucial to prevent the PDF from rendering with window scroll offset
      html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save();
    } else {
      alert("PDF generator is loading, please try again in a moment or use Print > Save as PDF.");
      window.print();
    }
  };

  // Dashboard View
  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-12">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ModuQuote</h1>
           <p className="text-slate-500 mt-2">Manage your kitchen & wardrobe projects</p>
        </div>
        <button
          onClick={createNewQuote}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg shadow-slate-200 flex items-center gap-2 transition-all transform hover:scale-105"
        >
          <PlusIcon className="w-5 h-5" />
          New Quote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotes.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <PlusIcon className="w-8 h-8 text-gray-300" />
             </div>
             <p className="text-slate-500 font-medium">No quotations yet</p>
             <p className="text-sm text-slate-400 mt-1">Create your first quote to get started</p>
          </div>
        )}
        {quotes.map(quote => (
          <div
            key={quote.id}
            onClick={() => handleEdit(quote)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group relative"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                {quote.status}
              </span>
              <span className="text-slate-400 text-xs">{quote.date}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
              {quote.customer.name || 'Untitled Customer'}
            </h3>
            <p className="text-sm text-slate-500 mb-6 truncate">#{quote.number}</p>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Amount</p>
                <p className="text-xl font-bold text-slate-900">₹{quote.total.toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={(e) => handleDelete(quote.id, e)}
                className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 selection:bg-blue-100">
      {/* Navbar for Non-Print Views */}
      {viewMode !== 'preview' && (
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      )}

      {viewMode === 'dashboard' && renderDashboard()}

      {viewMode === 'edit' && currentQuote && (
        <div className="p-6">
          <QuoteEditor
            quotation={currentQuote}
            onUpdate={handleUpdateQuote}
            onBack={() => setViewMode('dashboard')}
            onPreview={() => setViewMode('preview')}
          />
        </div>
      )}

      {viewMode === 'preview' && currentQuote && (
        <div className="min-h-screen bg-slate-100 pb-12 print:bg-white print:pb-0">
          {/* Preview Toolbar - Hidden when printing */}
          <div className="bg-slate-900 text-white p-4 print:hidden sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <button onClick={() => setViewMode('edit')} className="flex items-center gap-2 hover:text-gray-300">
                <ArrowLeftIcon className="w-5 h-5" /> Back to Editor
              </button>
              <div className="flex gap-4">
                 <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingLetter}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-sm font-medium border border-slate-700"
                  >
                    <SparklesIcon className={`w-4 h-4 ${generatingLetter ? 'animate-spin' : 'text-yellow-400'}`} />
                    {generatingLetter ? 'Writing...' : 'AI Cover Letter'}
                  </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 font-bold shadow-lg shadow-blue-900/50"
                >
                  <PrinterIcon className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          <div className="py-8 print:py-0">
             {/* AI Cover Letter Modal/Section */}
             {aiCoverLetter && (
               <div className="max-w-[210mm] mx-auto mb-8 bg-white p-8 rounded-lg shadow-sm border border-indigo-100 print:hidden relative">
                  <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-indigo-500" /> AI Suggestion
                  </h3>
                  <div className="prose prose-sm text-slate-600 bg-indigo-50/50 p-4 rounded-md italic">
                    {aiCoverLetter}
                  </div>
                  <button onClick={() => setAiCoverLetter('')} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xs">Close</button>
               </div>
             )}

             <QuotePreview quotation={currentQuote} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;