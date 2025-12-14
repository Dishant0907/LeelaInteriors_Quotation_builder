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

  // Determine if this is a Quote or an Invoice based on status
  const isInvoice = ['Approved', 'Paid'].includes(quotation.status);
  const docTitle = isInvoice ? 'TAX INVOICE' : 'QUOTATION';
  const dateLabel = isInvoice ? 'Invoice Date:' : 'Date:';

  return (
    <div id="quote-preview-content" className="bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none print:w-full print:max-w-none print:m-0 print:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{docTitle}</h1>
          <p className="text-slate-500 mt-1 text-sm">#{quotation.number}</p>
          {isInvoice && <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">{quotation.status}</span>}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent">ModuQuote</div>
          <p className="text-sm text-slate-500 mt-1">Premium Modular Interiors</p>
          <p className="text-sm text-slate-500">123 Design Avenue, Creative City</p>
          <p className="text-sm text-slate-500">contact@moduquote.com</p>
          <p className="text-sm text-slate-500">GSTIN: 29ABCDE1234F1Z5</p>
        </div>
      </div>

      {/* Customer & Quote Details */}
      <div className="flex justify-between mb-8 border-b border-gray-100 pb-6">
        <div className="w-1/2 pr-8">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
          <p className="font-semibold text-slate-900">{quotation.customer.name}</p>
          <p className="text-slate-600 text-sm whitespace-pre-line leading-snug">{quotation.customer.address}</p>
          <div className="mt-2">
            <p className="text-slate-600 text-sm">{quotation.customer.email}</p>
            <p className="text-slate-600 text-sm">{quotation.customer.phone}</p>
          </div>
        </div>
        <div className="w-1/2 pl-8 text-right">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Details</h3>
          <div className="space-y-1">
            <div className="flex justify-end">
              <span className="text-slate-500 text-sm w-24">{dateLabel}</span>
              <span className="text-slate-900 text-sm font-medium">{quotation.date}</span>
            </div>
            {!isInvoice && (
              <div className="flex justify-end">
                <span className="text-slate-500 text-sm w-24">Valid Until:</span>
                <span className="text-slate-900 text-sm font-medium">{quotation.validUntil}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="py-2 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-1/12">#</th>
              <th className="py-2 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-5/12">Description</th>
              <th className="py-2 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-1/12 text-center">Qty</th>
              <th className="py-2 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-1/12 text-center">Unit</th>
              <th className="py-2 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-2/12 text-right">Rate</th>
              <th className="py-2 text-[10px] font-bold text-slate-900 uppercase tracking-wider w-2/12 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {Object.keys(groupedItems).map((category) => (
              <React.Fragment key={category}>
                <tr className="bg-gray-50 print:bg-gray-50/50">
                  <td colSpan={6} className="py-1.5 px-2 font-bold text-slate-700 uppercase text-[10px] tracking-wide border-b border-gray-100">
                    {category}
                  </td>
                </tr>
                {groupedItems[category].map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-slate-500 text-xs align-top">{index + 1}</td>
                    <td className="py-3 pr-4 align-top">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.description}</p>
                      
                      {/* Dimensions Display */}
                      {item.dimensions && (item.dimensions.length > 0 || item.dimensions.height > 0) && (
                         <p className="text-slate-400 text-[10px] mt-1">
                           Dims: {item.dimensions.length} x {item.dimensions.height} x {item.dimensions.depth}
                         </p>
                      )}
                      
                      {/* Area Display for Sq.Ft */}
                      {item.unit === Unit.SQFT && item.area && (
                         <p className="text-slate-500 text-[10px] mt-1 font-medium bg-slate-100 inline-block px-1 rounded">
                           Area: {item.area} Sq.Ft
                         </p>
                      )}
                    </td>
                    <td className="py-3 text-center text-slate-700 align-top">{item.quantity}</td>
                    <td className="py-3 text-center text-slate-500 text-xs align-top">{item.unit}</td>
                    <td className="py-3 text-right text-slate-700 font-medium align-top">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right text-slate-900 font-bold align-top">₹{item.amount.toLocaleString('en-IN')}</td>
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
          <div className="flex justify-between py-1.5 text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium">₹{quotation.subtotal.toLocaleString('en-IN')}</span>
          </div>
          {quotation.discount > 0 && (
             <div className="flex justify-between py-1.5 text-sm text-green-600">
               <span>Discount</span>
               <span>-₹{quotation.discount.toLocaleString('en-IN')}</span>
             </div>
          )}
          <div className="flex justify-between py-1.5 text-sm text-slate-600">
            <span>GST ({quotation.taxRate}%)</span>
            <span className="font-medium">₹{quotation.taxAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-slate-900 mt-2">
            <span className="text-lg font-bold text-slate-900">Total</span>
            <span className="text-lg font-bold text-slate-900">₹{quotation.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {quotation.notes && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8 break-inside-avoid">
          <h4 className="text-[10px] font-bold text-slate-900 uppercase mb-2">Notes & Terms</h4>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{quotation.notes}</p>
        </div>
      )}

      {/* Signature */}
      <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-end break-inside-avoid">
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