import React, { useState } from 'react';

const ProductGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState('electronics');

  const categories = [
    {id: 'electronics', label: 'Electronics'},
    {id: 'clothing', label: 'Clothing & Apparel'},
    {id: 'home', label: 'Home & Garden'},
    {id: 'sports', label: 'Sports & Outdoors'},
    {id: 'beauty', label: 'Beauty & Health'},
    {id: 'books', label: 'Books & Media'},
  ];

  // Sample products for each category
  const products = {
    electronics: [
      { id: 1, name: 'Wireless Headphones', price: 89.99, rating: 4.5 },
      { id: 2, name: 'Smart Watch', price: 199.99, rating: 4.7 },
      { id: 3, name: 'Bluetooth Speaker', price: 59.99, rating: 4.3 }
    ],
    clothing: [
      { id: 4, name: 'Denim Jacket', price: 79.99, rating: 4.2 },
      { id: 5, name: 'Cotton T-Shirt', price: 24.99, rating: 4.4 },
      { id: 6, name: 'Athletic Shoes', price: 119.99, rating: 4.6 }
    ],
    home: [
      { id: 7, name: 'Coffee Maker', price: 149.99, rating: 4.8 },
      { id: 8, name: 'Bedding Set', price: 89.99, rating: 4.5 },
      { id: 9, name: 'Indoor Plant', price: 34.99, rating: 4.3 }
    ],
    sports: [
      { id: 10, name: 'Yoga Mat', price: 29.99, rating: 4.7 },
      { id: 11, name: 'Dumbbells Set', price: 119.99, rating: 4.6 },
      { id: 12, name: 'Tennis Racket', price: 89.99, rating: 4.4 }
    ],
    beauty: [
      { id: 13, name: 'Face Serum', price: 39.99, rating: 4.8 },
      { id: 14, name: 'Hairdryer', price: 79.99, rating: 4.6 },
      { id: 15, name: 'Perfume', price: 69.99, rating: 4.5 }
    ],
    books: [
      { id: 16, name: 'Bestseller Novel', price: 19.99, rating: 4.9 },
      { id: 17, name: 'Cookbook', price: 29.99, rating: 4.7 },
      { id: 18, name: 'Self-Help Book', price: 24.99, rating: 4.6 }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>
      
      {/* Category Navigation */}
      <div className="flex overflow-x-auto mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 mx-1 rounded-md whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products[selectedCategory].map((product) => (
          <div key={product.id} className="border rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-100 h-48 flex items-center justify-center">
              <div className="text-gray-400 text-4xl">Product Image</div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <div className="flex items-center mt-1">
                <div className="text-yellow-500">★★★★☆</div>
                <span className="ml-1 text-sm text-gray-600">{product.rating}/5</span>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xl font-bold">${product.price}</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
