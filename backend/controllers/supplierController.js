const Supplier = require('../models/Supplier');

exports.getSuppliers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const suppliers = await Supplier.find(filter)
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    const suppliersResponse = suppliers.map(sup => ({
      id: sup._id,
      name: sup.name,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
      contact_person: sup.contactPerson,
      status: sup.status,
      created_by_name: sup.createdBy?.name,
      createdAt: sup.createdAt,
      updatedAt: sup.updatedAt
    }));

    res.json({ success: true, count: suppliersResponse.length, data: suppliersResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching suppliers' });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ 
      success: true, 
      data: {
        id: supplier._id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        contact_person: supplier.contactPerson,
        status: supplier.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching supplier' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, contact_person, status } = req.body;
    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
      contactPerson: contact_person,
      status: status || 'active',
      createdBy: req.user.id
    });
    res.status(201).json({ 
      success: true, 
      message: 'Supplier created successfully', 
      data: {
        id: supplier._id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        contact_person: supplier.contactPerson,
        status: supplier.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating supplier' });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, contact_person, status } = req.body;
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, contactPerson: contact_person, status },
      { new: true, runValidators: true }
    );
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ 
      success: true, 
      message: 'Supplier updated successfully', 
      data: {
        id: supplier._id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        contact_person: supplier.contactPerson,
        status: supplier.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating supplier' });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting supplier' });
  }
};
