import React from 'react';
import Invoice from './components/Invoice'; // Adjust path as per your project structure

const App = () => {
  // Example data (replace with actual data from your application)
  const sellerDetails = {
    name: 'ABC Traders',
    address: '123 Main St',
    city: 'City',
    state: 'State',
    pincode: '123456',
    panNo: 'ABCDE1234F',
    gstNo: 'GSTIN12345678',
  };

  const billingDetails = {
    name: 'John Doe',
    address: '456 Elm St',
    city: 'Another City',
    state: 'Another State',
    pincode: '654321',
    stateCode: 'XX',
  };

  const shippingDetails = {
    name: 'Jane Doe',
    address: '789 Oak St',
    city: 'Yet Another City',
    state: 'Yet Another State',
    pincode: '987654',
    stateCode: 'YY',
  };

  const placeOfSupply = 'State A';
  const placeOfDelivery = 'State B';

  const orderDetails = {
    orderNo: 'ORD123',
    orderDate: '2024-06-30',
  };

  const invoiceDetails = {
    invoiceNo: 'INV456',
    invoiceDate: '2024-07-01',
  };

  const reverseCharge = false;

  const items = [
    {
      description: 'Item 1',
      unitPrice: 100,
      quantity: 2,
      discount: 10,
      taxRate: 18,
    },
    {
      description: 'Item 2',
      unitPrice: 75,
      quantity: 1,
      discount: 5,
      taxRate: 18,
    },
  ];

  const signatureImage = '/path/to/signature.png'; // Replace with actual path

  return (
    <div className="App">
      <Invoice
        sellerDetails={sellerDetails}
        placeOfSupply={placeOfSupply}
        billingDetails={billingDetails}
        shippingDetails={shippingDetails}
        placeOfDelivery={placeOfDelivery}
        orderDetails={orderDetails}
        invoiceDetails={invoiceDetails}
        reverseCharge={reverseCharge}
        items={items}
        signatureImage={signatureImage}
      />
    </div>
  );
};

export default App;
