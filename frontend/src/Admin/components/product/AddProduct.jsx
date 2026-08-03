import { useState, useEffect } from 'react';
import { categoryData, getTemplateForCategory } from '../../data/categoryData';
import { getTemplateByCategory } from '../../data/ProductTemplates';
import { addProduct } from '../../../api/productApi';

const ProductForm = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [specifications, setSpecifications] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    brand: '',
    name: '',
    MRP: '',
    sellingPrice: '',
    discount: '0',
    stock: '',
    description: '',
    images: []
  });

  // Update form fields when category changes
  useEffect(() => {
    if (selectedCategory) {
      const template = getTemplateByCategory(selectedCategory);
      const fields = Object.entries(template.fields).map(([key, config]) => ({
        key,
        ...config
      }));
      setFormFields(fields);
      setSpecifications({});
    }
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, category }));
  };

  const handleSpecificationChange = (key, value) => {
    setSpecifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Get product type from template
      const template = getTemplateByCategory(selectedCategory);
      formDataToSend.append('productType', template.productType);

      // Add specifications as JSON
      formDataToSend.append('specifications', JSON.stringify(specifications));

      // Add images
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach(file => {
          formDataToSend.append('images', file);
        });
      }

      const response = await addProduct(formData)
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Product created successfully!');
        // Reset form
        setFormData({
          category: '',
          subCategory: '',
          brand: '',
          name: '',
          MRP: '',
          sellingPrice: '',
          discount: '0',
          stock: '',
          description: '',
          images: []
        });
        setSpecifications({});
        setSelectedCategory('');
        setImagePreviews([]);
      } else {
        alert('❌ Failed to create product: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('❌ Error creating product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: files }));
    
    // Create image previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
      textAlign: 'center'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontWeight: '500',
      marginBottom: '4px',
      color: '#555',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      resize: 'vertical'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginTop: '20px',
      marginBottom: '12px',
      color: '#444',
      borderBottom: '2px solid #ddd',
      paddingBottom: '8px'
    },
    imagePreview: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '8px'
    },
    imageName: {
      backgroundColor: '#e9ecef',
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      color: '#555'
    },
    submitBtn: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '20px'
    },
    submitBtnDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed'
    },
    required: {
      color: 'red',
      marginLeft: '4px'
    },
    specsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Add New Product</h2>

      <form onSubmit={handleSubmit}>
        {/* Category Selection */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Category *</label>
          <select 
            name="category" 
            value={formData.category}
            onChange={handleCategoryChange}
            required
            style={styles.select}
          >
            <option value="">Select Category</option>
            {Object.keys(categoryData).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sub Category */}
        {selectedCategory && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Sub Category *</label>
            <select 
              name="subCategory" 
              value={formData.subCategory}
              onChange={handleInputChange}
              required
              style={styles.select}
            >
              <option value="">Select Sub Category</option>
              {categoryData[selectedCategory]?.subCategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}

        {/* Brand */}
        {selectedCategory && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Brand *</label>
            <select 
              name="brand" 
              value={formData.brand}
              onChange={handleInputChange}
              required
              style={styles.select}
            >
              <option value="">Select Brand</option>
              {categoryData[selectedCategory]?.brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        )}

        {/* Basic Fields */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={styles.input}
            placeholder="Enter product name"
          />
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Old Price *</label>
            <input
              type="number"
              name="MRP"
              value={formData.MRP}
              onChange={handleInputChange}
              required
              style={styles.input}
              placeholder="e.g., 2999"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>New Price *</label>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleInputChange}
              required
              style={styles.input}
              placeholder="e.g., 2499"
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="e.g., 10"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Stock *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              required
              style={styles.input}
              placeholder="e.g., 50"
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            style={styles.textarea}
            placeholder="Enter product description"
          />
        </div>

        {/* Dynamic Specifications */}
        {selectedCategory && formFields.length > 0 && (
          <div>
            <h3 style={styles.sectionTitle}>Product Specifications</h3>
            <div style={styles.specsGrid}>
              {formFields.map((field) => (
                <div key={field.key} style={styles.formGroup}>
                  <label style={styles.label}>
                    {field.label}
                    {field.required && <span style={styles.required}>*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={specifications[field.key] || ''}
                      onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
                      required={field.required}
                      style={styles.select}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={specifications[field.key] || ''}
                      onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows="3"
                      style={styles.textarea}
                    />
                  ) : (
                    <input
                      type="text"
                      value={specifications[field.key] || ''}
                      onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      style={styles.input}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Product Images *</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            required
            style={styles.input}
          />
          {imagePreviews.length > 0 && (
            <div style={styles.imagePreview}>
              {imagePreviews.map((preview, index) => (
                <span key={index} style={styles.imageName}>
                  Image {index + 1}
                </span>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          style={{
            ...styles.submitBtn,
            ...(loading ? styles.submitBtnDisabled : {})
          }}
          disabled={loading}
        >
          {loading ? 'Creating Product...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;