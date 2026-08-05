import dotenv from 'dotenv';
dotenv.config();

import connectDB from "./config/db.js";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Category from "./models/Category.js";
import Deal from "./models/Deal.js";

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Category.deleteMany({});
    await Deal.deleteMany({});

    console.log('🗑️ Existing data cleared');

    // ============================
    // ✅ CREATE USERS
    // ============================
    const usersData = [
      { 
        name: 'Admin User', 
        email: 'admin@example.com', 
        password: await bcrypt.hash('123456', 10), 
        role: 'admin', 
        verified: true,
        status: 'Active'
      },
      { 
        name: 'John Doe', 
        email: 'john@example.com', 
        password: await bcrypt.hash('password', 10), 
        role: 'user', 
        verified: true,
        status: 'Active'
      },
      { 
        name: 'Jane Smith', 
        email: 'jane@example.com', 
        password: await bcrypt.hash('password', 10), 
        role: 'user', 
        verified: false,
        status: 'Active'
      }
    ];

    const createdUsers = await User.insertMany(usersData);
    console.log(`✅ ${createdUsers.length} users created`);

    // ============================
    // ✅ CREATE CATEGORIES
    // ============================
    const categoriesData = [
      { 
        name: 'Fans', 
        description: 'Ceiling, wall, and exhaust fans',
        image: '🌀',
        icon: '🌀'
      },
      { 
        name: 'Lighting', 
        description: 'LED bulbs, tube lights, decorative lights',
        image: '💡',
        icon: '💡'
      },
      { 
        name: 'Kitchen Appliances', 
        description: 'Chimney, water purifier, cooktop',
        image: '🔌',
        icon: '🔌'
      },
      { 
        name: 'Bathroom Appliances', 
        description: 'Geysers, bathroom fittings',
        image: '🚿',
        icon: '🚿'
      },
      { 
        name: 'Electrical', 
        description: 'Switches, wires, circuit breakers',
        image: '⚡',
        icon: '⚡'
      },
      { 
        name: 'Solar', 
        description: 'Solar panels, inverters, batteries',
        image: '☀️',
        icon: '☀️'
      }
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✅ ${createdCategories.length} categories created`);

    // ============================
    // ✅ CREATE PRODUCTS
    // ============================
    const productsData = [
      {
        category: 'Fans',
        subCategory: 'Classic',
        brand: 'Rallys',
        name: 'Rallys Classic Ceiling Fan',
        MRP: 2999,
        sellingPrice: 2499,
        discount: 17,
        rating: 4.5,
        reviews: 120,
        stock: 50,
        description: 'High-quality ceiling fan with powerful air delivery and elegant design.',
        includeComponents: ['Remote Control', 'Mounting Kit', 'User Manual'],
        productType: 'fan',
        images: ['https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=500'],
        choose_W_G: 'warranty',
        warranty_guarantee: '2 years',
        specifications: new Map([
          ['motor', 'Copper Motor'],
          ['sweepSize', '1200mm'],
          ['bladeCount', '4'],
          ['color', 'White'],
          ['fanWattage', '75W'],
          ['airDelivery', '230 CMM']
        ])
      },
      {
        category: 'Lighting',
        subCategory: 'LED Bulbs',
        brand: 'Philips',
        name: 'Philips LED Bulb 12W',
        MRP: 399,
        sellingPrice: 299,
        discount: 25,
        rating: 4.2,
        reviews: 85,
        stock: 200,
        description: 'Energy-efficient LED bulb with warm white light and long life.',
        includeComponents: ['Bulb', 'Warranty Card'],
        productType: 'lighting',
        images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500'],
        choose_W_G: 'warranty',
        warranty_guarantee: '1 year',
        specifications: new Map([
          ['wattage', '12W'],
          ['colorTemperature', '3000K'],
          ['lumens', '1200 lm'],
          ['dimmable', 'No'],
          ['ipRating', 'IP20']
        ])
      },
      {
        category: 'Kitchen Appliances',
        subCategory: 'Chimney',
        brand: 'Hindware',
        name: 'Hindware Auto Clean Chimney 60cm',
        MRP: 14999,
        sellingPrice: 11999,
        discount: 20,
        rating: 4.7,
        reviews: 45,
        stock: 25,
        description: 'Auto-clean chimney with powerful suction and stylish design.',
        includeComponents: ['Chimney', 'Installation Kit', 'User Manual'],
        productType: 'kitchenAppliances',
        images: ['https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500'],
        choose_W_G: 'warranty',
        warranty_guarantee: '5 years',
        specifications: new Map([
          ['chimneyType', 'Auto Clean'],
          ['chimneySize', '60cm'],
          ['motorPower', '150W'],
          ['suctionCapacity', '1200 m³/h'],
          ['filterType', 'Baffle Filter'],
          ['noiseLevel', '58 dB'],
          ['controlType', 'Touch Control']
        ])
      },
      {
        category: 'Solar',
        subCategory: 'Panels',
        brand: 'Luminous',
        name: 'Luminous Solar Panel 300W',
        MRP: 18999,
        sellingPrice: 15999,
        discount: 16,
        rating: 4.4,
        reviews: 30,
        stock: 15,
        description: 'High-efficiency solar panel with durable construction and 25-year performance warranty.',
        includeComponents: ['Solar Panel', 'Mounting Frame', 'Connectors'],
        productType: 'solar',
        images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500'],
        choose_W_G: 'warranty',
        warranty_guarantee: '25 years',
        specifications: new Map([
          ['solarType', 'Monocrystalline'],
          ['powerRating', '300W'],
          ['voltage', '24V'],
          ['efficiency', '21.5%'],
          ['panelType', 'Glass-Frame'],
          ['batteryType', 'N/A']
        ])
      },
      {
        category: 'Fans',
        subCategory: 'BLDC',
        brand: 'Orient',
        name: 'Orient BLDC Smart Fan',
        MRP: 5999,
        sellingPrice: 4999,
        discount: 17,
        rating: 4.6,
        reviews: 60,
        stock: 35,
        description: 'Energy-efficient BLDC fan with remote control and smart features.',
        includeComponents: ['Remote Control', 'Mounting Kit', 'User Manual'],
        productType: 'fan',
        images: ['https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=500'],
        choose_W_G: 'warranty',
        warranty_guarantee: '3 years',
        specifications: new Map([
          ['motor', 'BLDC Motor'],
          ['sweepSize', '1200mm'],
          ['bladeCount', '3'],
          ['color', 'Black'],
          ['fanWattage', '35W'],
          ['airDelivery', '250 CMM']
        ])
      }
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`✅ ${createdProducts.length} products created`);

    // ============================
    // ✅ CREATE DEALS
    // ============================
    const dealsData = [
      {
        title: 'Rallys Fan Fest',
        brand: 'Rallys',
        price: 2499,
        image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=500'
      },
      {
        title: 'LED Super Saver',
        brand: 'Philips',
        price: 299,
        image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500'
      },
      {
        title: 'Chimney Fest',
        brand: 'Hindware',
        price: 11999,
        image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500'
      }
    ];

    const createdDeals = await Deal.insertMany(dealsData);
    console.log(`✅ ${createdDeals.length} deals created`);

    // ============================
    // ✅ CREATE SAMPLE ORDERS
    // ============================
    const orderData = {
      userId: createdUsers[1]._id, // John Doe
      items: [
        { 
          productId: createdProducts[0]._id, 
          qty: 2, 
          price: createdProducts[0].sellingPrice 
        },
        { 
          productId: createdProducts[2]._id, 
          qty: 1, 
          price: createdProducts[2].sellingPrice 
        }
      ],
      totalAmount: createdProducts[0].sellingPrice * 2 + createdProducts[2].sellingPrice * 1,
      address: {
        fullName: 'John Doe',
        street: '123 Main Street',
        city: 'Bangalore',
        postalCode: '560001',
        country: 'India'
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      status: 'Pending'
    };

    await Order.create(orderData);
    console.log('✅ 1 sample order created');

    console.log('\n🎉 Seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`  - ${createdUsers.length} users`);
    console.log(`  - ${createdCategories.length} categories`);
    console.log(`  - ${createdProducts.length} products`);
    console.log(`  - ${createdDeals.length} deals`);
    console.log('  - 1 order');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seed();