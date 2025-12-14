import React from 'react';
import { Quotation, Unit } from '../types';

interface QuotePreviewProps {
  quotation: Quotation;
}

const QuotePreview: React.FC<QuotePreviewProps> = ({ quotation }) => {
  // Group items by category
  const groupedItems = quotation.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof quotation.items>);

  const isInvoice = ['Approved', 'Paid'].includes(quotation.status);
  const docTitle = isInvoice ? 'TAX INVOICE' : 'QUOTATION';
  const dateLabel = isInvoice ? 'Invoice Date:' : 'Date:';

  return (
    <div 
      id="quote-preview-content" 
      className="bg-white p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:w-full print:max-w-none print:m-0 print:p-10 text-slate-900"
    >
      {/* Brand & Document Header */}
      <div className="flex justify-between items-start mb-12">
         {/* Logo/Company Area */}
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
             </div>
             <div className="text-2xl font-bold tracking-tight text-slate-900">ModuQuote</div>
          </div>
          <div className="text-xs text-slate-500 space-y-1 leading-relaxed">
             <p className="font-medium text-slate-700">Premium Modular Interiors</p>
             <p>123 Design Avenue, Creative City, 400001</p>
             <p>contact@moduquote.com | +91 98765 43210</p>
             <p>GSTIN: 29ABCDE1234F1Z5</p>
          </div>
        </div>

        {/* Document Details */}
        <div className="text-right">
          <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-2">{docTitle}</h1>
          <p className="text-sm font-medium text-slate-500 mb-4">#{quotation.number}</p>
          <div className="space-y-1">
             <div className="flex justify-end items-center gap-4">
               <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{dateLabel}</span>
               <span className="text-sm font-medium">{quotation.date}</span>
             </div>
             {!isInvoice && (
                <div className="flex justify-end items-center gap-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valid Until:</span>
                  <span className="text-sm font-medium">{quotation.validUntil}</span>
                </div>
             )}
             {isInvoice && (
                <div className="mt-2">
                   <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${quotation.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                     Status: {quotation.status}
                   </span>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="mb-12">
        <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-4 border-b border-slate-100 pb-2">Bill To</h3>
        <div className="flex justify-between items-start">
           <div>
              <p className="text-lg font-bold text-slate-900 mb-1">{quotation.customer.name}</p>
              <div className="text-sm text-slate-600 space-y-1">
                <p className="whitespace-pre-line leading-relaxed">{quotation.customer.address}</p>
                {quotation.customer.email && <p>{quotation.customer.email}</p>}
                {quotation.customer.phone && <p>{quotation.customer.phone}</p>}
              </div>
           </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="pb-3 border-b-2 border-slate-900 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-12">#</th>
              <th className="pb-3 border-b-2 border-slate-900 text-[10px] font-bold text-slate-900 uppercase tracking-wider">Description</th>
              <th className="pb-3 border-b-2 border-slate-900 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-16 text-center">Qty</th>
              <th className="pb-3 border-b-2 border-slate-900 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-16 text-center">Unit</th>
              <th className="pb-3 border-b-2 border-slate-900 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-24 text-right">Rate</th>
              <th className="pb-3 border-b-2 border-slate-900 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-28 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm leading-relaxed">
            {Object.keys(groupedItems).map((category, catIndex) => (
              <React.Fragment key={category}>
                {/* Category Header */}
                <tr>
                   <td colSpan={6} className="pt-6 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1 rounded">
                        {category}
                      </span>
                   </td>
                </tr>
                {groupedItems[category].map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0 group">
                    <td className="py-4 text-slate-400 text-xs align-top">{index + 1}</td>
                    <td className="py-4 pr-6 align-top">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      {item.description && (
                         <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-md">{item.description}</p>
                      )}
                      <div className="flex gap-3 mt-2">
                        {(item.dimensions?.length || 0) > 0 && (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                             {item.dimensions?.length}L × {item.dimensions?.height}H × {item.dimensions?.depth}D
                          </span>
                        )}
                        {item.unit === Unit.SQFT && item.area && (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                             Area: {item.area} Sq.Ft
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center text-slate-600 align-top">{item.quantity}</td>
                    <td className="py-4 text-center text-slate-400 text-xs align-top uppercase">{item.unit}</td>
                    <td className="py-4 text-right text-slate-600 align-top font-medium">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="py-4 text-right text-slate-900 align-top font-bold">₹{item.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Totals */}
      <div className="flex flex-col items-end border-t-2 border-slate-900 pt-6">
        <div className="w-full max-w-xs space-y-3">
           <div className="flex justify-between text-sm text-slate-600">
             <span>Subtotal</span>
             <span className="font-medium">₹{quotation.subtotal.toLocaleString('en-IN')}</span>
           </div>
           
           {quotation.discount > 0 && (
             <div className="flex justify-between text-sm text-green-600">
               <span>Discount</span>
               <span>- ₹{quotation.discount.toLocaleString('en-IN')}</span>
             </div>
           )}

           <div className="flex justify-between text-sm text-slate-600">
             <span>GST ({quotation.taxRate}%)</span>
             <span className="font-medium">₹{quotation.taxAmount.toLocaleString('en-IN')}</span>
           </div>

           <div className="flex justify-between items-center pt-4 border-t border-slate-200">
             <span className="text-base font-bold text-slate-900 uppercase tracking-wide">Grand Total</span>
             <span className="text-2xl font-bold text-slate-900">₹{quotation.total.toLocaleString('en-IN')}</span>
           </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {quotation.notes && (
        <div className="mt-12 pt-8 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Notes & Terms</h4>
          <div className="bg-slate-50 p-6 rounded-xl">
             <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{quotation.notes}</p>
          </div>
        </div>
      )}

       {/* Signature Area */}
      <div className="mt-16 flex justify-between items-end">
        <div className="text-xs text-slate-400">
           <p>This is a computer generated quotation.</p>
        </div>
        <div className="text-center">
           <div className="h-16 w-40 border-b border-slate-300 mb-2"></div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Signature</p>
        </div>
      </div>

    </div>
  );
};

export default QuotePreview;