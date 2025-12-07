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

  return (
    <div className="bg-white p-12 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:w-full print:max-w-none print:m-0 print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">QUOTATION</h1>
          <p className="text-slate-500 mt-1">Reference: #{quotation.number}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent">ModuQuote</div>
          <p className="text-sm text-slate-500 mt-1">Premium Modular Interiors</p>
          <p className="text-sm text-slate-500">123 Design Avenue, Creative City</p>
          <p className="text-sm text-slate-500">contact@moduquote.com</p>
        </div>
      </div>

      {/* Customer & Quote Details */}
      <div className="flex justify-between mb-12 border-b border-gray-100 pb-8">
        <div className="w-1/2 pr-8">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Bill To</h3>
          <p className="font-semibold text-slate-900">{quotation.customer.name}</p>
          <p className="text-slate-600 text-sm whitespace-pre-line">{quotation.customer.address}</p>
          <p className="text-slate-600 text-sm mt-1">{quotation.customer.email}</p>
          <p className="text-slate-600 text-sm">{quotation.customer.phone}</p>
        </div>
        <div className="w-1/2 pl-8 text-right">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Details</h3>
          <div className="flex justify-end mb-1">
            <span className="text-slate-500 text-sm w-24">Date:</span>
            <span className="text-slate-900 text-sm font-medium">{quotation.date}</span>
          </div>
          <div className="flex justify-end">
            <span className="text-slate-500 text-sm w-24">Valid Until:</span>
            <span className="text-slate-900 text-sm font-medium">{quotation.validUntil}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="py-3 text-xs font-bold text-slate-900 uppercase tracking-wider w-1/12">#</th>
              <th className="py-3 text-xs font-bold text-slate-900 uppercase tracking-wider w-5/12">Description</th>
              <th className="py-3 text-xs font-bold text-slate-900 uppercase tracking-wider w-1/12 text-center">Qty</th>
              <th className="py-3 text-xs font-bold text-slate-900 uppercase tracking-wider w-1/12 text-center">Unit</th>
              <th className="py-3 text-xs font-bold text-slate-900 uppercase tracking-wider w-2/12 text-right">Rate</th>
              <th className="py-3 text-xs font-bold text-slate-900 uppercase tracking-wider w-2/12 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {Object.keys(groupedItems).map((category) => (
              <React.Fragment key={category}>
                <tr className="bg-gray-50 print:bg-gray-50/50">
                  <td colSpan={6} className="py-2 px-2 font-bold text-slate-700 uppercase text-xs tracking-wide">
                    {category}
                  </td>
                </tr>
                {groupedItems[category].map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-4 text-slate-500">{index + 1}</td>
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.description}</p>
                      {item.dimensions && (item.dimensions.length > 0 || item.dimensions.height > 0) && (
                         <p className="text-slate-400 text-[10px] mt-1">
                           Dims: {item.dimensions.length} x {item.dimensions.height} x {item.dimensions.depth}
                         </p>
                      )}
                    </td>
                    <td className="py-4 text-center text-slate-700">{item.quantity}</td>
                    <td className="py-4 text-center text-slate-500 text-xs">{item.unit}</td>
                    <td className="py-4 text-right text-slate-700 font-medium">${item.rate.toLocaleString()}</td>
                    <td className="py-4 text-right text-slate-900 font-bold">${item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2 lg:w-1/3">
          <div className="flex justify-between py-2 text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium">${quotation.subtotal.toLocaleString()}</span>
          </div>
          {quotation.discount > 0 && (
             <div className="flex justify-between py-2 text-sm text-green-600">
               <span>Discount</span>
               <span>-${quotation.discount.toLocaleString()}</span>
             </div>
          )}
          <div className="flex justify-between py-2 text-sm text-slate-600">
            <span>Tax ({quotation.taxRate}%)</span>
            <span className="font-medium">${quotation.taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-4 border-t-2 border-slate-900 mt-2">
            <span className="text-lg font-bold text-slate-900">Total</span>
            <span className="text-lg font-bold text-slate-900">${quotation.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {quotation.notes && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8 break-inside-avoid">
          <h4 className="text-xs font-bold text-slate-900 uppercase mb-2">Notes & Terms</h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{quotation.notes}</p>
        </div>
      )}

      {/* Signature */}
      <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-end break-inside-avoid">
        <div>
          <p className="text-xs text-slate-400">Thank you for your business!</p>
        </div>
        <div className="text-right">
          <div className="h-12 w-48 border-b border-slate-300 mb-2"></div>
          <p className="text-xs text-slate-500">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;