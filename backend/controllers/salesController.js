const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { generateInvoiceNumber } = require('../utils/invoiceGenerator');
const mongoose = require('mongoose');

exports.getSales = async (req, res) => {
  try {
    const { start_date, end_date, payment_status } = req.query;
    const filter = {};

    if (start_date && end_date) {
      filter.saleDate = {
        $gte: new Date(start_date),
        $lte: new Date(end_date + 'T23:59:59.999Z')
      };
    }
    if (payment_status) {
      filter.paymentStatus = payment_status;
    }

    const sales = await Sale.find(filter)
      .populate('soldBy', 'name')
      .sort({ saleDate: -1 });

    const salesResponse = sales.map(sale => ({
      id: sale._id,
      invoice_number: sale.invoiceNumber,
      customer_name: sale.customerName,
      customer_phone: sale.customerPhone,
      customer_email: sale.customerEmail,
      total_amount: sale.totalAmount,
      discount: sale.discount,
      tax: sale.tax,
      grand_total: sale.grandTotal,
      payment_method: sale.paymentMethod,
      payment_status: sale.paymentStatus,
      notes: sale.notes,
      sold_by_name: sale.soldBy?.name,
      sale_date: sale.saleDate,
      items_count: sale.items.length,
      createdAt: sale.createdAt
    }));

    res.json({ success: true, count: salesResponse.length, data: salesResponse });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ success: false, message: 'Error fetching sales' });
  }
};

exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('soldBy', 'name')
      .populate('items.product', 'name');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    const saleResponse = {
      id: sale._id,
      invoice_number: sale.invoiceNumber,
      customer_name: sale.customerName,
      customer_phone: sale.customerPhone,
      customer_email: sale.customerEmail,
      total_amount: sale.totalAmount,
      discount: sale.discount,
      tax: sale.tax,
      grand_total: sale.grandTotal,
      payment_method: sale.paymentMethod,
      payment_status: sale.paymentStatus,
      notes: sale.notes,
      sold_by_name: sale.soldBy?.name,
      sale_date: sale.saleDate,
      items: sale.items.map(item => ({
        id: item._id,
        product_id: item.product,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal
      }))
    };

    res.json({ success: true, data: saleResponse });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ success: false, message: 'Error fetching sale' });
  }
};

exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customer_name, customer_phone, customer_email, items, discount, tax, payment_method, payment_status, notes } = req.body;

    // Calculate totals
    let total_amount = 0;
    for (const item of items) {
      total_amount += item.quantity * item.unit_price;
    }

    const grand_total = total_amount - (discount || 0) + (tax || 0);
    const invoice_number = generateInvoiceNumber();

    // Create sale
    const sale = await Sale.create([{
      invoiceNumber: invoice_number,
      customerName: customer_name,
      customerPhone: customer_phone,
      customerEmail: customer_email,
      items: items.map(item => ({
        product: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        subtotal: item.quantity * item.unit_price
      })),
      totalAmount: total_amount,
      discount: discount || 0,
      tax: tax || 0,
      grandTotal: grand_total,
      paymentMethod: payment_method,
      paymentStatus: payment_status,
      notes,
      soldBy: req.user.id
    }], { session });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product_id,
        { $inc: { quantityInStock: -item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();

    res.status(201).json({ 
      success: true, 
      message: 'Sale created successfully', 
      data: {
        id: sale[0]._id,
        invoice_number: sale[0].invoiceNumber,
        grand_total: sale[0].grandTotal
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create sale error:', error);
    res.status(500).json({ success: false, message: 'Error creating sale' });
  } finally {
    session.endSession();
  }
};

exports.deleteSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id).session(session);

    if (!sale) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    // Restore stock
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantityInStock: item.quantity } },
        { session }
      );
    }

    // Delete sale
    await Sale.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    res.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Delete sale error:', error);
    res.status(500).json({ success: false, message: 'Error deleting sale' });
  } finally {
    session.endSession();
  }
};
