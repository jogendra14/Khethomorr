import dotenv  from 'dotenv';
dotenv.config();

import connectDB from "./config/db.js";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

const seed = async () => {
	try {
		await connectDB();

		// Clear existing data
		await User.deleteMany({});
		await Product.deleteMany({});
		await Order.deleteMany({});

		// Create users
		const usersData = [
			{ name: 'Admin User', email: 'admin@example.com', password: '123456', role: 'admin', verified: true },
			{ name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user' , verified: true},
			{ name: 'Jane Smith', email: 'jane@example.com', password: 'password', role: 'user' }
		];

		for (let u of usersData) {
			const salt = await bcrypt.genSalt(10);
			u.password = await bcrypt.hash(u.password, salt);
		}

		const createdUsers = await User.insertMany(usersData);

		// Create products
		const productsData = [
			{
				name: 'Blue T-Shirt',
				description: 'Comfortable cotton t-shirt',
				price: 19.99,
				category: 'Apparel',
				stock: 100,
				imageUrl: 'https://via.placeholder.com/400x400.png?text=Blue+T-Shirt'
			},
			{
				name: 'Running Shoes',
				description: 'Lightweight running shoes',
				price: 79.99,
				category: 'Footwear',
				stock: 50,
				imageUrl: 'https://via.placeholder.com/400x400.png?text=Running+Shoes'
			},
			{
				name: 'Wireless Headphones',
				description: 'Noise-cancelling over-ear headphones',
				price: 129.99,
				category: 'Electronics',
				stock: 30,
				imageUrl: 'https://via.placeholder.com/400x400.png?text=Headphones'
			}
		];

		const createdProducts = await Product.insertMany(productsData);

		// Create a sample order for second user
		const orderData = {
			userId: createdUsers[1]._id,
			items: [
				{ productId: createdProducts[0]._id, qty: 2, price: createdProducts[0].price },
				{ productId: createdProducts[2]._id, qty: 1, price: createdProducts[2].price }
			],
			totalAmount:
				createdProducts[0].price * 2 + createdProducts[2].price * 1,
			address: {
				fullName: 'John Doe',
				street: '123 Main St',
				city: 'Anytown',
				postalCode: '12345',
				country: 'USA'
			},
			paymentId: 'PAYMENT-TEST-123',
			status: 'Pending'
		};

		await Order.create(orderData);

		console.log('Seeding completed successfully');
		process.exit(0);
	} catch (error) {
		console.error('Seeding error:', error);
		process.exit(1);
	}
};

seed();
