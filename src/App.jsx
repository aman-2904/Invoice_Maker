import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import { calculateInvoiceTotals } from './utils/gstCalculation';
import { numberToWords } from './utils/numberToWords';
import './styles/form.css';
import './styles/invoice.css';

function App() {
  const [formData, setFormData] = useState({
    sellerName: '',
    sellerAddress: '',
    sellerPhone: '',
    sellerGST: '',
    sellerPAN: '',
    sellerEmail: '',
    sellerTagline: '',
    buyerName: '',
    buyerAddress: '',
    buyerGST: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    deliveryNote: '',
    paymentMode: '',
    supplierRef: '',
    otherRef: '',
    buyerPO: '',
    poDate: '',
    dispatchThrough: '',
    destination: '',
    termsOfDelivery: ''
  });

  const [items, setItems] = useState([
    { id: 1, description: '', hsn: '', unit: 1, rate: 0, amount: 0 }
  ]);

  const [gstRate, setGstRate] = useState(18);
  const [excludeGST, setExcludeGST] = useState(false);
  const invoiceRef = useRef(null);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updates = { [field]: value };

        let newRate = item.rate;
        let newUnit = item.unit;

        if (field === 'rate') newRate = parseFloat(value) || 0;
        if (field === 'unit') newUnit = parseFloat(value) || 0;

        // Auto-calculate amount if rate or unit changes
        if (field === 'rate' || field === 'unit') {
          updates.amount = newRate * newUnit;
        }

        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    setItems(prev => [...prev, { id: newId, description: '', hsn: '', unit: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const resetForm = () => {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
      setFormData({
        sellerName: '',
        sellerAddress: '',
        sellerPhone: '',
        sellerGST: '',
        sellerPAN: '',
        sellerEmail: '',
        sellerTagline: '',
        buyerName: '',
        buyerAddress: '',
        buyerGST: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        deliveryNote: '',
        paymentMode: '',
        supplierRef: '',
        otherRef: '',
        buyerPO: '',
        poDate: '',
        dispatchThrough: '',
        destination: '',
        termsOfDelivery: ''
      });
      setItems([{ id: 1, description: '', hsn: '', unit: 1, rate: 0, amount: 0 }]);
      setGstRate(18);
      setExcludeGST(false);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      { field: 'sellerName', label: 'Seller Name' },
      { field: 'sellerAddress', label: 'Seller Address' },
      { field: 'sellerPhone', label: 'Seller Phone' },
      { field: 'sellerGST', label: 'Seller GST' },
      { field: 'sellerEmail', label: 'Seller Email' },
      { field: 'buyerName', label: 'Buyer Name' },
      { field: 'buyerAddress', label: 'Buyer Address' },
      { field: 'invoiceNumber', label: 'Invoice Number' },
      { field: 'invoiceDate', label: 'Invoice Date' }
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field] || !formData[field].trim()) {
        alert(`Please fill in: ${label}`);
        return false;
      }
    }

    if (items.length === 0) {
      alert('Please add at least one item to the invoice');
      return false;
    }

    for (const item of items) {
      if (!item.description || !item.description.trim()) {
        alert('Please fill in item description for all items');
        return false;
      }
      if (!item.amount || parseFloat(item.amount) <= 0) {
        alert('Please enter a valid amount for all items');
        return false;
      }
    }

    return true;
  };

  const generatePDF = () => {
    if (!validateForm()) {
      return;
    }

    const element = invoiceRef.current;
    element.style.display = 'block';

    const invoiceNumber = formData.invoiceNumber;
    const cleanInvoiceNumber = invoiceNumber.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
    const filename = `Invoice_${cleanInvoiceNumber}.pdf`;

    const opt = {
      margin: [5, 5, 5, 5],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save(filename)
      .then(() => {
        element.style.display = 'none';
        alert('Invoice PDF generated successfully!');
      })
      .catch(err => {
        console.error('PDF generation error:', err);
        alert('Error generating PDF. Please try again.');
        element.style.display = 'none';
      });
  };

  const effectiveGstRate = excludeGST ? 0 : gstRate;
  const totals = calculateInvoiceTotals(items, effectiveGstRate);
  const amountInWords = numberToWords(totals.totalAfterTax);

  return (
    <div className="container">
      <header className="app-header">
        <h1>GST Tax Invoice Maker</h1>
        <p className="subtitle">Professional invoice generator with instant PDF download</p>
      </header>

      <InvoiceForm
        formData={formData}
        items={items}
        gstRate={effectiveGstRate}
        originalGstRate={gstRate}
        excludeGST={excludeGST}
        totals={totals}
        amountInWords={amountInWords}
        onFormChange={handleFormChange}
        onItemChange={handleItemChange}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onGstRateChange={setGstRate}
        onExcludeGSTChange={setExcludeGST}
        onGeneratePDF={generatePDF}
        onReset={resetForm}
      />

      <InvoicePreview
        ref={invoiceRef}
        formData={formData}
        items={items}
        gstRate={effectiveGstRate}
        totals={totals}
        amountInWords={amountInWords}
      />
    </div>
  );
}

export default App;
