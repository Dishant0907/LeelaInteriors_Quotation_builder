import React, { useState, useEffect } from 'react';
import { Quotation, LineItem, Unit, EMPTY_ITEM } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon } from './ui/Icons';
import { enhanceItemDescription } from '../services/geminiService';

interface QuoteEditorProps {
  quotation: Quotation;
  onUpdate: (q: Quotation) => void;
  onBack: () => void;
  onPreview: () => void;
}

const QuoteEditor: React.FC<QuoteEditorProps> = ({ quotation, onUpdate, onBack, onPreview }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'summary'>('details');
  const [loadingAi, setLoadingAi] = useState<string | null>(null);

  // Helper to recalculate totals
  const recalculate = (q: Quotation): Quotation => {
    const subtotal = q.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal - q.discount) * (q.taxRate / 100);
    const total = subtotal - q.discount + taxAmount;
    return { ...q, subtotal, taxAmount, total };
  };

  const handleCustomerChange = (field: string, value: string) => {
    onUpdate({ ...quotation, customer: { ...quotation.customer, [field]: value } });
  };

  const addItem = () => {
    const newItem = { ...EMPTY_ITEM, id: Date.now().toString() };
    const updated = { ...quotation, items: [...quotation.items, newItem] };
    onUpdate(recalculate(updated));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = quotation.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Auto-calculate amount
        updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        return updatedItem;
      }
      return item;
    });
    onUpdate(recalculate({ ...quotation, items: updatedItems }));
  };

  const removeItem = (id: string) => {
    const updatedItems = quotation.items.filter(i => i.id !== id);
    onUpdate(recalculate({ ...quotation, items: updatedItems }));
  };

  const handleAiDescription = async (itemId: string, name: string, category: string) => {
    if (!name) return;
    setLoadingAi(itemId);
    const desc = await enhanceItemDescription(name, category);
    if (desc) {
      updateItem(itemId, 'description', desc);
    }
    setLoadingAi(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header / Nav */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
            &larr; Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">Edit Quote #{quotation.number}</h2>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'details' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-gray-50'}`}
            >
              Client
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'items' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-gray-50'}`}
            >
              Items
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'summary' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-gray-50'}`}
            >
              Summary
            </button>
          </div>
          <button
             onClick={onPreview}
             className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            Preview & Print
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
        {activeTab === 'details' && (
          <div className="p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Customer Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={quotation.customer.name}
                  onChange={(e) => handleCustomerChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={quotation.customer.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={quotation.customer.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Billing Address</label>
                <textarea
                  value={quotation.customer.address}
                  onChange={(e) => handleCustomerChange('address', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="123 Main St..."
                />
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setActiveTab('items')}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Next: Add Items &rarr;
              </button>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-semibold text-slate-900">Line Items</h3>
               <button onClick={addItem} className="flex items-center gap-2 text-sm font-medium text-accent hover:text-blue-700">
                 <PlusIcon className="w-4 h-4" /> Add New Item
               </button>
            </div>
            
            <div className="space-y-4">
              {quotation.items.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  No items added yet. Click "Add New Item" to start.
                </div>
              )}
              {quotation.items.map((item, index) => (
                <div key={item.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 hover:border-gray-300 transition-all relative group">
                  <div className="grid grid-cols-12 gap-4 items-start">
                    {/* Category & Name */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                       <input
                          type="text"
                          value={item.category}
                          onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-semibold text-slate-500 bg-transparent border-none focus:ring-0 placeholder-slate-400"
                          placeholder="CATEGORY (e.g. Kitchen)"
                        />
                        <div className="relative">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none text-sm font-medium"
                            placeholder="Item Name"
                          />
                        </div>
                        <div className="relative">
                           <textarea
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-600 resize-none"
                            placeholder="Description..."
                          />
                          <button
                            onClick={() => handleAiDescription(item.id, item.name, item.category)}
                            disabled={loadingAi === item.id || !item.name}
                            className="absolute bottom-2 right-2 p-1 text-slate-400 hover:text-accent disabled:opacity-30"
                            title="Generate description with AI"
                          >
                            <SparklesIcon className={`w-4 h-4 ${loadingAi === item.id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                    </div>

                    {/* Dimensions & Unit */}
                    <div className="col-span-12 md:col-span-3 space-y-2">
                      <div className="flex gap-2">
                         <div className="flex-1">
                            <label className="text-[10px] uppercase text-slate-400 font-bold">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                            />
                         </div>
                         <div className="flex-1">
                            <label className="text-[10px] uppercase text-slate-400 font-bold">Unit</label>
                            <select
                              value={item.unit}
                              onChange={(e) => updateItem(item.id, 'unit', e.target.value as Unit)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                            >
                              {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                         </div>
                      </div>
                    </div>

                    {/* Rate & Amount */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                       <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] uppercase text-slate-400 font-bold">Rate</label>
                            <div className="relative">
                               <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                               <input
                                type="number"
                                min="0"
                                value={item.rate}
                                onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-slate-900 outline-none text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                             <label className="text-[10px] uppercase text-slate-400 font-bold">Amount</label>
                             <div className="w-full px-3 py-2 bg-slate-100 rounded-md text-sm font-semibold text-slate-700 border border-transparent">
                               ${item.amount.toLocaleString()}
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Delete */}
                    <div className="col-span-12 md:col-span-1 flex justify-center pt-6">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
               <button onClick={() => setActiveTab('details')} className="text-slate-500 text-sm font-medium hover:text-slate-900">
                 &larr; Back to Client
               </button>
               <button
                  onClick={() => setActiveTab('summary')}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
                >
                  Next: Summary &rarr;
                </button>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Quote Summary</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal ({quotation.items.length} items)</span>
                <span className="font-medium">${quotation.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600">Discount Amount</span>
                <input
                  type="number"
                  value={quotation.discount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onUpdate(recalculate({ ...quotation, discount: val }));
                  }}
                  className="w-32 px-2 py-1 text-right border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600">Tax Rate (%)</span>
                <input
                  type="number"
                  value={quotation.taxRate}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onUpdate(recalculate({ ...quotation, taxRate: val }));
                  }}
                  className="w-32 px-2 py-1 text-right border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900">Total Payable</span>
                <span className="text-2xl font-bold text-slate-900">${quotation.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes / Terms & Conditions</label>
              <textarea
                value={quotation.notes}
                onChange={(e) => onUpdate({ ...quotation, notes: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                placeholder="Payment terms, warranty info, delivery schedule..."
              />
            </div>

             <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
               <button onClick={() => setActiveTab('items')} className="text-slate-500 text-sm font-medium hover:text-slate-900">
                 &larr; Back to Items
               </button>
               <button
                  onClick={onPreview}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 shadow-md shadow-green-200"
                >
                  Finalize & Preview
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteEditor;