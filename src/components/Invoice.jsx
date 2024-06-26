import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignatureCanvas from 'react-signature-canvas';
import 'tailwindcss/tailwind.css';

const numberToWords = (num) => {
  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  if ((num = num.toString()).length > 9) return 'overflow';
  const n = (`000000000${num}`).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{1})$/);
  if (!n) return; let str = '';
  str += (n[1] !== '00') ? (`${a[Number(n[1])] || `${b[n[1][0]]} ${a[n[1][1]]}`} crore `) : '';
  str += (n[2] !== '00') ? (`${a[Number(n[2])] || `${b[n[2][0]]} ${a[n[2][1]]}`} lakh `) : '';
  str += (n[3] !== '00') ? (`${a[Number(n[3])] || `${b[n[3][0]]} ${a[n[3][1]]}`} thousand `) : '';
  str += (n[4] !== '00') ? (`${a[Number(n[4])] || `${b[n[4][0]]} ${a[n[4][1]]}`} hundred `) : '';
  str += (n[5] !== '00') ? `${(str !== '') ? 'and ' : ''}${a[Number(n[5])] || `${b[n[5][0]]} ${a[n[5][1]]}`} ` : '';
  return str.trim();
};

const Invoice = ({
  sellerDetails,
  placeOfSupply,
  billingDetails,
  shippingDetails,
  placeOfDelivery,
  orderDetails,
  invoiceDetails,
  reverseCharge,
  items,
}) => {
  const invoiceRef = useRef();
  const signatureRef = useRef();

  const [formData, setFormData] = useState({
    sellerDetails: {
      name: sellerDetails.name || '',
      address: sellerDetails.address || '',
      city: sellerDetails.city || '',
      state: sellerDetails.state || '',
      pincode: sellerDetails.pincode || '',
      panNo: sellerDetails.panNo || '',
      gstNo: sellerDetails.gstNo || '',
    },
    placeOfSupply: placeOfSupply || '',
    billingDetails: {
      name: billingDetails.name || '',
      address: billingDetails.address || '',
      city: billingDetails.city || '',
      state: billingDetails.state || '',
      pincode: billingDetails.pincode || '',
      stateCode: billingDetails.stateCode || '',
    },
    shippingDetails: {
      name: shippingDetails.name || '',
      address: shippingDetails.address || '',
      city: shippingDetails.city || '',
      state: shippingDetails.state || '',
      pincode: shippingDetails.pincode || '',
      stateCode: shippingDetails.stateCode || '',
    },
    placeOfDelivery: placeOfDelivery || '',
    orderDetails: {
      orderNo: orderDetails.orderNo || '',
      orderDate: orderDetails.orderDate || '',
    },
    invoiceDetails: {
      invoiceNo: invoiceDetails.invoiceNo || '',
      invoiceDate: invoiceDetails.invoiceDate || '',
    },
    reverseCharge: reverseCharge || false,
    items: items || [],
    signature: null,
  });

  const handleInputChange = (section, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value,
      },
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData((prevData) => ({
      ...prevData,
      items: updatedItems,
    }));
  };

  const computeNetAmount = (unitPrice, quantity, discount) => {
    return unitPrice * quantity - discount;
  };

  const computeTaxType = (placeOfSupply, placeOfDelivery) => {
    return placeOfSupply === placeOfDelivery ? 'CGST/SGST' : 'IGST';
  };

  const computeTaxAmount = (netAmount, taxRate) => {
    return netAmount * (taxRate / 100);
  };

  const totalNetAmount = formData.items.reduce((total, item) => {
    return total + computeNetAmount(item.unitPrice, item.quantity, item.discount);
  }, 0);

  const totalTaxAmount = formData.items.reduce((total, item) => {
    const netAmount = computeNetAmount(item.unitPrice, item.quantity, item.discount);
    return total + computeTaxAmount(netAmount, item.taxRate);
  }, 0);

  const totalAmount = totalNetAmount + totalTaxAmount;

  const amountInWords = (amount) => {
    return numberToWords(amount);
  };

  const generatePDF = () => {
    const input = invoiceRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm (8.27 in)
      const pageHeight = 297; // A4 height in mm (11.69 in)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice_${formData.invoiceDetails.invoiceNo}.pdf`);
    });
  };


  const clearSignature = () => {
    signatureRef.current.clear();
  };

  return (
    <div className="p-6 bg-white" ref={invoiceRef}>
      <div className="flex justify-between items-center">
        <div>
          <img src="/path/to/logo.png" alt="Company Logo" className="h-12" />
          <h1 className="text-xl font-bold">Invoice</h1>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold">{formData.sellerDetails.name}</h2>
          <input
            type="text"
            value={formData.sellerDetails.address}
            onChange={(e) => handleInputChange('sellerDetails', 'address', e.target.value)}
            placeholder="Address"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.sellerDetails.city}
            onChange={(e) => handleInputChange('sellerDetails', 'city', e.target.value)}
            placeholder="City"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.sellerDetails.state}
            onChange={(e) => handleInputChange('sellerDetails', 'state', e.target.value)}
            placeholder="State"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.sellerDetails.pincode}
            onChange={(e) => handleInputChange('sellerDetails', 'pincode', e.target.value)}
            placeholder="Pincode"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.sellerDetails.panNo}
            onChange={(e) => handleInputChange('sellerDetails', 'panNo', e.target.value)}
            placeholder="PAN No."
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.sellerDetails.gstNo}
            onChange={(e) => handleInputChange('sellerDetails', 'gstNo', e.target.value)}
            placeholder="GST Registration No."
            className="border border-gray-400 p-2 mt-2 w-full"
          />
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Place of Supply:</h2>
        <input
          type="text"
          value={formData.placeOfSupply}
          onChange={(e) => handleInputChange('', 'placeOfSupply', e.target.value)}
          className="border border-gray-400 p-2 mt-2 w-full"
        />
        <h2 className="text-lg font-semibold mt-4">Place of Delivery:</h2>
        <input
          type="text"
          value={formData.placeOfDelivery}
          onChange={(e) => handleInputChange('', 'placeOfDelivery', e.target.value)}
          className="border border-gray-400 p-2 mt-2 w-full"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Billing Details</h3>
          <input
            type="text"
            value={formData.billingDetails.name}
            onChange={(e) => handleInputChange('billingDetails', 'name', e.target.value)}
            placeholder="Name"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.billingDetails.address}
            onChange={(e) => handleInputChange('billingDetails', 'address', e.target.value)}
            placeholder="Address"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.billingDetails.city}
            onChange={(e) => handleInputChange('billingDetails', 'city', e.target.value)}
            placeholder="City"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.billingDetails.state}
            onChange={(e) => handleInputChange('billingDetails', 'state', e.target.value)}
            placeholder="State"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.billingDetails.pincode}
            onChange={(e) => handleInputChange('billingDetails', 'pincode', e.target.value)}
            placeholder="Pincode"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.billingDetails.stateCode}
            onChange={(e) => handleInputChange('billingDetails', 'stateCode', e.target.value)}
            placeholder="State Code"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Shipping Details</h3>
          <input
            type="text"
            value={formData.shippingDetails.name}
            onChange={(e) => handleInputChange('shippingDetails', 'name', e.target.value)}
            placeholder="Name"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.shippingDetails.address}
            onChange={(e) => handleInputChange('shippingDetails', 'address', e.target.value)}
            placeholder="Address"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.shippingDetails.city}
            onChange={(e) => handleInputChange('shippingDetails', 'city', e.target.value)}
            placeholder="City"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.shippingDetails.state}
            onChange={(e) => handleInputChange('shippingDetails', 'state', e.target.value)}
            placeholder="State"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.shippingDetails.pincode}
            onChange={(e) => handleInputChange('shippingDetails', 'pincode', e.target.value)}
            placeholder="Pincode"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
          <input
            type="text"
            value={formData.shippingDetails.stateCode}
            onChange={(e) => handleInputChange('shippingDetails', 'stateCode', e.target.value)}
            placeholder="State Code"
            className="border border-gray-400 p-2 mt-2 w-full"
          />
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Order Details:</h2>
        <input
          type="text"
          value={formData.orderDetails.orderNo}
          onChange={(e) => handleInputChange('orderDetails', 'orderNo', e.target.value)}
          placeholder="Order Number"
          className="border border-gray-400 p-2 mt-2 w-full"
        />
        <input
          type="date"
          value={formData.orderDetails.orderDate}
          onChange={(e) => handleInputChange('orderDetails', 'orderDate', e.target.value)}
          placeholder="Order Date"
          className="border border-gray-400 p-2 mt-2 w-full"
        />
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Invoice Details:</h2>
        <input
          type="text"
          value={formData.invoiceDetails.invoiceNo}
          onChange={(e) => handleInputChange('invoiceDetails', 'invoiceNo', e.target.value)}
          placeholder="Invoice Number"
          className="border border-gray-400 p-2 mt-2 w-full"
        />
        <input
          type="date"
          value={formData.invoiceDetails.invoiceDate}
          onChange={(e) => handleInputChange('invoiceDetails', 'invoiceDate', e.target.value)}
          placeholder="Invoice Date"
          className="border border-gray-400 p-2 mt-2 w-full"
        />
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Reverse Charge:</h2>
        <input
          type="checkbox"
          checked={formData.reverseCharge}
          onChange={(e) => handleInputChange('', 'reverseCharge', e.target.checked)}
          className="mt-2"
        />
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Items:</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">#</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
                <th className="border border-gray-300 px-4 py-2">Unit Price</th>
                <th className="border border-gray-300 px-4 py-2">Quantity</th>
                <th className="border border-gray-300 px-4 py-2">Discount</th>
                <th className="border border-gray-300 px-4 py-2">Tax Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="border border-gray-400 p-2 w-full"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      className="border border-gray-400 p-2 w-full"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      className="border border-gray-400 p-2 w-full"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))}
                      className="border border-gray-400 p-2 w-full"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      value={item.taxRate}
                      onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value))}
                      className="border border-gray-400 p-2 w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Signature:</h2>
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{ width: 500, height: 200, className: 'border border-gray-400 mt-2' }}
        />
        <button onClick={clearSignature} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">
          Clear Signature
        </button>
      </div>

      <div className="mt-4">
        <button onClick={generatePDF} className="bg-green-500 text-white px-6 py-2 rounded">
          Generate PDF
        </button>
      </div>
    </div>
  );
};

export default Invoice;
