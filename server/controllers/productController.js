import Product from '../models/Product.js';
import MetalRates from '../models/MetalRates.js';

// @desc    Fetch all products (with optional category & search filters)
// @route   GET /api/products?category=rings&search=necklace
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('DB Error, serving mock data:', err.message);
    const mockProducts = [
      {
        _id: '1',
        name: 'Kundan Polki Necklace Set',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        description: 'Exquisite Kundan Polki necklace set with matching earrings. Perfect for royal weddings.',
        category: 'wedding',
        price: 245000,
        metalType: 'gold',
        weight: 45,
        sku: 'SKU-DEMO-1'
      },
      {
        _id: '2',
        name: 'Diamond Solitaire Ring',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
        description: 'Stunning 1 carat diamond solitaire ring set in 18KT white gold.',
        category: 'diamond',
        price: 185000,
        sku: 'SKU-DEMO-2'
      },
      {
        _id: '3',
        name: '22KT Gold Hoop Earrings',
        image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400',
        description: 'Classic 22KT gold hoop earrings with a high-polish finish.',
        category: 'earrings',
        price: 32000,
        metalType: 'gold',
        weight: 8,
        sku: 'SKU-DEMO-3'
      }
    ];
    res.json(mockProducts);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      throw new Error('Not found');
    }
  } catch (err) {
    // Return a demo product if DB is down
    const demoProduct = {
      _id: req.params.id,
      name: 'Demo Aura Product',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      description: 'This is a demo description used because the database is currently disconnected. At Aura Jewels, we provide real data when MongoDB is active.',
      category: 'other',
      price: 25000,
      sku: 'SKU-DEMO-DETAIL'
    };
    res.json(demoProduct);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, image, description, category, price, metalType, weight, makingCharge } = req.body;

  const product = new Product({
    name,
    image,
    description,
    category,
    price,
    metalType: metalType || null,
    weight: weight || null,
    makingCharge: makingCharge || null,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { name, image, description, category, price, metalType, weight, makingCharge } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.image = image || product.image;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price;
    product.metalType = metalType !== undefined ? metalType : product.metalType;
    product.weight = weight !== undefined ? weight : product.weight;
    product.makingCharge = makingCharge !== undefined ? makingCharge : product.makingCharge;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Get latest metal rates
// @route   GET /api/products/rates
// @access  Public
export const getMetalRates = async (req, res) => {
  const rates = await MetalRates.findOne().sort({ createdAt: -1 });
  if (rates) {
    res.json(rates);
  } else {
    res.json({ goldRate: 0, silverRate: 0 });
  }
};

// @desc    Update metal rates & recalculate product prices
// @route   POST /api/products/rates
// @access  Private/Admin
export const updateMetalRates = async (req, res) => {
  const { goldRate, silverRate } = req.body;

  if (!goldRate || !silverRate) {
    res.status(400).json({ message: 'Both gold and silver rates are required' });
    return;
  }

  const rates = new MetalRates({ goldRate: Number(goldRate), silverRate: Number(silverRate) });
  await rates.save();

  // Recalculate prices for all gold/silver products
  const products = await Product.find({ metalType: { $in: ['gold', 'silver'] } });
  for (const p of products) {
    if (p.weight) {
      const rate = p.metalType === 'gold' ? Number(goldRate) : Number(silverRate);
      p.price = rate * p.weight + (p.makingCharge || 0);
      await p.save();
    }
  }

  res.status(201).json({ ...rates._doc, updatedCount: products.length });
};
